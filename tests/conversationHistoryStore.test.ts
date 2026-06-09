import { describe, expect, test } from 'vitest';

import { createConversationHistoryStore } from '@/stores/conversationHistoryStore';
import type { ConversationMessage } from '@/stores/conversationStore';

const messages: ConversationMessage[] = [
  {
    id: 'record-1',
    speaker: 'source',
    sourceText: '你好',
    translatedText: 'Hello',
    sourceLanguage: 'zh-CN',
    targetLanguage: 'en-US',
    createdAt: '2026-06-02T00:00:00.000Z',
  },
];

describe('conversation history store', () => {
  test('archives and restores a complete conversation session', () => {
    const store = createConversationHistoryStore();

    const session = store.archive(messages);
    const restored = createConversationHistoryStore();

    expect(session).toBeDefined();
    expect(restored.sessions.value).toHaveLength(1);
    expect(restored.sessions.value[0].messages).toEqual(messages);
  });

  test('does not archive an empty conversation', () => {
    const store = createConversationHistoryStore();

    expect(store.archive([])).toBeUndefined();
    expect(store.sessions.value).toHaveLength(0);
  });
});
