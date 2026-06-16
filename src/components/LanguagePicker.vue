<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  baiduLanguages,
  getLanguageGroups,
  languageIndex,
  popularBaiduLanguages,
  type BaiduLanguage,
} from '@/data/baiduLanguages';

const props = defineProps<{
  modelValue: string;
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
  select: [value: string];
}>();

const query = ref('');
const pickerBodyRef = ref<HTMLElement | null>(null);

const filteredLanguages = computed(() => {
  const keyword = query.value.trim().toLowerCase();

  if (!keyword) {
    return baiduLanguages;
  }

  return baiduLanguages.filter((language) => {
    return (
      language.nameZh.includes(keyword) ||
      language.nativeName.toLowerCase().includes(keyword) ||
      language.pinyin.includes(keyword) ||
      language.baiduCode.includes(keyword)
    );
  });
});

const groupedLanguages = computed(() => getLanguageGroups(filteredLanguages.value));

function selectLanguage(language: BaiduLanguage) {
  emit('select', language.appCode);
}

function scrollToGroup(initial: string) {
  const pickerBody = pickerBodyRef.value;
  if (!pickerBody) {
    return;
  }

  const groupSection = pickerBody.querySelector<HTMLElement>(`[data-language-group="${initial}"]`);
  if (!groupSection) {
    return;
  }

  pickerBody.scrollTo({
    top: groupSection.offsetTop,
    behavior: 'smooth',
  });
}
</script>

<template>
  <div v-if="open" class="language-picker" role="dialog" aria-modal="true" :aria-label="title">
    <header class="language-picker-header">
      <button type="button" aria-label="关闭语言选择" @click="emit('close')">‹</button>
      <h2>{{ title }}</h2>
    </header>

    <label class="language-search">
      <span>搜索语言</span>
      <input v-model="query" type="search" placeholder="中文 / English / yingyu" />
    </label>

    <div ref="pickerBodyRef" class="language-picker-body">
      <section v-if="!query" class="language-section">
        <h3>热门语言</h3>
        <button
          v-for="language in popularBaiduLanguages"
          :key="language.appCode"
          class="language-row"
          :class="{ selected: modelValue === language.appCode }"
          type="button"
          @click="selectLanguage(language)"
        >
          <span>{{ language.nameZh }}</span>
          <strong v-if="modelValue === language.appCode">✓</strong>
        </button>
      </section>

      <section class="language-section">
        <h3>{{ query ? '搜索结果' : '全部' }}</h3>
        <template v-for="group in groupedLanguages" :key="group.initial">
          <section :data-language-group="group.initial" class="language-group">
            <div :id="`language-index-${group.initial}`" class="language-group-title">{{ group.initial }}</div>
          <button
            v-for="language in group.languages"
            :key="language.appCode"
            class="language-row"
            :class="{ selected: modelValue === language.appCode }"
            type="button"
            @click="selectLanguage(language)"
          >
            <span>{{ language.nameZh }}</span>
            <small>{{ language.nativeName }}</small>
            <strong v-if="modelValue === language.appCode">✓</strong>
          </button>
          </section>
        </template>
      </section>
    </div>

    <nav class="language-index" aria-label="语言索引">
      <button
        v-for="item in languageIndex"
        :key="item"
        type="button"
        @click.prevent="scrollToGroup(item)"
      >
        {{ item }}
      </button>
    </nav>
  </div>
</template>
