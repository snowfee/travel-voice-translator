<script setup lang="ts">
import { ref } from 'vue';

import { speak } from '@/services/speech';
import { translateText } from '@/services/translator';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';

const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const inputText = ref('你好，请问地铁站怎么走？');
const translatedText = ref('How do I get to the subway station?');

function swapLanguages() {
  const sourceLanguage = settings.value.sourceLanguage;
  settingsStore.update({
    sourceLanguage: settings.value.targetLanguage,
    targetLanguage: sourceLanguage,
  });
}

async function runTranslation() {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }

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
}

function play() {
  speak(translatedText.value, settings.value.targetLanguage, settings.value.speechRate);
}

function clearCurrent() {
  inputText.value = '';
  translatedText.value = '';
}
</script>

<template>
  <section class="tool-panel translate-panel">
    <div class="panel-title">
      <div>
        <span class="eyebrow">Text Mode</span>
        <h2>文本翻译</h2>
      </div>
      <button type="button" @click="swapLanguages">交换语言</button>
    </div>
    <label class="input-card">
      <span>输入内容</span>
      <textarea v-model="inputText" rows="7" placeholder="输入或录入一句旅行用语"></textarea>
    </label>
    <div class="translate-actions">
      <button class="primary-action" type="button" @click="runTranslation">翻译</button>
      <button type="button" @click="play">播放</button>
      <button type="button" @click="clearCurrent">清空</button>
    </div>
    <article class="result-card">
      <span>译文</span>
      <p>{{ translatedText || '译文会显示在这里' }}</p>
    </article>
  </section>
</template>
