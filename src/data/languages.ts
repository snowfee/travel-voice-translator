import type { Language } from '@/types/domain';

export const languages: Language[] = [
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
];

export function getLanguageName(code: string) {
  return languages.find((language) => language.code === code)?.nativeName ?? code;
}
