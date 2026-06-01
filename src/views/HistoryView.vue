<script setup lang="ts">
import { getLanguageName } from '@/data/languages';
import { speak } from '@/services/speech';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { TranslationRecord } from '@/types/domain';

const historyStore = useHistoryStore();
const settings = useSettingsStore().settings;

function replayRecord(record: TranslationRecord) {
  speak(record.translatedText, record.targetLanguage, settings.value.speechRate);
}
</script>

<template>
  <section class="tool-panel history-panel">
    <div class="panel-title">
      <div>
        <span class="eyebrow">Recent Lines</span>
        <h2>历史</h2>
      </div>
    </div>
    <article v-for="record in historyStore.records.value" :key="record.id" class="history-card">
      <span>{{ getLanguageName(record.sourceLanguage) }} -> {{ getLanguageName(record.targetLanguage) }}</span>
      <p>{{ record.sourceText }}</p>
      <strong>{{ record.translatedText }}</strong>
      <div>
        <button type="button" @click="replayRecord(record)">播放</button>
        <button type="button" @click="historyStore.remove(record.id)">删除</button>
      </div>
    </article>
    <p v-if="historyStore.records.value.length === 0" class="empty-state">暂无历史记录。</p>
  </section>
</template>
