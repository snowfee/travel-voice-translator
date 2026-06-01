# Google Cloud Translation Basic v2 Design

## Goal

Use Google Cloud Translation Basic v2 as the default online translation provider while keeping browser speech recognition and speech synthesis for the travel conversation UI.

## Request Flow

1. The browser recognizes one spoken sentence with `SpeechRecognition`.
2. The Vue client sends source text and language direction to `POST /api/translate`.
3. The local Node server calls Google Cloud Translation Basic v2 using `GOOGLE_TRANSLATE_API_KEY`.
4. The Vue client stores the returned translation in the conversation stream and optionally plays it with browser speech synthesis.
5. If Google Translation is unavailable, the existing local phrase dictionary and readable fallback remain available.

## Security

The Google API key is read only by `server/index.mjs`. It is never embedded into the Vue build.

## OpenAI Compatibility

The existing optional `/api/realtime/token` endpoint and WebRTC service remain in the repository for future premium mode work, but they are no longer the default conversation interaction.
