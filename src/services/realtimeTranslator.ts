import type { LanguageCode } from '@/types/domain';

export interface RealtimeTranslationTurn {
  sourceText: string;
  translatedText: string;
}

interface RealtimeTranslatorCallbacks {
  onStatus: (status: string) => void;
  onSourceTranscript: (text: string) => void;
  onTranslationTranscript: (text: string) => void;
  onTurnCompleted: (turn: RealtimeTranslationTurn) => void;
  onError: (message: string) => void;
}

export interface RealtimeServerEvent {
  type: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
}

export interface RealtimeTranslatorSession {
  close: () => void;
}

export function createTranscriptTurnCollector(
  callbacks: Pick<RealtimeTranslatorCallbacks, 'onSourceTranscript' | 'onTranslationTranscript' | 'onTurnCompleted'>,
) {
  let sourceTranscript = '';
  let translatedTranscript = '';
  let translationCompleted = false;

  function commitWhenReady() {
    if (!translationCompleted || !sourceTranscript.trim() || !translatedTranscript.trim()) {
      return;
    }

    callbacks.onTurnCompleted({
      sourceText: sourceTranscript.trim(),
      translatedText: translatedTranscript.trim(),
    });
    sourceTranscript = '';
    translatedTranscript = '';
    translationCompleted = false;
  }

  function handle(event: RealtimeServerEvent) {
    if (event.type === 'conversation.item.input_audio_transcription.delta') {
      sourceTranscript += event.delta ?? '';
      callbacks.onSourceTranscript(sourceTranscript);
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      sourceTranscript = event.transcript ?? sourceTranscript;
      callbacks.onSourceTranscript(sourceTranscript);
      commitWhenReady();
    }

    if (event.type === 'response.output_audio_transcript.delta') {
      translatedTranscript += event.delta ?? '';
      callbacks.onTranslationTranscript(translatedTranscript);
    }

    if (event.type === 'response.output_audio_transcript.done') {
      translatedTranscript = event.transcript ?? translatedTranscript;
      translationCompleted = true;
      callbacks.onTranslationTranscript(translatedTranscript);
      commitWhenReady();
    }
  }

  return { handle };
}

function translationInstructions(sourceLanguage: LanguageCode, targetLanguage: LanguageCode) {
  return [
    'You are a live travel interpreter.',
    `Translate spoken ${sourceLanguage} into ${targetLanguage}.`,
    'Respond only with a faithful translation in the target language.',
    'Do not answer questions, add explanations, or repeat the source sentence.',
    'Keep names, numbers, and travel details accurate. Speak clearly and briefly.',
  ].join(' ');
}

function transcriptionLanguage(language: LanguageCode) {
  return language.split('-')[0];
}

export async function connectRealtimeTranslator(
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  callbacks: RealtimeTranslatorCallbacks,
): Promise<RealtimeTranslatorSession> {
  callbacks.onStatus('正在连接 AI 实时翻译...');
  const tokenResponse = await fetch('/api/realtime/token');
  const tokenBody = (await tokenResponse.json()) as { value?: string; error?: string };

  if (!tokenResponse.ok || !tokenBody.value) {
    throw new Error(tokenBody.error ?? '无法获取 AI 实时翻译凭证。');
  }

  const peerConnection = new RTCPeerConnection();
  const audioElement = document.createElement('audio');
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const dataChannel = peerConnection.createDataChannel('oai-events');
  let closed = false;
  const transcriptCollector = createTranscriptTurnCollector(callbacks);

  audioElement.autoplay = true;
  peerConnection.ontrack = (event) => {
    audioElement.srcObject = event.streams[0];
  };
  peerConnection.addTrack(mediaStream.getTracks()[0]);

  const close = () => {
    if (closed) {
      return;
    }
    closed = true;
    mediaStream.getTracks().forEach((track) => track.stop());
    dataChannel.close();
    peerConnection.close();
    audioElement.srcObject = null;
    callbacks.onStatus('AI 实时翻译已停止。');
  };

  dataChannel.addEventListener('message', (message) => {
    const event = JSON.parse(message.data) as RealtimeServerEvent;

    transcriptCollector.handle(event);

    if (event.type === 'error') {
      callbacks.onError(event.error?.message ?? 'AI 实时翻译发生错误。');
    }
  });

  const opened = new Promise<void>((resolve, reject) => {
    dataChannel.addEventListener('open', () => resolve(), { once: true });
    dataChannel.addEventListener('error', () => reject(new Error('AI 实时翻译连接失败。')), { once: true });
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${tokenBody.value}`,
      'Content-Type': 'application/sdp',
    },
  });

  if (!sdpResponse.ok) {
    close();
    throw new Error('AI 实时翻译会话创建失败。');
  }

  await peerConnection.setRemoteDescription({
    type: 'answer',
    sdp: await sdpResponse.text(),
  });
  await opened;

  dataChannel.send(
    JSON.stringify({
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions: translationInstructions(sourceLanguage, targetLanguage),
        output_modalities: ['audio'],
        audio: {
          input: {
            transcription: {
              model: 'gpt-4o-mini-transcribe',
              language: transcriptionLanguage(sourceLanguage),
            },
            noise_reduction: { type: 'near_field' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
              create_response: true,
              interrupt_response: true,
            },
          },
          output: {
            voice: 'marin',
          },
        },
      },
    }),
  );
  callbacks.onStatus('AI 实时翻译已开启，请开始说话。');

  return { close };
}
