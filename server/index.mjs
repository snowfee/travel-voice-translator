import { createServer } from 'node:http';

import { createBaiduRequest } from './baiduTranslate.mjs';

const port = Number(process.env.PORT ?? 8790);
const model = process.env.OPENAI_REALTIME_MODEL ?? 'gpt-realtime-mini';

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 32_768) {
        reject(new Error('Request body is too large.'));
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/translate') {
    const appId = process.env.BAIDU_TRANSLATE_APP_ID;
    const secretKey = process.env.BAIDU_TRANSLATE_SECRET_KEY;
    if (!appId || !secretKey) {
      sendJson(response, 503, { error: 'BAIDU_TRANSLATE_APP_ID and BAIDU_TRANSLATE_SECRET_KEY are not configured on the server.' });
      return;
    }

    try {
      const body = await readJson(request);
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const baiduRequest = createBaiduRequest(appId, secretKey, text, body.sourceLanguage, body.targetLanguage);

      if (!text || !baiduRequest.from || !baiduRequest.to) {
        sendJson(response, 400, { error: 'Text and supported source and target languages are required.' });
        return;
      }

      const upstream = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(baiduRequest),
      });
      const result = await upstream.json();
      const translatedText = result?.trans_result?.map((item) => item.dst).join('\n');

      if (!upstream.ok || result?.error_code || !translatedText) {
        const error = result?.error_msg ? `Baidu translation failed: ${result.error_msg}` : 'Baidu translation failed.';
        sendJson(response, upstream.status || 502, { error });
        return;
      }

      sendJson(response, 200, { translatedText });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Translation request failed.' });
    }
    return;
  }

  if (request.method !== 'GET' || url.pathname !== '/api/realtime/token') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured on the server.' });
    return;
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model,
        },
      }),
    });
    const body = await upstream.text();
    response.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    sendJson(response, 502, { error: 'Unable to reach the realtime token service.' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Realtime token server listening on http://127.0.0.1:${port}`);
});
