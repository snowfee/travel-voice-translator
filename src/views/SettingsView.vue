<script setup lang="ts">
import { languages } from '@/data/languages';
import { useSettingsStore } from '@/stores/settingsStore';
import type { LanguageCode } from '@/types/domain';

const settingsStore = useSettingsStore();
const settings = settingsStore.settings;

function updateSourceLanguage(value: string) {
  settingsStore.update({ sourceLanguage: value as LanguageCode });
}

function updateTargetLanguage(value: string) {
  settingsStore.update({ targetLanguage: value as LanguageCode });
}
</script>

<template>
  <section class="tool-panel settings-panel">
    <label class="setting-row">
      <span>默认源语言</span>
      <select :value="settings.sourceLanguage" @change="updateSourceLanguage(($event.target as HTMLSelectElement).value)">
        <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
      </select>
    </label>
    <label class="setting-row">
      <span>默认目标语言</span>
      <select :value="settings.targetLanguage" @change="updateTargetLanguage(($event.target as HTMLSelectElement).value)">
        <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
      </select>
    </label>
    <label class="setting-row inline-setting">
      <span>自动播放译文</span>
      <input :checked="settings.autoPlay" type="checkbox" @change="settingsStore.update({ autoPlay: ($event.target as HTMLInputElement).checked })" />
    </label>
    <label class="setting-row">
      <span>播放速度 {{ settings.speechRate.toFixed(1) }}x</span>
      <input
        :value="settings.speechRate"
        type="range"
        min="0.6"
        max="1.4"
        step="0.1"
        @input="settingsStore.update({ speechRate: Number(($event.target as HTMLInputElement).value) })"
      />
    </label>
  </section>
</template>
