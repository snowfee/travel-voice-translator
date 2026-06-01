import { createHash, randomUUID } from 'node:crypto';

const languageMap = {
  'zh-CN': 'zh',
  'en-US': 'en',
  'ja-JP': 'jp',
  'ko-KR': 'kor',
  'fr-FR': 'fra',
  'es-ES': 'spa',
};

export function baiduLanguage(language) {
  return languageMap[language] ?? '';
}

export function createBaiduSign(appId, text, salt, secretKey) {
  return createHash('md5').update(`${appId}${text}${salt}${secretKey}`).digest('hex');
}

export function createBaiduRequest(appId, secretKey, text, sourceLanguage, targetLanguage, salt = randomUUID()) {
  const from = baiduLanguage(sourceLanguage);
  const to = baiduLanguage(targetLanguage);

  return {
    q: text,
    from,
    to,
    appid: appId,
    salt,
    sign: createBaiduSign(appId, text, salt, secretKey),
  };
}
