import React from 'react';
import { GameDefinition } from '../lib/gamesCatalog';
import { GameCard } from './GameCard';
import { FeaturedBanner } from './FeaturedBanner';
import { FilterCategory } from './Sidebar';
import { getLangText, Language } from '../lib/translations';
import { Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { AppUser } from '../lib/auth';
import { sounds } from '../lib/sounds';

interface DashboardProps {
  games: GameDefinition[];
  featuredGame: GameDefinition;
  currentCategory: FilterCategory;
  favorites: string[];
  recentGames: string[];
  searchQuery: string;
  onToggleFavorite: (id: string) => void;
  onPlayGame: (id: string) => void;
  lang: Language;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  games,
  featuredGame,
  currentCategory,
  favorites,
  recentGames,
  searchQuery,
  onToggleFavorite,
  onPlayGame,
  lang,
  currentUser,
  onOpenAuthModal,
}) => {
  // Filter games based on category and search query
  const filteredGames = games.filter((g) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle =
        g.title.en.toLowerCase().includes(q) ||
        g.title.ru.toLowerCase().includes(q) ||
        g.title.uz.toLowerCase().includes(q);
      const matchDesc =
        g.description.en.toLowerCase().includes(q) ||
        g.description.ru.toLowerCase().includes(q) ||
        g.description.uz.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Category
    if (currentCategory === 'all') return true;
    if (currentCategory === 'favorites') return favorites.includes(g.id);
    if (currentCategory === 'recent') return recentGames.includes(g.id);
    return g.category === currentCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Featured Banner (only show when on 'all' and not searching) */}
      {currentCategory === 'all' && !searchQuery && (
        <>
          <FeaturedBanner
            game={featuredGame}
            onPlayGame={onPlayGame}
            lang={lang}
          />

          {/* Registration Invitation for Non-logged in visitors */}
          {!currentUser && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-cyan-950/80 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-neon-cyan">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {lang === 'ru'
                      ? 'Присоединяйтесь к GAME ZONE!'
                      : lang === 'uz'
                      ? 'GAME ZONE platformasiga xush kelibsiz!'
                      : 'Welcome to GAME ZONE!'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {lang === 'ru'
                      ? 'Зарегистрируйте аккаунт, чтобы сохранять свои рекорды, игры и статистику!'
                      : lang === 'uz'
                      ? 'O\'yinlaringiz, rekordlaringiz va natijalaringiz saqlanishi uchun ro\'yxatdan o\'ting!'
                      : 'Create an account to save your high scores, plays and stats!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenAuthModal?.();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-neon-cyan transition-all flex items-center justify-center gap-2 shrink-0 group"
              >
                <span>
                  {lang === 'ru' ? 'Регистрация / Вход' : lang === 'uz' ? 'Ro\'yxatdan o\'tish (Akkaunt ochish)' : 'Sign Up / Sign In'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-cyber-border">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5 h-5 text-cyber-neonCyan" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            {getLangText(`cat_${currentCategory}`, lang)}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyber-card border border-cyber-border text-cyan-400 font-bold">
            {filteredGames.length}
          </span>
        </div>
      </div>

      {/* Game Cards Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
              onPlayGame={onPlayGame}
              lang={lang}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        currentCategory === 'favorites' ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-cyber-card/50 border border-cyber-border">
            <span className="text-5xl mb-3">❤️</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              {lang === 'ru' ? 'В избранном пока нет игр' : lang === 'uz' ? 'Saralangan o\'yinlar hali yo\'q' : 'No favorites yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {lang === 'ru'
                ? 'Нажмите на иконку сердечка на карточке любой игры, чтобы добавить её в избранное.'
                : lang === 'uz'
                ? 'O\'zingizga yoqqan o\'yin kartochkasidagi yurakcha belgisini bossangiz, u shu yerda saqlanadi.'
                : 'Click the heart icon on any game card to add it to your favorites.'}
            </p>
          </div>
        ) : currentCategory === 'recent' ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-cyber-card/50 border border-cyber-border">
            <span className="text-5xl mb-3">🕒</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              {lang === 'ru' ? 'Вы еще не играли в игры' : lang === 'uz' ? 'Hali hech qanday o\'yin o\'ynamadingiz' : 'No recent games'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {lang === 'ru'
                ? 'Сыграйте в любую игру, и она появится здесь для быстрого доступа.'
                : lang === 'uz'
                ? 'Istalgan o\'yinni o\'ynab ko\'ring, u tez kirish uchun shu yerda paydo bo\'ladi.'
                : 'Play any game and it will appear here for quick access.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-cyber-card/50 border border-cyber-border">
            <span className="text-5xl mb-3">🔍</span>
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              {getLangText('noGamesFound', lang)}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'uz' ? 'Qidiruv so\'zini tekshiring yoki filtrlarni tozalang.' : 'Try checking your spelling or clearing active filters.'}
            </p>
          </div>
        )
      )}
    </div>
  );
};

