export type Language = 'en' | 'ru' | 'uz';

export interface Translations {
  [key: string]: {
    en: string;
    ru: string;
    uz: string;
  };
}

export const t: Translations = {
  // App Header & Branding
  appName: {
    en: 'GAME ZONE',
    ru: 'GAME ZONE',
    uz: 'GAME ZONE',
  },
  tagline: {
    en: 'Ultimate Offline Arcade Hub',
    ru: 'Оффлайн Игровая Платформа',
    uz: 'Oflayn O\'yinlar Platformasi',
  },
  offlineReady: {
    en: '100% Offline Ready',
    ru: '100% Работает без интернета',
    uz: '100% Internetsiz ishlaydi',
  },
  searchPlaceholder: {
    en: 'Search games (e.g. 2048, Snake, Chess)...',
    ru: 'Поиск игр (например: 2048, Змейка, Шахматы)...',
    uz: 'O\'yinlarni qidirish (masalan: 2048, Iloncha)...',
  },

  // Categories
  cat_all: {
    en: 'All Games',
    ru: 'Все игры',
    uz: 'Barcha o\'yinlar',
  },
  cat_favorites: {
    en: 'Favorites',
    ru: 'Избранное',
    uz: 'Saralanganlar',
  },
  cat_recent: {
    en: 'Recently Played',
    ru: 'Недавние',
    uz: 'Yaqinda o\'ynalgan',
  },
  cat_arcade: {
    en: 'Arcade & Action',
    ru: 'Аркады и Экшн',
    uz: 'Arkada va Harakat',
  },
  cat_puzzle: {
    en: 'Puzzle & Logic',
    ru: 'Головоломки и Логика',
    uz: 'Boshqotirma va Mantiq',
  },
  cat_card: {
    en: 'Cards & Board',
    ru: 'Карты и Настольные',
    uz: 'Karta va Stol o\'yinlari',
  },
  cat_speed: {
    en: 'Speed & Reflex',
    ru: 'Скорость и Реакция',
    uz: 'Tezlik va Reaksiya',
  },

  // Buttons & Controls
  playNow: {
    en: 'PLAY NOW',
    ru: 'ИГРАТЬ',
    uz: 'O\'YNASH',
  },
  backToHub: {
    en: 'Back to Hub',
    ru: 'В меню',
    uz: 'Bosh sahifaga',
  },
  pause: {
    en: 'Pause',
    ru: 'Пауза',
    uz: 'Pauza',
  },
  resume: {
    en: 'Resume',
    ru: 'Продолжить',
    uz: 'Davom etish',
  },
  restart: {
    en: 'Restart',
    ru: 'Заново',
    uz: 'Qayta boshlash',
  },
  howToPlay: {
    en: 'How to Play',
    ru: 'Как играть',
    uz: 'Qanday o\'ynash kerak',
  },
  score: {
    en: 'Score',
    ru: 'Счет',
    uz: 'Hisob',
  },
  bestScore: {
    en: 'Best',
    ru: 'Рекорд',
    uz: 'Rekord',
  },
  gameOver: {
    en: 'GAME OVER',
    ru: 'ИГРА ОКОНЧЕНА',
    uz: 'O\'YIN TUGADI',
  },
  newRecord: {
    en: 'NEW RECORD!',
    ru: 'НОВЫЙ РЕКОРД!',
    uz: 'YANGI REKORD!',
  },
  difficulty: {
    en: 'Difficulty',
    ru: 'Сложность',
    uz: 'Qiyinlik',
  },
  diff_easy: {
    en: 'Easy',
    ru: 'Легко',
    uz: 'Oson',
  },
  diff_medium: {
    en: 'Medium',
    ru: 'Средне',
    uz: 'O\'rta',
  },
  diff_hard: {
    en: 'Hard',
    ru: 'Сложно',
    uz: 'Qiyin',
  },
  diff_impossible: {
    en: 'Pro',
    ru: 'Про',
    uz: 'Usta',
  },

  // Audio & Display
  soundOn: {
    en: 'Sound FX: ON',
    ru: 'Звук: ВКЛ',
    uz: 'Ovoz: YONIQ',
  },
  soundOff: {
    en: 'Sound FX: OFF',
    ru: 'Звук: ВЫКЛ',
    uz: 'Ovoz: O\'CHIQ',
  },
  musicOn: {
    en: 'Music: ON',
    ru: 'Музыка: ВКЛ',
    uz: 'Musiqa: YONIQ',
  },
  musicOff: {
    en: 'Music: OFF',
    ru: 'Музыка: ВЫКЛ',
    uz: 'Musiqa: O\'CHIQ',
  },
  fullscreen: {
    en: 'Fullscreen',
    ru: 'На весь экран',
    uz: 'To\'liq ekran',
  },

  // Profile
  playerProfile: {
    en: 'Player Profile',
    ru: 'Профиль игрока',
    uz: 'O\'yinchi profili',
  },
  editUsername: {
    en: 'Edit Name',
    ru: 'Изменить имя',
    uz: 'Ismni o\'zgartirish',
  },
  chooseAvatar: {
    en: 'Choose Avatar',
    ru: 'Выбрать аватар',
    uz: 'Avatarni tanlang',
  },
  totalPlayTime: {
    en: 'Total Play Time',
    ru: 'Время в игре',
    uz: 'Umumiy o\'yin vaqti',
  },
  totalGamesPlayed: {
    en: 'Games Played',
    ru: 'Игр сыграно',
    uz: 'O\'ynalgan o\'yinlar',
  },
  achievements: {
    en: 'Achievements',
    ru: 'Достижения',
    uz: 'Yutuqlar',
  },
  unlocked: {
    en: 'Unlocked',
    ru: 'Открыто',
    uz: 'Ochildi',
  },
  locked: {
    en: 'Locked',
    ru: 'Заблокировано',
    uz: 'Qulflangan',
  },
  surpriseMe: {
    en: 'Random Game',
    ru: 'Случайная игра',
    uz: 'Tasodifiy o\'yin',
  },
  noGamesFound: {
    en: 'No games found matching your query',
    ru: 'Игры не найдены по вашему запросу',
    uz: 'So\'rovingiz bo\'yicha o\'yinlar topilmadi',
  },

  // Achievements text
  ach_first_play_title: {
    en: 'First Step',
    ru: 'Первый шаг',
    uz: 'Birinchi qadam',
  },
  ach_first_play_desc: {
    en: 'Played your first game in Game Zone',
    ru: 'Сыграна первая игра в Game Zone',
    uz: 'Game Zone-da birinchi o\'yin o\'ynaldi',
  },
  ach_gamer_5_title: {
    en: 'Apprentice Gamer',
    ru: 'Начинающий игрок',
    uz: 'Boshlovchi geymer',
  },
  ach_gamer_5_desc: {
    en: 'Played 5 different games',
    ru: 'Сыграно 5 различных игр',
    uz: '5 xil o\'yin o\'ynaldi',
  },
  ach_gamer_15_title: {
    en: 'Arcade Veteran',
    ru: 'Ветеран аркад',
    uz: 'Arkada faxriysi',
  },
  ach_gamer_15_desc: {
    en: 'Played 15 games or matches',
    ru: 'Сыграно 15 матчей или игр',
    uz: '15 ta o\'yin yoki match o\'ynaldi',
  },
  ach_century_title: {
    en: 'Score Centurion',
    ru: 'Центурион',
    uz: 'Senturion',
  },
  ach_century_desc: {
    en: 'Scored 100+ points in any game',
    ru: 'Набрано более 100 очков в любой игре',
    uz: 'Har qanday o\'yinda 100+ ball to\'plandi',
  },
  ach_high_roller_title: {
    en: 'Legendary Score',
    ru: 'Легендарный счет',
    uz: 'Afsonaviy hisob',
  },
  ach_high_roller_desc: {
    en: 'Scored 1,000+ points in any game',
    ru: 'Набрано более 1,000 очков в игре',
    uz: 'O\'yinda 1,000+ ball to\'plandi',
  },
  ach_puzzle_master_title: {
    en: 'Puzzle Grandmaster',
    ru: 'Магистр головоломок',
    uz: 'Boshqotirma ustasi',
  },
  ach_puzzle_master_desc: {
    en: 'Demonstrated high brain power in puzzle games',
    ru: 'Проявил мастерство в логических играх',
    uz: 'Mantiqiy o\'yinlarda aql salohiyatini ko\'rsatdi',
  },
  ach_reflex_king_title: {
    en: 'Lightning Reflexes',
    ru: 'Молниеносная реакция',
    uz: 'Chaqmoqdek reaksiya',
  },
  ach_reflex_king_desc: {
    en: 'Achieved under 250ms reaction or high combo',
    ru: 'Реакция менее 250мс или серия комбо',
    uz: '250ms dan tez reaksiya yoki yuqori kombo',
  },
  ach_arcade_champion_title: {
    en: 'Arcade Champion',
    ru: 'Чемпион аркад',
    uz: 'Arkada chempioni',
  },
  ach_arcade_champion_desc: {
    en: 'Mastered high-speed arcade action',
    ru: 'Покорил высокие результаты в экшн играх',
    uz: 'Tezkor o\'yinlarda rekord natijaga erishdi',
  },
};

export function getLangText(key: string, lang: Language): string {
  if (t[key] && t[key][lang]) {
    return t[key][lang];
  }
  return key;
}

