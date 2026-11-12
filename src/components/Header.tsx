import React, { useState } from 'react';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Music,
  Maximize,
  Minimize,
  Search,
  Menu,
  Crown,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { sounds } from '../lib/sounds';
import { getLangText, Language } from '../lib/translations';
import { AVATARS, PlayerProfile } from '../lib/storage';
import { AppUser } from '../lib/auth';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  profile: PlayerProfile;
  onOpenProfile: () => void;
  onToggleSidebar?: () => void;
  activeGameId: string | null;
  onBackToHub: () => void;
  currentUser: AppUser | null;
  onOpenAuthModal: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  lang,
  setLang,
  profile,
  onOpenProfile,
  onToggleSidebar,
  activeGameId,
  onBackToHub,
  currentUser,
  onOpenAuthModal,
  onOpenAdminPanel,
  onLogout,
}) => {
  const [soundOn, setSoundOn] = useState(sounds.soundEnabled);
  const [musicOn, setMusicOn] = useState(sounds.musicEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sounds.setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    sounds.setMusicEnabled(next);
    sounds.playClick();
  };

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const avatarId = currentUser ? currentUser.avatarId : profile.avatarId;
  const avatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const displayName = currentUser ? currentUser.username : profile.username;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0b12]/90 backdrop-blur-md border-b border-cyber-border px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg">
      {/* Left: Brand & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg bg-cyber-card border border-cyber-border text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={onBackToHub}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-[2px] shadow-neon-purple group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0b12] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyber-neonCyan group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-wider text-gradient">GAME ZONE</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 rounded-md">
                OFFLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
              {getLangText('tagline', lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Search Bar (when in dashboard) */}
      {!activeGameId && (
        <div className="hidden sm:flex flex-1 max-w-md mx-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getLangText('searchPlaceholder', lang)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-card/90 border border-cyber-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Right Controls: Audio, Fullscreen, Language, Admin Button & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Admin Panel Direct Button (if logged in as admin) */}
        {isAdmin && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAdminPanel();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse hover:scale-105 transition-all"
          >
            <Crown className="w-4 h-4" />
            <span className="hidden xs:inline">ADMIN PANEL</span>
          </button>
        )}

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          title={soundOn ? getLangText('soundOn', lang) : getLangText('soundOff', lang)}
          className={`p-2 rounded-xl border transition-all ${
            soundOn
              ? 'bg-purple-950/50 border-purple-500/50 text-purple-300 hover:bg-purple-900/50 shadow-sm'
              : 'bg-cyber-card border-cyber-border text-slate-500 hover:text-slate-300'
          }`}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Music Toggle */}
        <button
          onClick={toggleMusic}
          title={musicOn ? getLangText('musicOn', lang) : getLangText('musicOff', lang)}
          className={`p-2 rounded-xl border transition-all ${
            musicOn
              ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 shadow-sm animate-pulse'
              : 'bg-cyber-card border-cyber-border text-slate-500 hover:text-slate-300'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={getLangText('fullscreen', lang)}
          className="hidden sm:flex p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-400 hover:text-white hover:border-slate-500 transition-all"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Language Switcher */}
        <div className="flex items-center bg-cyber-card border border-cyber-border rounded-xl p-1 text-xs">
          {(['en', 'ru', 'uz'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                sounds.playClick();
              }}
              className={`px-2 py-1 rounded-lg uppercase font-bold text-[11px] transition-all ${
                lang === l
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Auth / Profile Area */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setShowUserDropdown(!showUserDropdown);
              }}
              className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all ${
                isAdmin
                  ? 'bg-amber-950/60 border-amber-500/50 hover:border-amber-400'
                  : 'bg-gradient-to-r from-purple-950/70 to-blue-950/70 border-purple-500/40 hover:border-cyan-400'
              }`}
            >
              <span className="text-base">{avatar.emoji}</span>
              <span className="font-semibold text-xs text-slate-200 max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">
                {displayName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#0d0e19] border border-cyber-border rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-bold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 border border-amber-500/40 text-amber-300">
                        ADMIN
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAdminPanel();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-950/40 font-bold transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profil & Rekordlar</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Chiqish (Logout)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Guest Mode: Login / Register Button */
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAuthModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-neon-purple transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kirish</span>
          </button>
        )}
      </div>
    </header>
  );
};
