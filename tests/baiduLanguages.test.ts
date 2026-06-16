import { describe, expect, it } from 'vitest';

import { baiduLanguages, getLanguageGroups, popularBaiduLanguages } from '@/data/baiduLanguages';

describe('baiduLanguages', () => {
  it('contains popular travel languages and groups all languages by initial', () => {
    expect(popularBaiduLanguages.map((language) => language.nameZh)).toEqual(
      expect.arrayContaining(['中文', '英语', '日语', '韩语', '法语', '泰语', '越南语']),
    );

    const groups = getLanguageGroups(baiduLanguages);

    expect(groups[0]).toMatchObject({ initial: 'A' });
    expect(groups.find((group) => group.initial === 'Y')?.languages.map((language) => language.nameZh)).toContain('英语');
    expect(groups.find((group) => group.initial === 'Z')?.languages.map((language) => language.nameZh)).toContain('中文');
  });

  it('keeps Baidu API codes separate from browser speech language tags', () => {
    const english = baiduLanguages.find((language) => language.appCode === 'en-US');
    const japanese = baiduLanguages.find((language) => language.appCode === 'ja-JP');
    const vietnamese = baiduLanguages.find((language) => language.baiduCode === 'vie');

    expect(english).toMatchObject({ baiduCode: 'en', speechCode: 'en-US' });
    expect(japanese).toMatchObject({ baiduCode: 'jp', speechCode: 'ja-JP' });
    expect(vietnamese).toMatchObject({ nameZh: '越南语', popular: true });
  });
});
