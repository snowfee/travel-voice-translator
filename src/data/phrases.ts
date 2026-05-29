import type { Phrase } from '@/types/domain';

export const phraseCategories = ['交通', '餐饮', '酒店', '购物', '求助', '医疗'];

export const phrases: Phrase[] = [
  {
    id: 'transit-subway',
    category: '交通',
    sourceText: '请问地铁站怎么走？',
    translations: {
      'en-US': 'How do I get to the subway station?',
      'ja-JP': '地下鉄の駅へはどう行けばいいですか？',
      'ko-KR': '지하철역에 어떻게 가나요?',
      'fr-FR': 'Comment puis-je aller à la station de métro ?',
      'es-ES': '¿Cómo llego a la estación de metro?',
    },
  },
  {
    id: 'transit-address',
    category: '交通',
    sourceText: '我想去这个地址。',
    translations: {
      'en-US': 'I want to go to this address.',
      'ja-JP': 'この住所に行きたいです。',
      'ko-KR': '이 주소로 가고 싶어요.',
      'fr-FR': 'Je voudrais aller à cette adresse.',
      'es-ES': 'Quiero ir a esta dirección.',
    },
  },
  {
    id: 'food-no-cilantro',
    category: '餐饮',
    sourceText: '可以不要放香菜吗？',
    translations: {
      'en-US': 'Could you make it without cilantro?',
      'ja-JP': 'パクチーを入れないでもらえますか？',
      'ko-KR': '고수를 빼 주실 수 있나요?',
      'fr-FR': 'Pouvez-vous le préparer sans coriandre ?',
      'es-ES': '¿Puede prepararlo sin cilantro?',
    },
  },
  {
    id: 'food-bill',
    category: '餐饮',
    sourceText: '请买单。',
    translations: {
      'en-US': 'Could I have the bill, please?',
      'ja-JP': 'お会計をお願いします。',
      'ko-KR': '계산서 부탁드립니다.',
      'fr-FR': "L'addition, s'il vous plaît.",
      'es-ES': 'La cuenta, por favor.',
    },
  },
  {
    id: 'hotel-booking',
    category: '酒店',
    sourceText: '我已经预订了房间。',
    translations: {
      'en-US': 'I have a room reservation.',
      'ja-JP': '部屋を予約しています。',
      'ko-KR': '객실을 예약했습니다.',
      'fr-FR': "J'ai une réservation de chambre.",
      'es-ES': 'Tengo una reserva de habitación.',
    },
  },
  {
    id: 'hotel-luggage',
    category: '酒店',
    sourceText: '可以帮我保管行李吗？',
    translations: {
      'en-US': 'Could you store my luggage?',
      'ja-JP': '荷物を預かってもらえますか？',
      'ko-KR': '짐을 맡아 주실 수 있나요?',
      'fr-FR': 'Pouvez-vous garder mes bagages ?',
      'es-ES': '¿Puede guardar mi equipaje?',
    },
  },
  {
    id: 'shopping-price',
    category: '购物',
    sourceText: '这个多少钱？',
    translations: {
      'en-US': 'How much is this?',
      'ja-JP': 'これはいくらですか？',
      'ko-KR': '이거 얼마예요?',
      'fr-FR': 'Combien ça coûte ?',
      'es-ES': '¿Cuánto cuesta esto?',
    },
  },
  {
    id: 'shopping-card',
    category: '购物',
    sourceText: '可以刷卡吗？',
    translations: {
      'en-US': 'Can I pay by card?',
      'ja-JP': 'カードで支払えますか？',
      'ko-KR': '카드로 결제할 수 있나요?',
      'fr-FR': 'Puis-je payer par carte ?',
      'es-ES': '¿Puedo pagar con tarjeta?',
    },
  },
  {
    id: 'help-lost',
    category: '求助',
    sourceText: '我迷路了，需要帮助。',
    translations: {
      'en-US': 'I am lost and need help.',
      'ja-JP': '道に迷いました。助けが必要です。',
      'ko-KR': '길을 잃어서 도움이 필요합니다.',
      'fr-FR': "Je suis perdu et j'ai besoin d'aide.",
      'es-ES': 'Estoy perdido y necesito ayuda.',
    },
  },
  {
    id: 'medical-allergy',
    category: '医疗',
    sourceText: '我对这个过敏。',
    translations: {
      'en-US': 'I am allergic to this.',
      'ja-JP': 'これにアレルギーがあります。',
      'ko-KR': '저는 이것에 알레르기가 있습니다.',
      'fr-FR': 'Je suis allergique à cela.',
      'es-ES': 'Soy alérgico a esto.',
    },
  },
];
