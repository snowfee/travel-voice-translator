export interface BaiduTranslateRequest {
  q: string;
  from: string;
  to: string;
  appid: string;
  salt: string;
  sign: string;
}

export function baiduLanguage(language: string): string;
export function createBaiduSign(appId: string, text: string, salt: string, secretKey: string): string;
export function createBaiduRequest(
  appId: string,
  secretKey: string,
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  salt?: string,
): BaiduTranslateRequest;
