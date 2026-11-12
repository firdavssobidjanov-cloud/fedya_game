// Global Cloud Sync & 10,000 km Real-time Notification Engine for GAME ZONE
// Connects with Firebase Realtime Database (REST API) & Telegram Bot API
// Delivers real-time notifications to Admin across any distance in the world

import { getAllUsers, saveAllUsers, AppUser } from './auth';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface CloudDatabaseConfig {
  databaseUrl: string; // e.g. https://game-zone-fedya-default-rtdb.firebaseio.com
  enabled: boolean;
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

const STORAGE_KEYS = {
  REAL_PLAYS_COUNT: 'game_zone_real_plays_count_v2',
  REAL_GAME_BREAKDOWN: 'game_zone_real_game_stats_v2',
  REAL_VISITORS_COUNT: 'game_zone_real_unique_visitors_v2',
  DEVICE_VISITED_FLAG: 'game_zone_has_counted_this_device_v2',
  TELEGRAM_CONFIG: 'game_zone_telegram_config_v2',
  CLOUD_DB_CONFIG: 'game_zone_cloud_db_config_v2',
  LAST_SYNC: 'game_zone_last_sync_timestamp',
};

// 1. TELEGRAM NOTIFICATIONS CONFIG (10,000 KM INSTANT ALERTS)
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

// 2. CLOUD DATABASE (FIREBASE REALTIME DB REST API)
export function getCloudDbConfig(): CloudDatabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOUD_DB_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    databaseUrl: 'https://game-zone-fedya-default-rtdb.firebaseio.com',
    enabled: true,
  };
}

export function saveCloudDbConfig(config: CloudDatabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOUD_DB_CONFIG, JSON.stringify(config));
  } catch (e) {}
}

// Visitors
export function getRealVisitorsCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_VISITORS_COUNT);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val)) return val;
    }
  } catch (e) {}
  return 1;
}

export function trackRealVisit(): void {
  try {
    const alreadyCounted = localStorage.getItem(STORAGE_KEYS.DEVICE_VISITED_FLAG);
    if (!alreadyCounted) {
      const current = getRealVisitorsCount();
      const updated = current + 1;
      localStorage.setItem(STORAGE_KEYS.REAL_VISITORS_COUNT, updated.toString());
      localStorage.setItem(STORAGE_KEYS.DEVICE_VISITED_FLAG, 'true');

      // Send Telegram alert if enabled
      sendTelegramAlert(
        `👁 <b>Yangi Tashrif Buyuruvchi!</b>\n\n` +
        `🌐 Biror kishi GAME ZONE saytingizga kirdi.\n` +
        `📊 Jami tashrif buyuruvchilar: <b>${updated} ta</b>\n` +
        `🕒 Vaqti: ${new Date().toLocaleString()}`
      );

      triggerGlobalCloudSync();
    }
  } catch (e) {}
}

// Games Played
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

export function incrementTotalGamesPlayed(gameId: string): void {
  try {
    const current = getTotalGamesPlayedCount();
    const updated = current + 1;
    localStorage.setItem(STORAGE_KEYS.REAL_PLAYS_COUNT, updated.toString());

    const breakdown = getGameStatsBreakdown();
    breakdown[gameId] = (breakdown[gameId] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.REAL_GAME_BREAKDOWN, JSON.stringify(breakdown));

    triggerGlobalCloudSync();
  } catch (e) {}
}

export function getGameStatsBreakdown(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_GAME_BREAKDOWN);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

// Analytics Summary for Admin Panel
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

// SYNC REAL USER TO CLOUD & TELEGRAM
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

  // 2. Cloud DB REST Push
  const config = getCloudDbConfig();
  if (config.enabled && config.databaseUrl) {
    try {
      const cleanBase = config.databaseUrl.replace(/\/$/, '');
      await fetch(`${cleanBase}/users/${user.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }).catch(() => {});
    } catch (e) {}
  }
}

// PULL USERS FROM CLOUD (FOR ADMIN PANEL)
export async function pullCloudUsers(): Promise<AppUser[]> {
  const config = getCloudDbConfig();
  if (!config.enabled || !config.databaseUrl) return getAllUsers();

  try {
    const cleanBase = config.databaseUrl.replace(/\/$/, '');
    const res = await fetch(`${cleanBase}/users.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const cloudUsers: AppUser[] = Object.values(data);
        if (cloudUsers.length > 0) {
          saveAllUsers(cloudUsers);
          return cloudUsers;
        }
      }
    }
  } catch (e) {}
  return getAllUsers();
}

// GLOBAL CLOUD SYNC
export async function triggerGlobalCloudSync(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

  const config = getCloudDbConfig();
  if (!config.enabled || !config.databaseUrl) return false;

  try {
    const cleanBase = config.databaseUrl.replace(/\/$/, '');
    const visitors = getRealVisitorsCount();
    const totalPlays = getTotalGamesPlayedCount();
    const breakdown = getGameStatsBreakdown();

    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    await fetch(`${cleanBase}/stats.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalUniqueVisitors: visitors,
        totalGamesPlayed: totalPlays,
        gameBreakdown: breakdown,
        lastUpdated: new Date().toISOString(),
      }),
    }).catch(() => {});

    return true;
  } catch (e) {
    return false;
  }
}

// PULL GLOBAL STATS FROM CLOUD
export async function pullCloudStats(): Promise<void> {
  const config = getCloudDbConfig();
  if (!config.enabled || !config.databaseUrl) return;

  try {
    const cleanBase = config.databaseUrl.replace(/\/$/, '');
    const res = await fetch(`${cleanBase}/stats.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (data.totalUniqueVisitors) {
          const currentVis = getRealVisitorsCount();
          if (data.totalUniqueVisitors > currentVis) {
            localStorage.setItem(STORAGE_KEYS.REAL_VISITORS_COUNT, data.totalUniqueVisitors.toString());
          }
        }
        if (data.totalGamesPlayed) {
          const currentPlays = getTotalGamesPlayedCount();
          if (data.totalGamesPlayed > currentPlays) {
            localStorage.setItem(STORAGE_KEYS.REAL_PLAYS_COUNT, data.totalGamesPlayed.toString());
          }
        }
      }
    }
  } catch (e) {}
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
