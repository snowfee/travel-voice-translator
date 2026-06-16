<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getLanguageName } from '@/data/languages';
import { speak } from '@/services/speech';
import type { ConversationMessage } from '@/stores/conversationStore';
import { useConversationHistoryStore } from '@/stores/conversationHistoryStore';
import { useSettingsStore } from '@/stores/settingsStore';

const route = useRoute();
const router = useRouter();
const conversationHistoryStore = useConversationHistoryStore();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const copyStatus = ref('复制全文');

const session = computed(() =>
  conversationHistoryStore.sessions.value.find((item) => item.id === route.params.id),
);

const sessionDirection = computed(() => {
  const firstMessage = session.value?.messages[0];
  if (!firstMessage) {
    return '未知语言';
  }

  return `${getLanguageName(firstMessage.sourceLanguage)} -> ${getLanguageName(firstMessage.targetLanguage)}`;
});

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildCopyText() {
  if (!session.value) {
    return '';
  }

  const header = [
    sessionDirection.value,
    `时间：${formatTime(session.value.endedAt)}`,
  ].join('\n');

  const messages = session.value.messages
    .map((message) => {
      const speaker = message.speaker === 'source' ? '我说' : '对方说';
      return [
        `${speaker}：`,
        message.sourceText,
        message.translatedText,
      ].join('\n');
    })
    .join('\n\n');

  return `${header}\n\n${messages}`;
}

function goBack() {
  router.push('/history');
}

async function copySession() {
  const text = buildCopyText();
  if (!text || !navigator.clipboard) {
    copyStatus.value = '无法复制';
    return;
  }

  await navigator.clipboard.writeText(text);
  copyStatus.value = '已复制';
  window.setTimeout(() => {
    copyStatus.value = '复制全文';
  }, 1400);
}

function removeSession() {
  if (!session.value) {
    return;
  }

  conversationHistoryStore.remove(session.value.id);
  router.push('/history');
}

function replayOriginalMessage(message: ConversationMessage) {
  speak(message.sourceText, message.sourceLanguage, settings.value.speechRate);
}

function replayTranslationMessage(message: ConversationMessage) {
  speak(message.translatedText, message.targetLanguage, settings.value.speechRate);
}
</script>

<template>
  <section class="tool-panel history-detail-panel">
    <div class="history-detail-bar">
      <button type="button" aria-label="返回历史" @click="goBack">‹</button>
      <h2 class="font-medium">历史详情</h2>
      <span></span>
    </div>

    <div v-if="!session" class="history-card history-missing-card">
      <strong>没有找到这条历史。</strong>
      <p>这条记录可能已经被删除。</p>
      <button class="history-detail-link" type="button" @click="goBack">返回历史</button>
    </div>

    <template v-else>
      <section class="history-detail-summary">
        <strong class="font-medium">{{ sessionDirection }} · {{ session.messages.length }}条对话</strong>
        <span>{{ formatTime(session.endedAt) }}</span>
      </section>

      <div class="session-detail-actions">
        <button class="font-medium" type="button" @click="copySession">{{ copyStatus }}</button>
        <button type="button" class="danger-action font-medium" @click="removeSession">删除记录</button>
      </div>

      <div class="session-detail-stream bubble-stream">
        <article
          v-for="message in session.messages"
          :key="message.id"
          class="speech-panel chat-bubble"
          :class="message.speaker === 'target' ? 'chat-bubble-target speech-panel-target' : 'chat-bubble-source speech-panel-source'"
        >
          <section class="speech-original" aria-label="原文">
            <p class="font-regular">{{ message.sourceText }}</p>
            <button
              class="play-icon-button"
              type="button"
              aria-label="播放原文"
              @click="replayOriginalMessage(message)"
            >
              <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="54" height="48" viewBox="0 0 54 48" fill="none" aria-hidden="true">
                <path d="M24 7L24 41L13.9992 32.0002L6 32.0002L6 15.9998L13.9992 15.9998L24 7Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
                <path d="M31.071 16.929C34.9762 20.8336 34.9762 27.1664 31.071 31.0711" stroke="currentColor" stroke-width="4" />
                <path d="M36.728 11.2721C43.7573 18.3005 43.7573 29.6996 36.728 36.7279" stroke="currentColor" stroke-width="4" />
              </svg>
            </button>
          </section>
          <div class="speech-divider" aria-hidden="true"></div>
          <section class="speech-translation" aria-label="译文">
            <strong class="font-medium">{{ message.translatedText }}</strong>
            <button
              class="play-icon-button"
              type="button"
              aria-label="播放译文"
              @click="replayTranslationMessage(message)"
            >
              <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="54" height="48" viewBox="0 0 54 48" fill="none" aria-hidden="true">
                <path d="M24 7L24 41L13.9992 32.0002L6 32.0002L6 15.9998L13.9992 15.9998L24 7Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
                <path d="M31.071 16.929C34.9762 20.8336 34.9762 27.1664 31.071 31.0711" stroke="currentColor" stroke-width="4" />
                <path d="M36.728 11.2721C43.7573 18.3005 43.7573 29.6996 36.728 36.7279" stroke="currentColor" stroke-width="4" />
              </svg>
            </button>
          </section>
        </article>
      </div>
    </template>
  </section>
</template>