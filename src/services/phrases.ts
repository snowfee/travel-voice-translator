import type { LanguageCode, NewTranslationRecord, Phrase } from '@/types/domain';

export function getPhraseTranslation(phrase: Phrase, targetLanguage: LanguageCode) {
  return phrase.translations[targetLanguage] ?? `[${targetLanguage}] ${phrase.sourceText}`;
}

export function createPhraseRecord(phrase: Phrase, targetLanguage: LanguageCode): NewTranslationRecord {
  return {
    sourceText: phrase.sourceText,
    translatedText: getPhraseTranslation(phrase, targetLanguage),
    sourceLanguage: 'zh-CN',
    targetLanguage,
  };
}
