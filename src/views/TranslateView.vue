<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { speak } from '@/services/speech';
import { translateText } from '@/services/translator';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { LanguageCode } from '@/types/domain';

const route = useRoute();
const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const inputText = ref('你好，请问地铁站怎么走？');
const translatedText = ref('How do I get to the subway station?');
const translateStatus = ref('');

function loadHistoryRecord(historyId: string) {
  const record = historyStore.records.value.find((item) => item.id === historyId);
  if (!record) {
    translateStatus.value = '没有找到这条历史翻译';
    return;
  }

  settingsStore.update({
    sourceLanguage: record.sourceLanguage as LanguageCode,
    targetLanguage: record.targetLanguage as LanguageCode,
  });
  inputText.value = record.sourceText;
  translatedText.value = record.translatedText;
  translateStatus.value = '已载入历史翻译';
}

watch(
  () => route.query.historyId,
  (historyId) => {
    if (typeof historyId === 'string') {
      loadHistoryRecord(historyId);
    }
  },
  { immediate: true },
);

async function runTranslation() {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }

  translateStatus.value = '正在翻译...';
  const result = await translateText({
    text,
    sourceLanguage: settings.value.sourceLanguage,
    targetLanguage: settings.value.targetLanguage,
  });
  translatedText.value = result.translatedText;
  historyStore.add({
    sourceText: text,
    translatedText: result.translatedText,
    sourceLanguage: settings.value.sourceLanguage,
    targetLanguage: settings.value.targetLanguage,
  });
  translateStatus.value = '翻译完成';
}

function play() {
  speak(translatedText.value, settings.value.targetLanguage, settings.value.speechRate);
}

function clearCurrent() {
  inputText.value = '';
  translatedText.value = '';
  translateStatus.value = '';
}
</script>

<template>
  <section class="tool-panel translate-panel">
    <p v-if="translateStatus" class="translate-status font-medium" aria-live="polite">{{ translateStatus }}</p>
    <label class="input-card">
      <span>输入内容</span>
      <textarea v-model="inputText" rows="7" placeholder="输入或录入一句旅行用语"></textarea>
    </label>
    <div class="translate-actions">
      <button class="primary-action font-medium" type="button" @click="runTranslation">翻译</button>
      <button class="font-medium" type="button" @click="play">播放</button>
      <button class="font-medium" type="button" @click="clearCurrent">清空</button>
    </div>
    <article class="result-card">
      <span>译文</span>
      <p>{{ translatedText || '译文会显示在这里' }}</p>
    </article>
  </section>
</template>
