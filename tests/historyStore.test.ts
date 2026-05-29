import { beforeEach, describe, expect, it } from 'vitest';

import { createHistoryStore } from '@/stores/historyStore';

describe('historyStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists translation records in newest-first order', () => {
    const store = createHistoryStore();

    store.add({
      sourceText: '你好',
      translatedText: 'Hello',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
    });
    store.add({
      sourceText: '谢谢',
      translatedText: 'Thank you',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
    });

    const restored = createHistoryStore();

    expect(restored.records.value).toHaveLength(2);
    expect(restored.records.value[0].sourceText).toBe('谢谢');
    expect(restored.records.value[1].sourceText).toBe('你好');
  });

  it('deletes exactly one record by id', () => {
    const store = createHistoryStore();
    const first = store.add({
      sourceText: 'A',
      translatedText: 'B',
      sourceLanguage: 'en-US',
      targetLanguage: 'zh-CN',
    });
    const second = store.add({
      sourceText: 'C',
      translatedText: 'D',
      sourceLanguage: 'en-US',
      targetLanguage: 'zh-CN',
    });

    store.remove(first.id);

    expect(store.records.value.map((record) => record.id)).toEqual([second.id]);
  });
});
