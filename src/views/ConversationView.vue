<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';

import { getLanguageName } from '@/data/languages';
import {
  canRecognizeSpeech,
  recognizeOnce,
  speak,
  startContinuousRecognition as startWebSpeechContinuousRecognition,
  type ContinuousRecognitionSession,
} from '@/services/speech';
import { translateText } from '@/services/translator';
import { useConversationStore, type ConversationMessage, type Speaker } from '@/stores/conversationStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';

const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const conversationStore = useConversationStore(settings);
const status = ref('准备就绪，可以开始旅行现场翻译。');
const isListening = ref(false);
const continuousSession = ref<ContinuousRecognitionSession | null>(null);
const activeSpeaker = ref<Speaker>('source');
const isTranslatingFinal = ref(false);
const isContinuousActive = computed(() => Boolean(continuousSession.value));

const sourceLanguageName = computed(() => getLanguageName(settings.value.sourceLanguage));
const targetLanguageName = computed(() => getLanguageName(settings.value.targetLanguage));
const speechAvailable = computed(() => {
  if (typeof window === 'undefined') {
    return false;
  }
  return canRecognizeSpeech();
});

function directionFor(speaker: Speaker) {
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

async function runTranslation(text: string, speaker: Speaker) {
  const direction = directionFor(speaker);
  status.value = '正在翻译...';
  const result = await translateText({ text, ...direction });
  const saved = historyStore.add({
    sourceText: text,
    translatedText: result.translatedText,
    ...direction,
  });
  conversationStore.append(saved, speaker);
  status.value =
    result.confidence === 'local'
      ? '已使用本地短句翻译。'
      : result.confidence === 'cloud'
        ? '已使用百度云端翻译。'
        : '云端不可用，已生成本地兜底翻译。';

  if (settings.value.autoPlay) {
    speak(result.translatedText, direction.targetLanguage, settings.value.speechRate);
  }
}

async function translateDraft(text: string, speaker: Speaker) {
  const direction = directionFor(speaker);
  isTranslatingFinal.value = true;
  status.value = '正在翻译...';
  conversationStore.updateDraftSource(text);
  conversationStore.updateDraftTranslation('');

  try {
    const result = await translateText({ text, ...direction });
    const saved = historyStore.add({
      sourceText: text,
      translatedText: result.translatedText,
      ...direction,
    });
    conversationStore.commitDraft(saved);
    status.value =
      result.confidence === 'local'
        ? '已使用本地短句翻译。'
        : result.confidence === 'cloud'
          ? '已使用百度云端翻译。'
          : '云端不可用，已生成本地兜底翻译。';

    if (settings.value.autoPlay) {
      speak(result.translatedText, direction.targetLanguage, settings.value.speechRate);
    }
  } finally {
    isTranslatingFinal.value = false;
    if (continuousSession.value && activeSpeaker.value === speaker) {
      conversationStore.startDraft(speaker);
    }
  }
}

async function listenAndTranslateOnce(speaker: Speaker) {
  if (!speechAvailable.value) {
    status.value = '当前浏览器不支持语音识别。';
    return;
  }

  try {
    const direction = directionFor(speaker);
    isListening.value = true;
    status.value = speaker === 'source' ? '正在听你说...' : '正在听对方说...';
    const text = await recognizeOnce(direction.sourceLanguage);
    await runTranslation(text, speaker);
  } catch (error) {
    status.value = error instanceof Error ? error.message : '语音识别失败，请再试一次。';
  } finally {
    isListening.value = false;
  }
}

async function stopContinuousRecognition() {
  const session = continuousSession.value;
  continuousSession.value = null;
  conversationStore.cancelDraft();

  if (session) {
    try {
      await session.stop();
    } catch (error) {
      status.value = error instanceof Error ? error.message : '停止连续语音识别失败。';
    }
  }
}

async function startContinuousRecognition(speaker: Speaker) {
  if (continuousSession.value) {
    if (activeSpeaker.value === speaker) {
      await stopContinuousRecognition();
      return;
    }

    await stopContinuousRecognition();
  }

  const direction = directionFor(speaker);
  activeSpeaker.value = speaker;
  conversationStore.startDraft(speaker);

  try {
    continuousSession.value = startWebSpeechContinuousRecognition(direction.sourceLanguage, {
      onInterim: (text) => {
        if (!isTranslatingFinal.value) {
          conversationStore.updateDraftSource(text);
        }
      },
      onFinal: (text) => {
        void translateDraft(text, speaker);
      },
      onStatus: (nextStatus) => {
        status.value = nextStatus;
      },
      onError: (message) => {
        status.value = message;
      },
    });
  } catch (error) {
    conversationStore.cancelDraft();
    status.value = `${error instanceof Error ? error.message : '浏览器连续语音识别启动失败。'} 正在改用浏览器单句识别。`;
    await listenAndTranslateOnce(speaker);
  }
}

function replayConversationMessage(message: ConversationMessage) {
  const played = speak(message.translatedText, message.targetLanguage, settings.value.speechRate);
  status.value = played ? '正在播放译文。' : '当前浏览器不支持语音播放。';
}

onUnmounted(() => {
  void stopContinuousRecognition();
});
</script>

<template>
  <section class="conversation-screen" aria-label="对话">
    <div class="conversation-stage bubble-stream">
      <article
        v-for="message in conversationStore.messages.value"
        :key="message.id"
        class="speech-panel chat-bubble"
        :class="[message.speaker === 'source' ? 'chat-bubble-source speech-panel-source' : 'chat-bubble-target speech-panel-target', { pending: message.pending }]"
      >
        <p>{{ message.sourceText || '正在聆听...' }}</p>
        <strong v-if="message.translatedText">{{ message.translatedText }}</strong>
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
        <button class="voice-chip" :class="{ active: isContinuousActive && activeSpeaker === 'source' }" type="button" :disabled="isListening" @click="startContinuousRecognition('source')">
          <span>我说</span>
          <strong>{{ sourceLanguageName }}</strong>
        </button>
        <button
          class="mic-button"
          :class="{ listening: isListening || isContinuousActive }"
          type="button"
          :disabled="isListening"
          :aria-label="isContinuousActive ? '停止连续语音识别' : '开始连续语音识别'"
          @click="isContinuousActive ? stopContinuousRecognition() : startContinuousRecognition(activeSpeaker)"
        >
          <span class="mic-symbol"></span>
        </button>
        <button class="voice-chip" :class="{ active: isContinuousActive && activeSpeaker === 'target' }" type="button" :disabled="isListening" @click="startContinuousRecognition('target')">
          <span>对方说</span>
          <strong>{{ targetLanguageName }}</strong>
        </button>
      </section>

      <p class="status-line" aria-live="polite">{{ status }}</p>
    </section>
  </section>
</template>
