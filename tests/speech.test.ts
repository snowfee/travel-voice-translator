import { afterEach, describe, expect, it, vi } from 'vitest';

import { startContinuousRecognition } from '@/services/speech';

class FakeSpeechRecognition {
  static latest: FakeSpeechRecognition | null = null;

  lang = '';
  interimResults = false;
  continuous = false;
  onresult: ((event: { results: Array<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null = null;
  onerror: ((event: { error?: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    this.onend?.();
  });

  constructor() {
    FakeSpeechRecognition.latest = this;
  }

  emitResult(transcript: string, isFinal: boolean) {
    this.onresult?.({
      results: [{ 0: { transcript }, isFinal }],
    });
  }
}

describe('speech recognition service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeSpeechRecognition.latest = null;
  });

  it('starts continuous Web Speech recognition with interim and final callbacks', () => {
    vi.stubGlobal('window', { webkitSpeechRecognition: FakeSpeechRecognition });
    const onInterim = vi.fn();
    const onFinal = vi.fn();
    const onStatus = vi.fn();

    const session = startContinuousRecognition('zh-CN', {
      onInterim,
      onFinal,
      onStatus,
      onError: vi.fn(),
    });

    const recognition = FakeSpeechRecognition.latest;
    expect(recognition).not.toBeNull();
    expect(recognition?.lang).toBe('zh-CN');
    expect(recognition?.continuous).toBe(true);
    expect(recognition?.interimResults).toBe(true);
    expect(recognition?.start).toHaveBeenCalledOnce();

    recognition?.emitResult('你好', false);
    recognition?.emitResult('你好，请问地铁站怎么走？', true);

    expect(onInterim).toHaveBeenCalledWith('你好');
    expect(onFinal).toHaveBeenCalledWith('你好，请问地铁站怎么走？');
    expect(onStatus).toHaveBeenCalledWith('正在持续听取语音...');

    session.stop();

    expect(recognition?.stop).toHaveBeenCalledOnce();
  });
});
