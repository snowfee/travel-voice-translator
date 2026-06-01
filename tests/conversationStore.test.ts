import { describe, expect, test } from 'vitest';
import { ref } from 'vue';

import { createConversationStore } from '@/stores/conversationStore';
import type { AppSettings } from '@/types/domain';

const settings = ref<AppSettings>({
  sourceLanguage: 'zh-CN',
  targetLanguage: 'en-US',
  autoPlay: true,
  speechRate: 1,
});

describe('conversation store', () => {
  test('streams a draft bubble and commits the completed turn', () => {
    const store = createConversationStore(settings);

    store.startDraft('source');
    store.updateDraftSource('你好');
    store.updateDraftTranslation('Hello');

    expect(store.messages.value[store.messages.value.length - 1]).toMatchObject({
      speaker: 'source',
      sourceText: '你好',
      translatedText: 'Hello',
      pending: true,
    });

    store.commitDraft({
      id: 'record-1',
      sourceText: '你好',
      translatedText: 'Hello',
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
      createdAt: '2026-06-01T00:00:00.000Z',
    });

    expect(store.messages.value).toHaveLength(1);
    expect(store.messages.value[0]).toMatchObject({
      id: 'record-1',
      sourceText: '你好',
      translatedText: 'Hello',
      pending: false,
    });
  });
});
