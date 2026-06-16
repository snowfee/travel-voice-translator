import type { LanguageCode } from '@/types/domain';

export interface BaiduLanguage {
  appCode: LanguageCode;
  baiduCode: string;
  speechCode: string;
  nameZh: string;
  nativeName: string;
  pinyin: string;
  initial: string;
  popular?: boolean;
}

export const baiduLanguages: BaiduLanguage[] = [
  { appCode: 'zh-CN', baiduCode: 'zh', speechCode: 'zh-CN', nameZh: '中文', nativeName: '中文', pinyin: 'zhongwen', initial: 'Z', popular: true },
  { appCode: 'en-US', baiduCode: 'en', speechCode: 'en-US', nameZh: '英语', nativeName: 'English', pinyin: 'yingyu', initial: 'Y', popular: true },
  { appCode: 'ja-JP', baiduCode: 'jp', speechCode: 'ja-JP', nameZh: '日语', nativeName: '日本語', pinyin: 'riyu', initial: 'R', popular: true },
  { appCode: 'ko-KR', baiduCode: 'kor', speechCode: 'ko-KR', nameZh: '韩语', nativeName: '한국어', pinyin: 'hanyu', initial: 'H', popular: true },
  { appCode: 'fr-FR', baiduCode: 'fra', speechCode: 'fr-FR', nameZh: '法语', nativeName: 'Français', pinyin: 'fayu', initial: 'F', popular: true },
  { appCode: 'th-TH', baiduCode: 'th', speechCode: 'th-TH', nameZh: '泰语', nativeName: 'ไทย', pinyin: 'taiyu', initial: 'T', popular: true },
  { appCode: 'vi-VN', baiduCode: 'vie', speechCode: 'vi-VN', nameZh: '越南语', nativeName: 'Tiếng Việt', pinyin: 'yuenanyu', initial: 'Y', popular: true },
  { appCode: 'lo-LA', baiduCode: 'lao', speechCode: 'lo-LA', nameZh: '老挝语', nativeName: 'ລາວ', pinyin: 'laowoyu', initial: 'L', popular: true },
  { appCode: 'my-MM', baiduCode: 'bur', speechCode: 'my-MM', nameZh: '缅甸语', nativeName: 'မြန်မာ', pinyin: 'miandianyu', initial: 'M', popular: true },
  { appCode: 'mn-MN', baiduCode: 'mon', speechCode: 'mn-MN', nameZh: '蒙古语', nativeName: 'Монгол', pinyin: 'mengguyu', initial: 'M', popular: true },
  { appCode: 'ug-CN', baiduCode: 'uyg', speechCode: 'ug-CN', nameZh: '维吾尔语-新疆', nativeName: 'ئۇيغۇرچە', pinyin: 'weiwueryu', initial: 'W', popular: true },
  { appCode: 'ar', baiduCode: 'ara', speechCode: 'ar', nameZh: '阿拉伯语', nativeName: 'العربية', pinyin: 'alaboyu', initial: 'A' },
  { appCode: 'ga-IE', baiduCode: 'gle', speechCode: 'ga-IE', nameZh: '爱尔兰语', nativeName: 'Gaeilge', pinyin: 'aierlanyu', initial: 'A' },
  { appCode: 'et-EE', baiduCode: 'est', speechCode: 'et-EE', nameZh: '爱沙尼亚语', nativeName: 'Eesti', pinyin: 'aishaniyayu', initial: 'A' },
  { appCode: 'az-AZ', baiduCode: 'aze', speechCode: 'az-AZ', nameZh: '阿塞拜疆语', nativeName: 'Azərbaycanca', pinyin: 'asaibaijiangyu', initial: 'A' },
  { appCode: 'sq-AL', baiduCode: 'alb', speechCode: 'sq-AL', nameZh: '阿尔巴尼亚语', nativeName: 'Shqip', pinyin: 'aerbaniyayu', initial: 'A' },
  { appCode: 'am-ET', baiduCode: 'amh', speechCode: 'am-ET', nameZh: '阿姆哈拉语', nativeName: 'አማርኛ', pinyin: 'amuhalayu', initial: 'A' },
  { appCode: 'af-ZA', baiduCode: 'afr', speechCode: 'af-ZA', nameZh: '南非荷兰语', nativeName: 'Afrikaans', pinyin: 'nanfeihelandyu', initial: 'N' },
  { appCode: 'pl-PL', baiduCode: 'pl', speechCode: 'pl-PL', nameZh: '波兰语', nativeName: 'Polski', pinyin: 'bolanyu', initial: 'B' },
  { appCode: 'bg-BG', baiduCode: 'bul', speechCode: 'bg-BG', nameZh: '保加利亚语', nativeName: 'Български', pinyin: 'baojialiyayu', initial: 'B' },
  { appCode: 'fa-IR', baiduCode: 'per', speechCode: 'fa-IR', nameZh: '波斯语', nativeName: 'فارسی', pinyin: 'bosiyu', initial: 'B' },
  { appCode: 'be-BY', baiduCode: 'bel', speechCode: 'be-BY', nameZh: '白俄罗斯语', nativeName: 'Беларуская', pinyin: 'baieluosiyu', initial: 'B' },
  { appCode: 'is-IS', baiduCode: 'ice', speechCode: 'is-IS', nameZh: '冰岛语', nativeName: 'Íslenska', pinyin: 'bingdaoyu', initial: 'B' },
  { appCode: 'de-DE', baiduCode: 'de', speechCode: 'de-DE', nameZh: '德语', nativeName: 'Deutsch', pinyin: 'deyu', initial: 'D' },
  { appCode: 'da-DK', baiduCode: 'dan', speechCode: 'da-DK', nameZh: '丹麦语', nativeName: 'Dansk', pinyin: 'danmaiyu', initial: 'D' },
  { appCode: 'ru-RU', baiduCode: 'ru', speechCode: 'ru-RU', nameZh: '俄语', nativeName: 'Русский', pinyin: 'eyu', initial: 'E' },
  { appCode: 'fi-FI', baiduCode: 'fin', speechCode: 'fi-FI', nameZh: '芬兰语', nativeName: 'Suomi', pinyin: 'fenlanyu', initial: 'F' },
  { appCode: 'fil-PH', baiduCode: 'fil', speechCode: 'fil-PH', nameZh: '菲律宾语', nativeName: 'Filipino', pinyin: 'feilvbinyu', initial: 'F' },
  { appCode: 'km-KH', baiduCode: 'hkm', speechCode: 'km-KH', nameZh: '高棉语', nativeName: 'ខ្មែរ', pinyin: 'gaomianyu', initial: 'G' },
  { appCode: 'ka-GE', baiduCode: 'geo', speechCode: 'ka-GE', nameZh: '格鲁吉亚语', nativeName: 'ქართული', pinyin: 'gelujiyayu', initial: 'G' },
  { appCode: 'gu-IN', baiduCode: 'guj', speechCode: 'gu-IN', nameZh: '古吉拉特语', nativeName: 'ગુજરાતી', pinyin: 'gujilateyu', initial: 'G' },
  { appCode: 'nl-NL', baiduCode: 'nl', speechCode: 'nl-NL', nameZh: '荷兰语', nativeName: 'Nederlands', pinyin: 'helanyu', initial: 'H' },
  { appCode: 'cs-CZ', baiduCode: 'cs', speechCode: 'cs-CZ', nameZh: '捷克语', nativeName: 'Čeština', pinyin: 'jiek Keyu'.replace(' ', ''), initial: 'J' },
  { appCode: 'ca-ES', baiduCode: 'cat', speechCode: 'ca-ES', nameZh: '加泰罗尼亚语', nativeName: 'Català', pinyin: 'jiatailuoniyayu', initial: 'J' },
  { appCode: 'hr-HR', baiduCode: 'hrv', speechCode: 'hr-HR', nameZh: '克罗地亚语', nativeName: 'Hrvatski', pinyin: 'keluodiyayu', initial: 'K' },
  { appCode: 'kn-IN', baiduCode: 'kan', speechCode: 'kn-IN', nameZh: '卡纳达语', nativeName: 'ಕನ್ನಡ', pinyin: 'kanadayu', initial: 'K' },
  { appCode: 'pt-PT', baiduCode: 'pt', speechCode: 'pt-PT', nameZh: '葡萄牙语', nativeName: 'Português', pinyin: 'putaoyayu', initial: 'P' },
  { appCode: 'ro-RO', baiduCode: 'rom', speechCode: 'ro-RO', nameZh: '罗马尼亚语', nativeName: 'Română', pinyin: 'luomaniyayu', initial: 'L' },
  { appCode: 'lv-LV', baiduCode: 'lav', speechCode: 'lv-LV', nameZh: '拉脱维亚语', nativeName: 'Latviešu', pinyin: 'latuoweiyayu', initial: 'L' },
  { appCode: 'lt-LT', baiduCode: 'lit', speechCode: 'lt-LT', nameZh: '立陶宛语', nativeName: 'Lietuvių', pinyin: 'litaowanyu', initial: 'L' },
  { appCode: 'ms-MY', baiduCode: 'may', speechCode: 'ms-MY', nameZh: '马来语', nativeName: 'Melayu', pinyin: 'malaiyu', initial: 'M' },
  { appCode: 'bn-BD', baiduCode: 'ben', speechCode: 'bn-BD', nameZh: '孟加拉语', nativeName: 'বাংলা', pinyin: 'mengjialayu', initial: 'M' },
  { appCode: 'ne-NP', baiduCode: 'nep', speechCode: 'ne-NP', nameZh: '尼泊尔语', nativeName: 'नेपाली', pinyin: 'niboeryu', initial: 'N' },
  { appCode: 'no-NO', baiduCode: 'nor', speechCode: 'no-NO', nameZh: '挪威语', nativeName: 'Norsk', pinyin: 'nuoweiyu', initial: 'N' },
  { appCode: 'sv-SE', baiduCode: 'swe', speechCode: 'sv-SE', nameZh: '瑞典语', nativeName: 'Svenska', pinyin: 'ruidianyu', initial: 'R' },
  { appCode: 'sk-SK', baiduCode: 'sk', speechCode: 'sk-SK', nameZh: '斯洛伐克语', nativeName: 'Slovenčina', pinyin: 'siluofakeyu', initial: 'S' },
  { appCode: 'sl-SI', baiduCode: 'slo', speechCode: 'sl-SI', nameZh: '斯洛文尼亚语', nativeName: 'Slovenščina', pinyin: 'siluowenniyayu', initial: 'S' },
  { appCode: 'sw-KE', baiduCode: 'swa', speechCode: 'sw-KE', nameZh: '斯瓦希里语', nativeName: 'Kiswahili', pinyin: 'siwaxiliyu', initial: 'S' },
  { appCode: 'tr-TR', baiduCode: 'tr', speechCode: 'tr-TR', nameZh: '土耳其语', nativeName: 'Türkçe', pinyin: 'tuerqiyu', initial: 'T' },
  { appCode: 'ta-IN', baiduCode: 'tam', speechCode: 'ta-IN', nameZh: '泰米尔语', nativeName: 'தமிழ்', pinyin: 'taimieryu', initial: 'T' },
  { appCode: 'uk-UA', baiduCode: 'ukr', speechCode: 'uk-UA', nameZh: '乌克兰语', nativeName: 'Українська', pinyin: 'wukelanyu', initial: 'W' },
  { appCode: 'ur-PK', baiduCode: 'urd', speechCode: 'ur-PK', nameZh: '乌尔都语', nativeName: 'اردو', pinyin: 'wu erduyu'.replace(' ', ''), initial: 'W' },
  { appCode: 'es-ES', baiduCode: 'spa', speechCode: 'es-ES', nameZh: '西班牙语', nativeName: 'Español', pinyin: 'xibanyayu', initial: 'X' },
  { appCode: 'el-GR', baiduCode: 'el', speechCode: 'el-GR', nameZh: '希腊语', nativeName: 'Ελληνικά', pinyin: 'xilayu', initial: 'X' },
  { appCode: 'he-IL', baiduCode: 'heb', speechCode: 'he-IL', nameZh: '希伯来语', nativeName: 'עברית', pinyin: 'xibolaiyu', initial: 'X' },
  { appCode: 'it-IT', baiduCode: 'it', speechCode: 'it-IT', nameZh: '意大利语', nativeName: 'Italiano', pinyin: 'yidaliyu', initial: 'Y' },
  { appCode: 'id-ID', baiduCode: 'id', speechCode: 'id-ID', nameZh: '印尼语', nativeName: 'Indonesia', pinyin: 'yinniyu', initial: 'Y' },
  { appCode: 'hi-IN', baiduCode: 'hi', speechCode: 'hi-IN', nameZh: '印地语', nativeName: 'हिन्दी', pinyin: 'yindiyu', initial: 'Y' },
  { appCode: 'yue-CN', baiduCode: 'yue', speechCode: 'yue-CN', nameZh: '粤语', nativeName: '粤语', pinyin: 'yueyu', initial: 'Y' },
  { appCode: 'cht-CN', baiduCode: 'cht', speechCode: 'zh-TW', nameZh: '中文繁体', nativeName: '繁體中文', pinyin: 'zhongwenfanti', initial: 'Z' },
  { appCode: 'wyw-CN', baiduCode: 'wyw', speechCode: 'zh-CN', nameZh: '文言文', nativeName: '文言文', pinyin: 'wenyanwen', initial: 'W' },
];

export const popularBaiduLanguages = baiduLanguages.filter((language) => language.popular);

export const languageIndex = ['#', 'A', 'B', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

export function getLanguageGroups(source: BaiduLanguage[] = baiduLanguages) {
  return languageIndex
    .filter((initial) => initial !== '#')
    .map((initial) => ({
      initial,
      languages: source
        .filter((language) => language.initial === initial)
        .sort((left, right) => left.pinyin.localeCompare(right.pinyin)),
    }))
    .filter((group) => group.languages.length > 0);
}

export function findBaiduLanguage(appCode: string) {
  return baiduLanguages.find((language) => language.appCode === appCode || language.baiduCode === appCode);
}
