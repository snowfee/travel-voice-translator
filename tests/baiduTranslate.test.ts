import { describe, expect, test } from 'vitest';

// @ts-expect-error The tested Node helper is intentionally authored as ESM JavaScript.
const { createBaiduRequest, createBaiduSign } = await import('../server/baiduTranslate.mjs');

describe('Baidu translation helper', () => {
  test('creates the documented MD5 signature', () => {
    expect(createBaiduSign('2015063000000001', 'apple', '1435660288', '12345678')).toBe('f89f9594663708c1605f3d736d01d2d4');
  });

  test('maps app language codes into Baidu request fields', () => {
    expect(createBaiduRequest('app-id', 'secret', '你好', 'zh-CN', 'ja-JP', 'salt')).toMatchObject({
      q: '你好',
      from: 'zh',
      to: 'jp',
      appid: 'app-id',
      salt: 'salt',
    });
  });

  test('passes through supported Baidu language codes from the language picker', () => {
    expect(createBaiduRequest('app-id', 'secret', 'hello', 'en', 'vie', 'salt')).toMatchObject({
      from: 'en',
      to: 'vie',
    });
  });
});
