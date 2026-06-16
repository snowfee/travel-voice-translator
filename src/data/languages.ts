import type { Language } from '@/types/domain';
import { baiduLanguages } from './baiduLanguages';

export const languages: Language[] = baiduLanguages.map((language) => ({
  code: language.appCode,
  baiduCode: language.baiduCode,
  speechCode: language.speechCode,
  name: language.nameZh,
  nativeName: language.nameZh,
}));

export function getLanguageName(code: string) {
  return languages.find((language) => language.code === code)?.nativeName ?? code;
}
