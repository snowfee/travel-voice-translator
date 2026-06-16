import { createHash, randomUUID } from 'node:crypto';

const languageMap = {
  'zh-CN': 'zh',
  'en-US': 'en',
  'ja-JP': 'jp',
  'ko-KR': 'kor',
  'fr-FR': 'fra',
  'es-ES': 'spa',
  'th-TH': 'th',
  'vi-VN': 'vie',
  'lo-LA': 'lao',
  'my-MM': 'bur',
  'mn-MN': 'mon',
  'ug-CN': 'uyg',
  'de-DE': 'de',
  'it-IT': 'it',
  'ru-RU': 'ru',
  'pt-PT': 'pt',
  'ar': 'ara',
  'cht-CN': 'cht',
  'yue-CN': 'yue',
  'wyw-CN': 'wyw',
};

export function baiduLanguage(language) {
  return languageMap[language] ?? (/^[a-z]{2,5}$/.test(language) ? language : '');
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
