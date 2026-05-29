import { beforeEach, describe, expect, it } from 'vitest';

import { createSettingsStore } from '@/stores/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with travel-friendly defaults', () => {
    const store = createSettingsStore();

    expect(store.settings.value.sourceLanguage).toBe('zh-CN');
    expect(store.settings.value.targetLanguage).toBe('en-US');
    expect(store.settings.value.autoPlay).toBe(true);
    expect(store.settings.value.speechRate).toBe(1);
  });

  it('persists updates', () => {
    const store = createSettingsStore();

    store.update({
      targetLanguage: 'ja-JP',
      autoPlay: false,
      speechRate: 0.8,
    });

    const restored = createSettingsStore();

    expect(restored.settings.value.targetLanguage).toBe('ja-JP');
    expect(restored.settings.value.autoPlay).toBe(false);
    expect(restored.settings.value.speechRate).toBe(0.8);
  });
});
