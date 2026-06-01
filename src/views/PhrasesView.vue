<script setup lang="ts">
import { computed, ref } from 'vue';

import { phraseCategories, phrases } from '@/data/phrases';
import { speak } from '@/services/speech';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';

const historyStore = useHistoryStore();
const settings = useSettingsStore().settings;
const selectedCategory = ref(phraseCategories[0]);
const phraseQuery = ref('');

const filteredPhrases = computed(() => {
  const query = phraseQuery.value.trim().toLowerCase();
  return phrases.filter((phrase) => {
    const inCategory = phrase.category === selectedCategory.value;
    const inQuery =
      !query ||
      phrase.sourceText.toLowerCase().includes(query) ||
      Object.values(phrase.translations).some((translation) => translation?.toLowerCase().includes(query));
    return inCategory && inQuery;
  });
});

function usePhrase(phrase: (typeof phrases)[number]) {
  const translatedText = phrase.translations[settings.value.targetLanguage] ?? `[${settings.value.targetLanguage}] ${phrase.sourceText}`;
  historyStore.add({
    sourceText: phrase.sourceText,
    translatedText,
    sourceLanguage: 'zh-CN',
    targetLanguage: settings.value.targetLanguage,
  });

  if (settings.value.autoPlay) {
    speak(translatedText, settings.value.targetLanguage, settings.value.speechRate);
  }
}
</script>

<template>
  <section class="tool-panel phrases-panel">
    <div class="panel-title">
      <div>
        <span class="eyebrow">Travel Scenarios</span>
        <h2>常用短句</h2>
      </div>
    </div>
    <div class="category-tabs" aria-label="短句分类">
      <button v-for="category in phraseCategories" :key="category" type="button" :class="{ active: selectedCategory === category }" @click="selectedCategory = category">
        {{ category }}
      </button>
    </div>
    <input v-model="phraseQuery" class="search-input" type="search" placeholder="搜索短句或译文" />
    <div class="phrase-list">
      <button v-for="phrase in filteredPhrases" :key="phrase.id" type="button" @click="usePhrase(phrase)">
        <span>{{ phrase.sourceText }}</span>
        <strong>{{ phrase.translations[settings.targetLanguage] }}</strong>
      </button>
    </div>
  </section>
</template>
