# AI Realtime Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI-powered realtime speech translation to the conversation page using OpenAI Realtime API over WebRTC.

**Architecture:** A small Node server keeps `OPENAI_API_KEY` private and mints short-lived Realtime client secrets. The Vue client opens a WebRTC session, streams microphone audio, receives incremental transcripts and translated audio transcripts, and persists completed turns in the conversation store. Existing browser speech recognition remains available as a fallback.

**Tech Stack:** Vue 3, TypeScript, Vite, Node HTTP server, OpenAI Realtime API, WebRTC

---

### Task 1: Add Token Server

**Files:**
- Create: `server/index.mjs`
- Create: `.env.example`
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] Add `/api/realtime/token` backed by `POST /v1/realtime/client_secrets`.
- [ ] Keep the server API key in `OPENAI_API_KEY`.
- [ ] Proxy `/api` from Vite to the local token server.

### Task 2: Add Realtime Client

**Files:**
- Create: `src/services/realtimeTranslator.ts`

- [ ] Open a WebRTC peer connection with the ephemeral client secret.
- [ ] Configure the session as a translation-only voice agent.
- [ ] Emit connection, input transcript, translated transcript, and completion callbacks.
- [ ] Cleanly close microphone tracks, the data channel, and peer connection.

### Task 3: Extend Conversation State

**Files:**
- Modify: `src/stores/conversationStore.ts`
- Test: `tests/conversationStore.test.ts`

- [ ] Add draft-message state and update methods.
- [ ] Commit completed AI translation messages into the persisted in-memory stream.

### Task 4: Wire Conversation UI

**Files:**
- Modify: `src/views/ConversationView.vue`
- Modify: `src/style.css`

- [ ] Start and stop AI realtime translation from the source and target controls.
- [ ] Render streaming draft bubbles and connection status.
- [ ] Fall back to the existing one-shot browser recognition when realtime connection fails.

### Task 5: Verify

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify the token endpoint reports a clear setup error when `OPENAI_API_KEY` is missing.
