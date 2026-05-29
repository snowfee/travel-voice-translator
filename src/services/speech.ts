import type { LanguageCode } from '@/types/domain';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionResultItem;
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
