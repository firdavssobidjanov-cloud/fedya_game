import React from 'react';
import {
  Gamepad2,
  Heart,
  Clock,
  Sparkles,
  Puzzle,
  CreditCard,
  Zap,
  Dices,
  Flame,
  LogIn,
} from 'lucide-react';
import { GameCategory } from '../lib/gamesCatalog';
import { getLangText, Language } from '../lib/translations';
import { sounds } from '../lib/sounds';
import { AppUser } from '../lib/auth';

export type FilterCategory = 'all' | 'favorites' | 'recent' | GameCategory;

interface SidebarProps {
  currentCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  favoritesCount: number;
  recentCount: number;
  totalGamesCount: number;
  lang: Language;
  onRandomGame: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: AppUser | null;
  onOpenAdminPanel: () => void;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  favoritesCount,
  recentCount,
  totalGamesCount,
  lang,
  onRandomGame,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onOpenAuthModal,
}) => {
  const categories = [
    { id: 'all' as FilterCategory, labelKey: 'cat_all', icon: Gamepad2, count: totalGamesCount, color: 'text-cyan-400' },
    { id: 'favorites' as FilterCategory, labelKey: 'cat_favorites', icon: Heart, count: favoritesCount, color: 'text-pink-400' },
    { id: 'recent' as FilterCategory, labelKey: 'cat_recent', icon: Clock, count: recentCount, color: 'text-amber-400' },
    { id: 'arcade' as FilterCategory, labelKey: 'cat_arcade', icon: Sparkles, color: 'text-purple-400' },
    { id: 'puzzle' as FilterCategory, labelKey: 'cat_puzzle', icon: Puzzle, color: 'text-emerald-400' },
    { id: 'card' as FilterCategory, labelKey: 'cat_card', icon: CreditCard, color: 'text-blue-400' },
    { id: 'speed' as FilterCategory, labelKey: 'cat_speed', icon: Zap, color: 'text-rose-400' },
  ];

  const handleSelect = (id: FilterCategory) => {
    sounds.playClick();
    onSelectCategory(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-cyber-bg/95 md:bg-cyber-bg/60 backdrop-blur-md border-r border-cyber-border p-4 flex flex-col justify-between z-30 transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-5">
          {/* Categories Section */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Kategoriyalar
            </p>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = currentCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border border-cyan-500/40 text-white shadow-neon-cyan'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-card/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : cat.color}`} />
                      <span>{getLangText(cat.labelKey, lang)}</span>
                    </div>
                    {cat.count !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-cyan-500/30 text-cyan-200'
                            : 'bg-cyber-card border border-cyber-border text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Surprise Me / Quick Play button */}
          <div className="pt-1">
            <button
              onClick={() => {
                sounds.playScore();
                onRandomGame();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold text-sm shadow-neon-purple hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Dices className="w-5 h-5 animate-bounce" />
              <span>{getLangText('surpriseMe', lang)}</span>
            </button>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="space-y-2 pt-4">
          {!currentUser && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAuthModal();
                onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kirish / Ro'yxatdan o'tish</span>
            </button>
          )}

          <div className="p-3 bg-cyber-card/80 border border-cyber-border rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">GAME ZONE v1.1</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              100% Client-Side PWA. Ro'yxatdan o'tish va Oflayn tizim.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
