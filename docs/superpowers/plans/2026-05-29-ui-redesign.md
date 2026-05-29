# Overall UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the app UI into a polished mobile travel translation console with readable Chinese copy and a cohesive blue/orange design system.

**Architecture:** Keep the existing single-file Vue app and local stores/services. Replace visible mojibake copy, introduce bottom tab navigation, redesign each page surface, and refresh CSS around reusable class names instead of adding dependencies.

**Tech Stack:** Vue 3, Vite, TypeScript, Vitest, plain CSS.

---

### Task 1: Regression Tests

**Files:**
- Modify: `tests/uiPolish.test.ts`

- [ ] Add assertions for readable app copy, readable phrase data, bottom navigation classes, and redesigned page classes.
- [ ] Run `npm test -- tests/uiPolish.test.ts` and confirm the new assertions fail before implementation.

### Task 2: Readable Data

**Files:**
- Modify: `src/data/languages.ts`
- Modify: `src/data/phrases.ts`

- [ ] Replace mojibake language names with readable native language names.
- [ ] Replace phrase categories and source text with readable Chinese travel phrases.

### Task 3: App Structure

**Files:**
- Modify: `src/App.vue`

- [ ] Replace visible mojibake strings with readable Chinese.
- [ ] Rebuild the template with a travel-console shell, language route header, conversation stage, bottom navigation, and redesigned panels.
- [ ] Keep existing service/store behavior intact.

### Task 4: Visual System

**Files:**
- Modify: `src/style.css`

- [ ] Replace the previous styling with a cohesive mobile app visual system.
- [ ] Preserve 44px touch targets, visible focus states, reduced-motion handling, and mobile responsive constraints.

### Task 5: Verification

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Report any browser automation limitation separately from command verification.
