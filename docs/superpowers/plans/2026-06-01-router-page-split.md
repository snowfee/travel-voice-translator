# Router Page Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the translator tools into five Vue Router pages with a shared mobile shell and persistent cross-page state.

**Architecture:** Add Vue Router with a redirect from `/` to `/conversation`. Convert `App.vue` into a shell, move feature templates into `src/views`, and expose shared singleton stores for settings, history, and conversation state.

**Tech Stack:** Vue 3, Vue Router 4, TypeScript, Vite, Vitest

---

### Task 1: Add Router Foundation

**Files:**
- Modify: `package.json`
- Modify: `src/main.ts`
- Create: `src/router/index.ts`
- Modify: `tests/uiPolish.test.ts`

- [ ] Add a regression assertion for `RouterView`, `RouterLink`, router installation, and the five route paths.
- [ ] Run `npm test -- tests/uiPolish.test.ts` and confirm the new assertion fails.
- [ ] Install `vue-router`, create route configuration, and install router in `main.ts`.

### Task 2: Make Shared Stores Page-Safe

**Files:**
- Modify: `src/stores/historyStore.ts`
- Modify: `src/stores/settingsStore.ts`
- Create: `src/stores/conversationStore.ts`

- [ ] Expose singleton settings and history store accessors.
- [ ] Add a conversation store with `append`, computed sample fallback messages, and message replay language data.
- [ ] Preserve existing store factories for focused unit tests.

### Task 3: Extract Routed Views

**Files:**
- Create: `src/views/ConversationView.vue`
- Create: `src/views/TranslateView.vue`
- Create: `src/views/PhrasesView.vue`
- Create: `src/views/HistoryView.vue`
- Create: `src/views/SettingsView.vue`

- [ ] Move each feature template and its local behavior into one focused view.
- [ ] Use shared stores where data must survive navigation.
- [ ] Keep conversation voice controls docked beneath the scrollable bubble stream.

### Task 4: Convert App Into Shared Shell

**Files:**
- Modify: `src/App.vue`
- Modify: `src/style.css`

- [ ] Keep the header, language selector, drawer, and shared route layout in `App.vue`.
- [ ] Replace tab conditions with `<RouterView />`.
- [ ] Replace drawer buttons with `RouterLink` navigation and active-route styling.

### Task 5: Verify

**Files:**
- Modify: `tests/uiPolish.test.ts`

- [ ] Run `npm test -- tests/uiPolish.test.ts`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
