<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import LanguagePicker from '@/components/LanguagePicker.vue';
import { languages } from '@/data/languages';
import { useConversationHistoryStore } from '@/stores/conversationHistoryStore';
import { useConversationStore } from '@/stores/conversationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { LanguageCode } from '@/types/domain';

const tabs = [
  { path: '/conversation', label: '对话', shortLabel: '话' },
  { path: '/translate', label: '翻译', shortLabel: '译' },
  { path: '/phrases', label: '短句', shortLabel: '句' },
  { path: '/history', label: '历史', shortLabel: '史' },
  { path: '/settings', label: '设置', shortLabel: '设' },
];

const pageTitles: Record<string, { eyebrow: string; title: string }> = {
  '/conversation': { eyebrow: 'Travel Voice Translator', title: '旅言' },
  '/translate': { eyebrow: 'Text Mode', title: '文本翻译' },
  '/phrases': { eyebrow: 'Travel Scenarios', title: '常用短句' },
  '/history': { eyebrow: 'Recent Lines', title: '历史' },
  '/settings': { eyebrow: 'Preferences', title: '设置' },
};

const isNavOpen = ref(false);
const languagePickerTarget = ref<'source' | 'target' | null>(null);
const route = useRoute();
const isHistoryDetailRoute = computed(() => route.path.startsWith('/history/'));
const pageTitle = computed(() => pageTitles[route.path] ?? pageTitles['/conversation']);
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const conversationStore = useConversationStore(settings);
const conversationHistoryStore = useConversationHistoryStore();

function updateSourceLanguage(value: string) {
  settingsStore.update({ sourceLanguage: value as LanguageCode });
}

function updateTargetLanguage(value: string) {
  settingsStore.update({ targetLanguage: value as LanguageCode });
}

function openLanguagePicker(target: 'source' | 'target') {
  languagePickerTarget.value = target;
}

function closeLanguagePicker() {
  languagePickerTarget.value = null;
}

function selectLanguage(value: string) {
  if (languagePickerTarget.value === 'source') {
    updateSourceLanguage(value);
  }

  if (languagePickerTarget.value === 'target') {
    updateTargetLanguage(value);
  }

  closeLanguagePicker();
}

function swapLanguages() {
  const sourceLanguage = settings.value.sourceLanguage;
  settingsStore.update({
    sourceLanguage: settings.value.targetLanguage,
    targetLanguage: sourceLanguage,
  });
}

function startNewConversation() {
  conversationHistoryStore.archive(conversationStore.takeCurrentConversation());
}
</script>

<template>
  <main class="travel-console" :class="{ 'travel-console-detail': isHistoryDetailRoute }">
    <header v-if="!isHistoryDetailRoute" class="app-hero">
      <button class="nav-toggle" type="button" aria-label="打开主要导航" @click="isNavOpen = true">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div>
        <span class="eyebrow font-bold">{{ pageTitle.eyebrow }}</span>
        <h1 class="font-bold">{{ pageTitle.title }}</h1>
      </div>
      <button v-if="route.path === '/conversation'" class="new-conversation-button font-medium" type="button" @click="startNewConversation">新对话</button>
    </header>

    <section v-if="route.path === '/conversation' || route.path === '/translate'" class="route-card" aria-label="语言方向">
      <div class="route-stop">
        <span class="font-medium">我说</span>
        <button class="route-stop-trigger font-medium" type="button" @click="openLanguagePicker('source')">
          {{ languages.find((language) => language.code === settings.sourceLanguage)?.nativeName ?? settings.sourceLanguage }}
        </button>
      </div>
      <button class="swap-button" type="button" aria-label="交换语言" @click="swapLanguages">
        <span></span>
      </button>
      <div class="route-stop">
        <span class="font-medium">对方说</span>
        <button class="route-stop-trigger font-medium" type="button" @click="openLanguagePicker('target')">
          {{ languages.find((language) => language.code === settings.targetLanguage)?.nativeName ?? settings.targetLanguage }}
        </button>
      </div>
    </section>

    <section class="content-deck">
      <RouterView />
    </section>

    <div v-if="isNavOpen" class="nav-scrim" @click="isNavOpen = false"></div>
    <nav class="nav-drawer" :class="{ open: isNavOpen }" aria-label="主要导航">
      <div class="nav-drawer-head">
        <div>
          <span class="eyebrow font-bold">Menu</span>
          <strong class="font-medium">旅言</strong>
        </div>
        <button type="button" aria-label="关闭主要导航" @click="isNavOpen = false">×</button>
      </div>
      <RouterLink v-for="tab in tabs" :key="tab.path" :to="tab.path" active-class="active" @click="isNavOpen = false">
        <span class="font-medium">{{ tab.shortLabel }}</span>
        <strong class="font-medium">{{ tab.label }}</strong>
      </RouterLink>
    </nav>
    <LanguagePicker
      :open="languagePickerTarget !== null"
      :title="languagePickerTarget === 'source' ? '选择我说的语言' : '选择对方语言'"
      :model-value="languagePickerTarget === 'source' ? settings.sourceLanguage : settings.targetLanguage"
      @close="closeLanguagePicker"
      @select="selectLanguage"
    />
  </main>
</template>
