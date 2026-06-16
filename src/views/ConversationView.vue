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

type VoiceStage = 'idle' | 'listening' | 'recognizing' | 'translating' | 'playing' | 'error';

const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();
const settings = settingsStore.settings;
const conversationStore = useConversationStore(settings);
const status = ref('准备就绪，可以开始旅行现场翻译。');
const isListening = ref(false);
const continuousSession = ref<ContinuousRecognitionSession | null>(null);
const activeSpeaker = ref<Speaker>('source');
const isTranslatingFinal = ref(false);
const voiceStage = ref<VoiceStage>('idle');
const lastError = ref('');

const isContinuousActive = computed(() => Boolean(continuousSession.value));
const sourceLanguageName = computed(() => getLanguageName(settings.value.sourceLanguage));
const targetLanguageName = computed(() => getLanguageName(settings.value.targetLanguage));
const speechAvailable = computed(() => {
  if (typeof window === 'undefined') {
    return false;
  }
  return canRecognizeSpeech();
});
const isVoiceEngaged = computed(() =>
  isListening.value ||
  isContinuousActive.value ||
  voiceStage.value === 'listening' ||
  voiceStage.value === 'recognizing' ||
  voiceStage.value === 'translating',
);

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

function setVoiceError(message: string) {
  lastError.value = message;
  voiceStage.value = 'error';
  status.value = message;
}

function handleContinuousRecognitionError(message: string) {
  continuousSession.value = null;
  isListening.value = false;
  conversationStore.cancelDraft();
  setVoiceError(message);
}

function handleContinuousRecognitionPause(message: string) {
  continuousSession.value = null;
  isListening.value = false;
  conversationStore.cancelDraft();
  lastError.value = '';
  voiceStage.value = 'idle';
  status.value = message;
}

function resetVoiceStage() {
  lastError.value = '';
  voiceStage.value = continuousSession.value ? 'listening' : 'idle';
}

function markPlayback(text: string, language: string, label = '译文') {
  const played = speak(text, language, settings.value.speechRate);
  status.value = played ? `正在播放${label}。` : '当前浏览器不支持语音播放。';

  if (!played) {
    setVoiceError(status.value);
    return;
  }

  voiceStage.value = 'playing';
  window.setTimeout(() => {
    if (voiceStage.value === 'playing') {
      resetVoiceStage();
    }
  }, 1400);
}

async function runTranslation(text: string, speaker: Speaker) {
  const direction = directionFor(speaker);
  voiceStage.value = 'translating';
  lastError.value = '';
  status.value = '正在翻译...';

  try {
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
      markPlayback(result.translatedText, direction.targetLanguage);
      return;
    }

    resetVoiceStage();
  } catch (error) {
    setVoiceError(error instanceof Error ? error.message : '翻译失败，请重试。');
  }
}

async function translateDraft(text: string, speaker: Speaker) {
  const direction = directionFor(speaker);
  isTranslatingFinal.value = true;
  voiceStage.value = 'translating';
  lastError.value = '';
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
      markPlayback(result.translatedText, direction.targetLanguage);
    } else {
      resetVoiceStage();
    }
  } catch (error) {
    setVoiceError(error instanceof Error ? error.message : '翻译失败，请重试。');
  } finally {
    isTranslatingFinal.value = false;
    if (continuousSession.value && activeSpeaker.value === speaker) {
      conversationStore.startDraft(speaker);
      const currentStage = voiceStage.value as VoiceStage;
      if (currentStage !== 'error' && currentStage !== 'playing') {
        voiceStage.value = 'listening';
      }
    }
  }
}

async function listenAndTranslateOnce(speaker: Speaker) {
  if (!speechAvailable.value) {
    setVoiceError('当前浏览器不支持语音识别。');
    return;
  }

  try {
    const direction = directionFor(speaker);
    activeSpeaker.value = speaker;
    isListening.value = true;
    voiceStage.value = 'listening';
    lastError.value = '';
    status.value = speaker === 'source' ? '正在听你说...' : '正在听对方说...';
    const text = await recognizeOnce(direction.sourceLanguage);
    voiceStage.value = 'recognizing';
    await runTranslation(text, speaker);
  } catch (error) {
    setVoiceError(error instanceof Error ? error.message : '语音识别失败，请再试一次。');
  } finally {
    isListening.value = false;
  }
}

async function stopContinuousRecognition() {
  const session = continuousSession.value;
  continuousSession.value = null;
  conversationStore.cancelDraft();

  if (voiceStage.value !== 'error') {
    voiceStage.value = 'idle';
  }

  if (session) {
    try {
      await session.stop();
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : '停止连续语音识别失败。');
    }
  }
}

async function startContinuousRecognition(speaker: Speaker) {
  if (!speechAvailable.value) {
    setVoiceError('当前浏览器不支持语音识别。');
    return;
  }

  if (voiceStage.value === 'playing') {
    return;
  }

  if (continuousSession.value) {
    if (activeSpeaker.value === speaker) {
      await stopContinuousRecognition();
      return;
    }

    await stopContinuousRecognition();
  }

  const direction = directionFor(speaker);
  activeSpeaker.value = speaker;
  voiceStage.value = 'listening';
  lastError.value = '';
  conversationStore.startDraft(speaker);

  try {
    continuousSession.value = startWebSpeechContinuousRecognition(direction.sourceLanguage, {
      onInterim: (text) => {
        if (!isTranslatingFinal.value) {
          voiceStage.value = text ? 'recognizing' : 'listening';
          conversationStore.updateDraftSource(text);
        }
      },
      onFinal: (text) => {
        void translateDraft(text, speaker);
      },
      onStatus: (nextStatus) => {
        if (nextStatus.includes('语音识别已暂停')) {
          handleContinuousRecognitionPause(nextStatus);
          return;
        }

        if (voiceStage.value !== 'error') {
          status.value = nextStatus;
        }
      },
      onError: (message) => {
        handleContinuousRecognitionError(message);
      },
    });
  } catch (error) {
    conversationStore.cancelDraft();
    status.value = `${error instanceof Error ? error.message : '浏览器连续语音识别启动失败。'} 正在改用浏览器单句识别。`;
    await listenAndTranslateOnce(speaker);
  }
}

function replayOriginalMessage(message: ConversationMessage) {
  markPlayback(message.sourceText, message.sourceLanguage, '原文');
}

function replayTranslationMessage(message: ConversationMessage) {
  markPlayback(message.translatedText, message.targetLanguage, '译文');
}

onUnmounted(() => {
  void stopContinuousRecognition();
});
</script>

<template>
  <section class="conversation-screen" aria-label="对话">
    <div class="conversation-stage bubble-stream">
      <div v-if="conversationStore.messages.value.length === 0" class="illustrated-empty-state conversation-empty-state">
        <img src="../public/images/empty-illustration-transparent.png" alt="" />
        <p>按住麦克风开始对话，译文会显示在这里</p>
      </div>
      <article
        v-for="message in conversationStore.messages.value"
        :key="message.id"
        class="speech-panel chat-bubble"
        :class="[message.speaker === 'source' ? 'chat-bubble-source speech-panel-source' : 'chat-bubble-target speech-panel-target', { pending: message.pending }]"
      >
        <section class="speech-original" aria-label="原文">
          <p class="font-regular">{{ message.sourceText || '正在识别语音...' }}</p>
          <button
            class="play-icon-button"
            type="button"
            aria-label="播放原文"
            :disabled="!message.sourceText"
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
          <strong v-if="message.translatedText" class="font-medium">{{ message.translatedText }}</strong>
          <strong v-else-if="message.pending" class="font-medium">{{ voiceStage === 'translating' ? '正在翻译...' : '等待翻译' }}</strong>
          <button
            class="play-icon-button"
            type="button"
            :aria-label="message.speaker === 'source' ? '播放给对方' : '播放给我'"
            :disabled="!message.translatedText"
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

    <section class="voice-dock">
      <section class="quick-actions" aria-label="语音操作">
        <button class="voice-chip" :class="{ active: isVoiceEngaged && activeSpeaker === 'source' }" type="button" :disabled="isListening" @click="startContinuousRecognition('source')">
          <span class="font-medium">{{ isVoiceEngaged && activeSpeaker === 'source' ? '正在听' : '我说' }}</span>
          <strong class="font-medium">{{ sourceLanguageName }}</strong>
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
        <button class="voice-chip" :class="{ active: isVoiceEngaged && activeSpeaker === 'target' }" type="button" :disabled="isListening" @click="startContinuousRecognition('target')">
          <span class="font-medium">{{ isVoiceEngaged && activeSpeaker === 'target' ? '正在听' : '对方说' }}</span>
          <strong class="font-medium">{{ targetLanguageName }}</strong>
        </button>
      </section>

      <p class="status-line font-medium" aria-live="polite">{{ status }}</p>
    </section>
  </section>
</template>
