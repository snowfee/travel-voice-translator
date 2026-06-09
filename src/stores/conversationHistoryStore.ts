import { ref } from 'vue';

import type { ConversationMessage } from '@/stores/conversationStore';

export interface ConversationSession {
  id: string;
  startedAt: string;
  endedAt: string;
  messages: ConversationMessage[];
}

const STORAGE_KEY = 'travel-voice-translator:conversation-history';
const MAX_SESSIONS = 30;

function loadSessions(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConversationSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ConversationSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createConversationHistoryStore() {
  const sessions = ref<ConversationSession[]>(loadSessions());

  function archive(messages: ConversationMessage[]) {
    const completedMessages = messages.filter((message) => !message.pending);
    if (completedMessages.length === 0) {
      return undefined;
    }

    const session: ConversationSession = {
      id: createId(),
      startedAt: completedMessages[0].createdAt,
      endedAt: new Date().toISOString(),
      messages: completedMessages,
    };
    sessions.value = [session, ...sessions.value].slice(0, MAX_SESSIONS);
    saveSessions(sessions.value);
    return session;
  }

  function remove(id: string) {
    sessions.value = sessions.value.filter((session) => session.id !== id);
    saveSessions(sessions.value);
  }

  return {
    sessions,
    archive,
    remove,
  };
}

let sharedConversationHistoryStore: ReturnType<typeof createConversationHistoryStore> | undefined;

export function useConversationHistoryStore() {
  sharedConversationHistoryStore ??= createConversationHistoryStore();
  return sharedConversationHistoryStore;
}
