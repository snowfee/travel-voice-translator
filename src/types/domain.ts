export type LanguageCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'es-ES';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}

export interface TranslationResult {
  translatedText: string;
  confidence: 'local' | 'cloud' | 'fallback';
}

export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  createdAt: string;
}

export interface NewTranslationRecord {
  sourceText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}

export interface AppSettings {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  autoPlay: boolean;
  speechRate: number;
}

export interface Phrase {
  id: string;
  category: string;
  sourceText: string;
  translations: Partial<Record<LanguageCode, string>>;
}
