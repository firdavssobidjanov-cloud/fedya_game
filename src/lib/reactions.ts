// Real-time Like / Dislike reactions and Admin Notifications for GAME ZONE
// Tracks who liked/disliked which game and notifies Admin

import { getCurrentUser } from './auth';

export interface ReactionRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  userId: string;
  username: string;
  email: string;
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

// Get all reaction records (for Admin notifications feed)
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

// User reaction map: { [userId_gameId]: 'like' | 'dislike' }
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
  const userKey = currentUser ? currentUser.email : 'guest_device';
  const username = currentUser ? currentUser.username : 'Mehmon (Guest)';
  const email = currentUser ? currentUser.email : 'Ro\'yxatdan o\'tmagan mehmon';
  const userId = currentUser ? currentUser.id : 'guest_' + Date.now();

  const map = getUserReactionsMap();
  const mapKey = `${userKey}_${gameId}`;
  const currentReaction = map[mapKey];

  let all = getAllReactions();

  // If user clicks the same reaction, remove it (toggle off)
  if (currentReaction === type) {
    delete map[mapKey];
    all = all.filter((r) => !(r.gameId === gameId && (r.email === email || r.userId === userId)));
  } else {
    // If switching reaction or new reaction
    map[mapKey] = type;
    all = all.filter((r) => !(r.gameId === gameId && (r.email === email || r.userId === userId)));

    const newRecord: ReactionRecord = {
      id: 'reaction_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      gameId,
      gameTitle,
      userId,
      username,
      email,
      type,
      timestamp: Date.now(),
    };
    all.unshift(newRecord);
  }

  saveAllReactions(all);
  saveUserReactionsMap(map);

  return getGameReactionStats(gameId);
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
