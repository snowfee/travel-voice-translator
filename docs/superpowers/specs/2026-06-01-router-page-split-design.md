# Router Page Split Design

## Goal

Split each travel translator feature into its own Vue Router page while keeping a shared mobile app shell and preserving cross-page state.

## Routes

- `/` redirects to `/conversation`
- `/conversation` shows the voice conversation stream and voice dock
- `/translate` shows text translation controls
- `/phrases` shows searchable travel phrases
- `/history` shows saved translations
- `/settings` shows preferences

## Shared Shell

`App.vue` owns the header, language direction selector, slide-out navigation, and `<RouterView />`. Drawer items use router links and highlight the active route.

## Shared State

Existing settings and history stores become shared singleton stores so pages observe the same state. A new conversation store owns persistent in-memory conversation messages and exposes the default sample exchange until the first recorded message is appended.

## Verification

Update source regression checks for the router structure, run the full Vitest suite, and run the production build.
