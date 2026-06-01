<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import { languages } from '@/data/languages';
import { useSettingsStore } from '@/stores/settingsStore';
import type { LanguageCode } from '@/types/domain';

const tabs = [
  { path: '/conversation', label: '对话', shortLabel: '话' },
  { path: '/translate', label: '翻译', shortLabel: '译' },
  { path: '/phrases', label: '短句', shortLabel: '句' },
  { path: '/history', label: '历史', shortLabel: '史' },
  { path: '/settings', label: '设置', shortLabel: '设' },
];

const isNavOpen = ref(false);
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;

function updateSourceLanguage(value: string) {
  settingsStore.update({ sourceLanguage: value as LanguageCode });
}

function updateTargetLanguage(value: string) {
  settingsStore.update({ targetLanguage: value as LanguageCode });
}

function swapLanguages() {
  const sourceLanguage = settings.value.sourceLanguage;
  settingsStore.update({
    sourceLanguage: settings.value.targetLanguage,
    targetLanguage: sourceLanguage,
  });
}
</script>

<template>
  <main class="travel-console">
    <header class="app-hero">
      <button class="nav-toggle" type="button" aria-label="打开主要导航" @click="isNavOpen = true">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div>
        <span class="eyebrow">Travel Voice Translator</span>
        <h1>旅言</h1>
      </div>
      <span class="connection-pill">本地兜底</span>
    </header>

    <section class="route-card" aria-label="语言方向">
      <label class="route-stop">
        <span>我说</span>
        <select :value="settings.sourceLanguage" @change="updateSourceLanguage(($event.target as HTMLSelectElement).value)">
          <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
        </select>
      </label>
      <button class="swap-button" type="button" aria-label="交换语言" @click="swapLanguages">
        <span></span>
      </button>
      <label class="route-stop">
        <span>对方说</span>
        <select :value="settings.targetLanguage" @change="updateTargetLanguage(($event.target as HTMLSelectElement).value)">
          <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
        </select>
      </label>
    </section>

    <section class="content-deck">
      <RouterView />
    </section>

    <div v-if="isNavOpen" class="nav-scrim" @click="isNavOpen = false"></div>
    <nav class="nav-drawer" :class="{ open: isNavOpen }" aria-label="主要导航">
      <div class="nav-drawer-head">
        <div>
          <span class="eyebrow">Menu</span>
          <strong>旅行工具</strong>
        </div>
        <button type="button" aria-label="关闭主要导航" @click="isNavOpen = false">×</button>
      </div>
      <RouterLink v-for="tab in tabs" :key="tab.path" :to="tab.path" active-class="active" @click="isNavOpen = false">
        <span>{{ tab.shortLabel }}</span>
        <strong>{{ tab.label }}</strong>
      </RouterLink>
    </nav>
  </main>
</template>
