// Authentication & User Management for GAME ZONE
// 100% Real users only. No dummy/fake/seeded accounts.
// Admin: firdavssobidjanov@gmail.com

import { syncNewUserToCloud } from './cloudSync';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'player';
  avatarId: number;
  createdAt: number;
  lastLoginAt: number;
  totalGamesPlayed: number;
  highScores?: Record<string, number>;
  isBlocked?: boolean;
}

export const ADMIN_CREDENTIALS = {
  email: 'firdavssobidjanov@gmail.com',
  password: 'firdavs4114',
  username: 'Firdavs (Admin)',
};

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'game_zone_current_user',
  USERS_LIST: 'game_zone_real_registered_users_v2',
  USER_PASSWORDS: 'game_zone_real_passwords_v2',
  VISITOR_ID: 'game_zone_device_visitor_id',
};

// Clean legacy dummy data if found
export function clearLegacyDummyData(): void {
  try {
    localStorage.removeItem('game_zone_registered_users');
    localStorage.removeItem('game_zone_user_creds');
  } catch (e) { }
}

// Get all REAL registered users (starts empty, only real users)
export function getAllUsers(): AppUser[] {
  clearLegacyDummyData();
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { }
  return [];
}

export function saveAllUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  } catch (e) { }
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return null;
}

export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }
    notifyAuthSubscribers(user);
  } catch (e) { }
}

export function isCurrentUserAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && user.role === 'admin';
}

// Subscriptions
type AuthListener = (user: AppUser | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function onAuthStateChanged(listener: AuthListener): () => void {
  authListeners.add(listener);
  listener(getCurrentUser());
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthSubscribers(user: AppUser | null) {
  authListeners.forEach((l) => {
    try {
      l(user);
    } catch (e) { }
  });
}

// Passwords storage helper (strictly real passwords entered by real users)
function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER_PASSWORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return {};
}

function saveStoredPasswords(map: Record<string, string>): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_PASSWORDS, JSON.stringify(map));
  } catch (e) { }
}

// Admin secret login
export function verifyAndLoginAdmin(email: string, pass: string): { success: boolean; error?: string; user?: AppUser } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (cleanEmail !== ADMIN_CREDENTIALS.email.toLowerCase()) {
    return { success: false, error: 'Bunday administrator hisobi mavjud emas.' };
  }

  if (cleanPass !== ADMIN_CREDENTIALS.password) {
    return { success: false, error: 'Admin paroli noto\'g\'ri!' };
  }

  const allUsers = getAllUsers();
  let admin = allUsers.find((u) => u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase());

  if (!admin) {
    admin = {
      id: 'admin-firdavs-root',
      username: 'Firdavs (Admin)',
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      avatarId: 11,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      totalGamesPlayed: 0,
    };
    allUsers.unshift(admin);
    saveAllUsers(allUsers);
  } else {
    admin.lastLoginAt = Date.now();
    admin.role = 'admin';
    saveAllUsers(allUsers);
  }

  setCurrentUser(admin);
  return { success: true, user: admin };
}

// Login
export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: AppUser } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Iltimos, email va parolni to\'liq kiriting.' };
  }

  // Check Admin Login
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return verifyAndLoginAdmin(cleanEmail, cleanPass);
  }

  // Check Regular Users
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'Ushbu email bilan ro\'yxatdan o\'tgan foydalanuvchi topilmadi.' };
  }

  if (user.isBlocked) {
    return { success: false, error: 'Ushbu hisob admin tomonidan bloklangan!' };
  }

  const passwordsMap = getStoredPasswords();
  const storedPass = passwordsMap[cleanEmail];

  if (storedPass && storedPass !== cleanPass) {
    return { success: false, error: 'Kiritilgan parol noto\'g\'ri!' };
  }

  user.lastLoginAt = Date.now();
  saveAllUsers(users);
  setCurrentUser(user);

  return { success: true, user };
}

// Register (Real users only)
export function registerUser(
  username: string,
  email: string,
  password: string,
  avatarId: number = 0
): { success: boolean; error?: string; user?: AppUser } {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, error: 'Nikneym kamida 2 ta belgidan iborat bo\'lishi kerak.' };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'To\'g\'ri email manzilini kiriting.' };
  }

  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak.' };
  }

  // If registering with admin email
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return verifyAndLoginAdmin(cleanEmail, cleanPass);
  }

  const users = getAllUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan. Iltimos, tizimga kiring.' };
  }

  const newUser: AppUser = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    username: cleanUsername,
    email: cleanEmail,
    role: 'player',
    avatarId,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    totalGamesPlayed: 0,
    highScores: {},
  };

  users.push(newUser);
  saveAllUsers(users);

  // Save real password
  const passwordsMap = getStoredPasswords();
  passwordsMap[cleanEmail] = cleanPass;
  saveStoredPasswords(passwordsMap);

  setCurrentUser(newUser);
  syncNewUserToCloud(newUser);

  return { success: true, user: newUser };
}

// Logout
export function logoutUser(): void {
  setCurrentUser(null);
}

// Update user game count
export function incrementUserGameCount(): void {
  const current = getCurrentUser();
  if (!current) return;
  current.totalGamesPlayed = (current.totalGamesPlayed || 0) + 1;
  setCurrentUser(current);

  const allUsers = getAllUsers();
  const idx = allUsers.findIndex((u) => u.id === current.id);
  if (idx !== -1) {
    allUsers[idx].totalGamesPlayed = current.totalGamesPlayed;
    saveAllUsers(allUsers);
  }
}

// Admin management: Delete user
export function adminDeleteUser(userId: string): boolean {
  if (!isCurrentUserAdmin()) return false;
  let allUsers = getAllUsers();
  const target = allUsers.find((u) => u.id === userId);
  if (!target || target.role === 'admin') return false;

  allUsers = allUsers.filter((u) => u.id !== userId);
  saveAllUsers(allUsers);
  return true;
}

// Admin management: Toggle user block
export function adminToggleBlockUser(userId: string): boolean {
  if (!isCurrentUserAdmin()) return false;
  const allUsers = getAllUsers();
  const target = allUsers.find((u) => u.id === userId);
  if (!target || target.role === 'admin') return false;

  target.isBlocked = !target.isBlocked;
  saveAllUsers(allUsers);
  return true;
}
