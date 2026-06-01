# Baidu Translation API Implementation Plan

**Goal:** Replace Google Cloud Translation Basic v2 with Baidu General Translation API.

**Architecture:** Keep `/api/translate` stable, extract a tested Baidu signing helper, call the Baidu translation endpoint from Node, and update setup documentation.

**Tech Stack:** Vue 3, TypeScript, Node HTTP server, Baidu General Translation API

---

### Task 1: Add Baidu Helper

- [ ] Add language mapping and MD5 signature helper.
- [ ] Verify the signature against a deterministic unit test.

### Task 2: Replace Server Provider

- [ ] Read `BAIDU_TRANSLATE_APP_ID` and `BAIDU_TRANSLATE_SECRET_KEY`.
- [ ] Submit signed form data to Baidu.
- [ ] Convert Baidu errors to readable server responses.

### Task 3: Update Setup Docs

- [ ] Replace Google environment variables in `.env.example`.
- [ ] Update README startup instructions.

### Task 4: Verify

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify missing Baidu credentials return `503`.
