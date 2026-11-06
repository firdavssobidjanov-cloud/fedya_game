import React from 'react';
import { Play, Heart, Trophy, Zap, Sparkles } from 'lucide-react';
import { GameDefinition } from '../lib/gamesCatalog';
import { getLangText, Language } from '../lib/translations';
import { getHighScore } from '../lib/storage';
import { sounds } from '../lib/sounds';

interface GameCardProps {
  game: GameDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlayGame: (id: string) => void;
  lang: Language;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlayGame,
  lang,
}) => {
  const highScore = getHighScore(game.id);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'arcade':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/40';
      case 'puzzle':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
      case 'card':
        return 'text-blue-400 border-blue-500/30 bg-blue-950/40';
      case 'speed':
        return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
      default:
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
    }
  };

  return (
    <div
      onClick={() => {
        sounds.playScore();
        onPlayGame(game.id);
      }}
      className="group relative rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyan-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-cyan flex flex-col justify-between overflow-hidden cursor-pointer p-4"
    >
      {/* Top Banner & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getCategoryColor(
                game.category
              )}`}
            >
              {game.category}
            </span>
            {game.badge && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                {game.badge}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onToggleFavorite(game.id);
            }}
            aria-label="Toggle Favorite"
            className={`p-1.5 rounded-lg border transition-all ${
              isFavorite
                ? 'bg-pink-950/60 border-pink-500/60 text-pink-500'
                : 'bg-[#0a0b12] border-cyber-border text-slate-500 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Thumbnail Gradient Accent */}
        <div
          className={`w-full h-24 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center p-3 relative overflow-hidden shadow-inner mb-3 group-hover:scale-[1.02] transition-transform`}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          <span className="relative z-10 text-3xl filter drop-shadow-md">
            {game.category === 'arcade' && '👾'}
            {game.category === 'puzzle' && '🧩'}
            {game.category === 'card' && '🃏'}
            {game.category === 'speed' && '⚡'}
          </span>

          {/* Play Icon on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {game.title[lang]}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {game.description[lang]}
        </p>
      </div>

      {/* Bottom Bar: High Score & Play CTA */}
      <div className="pt-2 border-t border-cyber-border/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-medium text-slate-300">
            {highScore > 0 ? highScore.toLocaleString() : '—'}
          </span>
        </div>

        <span className="text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          {getLangText('playNow', lang)} →
        </span>
      </div>
    </div>
  );
};

