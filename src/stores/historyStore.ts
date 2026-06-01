import { ref } from 'vue';

import type { NewTranslationRecord, TranslationRecord } from '@/types/domain';

const STORAGE_KEY = 'travel-voice-translator:history';
const MAX_RECORDS = 50;

function loadRecords(): TranslationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TranslationRecord[]) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: TranslationRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createHistoryStore() {
  const records = ref<TranslationRecord[]>(loadRecords());

  function add(record: NewTranslationRecord) {
    const saved: TranslationRecord = {
      ...record,
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    records.value = [saved, ...records.value].slice(0, MAX_RECORDS);
    saveRecords(records.value);
    return saved;
  }

  function remove(id: string) {
    records.value = records.value.filter((record) => record.id !== id);
    saveRecords(records.value);
  }

  return {
    records,
    add,
    remove,
  };
}

let sharedHistoryStore: ReturnType<typeof createHistoryStore> | undefined;

export function useHistoryStore() {
  sharedHistoryStore ??= createHistoryStore();
  return sharedHistoryStore;
}
