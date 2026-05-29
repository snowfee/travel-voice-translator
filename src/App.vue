<script setup lang="ts">
import { computed, ref } from 'vue';

import { getLanguageName, languages } from '@/data/languages';
import { phraseCategories, phrases } from '@/data/phrases';
import { canRecognizeSpeech, recognizeOnce, speak } from '@/services/speech';
import { translateText } from '@/services/translator';
import { createHistoryStore } from '@/stores/historyStore';
import { createSettingsStore } from '@/stores/settingsStore';
import type { LanguageCode, Phrase, TranslationRecord } from '@/types/domain';

type TabId = 'conversation' | 'translate' | 'phrases' | 'history' | 'settings';
type Speaker = 'source' | 'target';
type ConversationMessage = TranslationRecord & { speaker: Speaker };

const tabs: Array<{ id: TabId; label: string; shortLabel: string }> = [
  { id: 'conversation', label: '对话', shortLabel: '话' },
  { id: 'translate', label: '翻译', shortLabel: '译' },
  { id: 'phrases', label: '短句', shortLabel: '句' },
  { id: 'history', label: '历史', shortLabel: '史' },
  { id: 'settings', label: '设置', shortLabel: '设' },
];

const activeTab = ref<TabId>('conversation');
const isNavOpen = ref(false);
const inputText = ref('你好，请问地铁站怎么走？');
const translatedText = ref('How do I get to the subway station?');
const status = ref('准备就绪，可以开始旅行现场翻译。');
const isListening = ref(false);
const selectedCategory = ref(phraseCategories[0]);
const phraseQuery = ref('');
const selectedPhrase = ref<Phrase | null>(phrases[0]);
const conversationRecords = ref<ConversationMessage[]>([]);

const historyStore = createHistoryStore();
const settingsStore = createSettingsStore();
const settings = settingsStore.settings;

const speechAvailable = computed(() => {
  if (typeof window === 'undefined') {
    return false;
  }
  return canRecognizeSpeech();
});

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

const sourceLanguageName = computed(() => getLanguageName(settings.value.sourceLanguage));
const targetLanguageName = computed(() => getLanguageName(settings.value.targetLanguage));
const conversationMessages = computed<ConversationMessage[]>(() => {
  if (conversationRecords.value.length > 0) {
    return conversationRecords.value;
  }

  return [
    {
      id: 'demo-source',
      speaker: 'source',
      sourceText: inputText.value,
      translatedText: translatedText.value,
      sourceLanguage: settings.value.sourceLanguage,
      targetLanguage: settings.value.targetLanguage,
      createdAt: 'demo-source',
    },
    {
      id: 'demo-target',
      speaker: 'target',
      sourceText: 'Go straight ahead, then turn left.',
      translatedText: '往前直走，然后左转。',
      sourceLanguage: settings.value.targetLanguage,
      targetLanguage: settings.value.sourceLanguage,
      createdAt: 'demo-target',
    },
  ];
});

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

function navigate(tab: TabId) {
  activeTab.value = tab;
  isNavOpen.value = false;
}

function sourceToTargetLanguages(speaker?: Speaker) {
  if (speaker === 'target') {
    return {
      sourceLanguage: settings.value.targetLanguage,
      targetLanguage: settings.value.sourceLanguage,
    };
  }

  return {
    sourceLanguage: settings.value.sourceLanguage,
    targetLanguage: settings.value.targetLanguage,
  };
}

async function runTranslation(text = inputText.value, speaker?: Speaker) {
  const cleanText = text.trim();
  if (!cleanText) {
    status.value = '请输入或录入一句话。';
    return;
  }

  const direction = sourceToTargetLanguages(speaker);
  status.value = '正在翻译...';
  const result = await translateText({
    text: cleanText,
    sourceLanguage: direction.sourceLanguage,
    targetLanguage: direction.targetLanguage,
  });
  translatedText.value = result.translatedText;
  const saved = historyStore.add({
    sourceText: cleanText,
    translatedText: result.translatedText,
    sourceLanguage: direction.sourceLanguage,
    targetLanguage: direction.targetLanguage,
  });

  if (speaker) {
    conversationRecords.value = [...conversationRecords.value, { ...saved, speaker }];
  }

  status.value = result.confidence === 'local' ? '已使用本地短句翻译。' : '已生成本地兜底翻译。';

  if (settings.value.autoPlay) {
    speak(result.translatedText, direction.targetLanguage, settings.value.speechRate);
  }
}

async function listenAndTranslate(speaker: Speaker = 'source') {
  if (!speechAvailable.value) {
    status.value = '当前浏览器不支持语音识别，请直接输入文字。';
    return;
  }

  try {
    const direction = sourceToTargetLanguages(speaker);
    isListening.value = true;
    status.value = speaker === 'source' ? '正在听你说...' : '正在听对方说...';
    const text = await recognizeOnce(direction.sourceLanguage);
    inputText.value = text;
    await runTranslation(text, speaker);
  } catch (error) {
    status.value = error instanceof Error ? error.message : '语音识别失败，请再试一次。';
  } finally {
    isListening.value = false;
  }
}

function play(text = translatedText.value, language = settings.value.targetLanguage) {
  const played = speak(text, language, settings.value.speechRate);
  status.value = played ? '正在播放译文。' : '当前浏览器不支持语音播放。';
}

function usePhrase(phrase: Phrase) {
  selectedPhrase.value = phrase;
  inputText.value = phrase.sourceText;
  const localText = phrase.translations[settings.value.targetLanguage] ?? `[${settings.value.targetLanguage}] ${phrase.sourceText}`;
  translatedText.value = localText;
  status.value = '已选择常用短句。';
  historyStore.add({
    sourceText: phrase.sourceText,
    translatedText: localText,
    sourceLanguage: 'zh-CN',
    targetLanguage: settings.value.targetLanguage,
  });
  if (settings.value.autoPlay) {
    play(localText, settings.value.targetLanguage);
  }
}

function replayRecord(record: TranslationRecord) {
  play(record.translatedText, record.targetLanguage);
}

function replayConversationMessage(message: ConversationMessage) {
  play(message.translatedText, message.targetLanguage);
}

function clearCurrent() {
  inputText.value = '';
  translatedText.value = '';
  status.value = '已清空当前翻译。';
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
        <h1>旅行现场翻译</h1>
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
      <section v-if="activeTab === 'conversation'" class="conversation-screen" aria-label="对话">
        <div class="conversation-stage bubble-stream">
          <article
            v-for="message in conversationMessages"
            :key="message.id"
            class="speech-panel chat-bubble"
            :class="message.speaker === 'source' ? 'chat-bubble-source speech-panel-source' : 'chat-bubble-target speech-panel-target'"
          >
            <p>{{ message.sourceText }}</p>
            <strong>{{ message.translatedText }}</strong>
            <button
              class="play-icon-button"
              type="button"
              :aria-label="message.speaker === 'source' ? '播放给对方' : '播放给我'"
              @click="replayConversationMessage(message)"
            >
              <span class="play-icon" aria-hidden="true"></span>
            </button>
          </article>
        </div>

        <section class="voice-dock">
          <section class="quick-actions" aria-label="语音操作">
            <button class="voice-chip" type="button" :disabled="isListening" @click="listenAndTranslate('source')">
              <span>我说</span>
              <strong>{{ sourceLanguageName }}</strong>
            </button>
            <button class="mic-button" :class="{ listening: isListening }" type="button" :disabled="isListening" aria-label="开始语音翻译" @click="listenAndTranslate('source')">
              <span class="mic-symbol"></span>
            </button>
            <button class="voice-chip" type="button" :disabled="isListening" @click="listenAndTranslate('target')">
              <span>对方说</span>
              <strong>{{ targetLanguageName }}</strong>
            </button>
          </section>

          <p class="status-line" aria-live="polite">{{ status }}</p>
        </section>
      </section>

      <section v-else-if="activeTab === 'translate'" class="tool-panel translate-panel">
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
          <button class="primary-action" type="button" @click="runTranslation()">翻译</button>
          <button type="button" @click="play()">播放</button>
          <button type="button" @click="clearCurrent">清空</button>
        </div>
        <article class="result-card">
          <span>译文</span>
          <p>{{ translatedText || '译文会显示在这里' }}</p>
        </article>
      </section>

      <section v-else-if="activeTab === 'phrases'" class="tool-panel phrases-panel">
        <div class="panel-title">
          <div>
            <span class="eyebrow">Travel Scenarios</span>
            <h2>常用短句</h2>
          </div>
        </div>
        <div class="category-tabs" aria-label="短句分类">
          <button
            v-for="category in phraseCategories"
            :key="category"
            type="button"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
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

      <section v-else-if="activeTab === 'history'" class="tool-panel history-panel">
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

      <section v-else class="tool-panel settings-panel">
        <div class="panel-title">
          <div>
            <span class="eyebrow">Preferences</span>
            <h2>设置</h2>
          </div>
        </div>
        <label class="setting-row">
          <span>默认源语言</span>
          <select :value="settings.sourceLanguage" @change="updateSourceLanguage(($event.target as HTMLSelectElement).value)">
            <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
          </select>
        </label>
        <label class="setting-row">
          <span>默认目标语言</span>
          <select :value="settings.targetLanguage" @change="updateTargetLanguage(($event.target as HTMLSelectElement).value)">
            <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.nativeName }}</option>
          </select>
        </label>
        <label class="setting-row inline-setting">
          <span>自动播放译文</span>
          <input :checked="settings.autoPlay" type="checkbox" @change="settingsStore.update({ autoPlay: ($event.target as HTMLInputElement).checked })" />
        </label>
        <label class="setting-row">
          <span>播放速度 {{ settings.speechRate.toFixed(1) }}x</span>
          <input
            :value="settings.speechRate"
            type="range"
            min="0.6"
            max="1.4"
            step="0.1"
            @input="settingsStore.update({ speechRate: Number(($event.target as HTMLInputElement).value) })"
          />
        </label>
      </section>
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
      <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" @click="navigate(tab.id)">
        <span>{{ tab.shortLabel }}</span>
        <strong>{{ tab.label }}</strong>
      </button>
    </nav>
  </main>
</template>
