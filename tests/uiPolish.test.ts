import { describe, expect, test } from 'vitest';

import appShellSource from '../src/App.vue?raw';

// @ts-expect-error The app intentionally avoids @types/node; Vitest still runs in Node.
const { readFileSync } = await import('node:fs');
const cssSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8') as string;
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8') as string;
const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8') as string;
const conversationSource = readFileSync(new URL('../src/views/ConversationView.vue', import.meta.url), 'utf8') as string;
const translateSource = readFileSync(new URL('../src/views/TranslateView.vue', import.meta.url), 'utf8') as string;
const phrasesSource = readFileSync(new URL('../src/views/PhrasesView.vue', import.meta.url), 'utf8') as string;
const historySource = readFileSync(new URL('../src/views/HistoryView.vue', import.meta.url), 'utf8') as string;
const historyDetailSource = readFileSync(new URL('../src/views/HistoryDetailView.vue', import.meta.url), 'utf8') as string;
const settingsSource = readFileSync(new URL('../src/views/SettingsView.vue', import.meta.url), 'utf8') as string;
const conversationStoreSource = readFileSync(new URL('../src/stores/conversationStore.ts', import.meta.url), 'utf8') as string;
const languagePickerSource = readFileSync(new URL('../src/components/LanguagePicker.vue', import.meta.url), 'utf8') as string;
const appSource = [
  appShellSource,
  conversationSource,
  translateSource,
  phrasesSource,
  historySource,
  historyDetailSource,
  settingsSource,
].join('\n');

describe('UI polish regression checks', () => {
  test('splits tools into routed pages under a shared shell', () => {
    expect(appSource).toContain('RouterView');
    expect(appSource).toContain('RouterLink');
    expect(mainSource).toContain('.use(router)');
    expect(routerSource).toContain("redirect: '/conversation'");
    expect(routerSource).toContain("path: '/conversation'");
    expect(routerSource).toContain("path: '/translate'");
    expect(routerSource).toContain("path: '/phrases'");
    expect(routerSource).toContain("path: '/history'");
    expect(routerSource).toContain("path: '/history/:id'");
    expect(routerSource).toContain("path: '/settings'");
  });

  test('uses the approved picker blue theme with orange reserved for voice CTA', () => {
    expect(cssSource).toContain('--primary: #4f7df3');
    expect(cssSource).toContain('--primary-soft: #edf4ff');
    expect(cssSource).toContain('--accent: #f97316');
    expect(cssSource).toContain('Open Sans SemiBold');
    expect(cssSource).toContain('OpenSans-Regular.ttf');
  });

  test('keeps visible app copy readable instead of mojibake', () => {
    expect(appSource).toContain("label: '对话'");
    expect(appSource).toContain('旅行现场翻译');
    expect(appSource).toContain('文本翻译');
    expect(appSource).toContain('常用短句');
    expect(appSource).toContain('设置');
    expect(appSource).not.toMatch(/[�]|瀵硅瘽|缈昏瘧|璁剧疆|鍘嗗彶|鏂囨湰|鐭彞|鎾斁/);
  });

  test('uses the redesigned mobile app structure', () => {
    const travelConsoleRule = cssSource.match(/\.travel-console\s*\{[^}]+\}/)?.[0] ?? '';

    expect(appSource).toContain('travel-console');
    expect(appSource).toContain('route-card');
    expect(appSource).toContain('conversation-stage');
    expect(appSource).toContain('nav-toggle');
    expect(appSource).toContain('nav-drawer');
    expect(appSource).toContain('nav-scrim');
    expect(appSource).toContain('isNavOpen');
    expect(appSource).not.toContain('side-tabs');
    expect(appSource).not.toContain('bottom-tabs');
    expect(appSource).toContain('quick-actions');
    expect(travelConsoleRule).toContain('background: #f7faff');
    expect(travelConsoleRule).not.toContain('linear-gradient');
    expect(travelConsoleRule).toContain('box-shadow: none');
    expect(cssSource).not.toContain('box-shadow: var(--shadow)');
  });

  test('keeps the navigation trigger visually frameless', () => {
    const navToggleRule = cssSource.match(/\.nav-toggle\s*\{[^}]+\}/)?.[0] ?? '';

    expect(navToggleRule).toContain('background: transparent');
    expect(navToggleRule).toContain('border-color: transparent');
    expect(navToggleRule).toContain('box-shadow: none');
  });

  test('uses route-aware app header titles', () => {
    expect(appShellSource).toContain('pageTitles');
    expect(appShellSource).toContain("'/translate': { eyebrow: 'Text Mode', title: '文本翻译' }");
    expect(appShellSource).toContain("'/settings': { eyebrow: 'Preferences', title: '设置' }");
    expect(appShellSource).toContain('{{ pageTitle.title }}');
  });

  test('keeps bold weights only for the top app title', () => {
    const heavyWeightBlocks = Array.from(cssSource.matchAll(/([^{}]+)\{[^{}]*font-weight:\s*(?:[6-9]00|750|850|900)[^{}]*\}/g))
      .map((match) => match[0].trim())
      .filter((block) => !block.startsWith('@font-face'))
      .filter((block) => !(block.startsWith('.app-hero h1') && !block.includes(',')))
      .filter((block) => !block.startsWith('.eyebrow'))
      .filter((block) => !block.startsWith('.font-bold'));
    const strongRule = cssSource.match(/^strong\s*\{[^}]+\}/m)?.[0] ?? '';

    expect(heavyWeightBlocks).toEqual([]);
    expect(strongRule).toContain('font-weight: 500');
  });

  test('maps Open Sans font files through reusable utility classes', () => {
    const bodyRule = cssSource.match(/body\s*\{[^}]+margin:\s*0[^}]+\}/)?.[0] ?? '';
    const regularRule = cssSource.match(/\.font-regular\s*\{[^}]+\}/)?.[0] ?? '';
    const mediumRule = cssSource.match(/\.font-medium\s*\{[^}]+\}/)?.[0] ?? '';
    const boldRule = cssSource.match(/\.font-bold\s*\{[^}]+\}/)?.[0] ?? '';

    expect(cssSource).toContain('--font-open-sans-regular:');
    expect(cssSource).toContain('"Open Sans Regular"');
    expect(cssSource).toContain('--font-open-sans-semibold:');
    expect(cssSource).toContain('"Open Sans SemiBold"');
    expect(cssSource).toContain('--font-open-sans-bold:');
    expect(cssSource).toContain('"Open Sans Bold"');
    expect(bodyRule).toContain('font-family: var(--font-open-sans-regular)');
    expect(regularRule).toContain('font-family: var(--font-open-sans-regular)');
    expect(regularRule).toContain('font-weight: 400');
    expect(mediumRule).toContain('font-family: var(--font-open-sans-semibold)');
    expect(mediumRule).toContain('font-weight: 500');
    expect(boldRule).toContain('font-family: var(--font-open-sans-bold)');
    expect(boldRule).toContain('font-weight: 700');
    expect(appShellSource).toContain('class="eyebrow font-bold"');
    expect(appShellSource).toContain('class="new-conversation-button font-medium"');
    expect(appShellSource).toContain('class="route-stop-trigger font-medium"');
    expect(conversationSource).toContain('class="font-regular"');
    expect(conversationSource).toContain('class="font-medium"');
  });

  test('avoids duplicate page titles inside routed tool pages', () => {
    expect(translateSource).not.toContain('class="panel-title"');
    expect(phrasesSource).not.toContain('class="panel-title"');
    expect(historySource).not.toContain('class="panel-title"');
    expect(settingsSource).not.toContain('class="panel-title"');
    expect(translateSource).not.toContain('交换语言');
  });

  test('keeps voice controls docked below a scrollable bubble stream', () => {
    const conversationRule = cssSource.match(/\.conversation-screen\s*\{[^}]+\}/)?.[0] ?? '';
    const bubbleStreamRule = cssSource.match(/\.bubble-stream\s*\{[^}]+\}/)?.[0] ?? '';
    const voiceDockRule = cssSource.match(/\.voice-dock\s*\{[^}]+\}/)?.[0] ?? '';

    expect(appSource).toContain('bubble-stream');
    expect(appSource).toContain('chat-bubble');
    expect(appSource).toContain('voice-dock');
    expect(conversationRule).toContain('grid-template-rows: auto minmax(0, 1fr) auto');
    expect(conversationRule).toContain('overflow: hidden');
    expect(bubbleStreamRule).toContain('overflow-y: auto');
    expect(voiceDockRule).toContain('align-self: end');
  });

  test('keeps voice interaction status clear and recoverable', () => {
    expect(conversationSource).toContain("type VoiceStage = 'idle' | 'listening' | 'recognizing' | 'translating' | 'playing' | 'error'");
    expect(conversationSource).not.toContain('voice-status-card');
    expect(conversationSource).not.toContain('voiceStatusLabel');
    expect(conversationSource).not.toContain('voiceStatusHint');
    expect(conversationSource).not.toContain('retryVoiceAction');
    expect(conversationSource).toContain('status-line');
    expect(conversationSource).toContain('正在识别语音...');
    expect(conversationSource).toContain('等待翻译');
    expect(conversationSource).toContain('正在翻译...');
    expect(conversationSource).toContain('重试');
    expect(cssSource).not.toContain('voice-status-card');
    expect(cssSource).not.toContain('chat-bubble.pending::after');
    expect(cssSource).not.toContain('@keyframes pending-dots');
    expect(cssSource).toContain('@keyframes mic-breathe');
  });

  test('clears continuous listening state when speech recognition is interrupted', () => {
    expect(conversationSource).toContain('function handleContinuousRecognitionError(message: string)');
    expect(conversationSource).toContain('continuousSession.value = null');
    expect(conversationSource).toContain('conversationStore.cancelDraft()');
    expect(conversationSource).toContain('if (voiceStage.value !== \'error\')');
    expect(conversationSource).toContain('handleContinuousRecognitionError(message)');
  });

  test('clears continuous listening state when speech recognition pauses without an error', () => {
    expect(conversationSource).toContain('function handleContinuousRecognitionPause(message: string)');
    expect(conversationSource).toContain('handleContinuousRecognitionPause(nextStatus)');
    expect(conversationSource).toContain("nextStatus.includes('语音识别已暂停')");
  });

  test('uses illustrated empty states for conversation and history', () => {
    expect(conversationSource).toContain('conversation-empty-state');
    expect(conversationSource).toContain('empty-illustration-transparent.png');
    expect(conversationSource).toContain('按住麦克风开始对话，译文会显示在这里');
    expect(historySource).toContain('empty-illustration-transparent.png');
    expect(historySource).toContain('暂无历史记录，开始一次旅行对话或文本翻译后会显示在这里');
    expect(historySource).toContain('没有找到相关历史，试试换个关键词');
    expect(cssSource).toContain('illustrated-empty-state');
  });

  test('uses icon-only playback controls inside chat bubbles', () => {
    expect(appSource).toContain('play-icon-button');
    expect(appSource).toContain('play-icon');
    expect(appSource).not.toContain('播放给对方</button>');
    expect(appSource).not.toContain('播放给我</button>');
  });

  test('separates source and translation text without edit or translated footnote chrome', () => {
    const bubbleStreamRule = cssSource.match(/\.bubble-stream\s*\{[^}]+\}/)?.[0] ?? '';
    const speechPanelRule = cssSource.match(/\.speech-panel\s*\{[^}]+\}/)?.[0] ?? '';
    const originalRule = cssSource.match(/\.speech-original\s*\{[^}]+\}/)?.[0] ?? '';
    const originalTextRule = cssSource.match(/\.speech-original p\s*\{[^}]+\}/)?.[0] ?? '';
    const translationTextRule = cssSource.match(/\.speech-panel strong\s*\{[^}]+\}/)?.[0] ?? '';
    const sourceBubbleRule = cssSource.match(/\.chat-bubble-source\s*\{[^}]+\}/)?.[0] ?? '';
    const targetBubbleRule = cssSource.match(/\.chat-bubble-target\s*\{[^}]+\}/)?.[0] ?? '';
    const dividerRule = cssSource.match(/\.speech-divider\s*\{[^}]+\}/)?.[0] ?? '';
    const iconRule = cssSource.match(/\.play-icon\s*\{[^}]+\}/)?.[0] ?? '';

    expect(conversationSource).toContain('speech-original');
    expect(conversationSource).toContain('speech-divider');
    expect(conversationSource).toContain('speech-translation');
    expect(conversationSource).toContain('replayOriginalMessage(message)');
    expect(conversationSource).toContain('replayTranslationMessage(message)');
    expect(conversationSource).not.toContain('speech-segment');
    expect(conversationSource).not.toContain('已翻译');
    expect(conversationSource).not.toContain('编辑');
    expect(cssSource).toContain('--accent-soft');
    expect(cssSource).toContain('speech-original');
    expect(cssSource).toContain('speech-divider');
    expect(cssSource).toContain('speech-translation');
    expect(bubbleStreamRule).toContain('gap: 22px');
    expect(speechPanelRule).toContain('border: 0');
    expect(originalRule).toContain('color: #7f8b99');
    expect(originalTextRule).toContain('font-size: 0.91rem');
    expect(originalTextRule).toContain('font-weight: 400');
    expect(translationTextRule).toContain('color: #172033');
    expect(translationTextRule).toContain('font-weight: 500');
    expect(sourceBubbleRule).toContain('background: rgba(255, 247, 237, 0.92)');
    expect(sourceBubbleRule).toContain('box-shadow: inset 0 8px 20px rgba(249, 115, 22, 0.045)');
    expect(sourceBubbleRule).toContain('border-bottom-left-radius: 0px');
    expect(targetBubbleRule).toContain('background: rgba(237, 244, 255, 0.84)');
    expect(targetBubbleRule).toContain('box-shadow: inset 0 8px 20px rgba(79, 125, 243, 0.055)');
    expect(targetBubbleRule).toContain('border-bottom-right-radius: 0px');
    expect(dividerRule).toContain('border-top: 1px solid rgba(127, 139, 153, 0.13)');
    expect(iconRule).toContain('width: 24px');
    expect(iconRule).toContain('height: 22px');
  });

  test('keeps conversation bubbles persistent and removes bubble meta labels', () => {
    expect(conversationSource).toContain('v-for="message in conversationStore.messages.value"');
    expect(conversationSource).toContain('replayTranslationMessage(message)');
    expect(conversationStoreSource).toContain('records.value = [...records.value, { ...record, speaker, pending: false }]');
    expect(conversationStoreSource).not.toContain('records.value.unshift');
    expect(conversationSource).not.toContain('class="speech-meta"');
  });

  test('keeps history searchable with a dedicated detail route', () => {
    expect(historySource).toContain('searchQuery');
    expect(historySource).toContain('dateFilters');
    expect(historySource).toContain('filteredSessions');
    expect(historySource).toContain('搜索原文、译文或语言');
    expect(historySource).toContain('/history/${item.id}');
    expect(appShellSource).toContain('isHistoryDetailRoute');
    expect(appShellSource).toContain("route.path.startsWith('/history/')");
    expect(historyDetailSource).toContain('useRoute');
    expect(historyDetailSource).toContain('copySession');
    expect(historyDetailSource).toContain('删除记录');
    expect(historyDetailSource).toContain('history-detail-bar');
    expect(historyDetailSource).not.toContain('session-detail-card');
    expect(cssSource).toContain('history-search-card');
    expect(cssSource).toContain('session-detail-stream');
    expect(cssSource).toContain('travel-console-detail');
  });

  test('unifies reusable text and conversation history cards', () => {
    expect(historySource).toContain('typeFilter');
    expect(historySource).toContain('historyItems');
    expect(historySource).toContain('filteredHistoryItems');
    expect(historySource).toContain('useHistoryStore');
    expect(historySource).toContain("kind: 'text'");
    expect(historySource).toContain("kind: 'conversation'");
    expect(historySource).toContain('搜索原文、译文或语言');
    expect(historySource).toContain("item.kind === 'text'");
    expect(historySource).toContain('historyId: item.id');
    expect(historySource).toContain('/history/${item.id}');
    expect(translateSource).toContain('historyId');
    expect(translateSource).toContain('loadHistoryRecord');
    expect(translateSource).toContain('已载入历史翻译');
    expect(historyDetailSource).toContain('replayOriginalMessage');
    expect(historyDetailSource).toContain('replayTranslationMessage');
    expect(historyDetailSource).toContain('chat-bubble');
    expect(historyDetailSource).toContain('speech-original');
    expect(historyDetailSource).toContain('speech-translation');
    expect(historyDetailSource).toContain('play-icon-button');
    expect(cssSource).toContain('history-type-tabs');
    expect(cssSource).toContain('history-list-card');
  });

  test('keeps phrase and language data readable', () => {
    const phraseSource = readFileSync(new URL('../src/data/phrases.ts', import.meta.url), 'utf8') as string;
    const languageSource = readFileSync(new URL('../src/data/languages.ts', import.meta.url), 'utf8') as string;
    const baiduLanguageSource = readFileSync(new URL('../src/data/baiduLanguages.ts', import.meta.url), 'utf8') as string;

    expect(languageSource).toContain('baiduLanguages.map');
    expect(baiduLanguageSource).toContain("nativeName: '中文'");
    expect(baiduLanguageSource).toContain("nativeName: '日本語'");
    expect(phraseSource).toContain("'交通'");
    expect(phraseSource).toContain('请问地铁站怎么走？');
    expect(phraseSource).not.toMatch(/[�]|浜ら|椁愰|閰掑簵|璐墿|姹傚姪|鍖荤枟|璇烽棶/);
  });
  test('uses explicit index scrolling inside the language picker instead of hash anchors', () => {
    expect(languagePickerSource).toContain('pickerBodyRef');
    expect(languagePickerSource).toContain('scrollToGroup');
    expect(languagePickerSource).toContain('pickerBody.scrollTo');
    expect(languagePickerSource).toContain('groupSection.offsetTop');
    expect(languagePickerSource).toContain('data-language-group');
    expect(languagePickerSource).toContain("@click.prevent=\"scrollToGroup(item)\"");
    expect(languagePickerSource).toContain('type="button"');
    expect(languagePickerSource).not.toContain(':href="`#language-index-${item}`"');
  });
});
