import { describe, expect, it } from 'vitest';

import { createPhraseRecord, getPhraseTranslation } from '@/services/phrases';
import type { Phrase } from '@/types/domain';

const phrase: Phrase = {
  id: 'test-phrase',
  category: '交通',
  sourceText: '请问地铁站怎么走？',
  translations: {
    'en-US': 'How do I get to the subway station?',
    'ja-JP': '地下鉄の駅へはどう行けばいいですか？',
  },
};

describe('phrase helpers', () => {
  it('uses the selected phrase language for display and history records', () => {
    expect(getPhraseTranslation(phrase, 'ja-JP')).toBe('地下鉄の駅へはどう行けばいいですか？');

    expect(createPhraseRecord(phrase, 'ja-JP')).toEqual({
      sourceText: '请问地铁站怎么走？',
      translatedText: '地下鉄の駅へはどう行けばいいですか？',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'ja-JP',
    });
  });
});
