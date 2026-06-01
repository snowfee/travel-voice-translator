import { describe, expect, test } from 'vitest';

import { createTranscriptTurnCollector } from '@/services/realtimeTranslator';

describe('realtime transcript collector', () => {
  test('commits a turn after both transcripts finish even when translation finishes first', () => {
    const turns: Array<{ sourceText: string; translatedText: string }> = [];
    const collector = createTranscriptTurnCollector({
      onSourceTranscript: () => undefined,
      onTranslationTranscript: () => undefined,
      onTurnCompleted: (turn) => turns.push(turn),
    });

    collector.handle({ type: 'response.output_audio_transcript.done', transcript: 'Hello' });
    expect(turns).toHaveLength(0);

    collector.handle({ type: 'conversation.item.input_audio_transcription.completed', transcript: '你好' });
    expect(turns).toEqual([{ sourceText: '你好', translatedText: 'Hello' }]);
  });
});
