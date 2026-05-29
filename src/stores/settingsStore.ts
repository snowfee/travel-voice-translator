import { ref } from 'vue';

import type { AppSettings } from '@/types/domain';

const STORAGE_KEY = 'travel-voice-translator:settings';

const defaultSettings: AppSettings = {
  sourceLanguage: 'zh-CN',
  targetLanguage: 'en-US',
  autoPlay: true,
  speechRate: 1,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function createSettingsStore() {
  const settings = ref<AppSettings>(loadSettings());

  function update(nextSettings: Partial<AppSettings>) {
    settings.value = {
      ...settings.value,
      ...nextSettings,
    };
    saveSettings(settings.value);
  }

  return {
    settings,
    update,
  };
}
