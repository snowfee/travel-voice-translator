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
const settingsSource = readFileSync(new URL('../src/views/SettingsView.vue', import.meta.url), 'utf8') as string;
const conversationStoreSource = readFileSync(new URL('../src/stores/conversationStore.ts', import.meta.url), 'utf8') as string;
const appSource = [appShellSource, conversationSource, translateSource, phrasesSource, historySource, settingsSource].join('\n');

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
    expect(routerSource).toContain("path: '/settings'");
  });

  test('uses the approved travel blue and orange theme tokens', () => {
    expect(cssSource).toContain('--primary: #0ea5e9');
    expect(cssSource).toContain('--accent: #f97316');
    expect(cssSource).toContain('Be Vietnam Pro');
    expect(cssSource).toContain('Noto Sans');
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
  });

  test('keeps the navigation trigger visually frameless', () => {
    const navToggleRule = cssSource.match(/\.nav-toggle\s*\{[^}]+\}/)?.[0] ?? '';

    expect(navToggleRule).toContain('background: transparent');
    expect(navToggleRule).toContain('border-color: transparent');
    expect(navToggleRule).toContain('box-shadow: none');
  });

  test('keeps voice controls docked below a scrollable bubble stream', () => {
    const conversationRule = cssSource.match(/\.conversation-screen\s*\{[^}]+\}/)?.[0] ?? '';
    const bubbleStreamRule = cssSource.match(/\.bubble-stream\s*\{[^}]+\}/)?.[0] ?? '';
    const voiceDockRule = cssSource.match(/\.voice-dock\s*\{[^}]+\}/)?.[0] ?? '';

    expect(appSource).toContain('bubble-stream');
    expect(appSource).toContain('chat-bubble');
    expect(appSource).toContain('voice-dock');
    expect(conversationRule).toContain('grid-template-rows: minmax(0, 1fr) auto');
    expect(conversationRule).toContain('overflow: hidden');
    expect(bubbleStreamRule).toContain('overflow-y: auto');
    expect(voiceDockRule).toContain('align-self: end');
  });

  test('uses icon-only playback controls inside chat bubbles', () => {
    expect(appSource).toContain('play-icon-button');
    expect(appSource).toContain('play-icon');
    expect(appSource).not.toContain('播放给对方</button>');
    expect(appSource).not.toContain('播放给我</button>');
  });

  test('keeps conversation bubbles persistent and removes bubble meta labels', () => {
    expect(conversationSource).toContain('v-for="message in conversationStore.messages.value"');
    expect(conversationSource).toContain('replayConversationMessage(message)');
    expect(conversationStoreSource).toContain('records.value = [...records.value, { ...record, speaker, pending: false }]');
    expect(conversationStoreSource).not.toContain('records.value.unshift');
    expect(conversationSource).not.toContain('class="speech-meta"');
  });

  test('keeps phrase and language data readable', () => {
    const phraseSource = readFileSync(new URL('../src/data/phrases.ts', import.meta.url), 'utf8') as string;
    const languageSource = readFileSync(new URL('../src/data/languages.ts', import.meta.url), 'utf8') as string;

    expect(languageSource).toContain("nativeName: '中文'");
    expect(languageSource).toContain("nativeName: '日本語'");
    expect(phraseSource).toContain("'交通'");
    expect(phraseSource).toContain('请问地铁站怎么走？');
    expect(phraseSource).not.toMatch(/[�]|浜ら|椁愰|閰掑簵|璐墿|姹傚姪|鍖荤枟|璇烽棶/);
  });
});
