// Authentication & User Management for GAME ZONE
// Supports Admin (firdavssobidjanov@gmail.com) and regular players

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
  USERS_LIST: 'game_zone_registered_users',
};

// Seed initial admin user in the users registry
function getInitialUsers(): AppUser[] {
  return [
    {
      id: 'admin-firdavs-root',
      username: 'Firdavs (Admin)',
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      avatarId: 11, // Gold Champion avatar
      createdAt: Date.now() - 86400000 * 7,
      lastLoginAt: Date.now(),
      totalGamesPlayed: 42,
    },
    {
      id: 'user-demo-1',
      username: 'CyberGamer99',
      email: 'gamer99@gamezone.uz',
      role: 'player',
      avatarId: 0,
      createdAt: Date.now() - 86400000 * 3,
      lastLoginAt: Date.now() - 3600000 * 2,
      totalGamesPlayed: 28,
    },
    {
      id: 'user-demo-2',
      username: 'NeonShadow',
      email: 'neon.shadow@gmail.com',
      role: 'player',
      avatarId: 3,
      createdAt: Date.now() - 86400000 * 2,
      lastLoginAt: Date.now() - 3600000 * 8,
      totalGamesPlayed: 15,
    },
    {
      id: 'user-demo-3',
      username: 'PixelMaster',
      email: 'pixel.master@yahoo.com',
      role: 'player',
      avatarId: 2,
      createdAt: Date.now() - 86400000 * 1,
      lastLoginAt: Date.now() - 3600000 * 1,
      totalGamesPlayed: 33,
    },
  ];
}

export function getAllUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const initial = getInitialUsers();
  saveAllUsers(initial);
  return initial;
}

export function saveAllUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  } catch (e) {}
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
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
  } catch (e) {}
}

export function isCurrentUserAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() || user.role === 'admin';
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
    } catch (e) {}
  });
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
    if (cleanPass === ADMIN_CREDENTIALS.password) {
      const allUsers = getAllUsers();
      let admin = allUsers.find((u) => u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase());
      if (!admin) {
        admin = {
          id: 'admin-firdavs-root',
          username: ADMIN_CREDENTIALS.username,
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
    } else {
      return { success: false, error: 'Admin paroli noto\'g\'ri kiritildi!' };
    }
  }

  // Check Regular Users
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'Bu email bilan ro\'yxatdan o\'tgan foydalanuvchi topilmadi.' };
  }

  if (user.isBlocked) {
    return { success: false, error: 'Ushbu hisob admin tomonidan bloklangan!' };
  }

  // Check password from storage passwords mapping
  const passwordsMap = getStoredPasswords();
  const storedPass = passwordsMap[cleanEmail];

  if (storedPass && storedPass !== cleanPass) {
    return { success: false, error: 'Kiritilgan parol noto\'g\'ri!' };
  }

  // Update last login
  user.lastLoginAt = Date.now();
  saveAllUsers(users);
  setCurrentUser(user);

  return { success: true, user };
}

// Register
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
    if (cleanPass === ADMIN_CREDENTIALS.password) {
      return loginUser(cleanEmail, cleanPass);
    } else {
      return { success: false, error: 'Admin paroli noto\'g\'ri kiritildi!' };
    }
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

  // Save password
  const passwordsMap = getStoredPasswords();
  passwordsMap[cleanEmail] = cleanPass;
  saveStoredPasswords(passwordsMap);

  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

// Logout
export function logoutUser(): void {
  setCurrentUser(null);
}

// Passwords storage helper (local safe hash/storage)
function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem('game_zone_user_creds');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    'gamer99@gamezone.uz': 'gamer123',
    'neon.shadow@gmail.com': 'neon2026',
    'pixel.master@yahoo.com': 'pixel888',
  };
}

function saveStoredPasswords(map: Record<string, string>): void {
  try {
    localStorage.setItem('game_zone_user_creds', JSON.stringify(map));
  } catch (e) {}
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
  if (!target || target.role === 'admin') return false; // Cannot delete admin

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
