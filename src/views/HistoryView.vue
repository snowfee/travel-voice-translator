<script setup lang="ts">
import { getLanguageName } from '@/data/languages';
import { useConversationHistoryStore } from '@/stores/conversationHistoryStore';

const conversationHistoryStore = useConversationHistoryStore();

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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
    <article v-for="session in conversationHistoryStore.sessions.value" :key="session.id" class="history-card session-card">
      <div class="session-summary">
        <span>{{ formatTime(session.endedAt) }} · {{ session.messages.length }} 条对话</span>
        <button type="button" @click="conversationHistoryStore.remove(session.id)">删除</button>
      </div>
      <details>
        <summary>查看本轮对话</summary>
        <div class="session-messages">
          <article v-for="message in session.messages" :key="message.id" class="session-message">
            <span>{{ getLanguageName(message.sourceLanguage) }} -> {{ getLanguageName(message.targetLanguage) }}</span>
            <p>{{ message.sourceText }}</p>
            <strong>{{ message.translatedText }}</strong>
          </article>
        </div>
      </details>
    </article>
    <p v-if="conversationHistoryStore.sessions.value.length === 0" class="empty-state">暂无对话记录。</p>
  </section>
</template>
