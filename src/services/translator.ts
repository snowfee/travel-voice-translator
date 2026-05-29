import { phrases } from '@/data/phrases';
import type { TranslationRequest, TranslationResult } from '@/types/domain';

function normalize(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

export async function translateText(request: TranslationRequest): Promise<TranslationResult> {
  const text = normalize(request.text);
  const phrase = phrases.find((item) => normalize(item.sourceText) === text);
  const localTranslation = phrase?.translations[request.targetLanguage];

  if (localTranslation) {
    return {
      translatedText: localTranslation,
      confidence: 'local',
    };
  }

  return {
    translatedText: `[${request.targetLanguage}] ${text}`,
    confidence: 'fallback',
  };
}
