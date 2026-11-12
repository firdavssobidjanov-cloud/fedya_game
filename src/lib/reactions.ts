// Real-time Like / Dislike reactions and Admin Notifications for GAME ZONE
// 10,000 km Worldwide Sync with Cloud Database and Telegram Notifications

import { getCurrentUser } from './auth';
import { getStoredProfile } from './storage';
import { sendTelegramAlert, getCloudDbConfig } from './cloudSync';

export interface ReactionRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  userId: string;
  username: string;
  email: string;
  totalGamesPlayed: number;
  type: 'like' | 'dislike';
  timestamp: number;
}

export interface ReactionStats {
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
}

const STORAGE_KEYS = {
  REACTIONS_LIST: 'game_zone_real_reactions_feed_v2',
  REACTIONS_USER_MAP: 'game_zone_user_reactions_map_v2',
  READ_NOTIFS_TIMESTAMP: 'game_zone_admin_read_notifs_ts_v2',
};

// Get all reaction records
export function getAllReactions(): ReactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REACTIONS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllReactions(reactions: ReactionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REACTIONS_LIST, JSON.stringify(reactions));
  } catch (e) {}
}

function getUserReactionsMap(): Record<string, 'like' | 'dislike'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REACTIONS_USER_MAP);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function saveUserReactionsMap(map: Record<string, 'like' | 'dislike'>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REACTIONS_USER_MAP, JSON.stringify(map));
  } catch (e) {}
}

// Get Reaction stats for a specific game
export function getGameReactionStats(gameId: string): ReactionStats {
  const all = getAllReactions();
  const gameReactions = all.filter((r) => r.gameId === gameId);

  const likes = gameReactions.filter((r) => r.type === 'like').length;
  const dislikes = gameReactions.filter((r) => r.type === 'dislike').length;

  const currentUser = getCurrentUser();
  const userKey = currentUser ? currentUser.email : 'guest_device';
  const map = getUserReactionsMap();
  const userReaction = map[`${userKey}_${gameId}`] || null;

  return {
    likes,
    dislikes,
    userReaction,
  };
}

// Toggle or Set Reaction (Like or Dislike)
export function setGameReaction(
  gameId: string,
  gameTitle: string,
  type: 'like' | 'dislike'
): ReactionStats {
  const currentUser = getCurrentUser();
  const profile = getStoredProfile();

  const userKey = currentUser ? currentUser.email : 'guest_device';
  const username = currentUser ? currentUser.username : (profile.username || 'Mehmon (Guest)');
  const email = currentUser ? currentUser.email : 'Akkountsiz mehmon';
  const totalGamesPlayed = currentUser ? (currentUser.totalGamesPlayed || 0) : (profile.totalGamesPlayed || 0);
  const userId = currentUser ? currentUser.id : 'guest_' + Date.now();

  const map = getUserReactionsMap();
  const mapKey = `${userKey}_${gameId}`;
  const currentReaction = map[mapKey];

  let all = getAllReactions();

  if (currentReaction === type) {
    delete map[mapKey];
    all = all.filter((r) => !(r.gameId === gameId && (r.email === email || r.userId === userId)));
  } else {
    map[mapKey] = type;
    all = all.filter((r) => !(r.gameId === gameId && (r.email === email || r.userId === userId)));

    const newRecord: ReactionRecord = {
      id: 'reaction_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      gameId,
      gameTitle,
      userId,
      username,
      email,
      totalGamesPlayed,
      type,
      timestamp: Date.now(),
    };
    all.unshift(newRecord);

    // 1. Send instant Telegram alert (Reaches Firdavs 10,000 km away!)
    const emoji = type === 'like' ? '👍' : '👎';
    const label = type === 'like' ? 'LAYK BOSILDI' : 'DISLAYK BOSILDI';
    sendTelegramAlert(
      `${emoji} <b>O'yinga Yangi ${label}!</b>\n\n` +
      `🎮 <b>O'yin:</b> <code>${gameTitle}</code>\n` +
      `👤 <b>O'yinchi (Ismi):</b> <b>${username}</b>\n` +
      `📧 <b>Gmail (Email):</b> <code>${email}</code>\n` +
      `🎯 <b>O'ynagan o'yinlari:</b> <b>${totalGamesPlayed} ta o'yin o'ynagan</b>\n` +
      `⭐ <b>Reaksiya turi:</b> ${emoji} ${type.toUpperCase()}\n` +
      `🕒 <b>Vaqti:</b> ${new Date().toLocaleString()}`
    );

    // 2. Cloud DB Sync
    syncReactionToCloud(newRecord);
  }

  saveAllReactions(all);
  saveUserReactionsMap(map);

  return getGameReactionStats(gameId);
}

// Cloud DB push
async function syncReactionToCloud(record: ReactionRecord): Promise<void> {
  const config = getCloudDbConfig();
  if (!config.enabled || !config.databaseUrl) return;

  try {
    const cleanBase = config.databaseUrl.replace(/\/$/, '');
    await fetch(`${cleanBase}/reactions/${record.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {});
  } catch (e) {}
}

// PULL ALL REACTIONS FROM CLOUD (FOR ADMIN PANEL ON ANY DEVICE)
export async function pullCloudReactions(): Promise<ReactionRecord[]> {
  const config = getCloudDbConfig();
  if (!config.enabled || !config.databaseUrl) return getAllReactions();

  try {
    const cleanBase = config.databaseUrl.replace(/\/$/, '');
    const res = await fetch(`${cleanBase}/reactions.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const cloudReactions: ReactionRecord[] = Object.values(data);
        if (cloudReactions.length > 0) {
          cloudReactions.sort((a, b) => b.timestamp - a.timestamp);
          saveAllReactions(cloudReactions);
          return cloudReactions;
        }
      }
    }
  } catch (e) {}
  return getAllReactions();
}

// Admin Notifications count
export function getUnreadReactionsCount(): number {
  const all = getAllReactions();
  let lastRead = 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READ_NOTIFS_TIMESTAMP);
    if (raw) lastRead = parseInt(raw, 10);
  } catch (e) {}
  return all.filter((r) => r.timestamp > lastRead).length;
}

export function markReactionsAsRead(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFS_TIMESTAMP, Date.now().toString());
  } catch (e) {}
}
