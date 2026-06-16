<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { getLanguageName } from '@/data/languages';
import type { ConversationSession } from '@/stores/conversationHistoryStore';
import { useConversationHistoryStore } from '@/stores/conversationHistoryStore';
import { useHistoryStore } from '@/stores/historyStore';
import type { TranslationRecord } from '@/types/domain';

const conversationHistoryStore = useConversationHistoryStore();
const textHistoryStore = useHistoryStore();

type DateFilter = 'all' | 'today' | 'yesterday' | '7d' | '30d';
type TypeFilter = 'all' | 'conversation' | 'text';

type HistoryItem = {
  id: string;
  kind: 'conversation' | 'text';
  direction: string;
  sourceText: string;
  translatedText: string;
  occurredAt: string;
  countLabel: string;
  searchText: string;
};

const searchQuery = ref('');
const dateFilter = ref<DateFilter>('all');
const typeFilter = ref<TypeFilter>('all');

const dateFilters: { value: DateFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
];

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'conversation', label: '对话翻译' },
  { value: 'text', label: '文本翻译' },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function directionFromLanguages(sourceLanguage: string, targetLanguage: string) {
  return `${getLanguageName(sourceLanguage)} -> ${getLanguageName(targetLanguage)}`;
}

function getSessionDirection(session: ConversationSession) {
  const firstMessage = session.messages[0];
  if (!firstMessage) {
    return '未知语言';
  }

  return directionFromLanguages(firstMessage.sourceLanguage, firstMessage.targetLanguage);
}

function getPreview(session: ConversationSession) {
  const firstMessage = session.messages[0];
  if (!firstMessage) {
    return { sourceText: '暂无内容', translatedText: '' };
  }

  return firstMessage;
}

function createConversationItem(session: ConversationSession): HistoryItem {
  const preview = getPreview(session);
  const direction = getSessionDirection(session);
  const searchText = [
    direction,
    '对话翻译',
    ...session.messages.flatMap((message) => [
      getLanguageName(message.sourceLanguage),
      getLanguageName(message.targetLanguage),
      message.sourceText,
      message.translatedText,
    ]),
  ].join(' ');

  return {
    id: session.id,
    kind: 'conversation',
    direction,
    sourceText: preview.sourceText,
    translatedText: preview.translatedText,
    occurredAt: session.endedAt,
    countLabel: `${session.messages.length}条对话`,
    searchText,
  };
}

function createTextItem(record: TranslationRecord): HistoryItem {
  const direction = directionFromLanguages(record.sourceLanguage, record.targetLanguage);

  return {
    id: record.id,
    kind: 'text',
    direction,
    sourceText: record.sourceText,
    translatedText: record.translatedText,
    occurredAt: record.createdAt,
    countLabel: '文本',
    searchText: [
      direction,
      '文本翻译',
      getLanguageName(record.sourceLanguage),
      getLanguageName(record.targetLanguage),
      record.sourceText,
      record.translatedText,
    ].join(' '),
  };
}

const historyItems = computed<HistoryItem[]>(() =>
  [
    ...conversationHistoryStore.sessions.value.map(createConversationItem),
    ...textHistoryStore.records.value.map(createTextItem),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
);

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function matchesDateFilter(item: HistoryItem) {
  if (dateFilter.value === 'all') {
    return true;
  }

  const today = startOfDay(new Date());
  const itemDay = startOfDay(new Date(item.occurredAt));

  if (dateFilter.value === 'today') {
    return itemDay.getTime() === today.getTime();
  }

  if (dateFilter.value === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return itemDay.getTime() === yesterday.getTime();
  }

  const days = dateFilter.value === '7d' ? 7 : 30;
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return itemDay >= start && itemDay <= today;
}

function matchesTypeFilter(item: HistoryItem) {
  return typeFilter.value === 'all' || item.kind === typeFilter.value;
}

function matchesSearch(item: HistoryItem) {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return item.searchText.toLowerCase().includes(query);
}

const filteredHistoryItems = computed(() =>
  historyItems.value.filter(
    (item) => matchesTypeFilter(item) && matchesDateFilter(item) && matchesSearch(item),
  ),
);

const filteredSessions = filteredHistoryItems;
const hasFilters = computed(() => searchQuery.value.trim() || dateFilter.value !== 'all' || typeFilter.value !== 'all');

function clearFilters() {
  searchQuery.value = '';
  dateFilter.value = 'all';
  typeFilter.value = 'all';
}
</script>

<template>
  <section class="tool-panel history-panel">
    <section class="history-search-card">
      <label class="history-search-field">
        <span class="font-medium">搜索历史</span>
        <input v-model="searchQuery" type="search" placeholder="搜索原文、译文或语言" />
      </label>

      <div class="history-type-tabs" aria-label="按类型筛选历史">
        <button
          v-for="filter in typeFilters"
          :key="filter.value"
          type="button"
          :class="{ active: typeFilter === filter.value }"
          @click="typeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="history-filter-tabs" aria-label="按日期筛选历史">
        <button
          v-for="filter in dateFilters"
          :key="filter.value"
          type="button"
          :class="{ active: dateFilter === filter.value }"
          @click="dateFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      <p>{{ filteredHistoryItems.length }} 条结果</p>
    </section>

    <RouterLink
      v-for="item in filteredHistoryItems"
      :key="`${item.kind}-${item.id}`"
      class="history-list-card"
      :to="item.kind === 'text'
        ? { path: '/translate', query: { historyId: item.id } }
        : `/history/${item.id}`"
    >
      <div class="history-list-meta">
        <span>{{ item.direction }} | {{ item.kind === 'text' ? '文本翻译' : '对话翻译' }}</span>
        <span class="history-count-badge">{{ item.countLabel }}</span>
      </div>
      <p class="history-list-source">{{ item.sourceText }}</p>
      <p class="history-list-translation">{{ item.translatedText }}</p>
      <time>{{ formatTime(item.occurredAt) }}</time>
    </RouterLink>

    <div v-if="historyItems.length === 0" class="illustrated-empty-state">
      <img src="../public/images/empty-illustration-transparent.png" alt="" />
      <p>暂无历史记录，开始一次旅行对话或文本翻译后会显示在这里</p>
    </div>
    <div v-else-if="filteredHistoryItems.length === 0" class="illustrated-empty-state history-empty-result">
      <img src="../public/images/empty-illustration-transparent.png" alt="" />
      <p>没有找到相关历史，试试换个关键词</p>
      <button v-if="hasFilters" type="button" @click="clearFilters">清除筛选</button>
    </div>
  </section>
</template>
