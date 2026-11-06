import React, { useState } from 'react';
import { Gamepad2, Volume2, VolumeX, Music, Maximize, Minimize, User, Search, Wifi, Globe, Menu } from 'lucide-react';
import { sounds } from '../lib/sounds';
import { getLangText, Language } from '../lib/translations';
import { AVATARS, PlayerProfile } from '../lib/storage';

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
}) => {
  const [soundOn, setSoundOn] = useState(sounds.soundEnabled);
  const [musicOn, setMusicOn] = useState(sounds.musicEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const avatar = AVATARS.find((a) => a.id === profile.avatarId) || AVATARS[0];

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

      {/* Right Controls: Audio, Fullscreen, Language, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Offline Badge */}
        <div
          title={getLangText('offlineReady', lang)}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Offline Ready</span>
        </div>

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

        {/* Player Profile Chip */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/70 to-blue-950/70 border border-purple-500/40 hover:border-cyan-400 transition-all group"
        >
          <span className="text-lg">{avatar.emoji}</span>
          <span className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
            {profile.username}
          </span>
        </button>
      </div>
    </header>
  );
};

