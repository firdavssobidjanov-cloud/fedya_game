import React, { useState, useEffect } from 'react';
import { GAMES_CATALOG, GameDefinition } from './lib/gamesCatalog';
import { Header } from './components/Header';
import { Sidebar, FilterCategory } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GameRenderer } from './components/GameRenderer';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import {
  getStoredProfile,
  getFavorites,
  toggleFavorite,
  getRecentGames,
  clearFavorites,
  clearRecents,
  getStoredLanguage,
  saveStoredLanguage,
  PlayerProfile,
  onAchievementUnlocked,
  Achievement,
} from './lib/storage';
import {
  getCurrentUser,
  onAuthStateChanged,
  logoutUser,
  incrementUserGameCount,
  AppUser,
} from './lib/auth';
import {
  incrementTotalGamesPlayed,
  trackRealVisit,
  triggerGlobalCloudSync,
  pullCloudStats,
  pullCloudUsers,
} from './lib/cloudSync';
import { pullCloudReactions } from './lib/reactions';
import { Language, getLangText } from './lib/translations';
import { sounds } from './lib/sounds';
import { Trophy } from 'lucide-react';

export function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<FilterCategory>('all');
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [recentGames, setRecentGames] = useState<string[]>(() => getRecentGames());
  const [profile, setProfile] = useState<PlayerProfile>(() => getStoredProfile());
  const [lang, setLang] = useState<Language>(() => getStoredLanguage() as Language);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // Authentication & Admin state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Featured game
  const featuredGame = GAMES_CATALOG.find((g) => g.id === 'snake') || GAMES_CATALOG[0];

  // Track real visitor & listen for secret #admin entrance
  useEffect(() => {
    // 1. Record real visitor visit and sync global data
    trackRealVisit();
    pullCloudStats();
    pullCloudUsers();
    pullCloudReactions();

    // 2. Secret #admin URL hash listener
    const checkAdminHash = () => {
      if (window.location.hash.toLowerCase() === '#admin') {
        setIsAdminPanelOpen(true);
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);

    // 3. Secret keyboard shortcut: Ctrl+Shift+A opens secret admin gate
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminPanelOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 4. Subscribe to auth changes
    const unsub = onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setProfile((prev) => ({
          ...prev,
          username: user.username,
          avatarId: user.avatarId,
        }));
      }
    });

    triggerGlobalCloudSync();

    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
      window.removeEventListener('keydown', handleKeyDown);
      unsub();
    };
  }, []);

  // Language update
  const handleSetLang = (l: Language) => {
    setLang(l);
    saveStoredLanguage(l);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setFavorites([...updated]);
  };

  // Start Playing Game
  const handlePlayGame = (id: string) => {
    setActiveGameId(id);
    setRecentGames(getRecentGames());
    // Increment real global and user play analytics
    incrementTotalGamesPlayed(id);
    incrementUserGameCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Hub
  const handleBackToHub = () => {
    setActiveGameId(null);
    setRecentGames(getRecentGames());
  };

  // Random Game Picker
  const handleRandomGame = () => {
    const randomGame = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
    handlePlayGame(randomGame.id);
  };

  // Logout handler
  const handleLogout = () => {
    sounds.playClick();
    logoutUser();
    setCurrentUser(null);
    clearFavorites();
    clearRecents();
    setFavorites([]);
    setRecentGames([]);
    setProfile(getStoredProfile());
  };

  // Auth Success handler
  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setProfile((prev) => ({
      ...prev,
      username: user.username,
      avatarId: user.avatarId,
    }));
    clearFavorites();
    clearRecents();
    setFavorites([]);
    setRecentGames([]);
  };

  const handleCloseAdminModal = () => {
    setIsAdminPanelOpen(false);
    if (window.location.hash.toLowerCase() === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Achievement unlock listener
  useEffect(() => {
    const unsubscribe = onAchievementUnlocked((ach) => {
      sounds.playWin();
      setAchievementToast(ach);
      setTimeout(() => {
        setAchievementToast(null);
      }, 4000);
    });
    return () => unsubscribe();
  }, []);

  const activeGame = activeGameId
    ? GAMES_CATALOG.find((g) => g.id === activeGameId)
    : null;

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lang={lang}
        setLang={handleSetLang}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
        activeGameId={activeGameId}
        onBackToHub={handleBackToHub}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex">
        {/* Sidebar (only shown in hub dashboard view or toggleable) */}
        {!activeGameId && (
          <Sidebar
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            favoritesCount={favorites.length}
            recentCount={recentGames.length}
            totalGamesCount={GAMES_CATALOG.length}
            lang={lang}
            onRandomGame={handleRandomGame}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            currentUser={currentUser}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Content View */}
        <main className="flex-1 min-w-0 p-2 sm:p-4 md:p-6 overflow-y-auto">
          {activeGame ? (
            <GameRenderer
              game={activeGame}
              lang={lang}
              onBackToHub={handleBackToHub}
            />
          ) : (
            <Dashboard
              games={GAMES_CATALOG}
              featuredGame={featuredGame}
              currentCategory={currentCategory}
              favorites={favorites}
              recentGames={recentGames}
              searchQuery={searchQuery}
              onToggleFavorite={handleToggleFavorite}
              onPlayGame={handlePlayGame}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Player Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        lang={lang}
      />

      {/* Auth / Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Secret Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={handleCloseAdminModal}
        lang={lang}
      />

      {/* Achievement Unlocked Toast Notification */}
      {achievementToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border-2 border-cyan-400 shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-3xl">{achievementToast.icon}</span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              ACHIEVEMENT UNLOCKED!
            </div>
            <h4 className="font-bold text-sm text-white">
              {getLangText(achievementToast.titleKey, lang)}
            </h4>
            <p className="text-[11px] text-slate-300">
              {getLangText(achievementToast.descKey, lang)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
