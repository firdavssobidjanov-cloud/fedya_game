// Global 10,000 km Cloud Sync Engine for GAME ZONE
// Connects with live Global KV Database (CORS-enabled) & Telegram Bot API
// 100% Real-time sync across any device or phone worldwide

import { getAllUsers, saveAllUsers, AppUser } from './auth';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface CloudDatabaseConfig {
  endpoint: string;
}

export interface ActivityRecord {
  id: string;
  type: 'visit' | 'register' | 'login' | 'play' | 'reaction';
  username: string;
  email: string;
  totalGamesPlayed: number;
  details?: string;
  timestamp: number;
}

export interface AnalyticsSummary {
  totalUniqueVisitors: number;
  totalRegisteredUsers: number;
  totalGamesPlayed: number;
  topGames: { gameId: string; count: number }[];
  users: AppUser[];
  onlineStatus: 'online' | 'offline';
  cloudSyncStatus: 'connected' | 'offline_cached' | 'syncing';
  lastSyncTime: number;
}

// Live Global Cloud Database Base URL (Active, CORS-enabled, Zero 404s)
export const CLOUD_API_BASE = 'https://kvdb.io/WK7FLDbEdSEiqMTAbrHmtP';

const STORAGE_KEYS = {
  REAL_PLAYS_COUNT: 'game_zone_real_plays_count_v3',
  REAL_GAME_BREAKDOWN: 'game_zone_real_game_stats_v3',
  REAL_VISITORS_COUNT: 'game_zone_real_unique_visitors_v3',
  DEVICE_VISITED_FLAG: 'game_zone_counted_device_v3',
  TELEGRAM_CONFIG: 'game_zone_telegram_config_v3',
  ACTIVITY_LIST: 'game_zone_real_activity_feed_v3',
  LAST_SYNC: 'game_zone_last_sync_timestamp_v3',
};

// 1. CLOUD DB CONFIG (COMPATIBILITY)
export function getCloudDbConfig(): CloudDatabaseConfig {
  return { endpoint: CLOUD_API_BASE };
}

export function saveCloudDbConfig(_cfg: CloudDatabaseConfig): void {
  // Fixed endpoint
}

// 2. TELEGRAM ALERTS
export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    botToken: '',
    chatId: '',
    enabled: true,
  };
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_CONFIG, JSON.stringify(config));
  } catch (e) {}
}

export async function sendTelegramAlert(text: string): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) return false;

  try {
    const cleanToken = config.botToken.trim();
    const cleanChatId = config.chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// 3. ACTIVITY FEED (WHO ENTERED, LOGGED IN, REGISTERED, PLAYED)
export function getActivityList(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveActivityList(list: ActivityRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LIST, JSON.stringify(list));
  } catch (e) {}
}

export async function logActivityToCloud(
  entry: Omit<ActivityRecord, 'id' | 'timestamp'>
): Promise<void> {
  const record: ActivityRecord = {
    ...entry,
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };

  const local = getActivityList();
  local.unshift(record);
  if (local.length > 100) local.length = 100;
  saveActivityList(local);

  try {
    let cloudList: ActivityRecord[] = [];
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_activity`);
    if (res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) cloudList = data;
    }
    cloudList.unshift(record);
    if (cloudList.length > 100) cloudList = cloudList.slice(0, 100);

    await fetch(`${CLOUD_API_BASE}/gamezone_activity`, {
      method: 'POST',
      body: JSON.stringify(cloudList),
    });
  } catch (e) {}
}

export async function pullCloudActivity(): Promise<ActivityRecord[]> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_activity`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveActivityList(data);
        return data;
      }
    }
  } catch (e) {}
  return getActivityList();
}

// 4. VISITORS TRACKING (CLOUD + LOCAL)
export function getRealVisitorsCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_VISITORS_COUNT);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val)) return val;
    }
  } catch (e) {}
  return 0;
}

export async function trackRealVisit(): Promise<void> {
  try {
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const deviceName = isMobile ? '📱 Telefon' : '💻 Kompyuter';

    const alreadyCounted = localStorage.getItem(STORAGE_KEYS.DEVICE_VISITED_FLAG);
    if (!alreadyCounted) {
      localStorage.setItem(STORAGE_KEYS.DEVICE_VISITED_FLAG, 'true');

      // Update in cloud
      try {
        let stats: any = {};
        const res = await fetch(`${CLOUD_API_BASE}/gamezone_stats`);
        if (res.ok) {
          stats = await res.json().catch(() => ({}));
        }
        const cloudVisitors = (stats.visitors || 0) + 1;
        stats.visitors = cloudVisitors;
        localStorage.setItem(STORAGE_KEYS.REAL_VISITORS_COUNT, cloudVisitors.toString());

        await fetch(`${CLOUD_API_BASE}/gamezone_stats`, {
          method: 'POST',
          body: JSON.stringify(stats),
        }).catch(() => {});

        // Log activity
        logActivityToCloud({
          type: 'visit',
          username: 'Yangi Tashrif',
          email: 'Mehmon qurilma',
          totalGamesPlayed: 0,
          details: `${deviceName} orqali GAME ZONE ga kirdi`,
        });

        // Telegram alert
        sendTelegramAlert(
          `👁 <b>Yangi Tashrif Buyuruvchi!</b>\n\n` +
          `🌐 Boshqa qurilmadan (<b>${deviceName}</b>) GAME ZONE saytingizga kirishdi.\n` +
          `📊 Jami real tashriflar: <b>${cloudVisitors} ta</b>\n` +
          `🕒 Vaqti: ${new Date().toLocaleString()}`
        );
      } catch (e) {
        const current = getRealVisitorsCount();
        localStorage.setItem(STORAGE_KEYS.REAL_VISITORS_COUNT, (current + 1).toString());
      }
    }
  } catch (e) {}
}

// 5. GAMES PLAYED COUNTER (CLOUD + LOCAL)
export function getTotalGamesPlayedCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_PLAYS_COUNT);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val)) return val;
    }
  } catch (e) {}
  return 0;
}

export async function incrementTotalGamesPlayed(gameId: string): Promise<void> {
  try {
    const current = getTotalGamesPlayedCount();
    const updated = current + 1;
    localStorage.setItem(STORAGE_KEYS.REAL_PLAYS_COUNT, updated.toString());

    const breakdown = getGameStatsBreakdown();
    breakdown[gameId] = (breakdown[gameId] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.REAL_GAME_BREAKDOWN, JSON.stringify(breakdown));

    // Push to cloud stats
    try {
      let stats: any = {};
      const res = await fetch(`${CLOUD_API_BASE}/gamezone_stats`);
      if (res.ok) {
        stats = await res.json().catch(() => ({}));
      }
      stats.plays = (stats.plays || 0) + 1;
      stats.breakdown = stats.breakdown || {};
      stats.breakdown[gameId] = (stats.breakdown[gameId] || 0) + 1;

      await fetch(`${CLOUD_API_BASE}/gamezone_stats`, {
        method: 'POST',
        body: JSON.stringify(stats),
      }).catch(() => {});
    } catch (e) {}
  } catch (e) {}
}

export function getGameStatsBreakdown(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_GAME_BREAKDOWN);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

// 6. SYNC REAL USER TO CLOUD & TELEGRAM
export async function syncNewUserToCloud(user: AppUser): Promise<void> {
  // 1. Send instant Telegram Notification to Firdavs's phone
  sendTelegramAlert(
    `👤 <b>Yangi Foydalanuvchi Ro'yxatdan O'tdi!</b>\n\n` +
    `🎮 <b>Platforma:</b> GAME ZONE\n` +
    `👤 <b>Ismi (Nikneym):</b> <code>${user.username}</code>\n` +
    `📧 <b>Gmail (Email):</b> <code>${user.email}</code>\n` +
    `🎯 <b>O'ynagan o'yinlari:</b> <b>${user.totalGamesPlayed || 0} ta o'yin</b>\n` +
    `🕒 <b>Vaqti:</b> ${new Date().toLocaleString()}\n\n` +
    `✅ Akkaunt muvaffaqiyatli yaratildi!`
  );

  // 2. Log activity
  logActivityToCloud({
    type: 'register',
    username: user.username,
    email: user.email,
    totalGamesPlayed: user.totalGamesPlayed || 0,
    details: 'Yangi akkaunt ro\'yxatdan o\'tdi',
  });

  // 3. Push to live Cloud Database
  try {
    let cloudUsers: AppUser[] = [];
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_users`);
    if (res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) cloudUsers = data;
    }

    // Filter out if already exists
    cloudUsers = cloudUsers.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    cloudUsers.unshift(user);

    await fetch(`${CLOUD_API_BASE}/gamezone_users`, {
      method: 'POST',
      body: JSON.stringify(cloudUsers),
    });
  } catch (e) {}
}

// Sync updated user stats (like games played or last active) to Cloud
export async function syncUserUpdateToCloud(user: AppUser): Promise<void> {
  try {
    let cloudUsers: AppUser[] = [];
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_users`);
    if (res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) cloudUsers = data;
    }

    const idx = cloudUsers.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id
    );
    if (idx !== -1) {
      cloudUsers[idx] = { ...cloudUsers[idx], ...user };
    } else {
      cloudUsers.unshift(user);
    }

    await fetch(`${CLOUD_API_BASE}/gamezone_users`, {
      method: 'POST',
      body: JSON.stringify(cloudUsers),
    });
  } catch (e) {}
}

// Remove user from Cloud (Admin delete)
export async function removeUserFromCloud(userId: string): Promise<void> {
  try {
    let cloudUsers: AppUser[] = [];
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_users`);
    if (res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) cloudUsers = data;
    }
    cloudUsers = cloudUsers.filter((u) => u.id !== userId);

    await fetch(`${CLOUD_API_BASE}/gamezone_users`, {
      method: 'POST',
      body: JSON.stringify(cloudUsers),
    });
  } catch (e) {}
}

// Toggle block user in Cloud (Admin block)
export async function toggleBlockUserInCloud(userId: string): Promise<void> {
  try {
    let cloudUsers: AppUser[] = [];
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_users`);
    if (res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) cloudUsers = data;
    }
    const target = cloudUsers.find((u) => u.id === userId);
    if (target) {
      target.isBlocked = !target.isBlocked;
      await fetch(`${CLOUD_API_BASE}/gamezone_users`, {
        method: 'POST',
        body: JSON.stringify(cloudUsers),
      });
    }
  } catch (e) {}
}

// 7. PULL USERS FROM CLOUD (FOR ADMIN PANEL ON ANY PHONE 10,000 KM AWAY)
export async function pullCloudUsers(): Promise<AppUser[]> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_users`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Merge with local users (cloud has highest priority)
        const localUsers = getAllUsers();
        const mergedMap = new Map<string, AppUser>();
        localUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
        data.forEach((u: AppUser) => mergedMap.set(u.email.toLowerCase(), u));

        const result = Array.from(mergedMap.values());
        saveAllUsers(result);
        return result;
      }
    }
  } catch (e) {}
  return getAllUsers();
}

// 8. PULL GLOBAL STATS FROM CLOUD
export async function pullCloudStats(): Promise<void> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/gamezone_stats`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (typeof data.visitors === 'number') {
          localStorage.setItem(STORAGE_KEYS.REAL_VISITORS_COUNT, data.visitors.toString());
        }
        if (typeof data.plays === 'number') {
          localStorage.setItem(STORAGE_KEYS.REAL_PLAYS_COUNT, data.plays.toString());
        }
        if (data.breakdown) {
          localStorage.setItem(STORAGE_KEYS.REAL_GAME_BREAKDOWN, JSON.stringify(data.breakdown));
        }
      }
    }
  } catch (e) {}
}

// 9. SUMMARY FOR ADMIN DASHBOARD
export function getAnalyticsSummary(): AnalyticsSummary {
  const users = getAllUsers();
  const totalGamesPlayed = getTotalGamesPlayedCount();
  const totalUniqueVisitors = getRealVisitorsCount();
  const breakdown = getGameStatsBreakdown();

  const topGames = Object.entries(breakdown)
    .map(([gameId, count]) => ({ gameId, count }))
    .sort((a, b) => b.count - a.count);

  let lastSyncTime = Date.now();
  try {
    const rawSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (rawSync) lastSyncTime = parseInt(rawSync, 10);
  } catch (e) {}

  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  return {
    totalUniqueVisitors,
    totalRegisteredUsers: users.length,
    totalGamesPlayed,
    topGames,
    users,
    onlineStatus: isOnline ? 'online' : 'offline',
    cloudSyncStatus: isOnline ? 'connected' : 'offline_cached',
    lastSyncTime,
  };
}

export async function triggerGlobalCloudSync(): Promise<boolean> {
  await Promise.all([pullCloudUsers(), pullCloudStats(), pullCloudActivity()]);
  return true;
}

// Export CSV
export function exportUsersToCSV(): void {
  const users = getAllUsers();
  const headers = ['ID', 'Username', 'Email', 'Role', 'Total Games Played', 'Created Date', 'Last Active', 'Status'];

  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${u.username.replace(/"/g, '""')}"`,
    `"${u.email}"`,
    `"${u.role}"`,
    u.totalGamesPlayed || 0,
    `"${new Date(u.createdAt).toLocaleString()}"`,
    `"${new Date(u.lastLoginAt).toLocaleString()}"`,
    `"${u.isBlocked ? 'Blocked' : 'Active'}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `gamezone_real_users_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
