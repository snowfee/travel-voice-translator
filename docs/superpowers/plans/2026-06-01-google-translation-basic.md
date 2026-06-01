# Google Cloud Translation Basic v2 Implementation Plan

**Goal:** Use Google Cloud Translation Basic v2 as the default online text translation backend.

**Architecture:** Add a protected Node proxy endpoint, call it from the Vue translator service, retain the local phrase dictionary as the fast path and fallback, and return the conversation controls to browser one-shot speech recognition.

**Tech Stack:** Vue 3, TypeScript, Node HTTP server, Google Cloud Translation Basic v2

---

### Task 1: Add Server Translation Proxy

- [ ] Add `POST /api/translate`.
- [ ] Read `GOOGLE_TRANSLATE_API_KEY` only in the Node server.
- [ ] Forward text and language direction to Google Basic v2.

### Task 2: Use Online Translation With Fallback

- [ ] Add a focused translator test for a Google response.
- [ ] Update `translateText` to call `/api/translate` after local phrase lookup.
- [ ] Preserve readable fallback behavior when the proxy is unavailable.

### Task 3: Simplify Conversation Controls

- [ ] Make the voice chips and microphone use browser one-shot recognition.
- [ ] Keep the optional OpenAI Realtime service available but inactive by default.

### Task 4: Verify

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify missing Google API key returns a clear setup error.
