import type { LanguageCode } from '@/types/domain';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionResultItem;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function canRecognizeSpeech() {
  const speechWindow = window as SpeechWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
}

export interface ContinuousRecognitionCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onStatus: (status: string) => void;
  onError: (message: string) => void;
}

export interface ContinuousRecognitionSession {
  stop: () => Promise<void>;
}

export function startContinuousRecognition(
  language: LanguageCode,
  callbacks: ContinuousRecognitionCallbacks,
): ContinuousRecognitionSession {
  const speechWindow = window as SpeechWindow;
  const SpeechRecognitionApi = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  if (!SpeechRecognitionApi) {
    throw new Error('当前浏览器不支持语音识别，请使用 Chrome 或 Edge。');
  }

  const recognition = new SpeechRecognitionApi();
  recognition.lang = language;
  recognition.interimResults = true;
  recognition.continuous = true;

  let stopped = false;

  recognition.onresult = (event) => {
    const latestResult = event.results[event.results.length - 1];
    const text = latestResult[0].transcript.trim();

    if (!text) {
      return;
    }

    if (latestResult.isFinal) {
      callbacks.onFinal(text);
      return;
    }

    callbacks.onInterim(text);
  };

  recognition.onerror = () => {
    if (!stopped) {
      callbacks.onError('语音识别中断，请重新点击麦克风开始。');
    }
  };

  recognition.onend = () => {
    if (!stopped) {
      callbacks.onStatus('语音识别已暂停，点击麦克风可继续。');
    }
  };

  recognition.start();
  callbacks.onStatus('正在持续听取语音...');

  return {
    stop: () =>
      new Promise<void>((resolve) => {
        stopped = true;
        recognition.onend = () => resolve();
        recognition.stop();
      }),
  };
}

export function recognizeOnce(language: LanguageCode): Promise<string> {
  const speechWindow = window as SpeechWindow;
  const SpeechRecognitionApi = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  if (!SpeechRecognitionApi) {
    return Promise.reject(new Error('当前浏览器不支持语音识别，请输入文字。'));
  }

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognitionApi();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1];
      resolve(latestResult[0].transcript);
    };
    recognition.onerror = () => reject(new Error('没有识别到清晰语音，请再试一次。'));
    recognition.onend = () => undefined;
    recognition.start();
  });
}

export function speak(text: string, language: LanguageCode, rate: number) {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}
