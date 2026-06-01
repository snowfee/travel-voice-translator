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

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
      }),
    });

    if (response.ok) {
      const body = (await response.json()) as { translatedText?: string };
      if (body.translatedText) {
        return {
          translatedText: body.translatedText,
          confidence: 'cloud',
        };
      }
    }
  } catch {
    // Preserve offline fallback behavior when the cloud service is unavailable.
  }

  return {
    translatedText: `[${request.targetLanguage}] ${text}`,
    confidence: 'fallback',
  };
}
