# Travel Voice Translator

## Continuous Speech Recognition and Translation

The default conversation mode uses the browser Web Speech API for continuous speech recognition, Baidu General Translation API for text translation, and browser speech synthesis for playback. Keep provider keys on the local server only.

1. Create an application in the Baidu Translation Open Platform.
2. Set the server environment variable:

```powershell
$env:BAIDU_TRANSLATE_APP_ID = "your_baidu_app_id"
$env:BAIDU_TRANSLATE_SECRET_KEY = "your_baidu_secret_key"
```

3. Start the API server and Vue app:

```powershell
npm run dev:api
npm run dev
```

Open `http://localhost:5173/conversation`.

## Optional OpenAI Realtime Translation

The repository also includes an optional OpenAI Realtime WebRTC service for a future premium mode. It is not enabled by the default conversation UI.

1. Set the server environment variable:

```powershell
$env:OPENAI_API_KEY = "sk-..."
```

2. Start the token server:

```powershell
npm run dev:api
```

3. In another terminal, start the Vue app:

```powershell
npm run dev
```

4. Open `http://localhost:5173/conversation`.

Click `我说` to translate from the source language to the target language. Click `对方说` to reverse the direction. Click the active side or the microphone button again to stop the continuous recognition session.

Optional server settings are listed in `.env.example`. The default realtime model is `gpt-realtime-mini`.
