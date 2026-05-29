import { describe, expect, it } from 'vitest';

import { translateText } from '@/services/translator';

describe('translateText', () => {
  it('returns a local phrase translation when one exists', async () => {
    const result = await translateText({
      text: '请问地铁站怎么走？',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
    });

    expect(result.translatedText).toBe('How do I get to the subway station?');
    expect(result.confidence).toBe('local');
  });

  it('returns a clear fallback when the local dictionary has no match', async () => {
    const result = await translateText({
      text: '我想找一家安静的咖啡店',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'ja-JP',
    });

    expect(result.translatedText).toContain('ja-JP');
    expect(result.translatedText).toContain('我想找一家安静的咖啡店');
    expect(result.confidence).toBe('fallback');
  });
});
