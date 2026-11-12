// LocalStorage persistence for player profile, high scores, favorites and achievements

export interface PlayerProfile {
  username: string;
  avatarId: number;
  totalPlayTime: number; // in seconds
  totalGamesPlayed: number;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  unlockedAt?: number;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_play', titleKey: 'ach_first_play_title', descKey: 'ach_first_play_desc', icon: '🎮' },
  { id: 'gamer_5', titleKey: 'ach_gamer_5_title', descKey: 'ach_gamer_5_desc', icon: '⭐' },
  { id: 'gamer_15', titleKey: 'ach_gamer_15_title', descKey: 'ach_gamer_15_desc', icon: '🏆' },
  { id: 'century', titleKey: 'ach_century_title', descKey: 'ach_century_desc', icon: '⚡' },
  { id: 'high_roller', titleKey: 'ach_high_roller_title', descKey: 'ach_high_roller_desc', icon: '💎' },
  { id: 'puzzle_master', titleKey: 'ach_puzzle_master_title', descKey: 'ach_puzzle_master_desc', icon: '🧩' },
  { id: 'reflex_king', titleKey: 'ach_reflex_king_title', descKey: 'ach_reflex_king_desc', icon: '⚡' },
  { id: 'arcade_champion', titleKey: 'ach_arcade_champion_title', descKey: 'ach_arcade_champion_desc', icon: '👑' },
];

export const AVATARS = [
  { id: 0, name: 'Cyber Ninja', color: 'from-purple-500 to-indigo-600', emoji: '🥷' },
  { id: 1, name: 'Neon Robot', color: 'from-cyan-400 to-blue-600', emoji: '🤖' },
  { id: 2, name: 'Pixel Hero', color: 'from-emerald-400 to-teal-600', emoji: '👾' },
  { id: 3, name: 'Space Ace', color: 'from-pink-500 to-rose-600', emoji: '🚀' },
  { id: 4, name: 'Cyber Dragon', color: 'from-amber-400 to-red-600', emoji: '🐉' },
  { id: 5, name: 'Digital Wizard', color: 'from-violet-500 to-purple-700', emoji: '🧙‍♂️' },
  { id: 6, name: 'Hacker Cat', color: 'from-lime-400 to-emerald-600', emoji: '🐱‍💻' },
  { id: 7, name: 'Galactic Fox', color: 'from-orange-400 to-amber-600', emoji: '🦊' },
  { id: 8, name: 'Speed Demon', color: 'from-red-500 to-pink-600', emoji: '🏎️' },
  { id: 9, name: 'Alien King', color: 'from-teal-400 to-cyan-700', emoji: '👽' },
  { id: 10, name: 'Ghost Runner', color: 'from-blue-400 to-indigo-700', emoji: '👻' },
  { id: 11, name: 'Gold Champion', color: 'from-yellow-400 to-amber-500', emoji: '🏆' },
];

const STORAGE_KEYS = {
  PROFILE: 'game_zone_profile',
  HIGH_SCORES: 'game_zone_highscores',
  FAVORITES: 'game_zone_favorites',
  RECENTS: 'game_zone_recents',
  ACHIEVEMENTS: 'game_zone_achievements',
  LANG: 'game_zone_lang',
};

// Profile
export function getStoredProfile(): PlayerProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return {
    username: 'CyberPlayer',
    avatarId: 0,
    totalPlayTime: 0,
    totalGamesPlayed: 0,
  };
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

// High Scores
export function getHighScores(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return {};
}

export function getHighScore(gameId: string): number {
  const scores = getHighScores();
  return scores[gameId] || 0;
}

export function saveHighScore(gameId: string, score: number): boolean {
  try {
    const scores = getHighScores();
    const current = scores[gameId] || 0;
    if (score > current) {
      scores[gameId] = score;
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(scores));
      return true; // New High Score!
    }
  } catch (e) {}
  return false;
}

// Favorites
export function getFavorites(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Clean legacy preset list if found
        const isOldDefault =
          parsed.length === 5 &&
          parsed.includes('snake') &&
          parsed.includes('flappy') &&
          parsed.includes('2048') &&
          parsed.includes('brick_breaker') &&
          parsed.includes('blackjack');
        if (isOldDefault) {
          localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
          return [];
        }
        return parsed;
      }
    }
  } catch (e) {}
  return []; // 100% toza bo'sh holatda boshlanadi
}

export function clearFavorites(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
  } catch (e) {}
}

export function clearRecents(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify([]));
  } catch (e) {}
}

export function toggleFavorite(gameId: string): string[] {
  let favs = getFavorites();
  if (favs.includes(gameId)) {
    favs = favs.filter((id) => id !== gameId);
  } else {
    favs = [gameId, ...favs];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {}
  return favs;
}

// Recent Games
export function getRecentGames(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENTS);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
}

export function recordGamePlayed(gameId: string): void {
  try {
    let recents = getRecentGames().filter((id) => id !== gameId);
    recents.unshift(gameId);
    if (recents.length > 10) recents = recents.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(recents));

    // Update profile play count
    const profile = getStoredProfile();
    profile.totalGamesPlayed += 1;
    saveProfile(profile);

    // Check play count achievements
    checkAchievement('first_play');
    if (recents.length >= 5) checkAchievement('gamer_5');
    if (profile.totalGamesPlayed >= 15) checkAchievement('gamer_15');
  } catch (e) {}
}

// Achievements
export function getAchievements(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return {};
}

type AchievementCallback = (ach: Achievement) => void;
let achievementListeners: AchievementCallback[] = [];

export function onAchievementUnlocked(cb: AchievementCallback) {
  achievementListeners.push(cb);
  return () => {
    achievementListeners = achievementListeners.filter((l) => l !== cb);
  };
}

export function checkAchievement(achId: string): boolean {
  try {
    const unlocked = getAchievements();
    if (!unlocked[achId]) {
      unlocked[achId] = Date.now();
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
      const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) {
        achievementListeners.forEach((cb) => cb(ach));
      }
      return true;
    }
  } catch (e) {}
  return false;
}

// Language
export function getStoredLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANG) || 'en';
  } catch (e) {}
  return 'en';
}

export function saveStoredLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  } catch (e) {}
}

