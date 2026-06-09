import { computed, ref, type Ref } from 'vue';

import type { AppSettings, TranslationRecord } from '@/types/domain';

export type Speaker = 'source' | 'target';
export type ConversationMessage = TranslationRecord & { speaker: Speaker; pending?: boolean };

export function createConversationStore(settings: Ref<AppSettings>) {
  const records = ref<ConversationMessage[]>([]);
  const draft = ref<ConversationMessage | null>(null);
  const hasStarted = ref(false);
  const messages = computed<ConversationMessage[]>(() => {
    if (records.value.length > 0 || draft.value) {
      return draft.value ? [...records.value, draft.value] : records.value;
    }

    if (hasStarted.value) {
      return [];
    }

    return [
      {
        id: 'demo-source',
        speaker: 'source',
        sourceText: '你好，请问地铁站怎么走？',
        translatedText: 'How do I get to the subway station?',
        sourceLanguage: settings.value.sourceLanguage,
        targetLanguage: settings.value.targetLanguage,
        createdAt: 'demo-source',
      },
      {
        id: 'demo-target',
        speaker: 'target',
        sourceText: 'Go straight ahead, then turn left.',
        translatedText: '往前直走，然后左转。',
        sourceLanguage: settings.value.targetLanguage,
        targetLanguage: settings.value.sourceLanguage,
        createdAt: 'demo-target',
      },
    ];
  });

  function append(record: TranslationRecord, speaker: Speaker) {
    hasStarted.value = true;
    records.value = [...records.value, { ...record, speaker, pending: false }];
  }

  function startDraft(speaker: Speaker) {
    hasStarted.value = true;
    draft.value = {
      id: 'realtime-draft',
      speaker,
      sourceText: '',
      translatedText: '',
      sourceLanguage: speaker === 'source' ? settings.value.sourceLanguage : settings.value.targetLanguage,
      targetLanguage: speaker === 'source' ? settings.value.targetLanguage : settings.value.sourceLanguage,
      createdAt: new Date().toISOString(),
      pending: true,
    };
  }

  function updateDraftSource(text: string) {
    if (draft.value) {
      draft.value = { ...draft.value, sourceText: text };
    }
  }

  function updateDraftTranslation(text: string) {
    if (draft.value) {
      draft.value = { ...draft.value, translatedText: text };
    }
  }

  function commitDraft(record: TranslationRecord) {
    const speaker = draft.value?.speaker ?? 'source';
    append(record, speaker);
    draft.value = null;
  }

  function cancelDraft() {
    draft.value = null;
  }

  function takeCurrentConversation() {
    const completedRecords = records.value;
    records.value = [];
    draft.value = null;
    hasStarted.value = true;
    return completedRecords;
  }

  return {
    messages,
    append,
    startDraft,
    updateDraftSource,
    updateDraftTranslation,
    commitDraft,
    cancelDraft,
    takeCurrentConversation,
  };
}

let sharedConversationStore: ReturnType<typeof createConversationStore> | undefined;

export function useConversationStore(settings: Ref<AppSettings>) {
  sharedConversationStore ??= createConversationStore(settings);
  return sharedConversationStore;
}
