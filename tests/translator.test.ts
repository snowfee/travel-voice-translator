import { afterEach, describe, expect, it, vi } from 'vitest';

import { translateText } from '@/services/translator';

describe('translateText', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const result = await translateText({
      text: '我想找一家安静的咖啡店',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'ja-JP',
    });

    expect(result.translatedText).toContain('ja-JP');
    expect(result.translatedText).toContain('我想找一家安静的咖啡店');
    expect(result.confidence).toBe('fallback');
  });

  it('uses Google Cloud Translation Basic v2 when the local dictionary has no match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: 'I would like a quiet cafe.' }),
      }),
    );

    const result = await translateText({
      text: '我想找一家安静的咖啡店。',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
    });

    expect(fetch).toHaveBeenCalledWith('/api/translate', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual({
      translatedText: 'I would like a quiet cafe.',
      confidence: 'cloud',
    });
  });
});
