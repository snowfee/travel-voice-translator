# Baidu Translation API Design

## Goal

Replace Google Cloud Translation Basic v2 with Baidu General Translation API while preserving the existing frontend `/api/translate` contract.

## Server Flow

1. Receive source text and language codes from the Vue client.
2. Convert app language codes to Baidu language codes.
3. Generate a salt and MD5 signature from `appid + q + salt + secretKey`.
4. Call `https://fanyi-api.baidu.com/api/trans/vip/translate`.
5. Return `{ translatedText }` to the browser.

## Security

Read `BAIDU_TRANSLATE_APP_ID` and `BAIDU_TRANSLATE_SECRET_KEY` only inside the Node server. Do not expose them to the Vue build.

## Fallback

The browser client contract stays unchanged. Local phrase translation and readable offline fallback remain available when the Baidu proxy is unavailable.
