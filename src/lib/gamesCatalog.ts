export type GameCategory = 'arcade' | 'puzzle' | 'card' | 'speed';

export interface GameDefinition {
  id: string;
  category: GameCategory;
  badge?: string;
  popular?: boolean;
  featured?: boolean;
  gradient: string;
  iconName: string;
  hasDifficulty?: boolean;
  difficulties?: string[];
  title: {
    en: string;
    ru: string;
    uz: string;
  };
  description: {
    en: string;
    ru: string;
    uz: string;
  };
  instructions: {
    en: string;
    ru: string;
    uz: string;
  };
  controls: {
    en: string;
    ru: string;
    uz: string;
  };
}

export const GAMES_CATALOG: GameDefinition[] = [
  // 1. Snake
  {
    id: 'snake',
    category: 'arcade',
    badge: 'CLASSIC',
    popular: true,
    featured: true,
    gradient: 'from-emerald-500 to-teal-700',
    iconName: 'Sparkles',
    hasDifficulty: true,
    difficulties: ['Easy', 'Medium', 'Hard'],
    title: {
      en: 'Snake Classic',
      ru: 'Змейка Классик',
      uz: 'Klassik Iloncha',
    },
    description: {
      en: 'Guide the hungry snake, eat glowing apples and grow without hitting the walls or your own tail!',
      ru: 'Управляйте змейкой, собирайте яблоки и растите, избегая столкновений со стенами и хвостом!',
      uz: 'Ilonchani boshqaring, olmalarni yeb o\'sing, devor va dumga urilmang!',
    },
    instructions: {
      en: 'Eat food to gain points and grow. Golden food grants double points! Speed gradually increases as you grow.',
      ru: 'Собирайте еду, чтобы расти и зарабатывать очки. Золотая еда дает бонус. Скорость увеличивается.',
      uz: 'Ball to\'plash va o\'sish uchun oziqlarni yeng. Oltin meva ikki barobar ball beradi.',
    },
    controls: {
      en: 'Arrow Keys / WASD or On-Screen D-Pad / Swipe gestures.',
      ru: 'Стрелки / WASD или виртуальный джойстик / свайпы.',
      uz: 'Strelkalar / WASD yoki ekrandagi d-pad / surish.',
    },
  },

  // 2. Flappy Wing
  {
    id: 'flappy',
    category: 'arcade',
    badge: 'POPULAR',
    popular: true,
    gradient: 'from-amber-500 to-orange-600',
    iconName: 'Compass',
    title: {
      en: 'Flappy Wing',
      ru: 'Летящая Птичка',
      uz: 'Uchar Qushcha',
    },
    description: {
      en: 'Tap to flap wings and navigate safely through dangerous neon pipe pillars.',
      ru: 'Нажимайте, чтобы взмахивать крыльями и пролетать сквозь неоновые трубы.',
      uz: 'Qanot qoqib xavfli ustunlar orasidan xavfsiz uchib o\'ting.',
    },
    instructions: {
      en: 'Timing is everything! Tap or press Space to flap. Each pipe gap passed scores 1 point.',
      ru: 'Нажимайте Пробел или экран для взмаха. За каждую пройденную трубу начисляется 1 очко.',
      uz: 'Qanot qoqish uchun ekran yoki probelni bosing. Har bir ustun uchun 1 ball.',
    },
    controls: {
      en: 'Spacebar / Tap anywhere on screen.',
      ru: 'Пробел / Тап по экрану.',
      uz: 'Bo\'sh joy tugmasi / Ekranga teginish.',
    },
  },

  // 3. Brick Breaker
  {
    id: 'brick_breaker',
    category: 'arcade',
    badge: 'ACTION',
    popular: true,
    gradient: 'from-pink-500 to-rose-700',
    iconName: 'Flame',
    title: {
      en: 'Brick Breaker Neon',
      ru: 'Неоновый Арканоид',
      uz: 'Neon Arkanoid',
    },
    description: {
      en: 'Smash through layers of neon bricks using your paddle, bouncing ball and exciting power-ups!',
      ru: 'Разбивайте неоновые блоки платформой, мячом и ловите полезные бонусы!',
      uz: 'To\'pni sakratib neon g\'ishtlarni sindiring va bonuslarni yig\'ing!',
    },
    instructions: {
      en: 'Do not let the ball drop below the paddle! Break all bricks to win. Hit angle changes based on paddle contact point.',
      ru: 'Не роняйте мяч! Угол отскока зависит от места удара о ракетку. Разбейте все кирпичи.',
      uz: 'To\'pni pastga tushirib yubormang! Barcha g\'ishtlarni yo\'q qiling.',
    },
    controls: {
      en: 'Left/Right arrows, A/D, or drag paddle / touch controls.',
      ru: 'Стрелки влево/вправо, A/D или перемещение ракетки пальцем.',
      uz: 'Chap/O\'ng strelkalar, A/D yoki barmoq bilan siljitish.',
    },
  },

  // 4. Space Shooter
  {
    id: 'space_shooter',
    category: 'arcade',
    badge: 'RETRO',
    popular: true,
    gradient: 'from-indigo-600 to-purple-800',
    iconName: 'Rocket',
    hasDifficulty: true,
    difficulties: ['Normal', 'Veteran', 'Hardcore'],
    title: {
      en: 'Galaxy Starfighter',
      ru: 'Звездный Истребитель',
      uz: 'Yulduzlar Jangchisi',
    },
    description: {
      en: 'Command your spaceship, blast alien invaders and dodge incoming plasma fire.',
      ru: 'Управляйте космолетом, уничтожайте волны инопланетян и уворачивайтесь от выстрелов.',
      uz: 'Koinot kemasini boshqaring, dushmanlarni yo\'q qiling va o\'qlardan qoching.',
    },
    instructions: {
      en: 'Eliminate incoming enemy formations. Collect star power-ups for rapid fire and shields.',
      ru: 'Сбивайте вражеские корабли. Собирайте усиления для щита и скорострельности.',
      uz: 'Dushman kemalarini yo\'q qiling. Kuchaytirgichlar yig\'ib tez o\'q uzing.',
    },
    controls: {
      en: 'A/D or Left/Right to move, Space or Button to fire. Drag to fly on touch.',
      ru: 'Стрелки / A-D для движения, Пробел для стрельбы, либо тач-перемещение.',
      uz: 'Harakatlanish uchun A/D yoki strelkalar, o\'t ochish uchun Probel.',
    },
  },

  // 5. Pac-Man Maze
  {
    id: 'pac_maze',
    category: 'arcade',
    badge: 'HOT',
    popular: true,
    gradient: 'from-yellow-500 to-amber-700',
    iconName: 'Ghost',
    title: {
      en: 'Cyber Pac Maze',
      ru: 'Кибер Пак-Мэн',
      uz: 'Kiber Pak-Men',
    },
    description: {
      en: 'Chomp neon energy dots across the futuristic maze while outsmarting sneaky cyber ghosts.',
      ru: 'Собирайте неоновые точки в лабиринте и ускользайте от преследующих призраков.',
      uz: 'Labirint bo\'ylab neon nuqtalarni yeng va sharpalardan qoching.',
    },
    instructions: {
      en: 'Eat all pellets to win. Grab large Power Pellets to turn the ghosts blue and devour them for huge points!',
      ru: 'Соберите все точки. Большие энерджайзеры делают призраков уязвимыми!',
      uz: 'Barcha nuqtalarni yeb tugating. Katta nuqtalar sharpalarni zaiflashtiradi.',
    },
    controls: {
      en: 'Arrow Keys / WASD / Virtual D-pad / Swipe.',
      ru: 'Стрелки / WASD / Виртуальный D-Pad / Свайпы.',
      uz: 'Strelkalar / WASD / Virtual D-Pad / Surish.',
    },
  },

  // 6. Fruit Slice
  {
    id: 'fruit_slice',
    category: 'arcade',
    badge: 'FUN',
    popular: true,
    gradient: 'from-red-500 to-rose-600',
    iconName: 'Zap',
    title: {
      en: 'Cyber Blade Slicer',
      ru: 'Неоновый Слайсер',
      uz: 'Neon Kesuvchi',
    },
    description: {
      en: 'Slice flying neon fruits with your laser blade while avoiding dangerous plasma bombs!',
      ru: 'Разрезайте летящие неоновые фрукты лазерным лезвием и не задевайте бомбы!',
      uz: 'Lazer tig\'i bilan mevalarni kesing va xavfli bombalardan ehtiyot bo\'ling!',
    },
    instructions: {
      en: 'Swipe or drag mouse to slash fruits. Multiple fruits sliced in one swipe grant combo multipliers. 3 dropped fruits or 1 bomb = Game Over.',
      ru: 'Проводите пальцем или мышью для разрезания. 3 упавших фрукта или взрыв бомбы — конец игры.',
      uz: 'Mevalarni kesish uchun sichqoncha yoki barmog\'ingizni suring. Bombalarni kesmang.',
    },
    controls: {
      en: 'Mouse drag or finger swipe across the screen.',
      ru: 'Проведение мышью или пальцем по экрану.',
      uz: 'Sichqoncha yoki barmoq bilan ekranda kesish.',
    },
  },

  // 7. 2048
  {
    id: 'game_2048',
    category: 'puzzle',
    badge: 'BRAIN',
    popular: true,
    featured: true,
    gradient: 'from-amber-500 to-yellow-600',
    iconName: 'Grid',
    title: {
      en: '2048 Neon Edition',
      ru: '2048 Неон',
      uz: '2048 Neon',
    },
    description: {
      en: 'Join matching numbers, slide tiles across the board and reach the legendary 2048 tile!',
      ru: 'Объединяйте одинаковые числа, перемещайте плитки и доберитесь до заветной 2048!',
      uz: 'Bir xil raqamlarni birlashtiring va afsonaviy 2048 katagiga yetib boring!',
    },
    instructions: {
      en: 'Slide tiles in any of the 4 directions. When two identical numbers collide, they merge into one with double value.',
      ru: 'Двигайте плитки в 4 направлениях. Одинаковые плитки сливаются в одну удвоенного номинала.',
      uz: 'Plitkalarni 4 yo\'nalishda suring. Bir xil raqamlar to\'qnashganda birlashadi.',
    },
    controls: {
      en: 'Arrow Keys, WASD, or Touch Swipe.',
      ru: 'Стрелки, WASD или свайпы по экрану.',
      uz: 'Strelkalar, WASD yoki ekranda surish.',
    },
  },

  // 8. Tic Tac Toe
  {
    id: 'tic_tac_toe',
    category: 'puzzle',
    badge: 'VERSUS',
    popular: false,
    gradient: 'from-blue-500 to-indigo-600',
    iconName: 'CheckSquare',
    hasDifficulty: true,
    difficulties: ['Smart AI', 'Unbeatable AI', '2-Player Local'],
    title: {
      en: 'Tic-Tac-Toe Glow',
      ru: 'Крестики-Нолики Неон',
      uz: 'Krestik-Nolik Neon',
    },
    description: {
      en: 'Challenge the minimax unbeatable AI or play against a friend locally on the same device.',
      ru: 'Сразитесь с непобедимым искусственным интеллектом или играйте с другом вдвоем.',
      uz: 'Yengilmas sun\'iy intellektga qarshi o\'ynang yoki do\'stingiz bilan bahslashring.',
    },
    instructions: {
      en: 'Get three of your marks in a horizontal, vertical, or diagonal row to win.',
      ru: 'Выстройте линию из трех своих знаков по горизонтали, вертикали или диагонали.',
      uz: 'G\'alaba qozonish uchun ketma-ket 3 ta belgingizni qatorga tering.',
    },
    controls: {
      en: 'Click or tap any empty grid square.',
      ru: 'Клик или тап по любой свободной клетке.',
      uz: 'Bo\'sh katakka sichqoncha yoki barmoq bilan bosing.',
    },
  },

  // 9. Minesweeper
  {
    id: 'minesweeper',
    category: 'puzzle',
    badge: 'LOGIC',
    popular: true,
    gradient: 'from-slate-600 to-zinc-800',
    iconName: 'Target',
    hasDifficulty: true,
    difficulties: ['Easy (9x9)', 'Medium (16x16)', 'Expert (16x30)'],
    title: {
      en: 'Minesweeper Cyber',
      ru: 'Сапер Киберпанк',
      uz: 'Saper Kiber',
    },
    description: {
      en: 'Uncover safe cyber grid tiles using numerical clues while flagging all hidden explosives.',
      ru: 'Открывайте безопасные ячейки по числовым подсказкам и помечайте скрытые мины флажками.',
      uz: 'Raqamlar yordamida minalarni toping va xavfsiz kataklarni oching.',
    },
    instructions: {
      en: 'Numbers indicate how many mines surround that cell. First click is always safe!',
      ru: 'Число показывает количество мин вокруг клетки. Первый клик всегда безопасен!',
      uz: 'Raqam atrofdagi minalar sonini bildiradi. Birinchi bosish har doim xavfsiz!',
    },
    controls: {
      en: 'Left click to reveal, Right click or Flag Mode button to place flags.',
      ru: 'ЛКМ — открыть клетку, ПКМ или кнопка с флажком — поставить флаг.',
      uz: 'Ochish uchun bosing, bayroqcha qo\'yish uchun o\'ng tugma yoki maxsus tugma.',
    },
  },

  // 10. Memory Cards
  {
    id: 'memory_cards',
    category: 'puzzle',
    badge: 'MEMORY',
    popular: false,
    gradient: 'from-purple-600 to-indigo-800',
    iconName: 'Eye',
    hasDifficulty: true,
    difficulties: ['4x3 (Casual)', '4x4 (Normal)', '6x4 (Master)'],
    title: {
      en: 'Memory Matrix',
      ru: 'Матрица Памяти',
      uz: 'Xotira Matritsasi',
    },
    description: {
      en: 'Flip holographic cards and match identical gamer glyphs in the fewest moves possible.',
      ru: 'Переворачивайте карты и находите одинаковые символы за наименьшее число ходов.',
      uz: 'Kartalarni ochib eng kam urinishda bir xil juftliklarni toping.',
    },
    instructions: {
      en: 'Click a card to reveal its icon, then find its matching twin. Complete all pairs before time runs out!',
      ru: 'Открывайте по две карты за раз. Найдите все пары как можно быстрее.',
      uz: 'Bir vaqtda ikkita kartani oching va barcha juftliklarni toping.',
    },
    controls: {
      en: 'Click or tap cards to flip.',
      ru: 'Нажимайте на карты, чтобы перевернуть.',
      uz: 'Kartalarni ochish uchun ularga bosing.',
    },
  },

  // 11. Wordle
  {
    id: 'wordle',
    category: 'puzzle',
    badge: 'TRENDING',
    popular: true,
    gradient: 'from-emerald-600 to-green-800',
    iconName: 'BookOpen',
    title: {
      en: 'Wordle Master',
      ru: 'Мастер Вордли',
      uz: 'So\'z Topish Wordle',
    },
    description: {
      en: 'Guess the secret 5-letter word in 6 attempts with real-time colored feedback clues.',
      ru: 'Угадайте секретное слово из 5 букв за 6 попыток с помощью цветовых подсказок.',
      uz: 'Rangli maslahatlar yordamida 6 urinishda 5 harfli yashirin so\'zni toping.',
    },
    instructions: {
      en: 'Green = correct letter & position. Yellow = correct letter, wrong spot. Gray = not in word.',
      ru: 'Зеленый = буква на своем месте. Желтый = есть в слове, но в другом месте. Серый = буквы нет.',
      uz: 'Yashil = to\'g\'ri o\'rinda. Sariq = so\'zda bor, lekin boshqa joyda. Kulrang = so\'zda yo\'q.',
    },
    controls: {
      en: 'Type on physical keyboard or click virtual on-screen keyboard.',
      ru: 'Ввод с клавиатуры или клик по экранным клавишам.',
      uz: 'Klaviatura orqali yozing yoki ekrandagi tugmalarni bosing.',
    },
  },

  // 12. Sudoku
  {
    id: 'sudoku',
    category: 'puzzle',
    badge: 'GENIUS',
    popular: true,
    gradient: 'from-cyan-600 to-blue-800',
    iconName: 'Hash',
    hasDifficulty: true,
    difficulties: ['Easy', 'Medium', 'Hard'],
    title: {
      en: 'Sudoku Pro',
      ru: 'Судоку Про',
      uz: 'Sudoku Pro',
    },
    description: {
      en: 'Fill the 9x9 grid with numbers 1 to 9 so each row, column, and 3x3 box contains all digits.',
      ru: 'Заполните сетку 9х9 цифрами от 1 до 9 без повторений в строках, столбцах и блоках 3х3.',
      uz: '9x9 katakchani 1 dan 9 gacha raqamlar bilan takrorlanmasdan to\'ldiring.',
    },
    instructions: {
      en: 'Select a cell and tap a digit. Use Notes mode to mark candidate digits, or Erase to clear.',
      ru: 'Выберите клетку и введите цифру. Используйте Заметки для пометок или Ластик.',
      uz: 'Katakni tanlang va raqamni kiriting. Maslahatlar yoki o\'chirgichdan foydalaning.',
    },
    controls: {
      en: 'Click grid cell, then click number pad or use number keys 1-9.',
      ru: 'Клик по клетке, затем выбор цифры с клавиатуры или панели.',
      uz: 'Katakni bosing va raqam panelidan kerakli raqamni tanlang.',
    },
  },

  // 13. 15-Puzzle
  {
    id: 'sliding_puzzle',
    category: 'puzzle',
    badge: 'CLASSIC',
    popular: false,
    gradient: 'from-teal-500 to-emerald-700',
    iconName: 'Layers',
    hasDifficulty: true,
    difficulties: ['3x3 (8-Puzzle)', '4x4 (15-Puzzle)'],
    title: {
      en: '15-Puzzle Numbers',
      ru: 'Пятнашки',
      uz: '15-Boshqotirma',
    },
    description: {
      en: 'Slide scrambled numbered tiles into numerical order using the single empty slot.',
      ru: 'Сдвигайте пронумерованные костяшки, чтобы выстроить их по порядку от 1 до 15.',
      uz: 'Raqamlarni 1 dan 15 gacha to\'g\'ri tartibda terib chiqing.',
    },
    instructions: {
      en: 'Click adjacent tiles to slide them into the empty position. Complete row by row.',
      ru: 'Нажимайте на соседнюю плитку, чтобы переместить ее в пустое место.',
      uz: 'Bo\'sh joy yonidagi plitkaga bosib uni siljiting.',
    },
    controls: {
      en: 'Click/tap tile adjacent to empty space, or use Arrow keys.',
      ru: 'Клик по плитке рядом с пустой клеткой или стрелки.',
      uz: 'Bo\'sh joy yonidagi katakka bosing yoki strelkalardan foydalaning.',
    },
  },

  // 14. Lights Out
  {
    id: 'lights_out',
    category: 'puzzle',
    badge: 'LOGIC',
    popular: false,
    gradient: 'from-violet-500 to-fuchsia-700',
    iconName: 'Sun',
    hasDifficulty: true,
    difficulties: ['3x3 Grid', '4x4 Grid', '5x5 Grid'],
    title: {
      en: 'Lights Out Neon',
      ru: 'Выключи Свет',
      uz: 'Chiroqlarni O\'chir',
    },
    description: {
      en: 'Turn off all glowing grid tiles. Clicking one toggles it and all four adjacent neighbors!',
      ru: 'Погасите все огни на поле. Нажатие на лампу переключает ее и 4 соседние клетки!',
      uz: 'Barcha chiroqlarni o\'chiring. Bitta chiroqqa bosish uni va qo\'shnilarini o\'zgartiradi.',
    },
    instructions: {
      en: 'Strategically flip switches until the entire grid goes completely dark.',
      ru: 'Продумывайте комбинации, пока все лампочки на игровом поле не погаснут.',
      uz: 'Barcha chiroqlar to\'liq o\'chguncha reja asosida tugmalarni bosing.',
    },
    controls: {
      en: 'Click or tap any light tile.',
      ru: 'Клик или тап по любой плитке.',
      uz: 'Istalgan katakka bosing.',
    },
  },

  // 15. Connect 4
  {
    id: 'connect_four',
    category: 'puzzle',
    badge: 'STRATEGY',
    popular: true,
    gradient: 'from-blue-600 to-cyan-700',
    iconName: 'Disc',
    hasDifficulty: true,
    difficulties: ['Easy AI', 'Hard AI', '2-Player Local'],
    title: {
      en: 'Connect Four',
      ru: 'Четыре в Ряд',
      uz: 'Qatorda To\'rtta',
    },
    description: {
      en: 'Drop colored discs into the vertical grid to form a connected line of four before your rival.',
      ru: 'Бросайте диски в колонки и соберите непрерывную линию из 4 своих фишек.',
      uz: 'Rangli disklarni ustunlarga tashlab, ketma-ket 4 tasini bir qatorga tering.',
    },
    instructions: {
      en: 'Choose a column to drop your chip. Connect 4 horizontally, vertically, or diagonally to win.',
      ru: 'Кликните на колонку, чтобы сбросить фишку. Победит тот, кто первым выстроит 4 фишки.',
      uz: 'Diskni tashlash uchun ustunni bosing. Birinchi bo\'lib 4 ta disk to\'plagan yutadi.',
    },
    controls: {
      en: 'Click or tap the top arrow or column.',
      ru: 'Клик по колонке или стрелке сверху.',
      uz: 'Ustun ustiga yoki kerakli joyga bosing.',
    },
  },

  // 16. Blackjack 21
  {
    id: 'blackjack',
    category: 'card',
    badge: 'CASINO',
    popular: true,
    featured: true,
    gradient: 'from-emerald-700 to-green-900',
    iconName: 'CreditCard',
    title: {
      en: 'Blackjack 21 Neon',
      ru: 'Блэкджек 21',
      uz: 'Blekjek 21',
    },
    description: {
      en: 'Beat the dealer by getting as close to 21 as possible without busting!',
      ru: 'Обыграйте дилера, набрав сумму очков ближе к 21, чем у него, но не перебрав!',
      uz: 'Dilerdan ko\'ra 21 ga yaqinroq ball to\'plab yutib chiqing!',
    },
    instructions: {
      en: 'Aces count as 1 or 11, face cards count as 10. Hit to draw cards, Stand to hold your hand.',
      ru: 'Туз стоит 1 или 11 очков, картинки — 10. Берите карты или останавливайтесь вовремя.',
      uz: 'Tuz 1 yoki 11 ball, rasmli kartalar 10 ball. Yana karta oling yoki to\'xtating.',
    },
    controls: {
      en: 'Click Deal, Hit, Stand, or Double buttons.',
      ru: 'Кнопки Раздать, Еще, Хватит, Удвоить.',
      uz: 'Tarqatish, Karta olish, To\'xtash tugmalari.',
    },
  },

  // 17. Klondike Solitaire
  {
    id: 'solitaire',
    category: 'card',
    badge: 'CLASSIC',
    popular: true,
    gradient: 'from-blue-700 to-indigo-950',
    iconName: 'FolderGit2',
    title: {
      en: 'Klondike Solitaire',
      ru: 'Косынка Пасьянс',
      uz: 'Kosinka Solityor',
    },
    description: {
      en: 'The legendary card solitaire. Build four foundation piles from Ace up to King by suit.',
      ru: 'Классический пасьянс Косынка. Разложите карты по четырем мастям от Туза до Короля.',
      uz: 'Klassik karta solityori. Kartalarni Tuzdan Qirolgacha to\'rtta ustunga tering.',
    },
    instructions: {
      en: 'Stack cards in descending order with alternating colors (Red/Black). Tap or drag cards to move.',
      ru: 'Чередуйте красные и черные карты по убыванию. Переносите карты кликом или перетаскиванием.',
      uz: 'Qizil va qora kartalarni kamayish tartibida tering. O\'tkazish uchun bosing.',
    },
    controls: {
      en: 'Click card to auto-move or drag to destination pile.',
      ru: 'Клик по карте для авто-перемещения или перетаскивание.',
      uz: 'Avtomatik ko\'chirish uchun kartaga bosing.',
    },
  },

  // 18. Speed Math Challenge
  {
    id: 'speed_math',
    category: 'speed',
    badge: 'MATH',
    popular: false,
    gradient: 'from-amber-600 to-orange-700',
    iconName: 'Calculator',
    hasDifficulty: true,
    difficulties: ['Easy (+ -)', 'Medium (x /)', 'Hard (Mixed)'],
    title: {
      en: 'Speed Math Blitz',
      ru: 'Быстрая Арифметика',
      uz: 'Tezkor Arifmetika',
    },
    description: {
      en: 'Solve as many mental arithmetic math problems as possible before the 60-second timer expires!',
      ru: 'Решите максимум математических примеров в уме за 60 секунд!',
      uz: '60 soniya ichida miyangizda iloji boricha ko\'proq misollarni yeching!',
    },
    instructions: {
      en: 'Select the correct answer from four choices. Streak combos multiply your final score.',
      ru: 'Выбирайте правильный ответ из предложенных. Непрерывные серии дают комбо-множители.',
      uz: 'To\'rtta variantdan to\'g\'risini tanlang. Ketma-ket to\'g\'ri javoblar ko\'proq ball beradi.',
    },
    controls: {
      en: 'Click the correct answer button or press 1, 2, 3, 4.',
      ru: 'Клик по варианту ответа или клавиши 1, 2, 3, 4.',
      uz: 'To\'g\'ri javob tugmasini bosing yoki 1-4 tugmalaridan foydalaning.',
    },
  },

  // 19. Color Reflex / Stroop Test
  {
    id: 'color_reflex',
    category: 'speed',
    badge: 'REFLEX',
    popular: false,
    gradient: 'from-rose-600 to-purple-700',
    iconName: 'Palette',
    title: {
      en: 'Stroop Color Clash',
      ru: 'Цветовой Тест Струпа',
      uz: 'Ranglar To\'qnashuvi',
    },
    description: {
      en: 'Does the font color match the word meaning? Test your brain resistance to cognitive interference!',
      ru: 'Совпадает ли цвет шрифта со значением написанного слова? Проверьте реакцию мозга!',
      uz: 'Shrift rangi so\'z ma\'nosiga mos keladimi? Miyangiz chaqqonligini sinab ko\'ring!',
    },
    instructions: {
      en: 'Tap MATCH or NO MATCH before the countdown ring empties. Speed increases every 5 answers.',
      ru: 'Быстро жмите ДА или НЕТ, пока не истек таймер. С каждым раундом времени меньше!',
      uz: 'Vaqt tugamasdan HA yoki YO\'Q tugmasini bosing. Har safar tezlik oshadi.',
    },
    controls: {
      en: 'Click YES / NO buttons or Left/Right Arrow keys.',
      ru: 'Кнопки ДА / НЕТ или стрелки влево/вправо.',
      uz: 'HA / YO\'Q tugmalari yoki strelkalar.',
    },
  },

  // 20. Reaction Time Tester
  {
    id: 'reaction_time',
    category: 'speed',
    badge: 'PRECISION',
    popular: true,
    gradient: 'from-emerald-600 to-teal-800',
    iconName: 'Timer',
    title: {
      en: 'Reaction Time Lab',
      ru: 'Тест на Реакцию',
      uz: 'Reaksiya Tezligi Testi',
    },
    description: {
      en: 'Wait for the red screen to turn glowing green, then tap immediately to record your reaction in milliseconds.',
      ru: 'Дождитесь, пока красный экран станет зеленым, и мгновенно нажмите для замера миллисекунд.',
      uz: 'Qizil ekran yashil rangga o\'zgarishini kuting va darhol bosing!',
    },
    instructions: {
      en: 'Red = Wait for green... Green = CLICK AS FAST AS POSSIBLE! Clicking too early incurs a penalty.',
      ru: 'Красный = ждите... Зеленый = ЖМИТЕ! Слишком ранний клик считается фальстартом.',
      uz: 'Qizil = kuting... Yashil = TEZROQ BOSING! Erta bosish hisobga olinmaydi.',
    },
    controls: {
      en: 'Click anywhere on the screen or press Space.',
      ru: 'Клик в любом месте экрана или Пробел.',
      uz: 'Ekran bo\'ylab istalgan joyga yoki probelga bosing.',
    },
  },

  // 21. Tower Stacker
  {
    id: 'tower_stacker',
    category: 'speed',
    badge: 'ADDICTIVE',
    popular: true,
    gradient: 'from-fuchsia-600 to-pink-800',
    iconName: 'Layers',
    title: {
      en: 'Tower Stacker 3D',
      ru: 'Башня Неон',
      uz: 'Neon Minora',
    },
    description: {
      en: 'Stack moving blocks on top of each other. Any misaligned edge gets trimmed off!',
      ru: 'Ставьте движущиеся блоки ровно друг на друга. Выступающие части срезаются!',
      uz: 'Harakatlanuvchi bloklarni bir-birining ustiga tering. Chetga chiqqan qismlar kesiladi!',
    },
    instructions: {
      en: 'Time your taps perfectly. Perfect placements play a chime and expand your block size back!',
      ru: 'Идеальное попадание воспроизводит аккорд и немного увеличивает размер блока.',
      uz: 'To\'liq ustma-ust tushirish blok hajmini tiklaydi va qo\'shimcha ball beradi.',
    },
    controls: {
      en: 'Spacebar or Click/Tap anywhere.',
      ru: 'Пробел или клик/тап в любом месте.',
      uz: 'Probel yoki ekranning istalgan joyiga bosish.',
    },
  },

  // 22. Pong vs AI
  {
    id: 'pong',
    category: 'speed',
    badge: 'RETRO',
    popular: true,
    gradient: 'from-blue-600 to-cyan-800',
    iconName: 'Activity',
    hasDifficulty: true,
    difficulties: ['Casual', 'Challenger', 'Master AI'],
    title: {
      en: 'Cyber Pong 1980',
      ru: 'Кибер Понг',
      uz: 'Kiber Pong',
    },
    description: {
      en: 'Classic retro paddle tennis against a reactive AI. Put spin on the ball and score 7 points first!',
      ru: 'Классический настольный теннис против ИИ. Закручивайте мяч и забейте 7 очков первым!',
      uz: 'Sun\'iy intellektga qarshi klassik stol tennisi. Birinchi bo\'lib 7 ball to\'plang!',
    },
    instructions: {
      en: 'Deflect the glowing cyber puck past the AI opponent paddle. Moving paddle adds spin.',
      ru: 'Отбивайте шайбу мимо ракетки соперника. Движение ракетки во время удара придает вращение.',
      uz: 'To\'pni raqib tomonidan qaytara olmaydigan qilib urib o\'tkazing.',
    },
    controls: {
      en: 'Up/Down arrows, W/S, or drag paddle up and down on touch.',
      ru: 'Стрелки вверх/вниз, W/S или вертикальное ведение пальцем.',
      uz: 'Yuqori/Pastki strelkalar, W/S yoki barmoq bilan siljitish.',
    },
  },

  // 23. Whack-a-Mole
  {
    id: 'whack_mole',
    category: 'speed',
    badge: 'FUN',
    popular: false,
    gradient: 'from-amber-700 to-yellow-800',
    iconName: 'Hammer',
    title: {
      en: 'Cyber Whack-A-Mole',
      ru: 'Ударь Крота',
      uz: 'Krotni Ur',
    },
    description: {
      en: 'Whack mischievous cyber bots popping out of underground holes before they disappear!',
      ru: 'Бейте молотком выскакивающих кибер-кротов до того, как они скроются под землю!',
      uz: 'Yer ostidan chiqayotgan robotlarni ular qaytib kirguncha tezda urib qoling!',
    },
    instructions: {
      en: 'Golden bots yield triple points. Avoid hitting bomb decoys! 30-second time rush.',
      ru: 'Золотые кроты приносят тройные очки. Не бейте бомбы! Время раунда 30 секунд.',
      uz: 'Oltin robotlar 3 barobar ko\'p ball beradi. Bombalarga tegmang!',
    },
    controls: {
      en: 'Click or tap holes as bots emerge.',
      ru: 'Нажимайте на лунки при появлении кротов.',
      uz: 'Robotlar chiqqan kataklarga tezda bosing.',
    },
  },

  // 24. Simon Says
  {
    id: 'simon_says',
    category: 'speed',
    badge: 'AUDIO',
    popular: false,
    gradient: 'from-indigo-600 to-pink-600',
    iconName: 'Radio',
    title: {
      en: 'Simon Cyber Memory',
      ru: 'Саймон Говорит',
      uz: 'Saymon Eslab Qol',
    },
    description: {
      en: 'Watch, listen and memorize the sequence of flashing neon quadrants, then repeat it accurately.',
      ru: 'Запоминайте звуковую и цветовую последовательность неоновых секторов и повторяйте ее.',
      uz: 'Chiroqlar va tovushlar ketma-ketligini eslab qoling va xuddi shunday takrorlang.',
    },
    instructions: {
      en: 'The sequence adds 1 new tone each round. One wrong press ends the sequence!',
      ru: 'С каждым раундом добавляется один новый сигнал. Ошибка завершает игру.',
      uz: 'Har bir bosqichda yangi signal qo\'shiladi. Bitta xato o\'yinni to\'xtatadi.',
    },
    controls: {
      en: 'Click or tap the 4 colored quadrant buttons.',
      ru: 'Нажимайте на 4 цветные кнопки.',
      uz: '4 ta rangli tugmalarni tartib bilan bosing.',
    },
  },

  // 25. Hangman
  {
    id: 'hangman',
    category: 'puzzle',
    badge: 'WORDS',
    popular: false,
    gradient: 'from-purple-700 to-indigo-900',
    iconName: 'HelpCircle',
    title: {
      en: 'Cyber Hangman',
      ru: 'Виселица Неон',
      uz: 'Dor O\'yini',
    },
    description: {
      en: 'Guess the secret gaming or science word letter by letter before your hologram fades away!',
      ru: 'Угадайте скрытое слово по буквам, пока голограмма персонажа не исчезнет!',
      uz: 'Hologramma yo\'qolib ketmasdan oldin harflarni topib so\'zni yeching!',
    },
    instructions: {
      en: 'You are allowed 6 incorrect letter guesses. Use letter clues wisely.',
      ru: 'Допускается не более 6 неверных букв. Вводите буквы по одной.',
      uz: 'Maksimum 6 ta xatoga ruxsat beriladi. Harflarni diqqat bilan tanlang.',
    },
    controls: {
      en: 'Click on-screen alphabet letters or press physical keyboard keys.',
      ru: 'Нажимайте буквы на виртуальной или физической клавиатуре.',
      uz: 'Klaviatura yoki ekrandagi harflarni bosing.',
    },
  },

  // 26. Galaxy Jumper (Doodle Jump style)
  {
    id: 'galaxy_jumper',
    category: 'arcade',
    badge: 'JUMP',
    popular: true,
    gradient: 'from-cyan-500 to-blue-700',
    iconName: 'ChevronUp',
    title: {
      en: 'Galaxy Jumper',
      ru: 'Космический Прыгун',
      uz: 'Koinot Sakrovchisi',
    },
    description: {
      en: 'Bounce from platform to platform climbing into the cosmos. Watch out for broken and moving ledges!',
      ru: 'Прыгайте по платформам всё выше в космос! Остерегайтесь ломающихся и движущихся платформ.',
      uz: 'Platformalardan yuqoriga sakrab koinotga chiqing. Singan platformalardan ehtiyot bo\'ling.',
    },
    instructions: {
      en: 'Automatic jumping. Move left or right to land on platforms. Bounce off springs for huge super jumps!',
      ru: 'Прыжки происходят автоматически. Управляйте движением влево и вправо.',
      uz: 'Sakrash avtomatik. Faqat chap va o\'ng tomonga yo\'naltiring.',
    },
    controls: {
      en: 'Left / Right Arrow keys, A / D, or tilt / on-screen arrow buttons.',
      ru: 'Стрелки влево/вправо, клавиши A/D или экранные стрелки.',
      uz: 'Chap/O\'ng strelkalar, A/D yoki ekrandagi boshqaruv.',
    },
  },

  // 27. Highway Racer (2D Car Racing)
  {
    id: 'car_racing',
    category: 'arcade',
    badge: 'RACING',
    popular: true,
    featured: true,
    gradient: 'from-red-600 to-amber-700',
    iconName: 'Compass',
    hasDifficulty: true,
    difficulties: ['Highway', 'Rush Hour', 'Nitro Hyper'],
    title: {
      en: 'Neon Highway Racer',
      ru: 'Неоновый Гонщик',
      uz: 'Neon Trassa Poygasi',
    },
    description: {
      en: 'Weave through high-speed neon highway traffic, grab nitro boosters and outrun the clock!',
      ru: 'Маневрируйте на безумной скорости в потоке машин, собирайте нитро и ставьте рекорды!',
      uz: 'Avtomobillar oqimida yuqori tezlikda boshqaring, nitro yig\'ing va rekord qo\'ying!',
    },
    instructions: {
      en: 'Dodge oncoming traffic. Collect coins for bonus points and blue nitro canisters for speed boosts.',
      ru: 'Уворачивайтесь от других машин. Собирайте монеты и баллоны с закисью азота.',
      uz: 'Mashinalar bilan to\'qnashmang. Qo\'shimcha ball uchun tangalarni yig\'ing.',
    },
    controls: {
      en: 'Left/Right or A/D to steer, Up or W to accelerate / nitro.',
      ru: 'Стрелки влево/вправо или A/D — руль, вверх / W — ускорение.',
      uz: 'Chap/O\'ng burilish, Yuqori — tezlanish.',
    },
  },
];

