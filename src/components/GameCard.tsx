import React, { useState } from 'react';
import { Play, Heart, Trophy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameDefinition } from '../lib/gamesCatalog';
import { getLangText, Language } from '../lib/translations';
import { getHighScore } from '../lib/storage';
import { sounds } from '../lib/sounds';
import { getGameReactionStats, setGameReaction, ReactionStats } from '../lib/reactions';

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
  const [reaction, setReaction] = useState<ReactionStats>(() => getGameReactionStats(game.id));

  const gameTitle = typeof game.title === 'string'
    ? game.title
    : game.title[lang] || game.title.uz || game.title.en;

  const handleLike = () => {
    const updated = setGameReaction(game.id, gameTitle, 'like');
    setReaction(updated);
  };

  const handleDislike = () => {
    const updated = setGameReaction(game.id, gameTitle, 'dislike');
    setReaction(updated);
  };

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

      <div>
        {/* Like & Dislike Reactions Bar */}
        <div className="flex items-center justify-between mb-2.5 pt-2 border-t border-cyber-border/50 text-xs">
          <div className="flex items-center gap-1.5">
            {/* Like */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                handleLike();
              }}
              title="Layk bosish"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                reaction.userReaction === 'like'
                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40'
              }`}
            >
              <ThumbsUp className={`w-3 h-3 ${reaction.userReaction === 'like' ? 'fill-current' : ''}`} />
              <span className="font-mono text-[10px]">{reaction.likes}</span>
            </button>

            {/* Dislike */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                handleDislike();
              }}
              title="Dislayk bosish"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                reaction.userReaction === 'dislike'
                  ? 'bg-rose-950/80 border-rose-500/70 text-rose-300 shadow-sm'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
              }`}
            >
              <ThumbsDown className={`w-3 h-3 ${reaction.userReaction === 'dislike' ? 'fill-current' : ''}`} />
              <span className="font-mono text-[10px]">{reaction.dislikes}</span>
            </button>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-medium text-slate-300 text-[11px]">
              {highScore > 0 ? highScore.toLocaleString() : '—'}
            </span>
          </div>
        </div>

        {/* Bottom Play CTA */}
        <div className="flex items-center justify-end text-xs">
          <span className="text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            {getLangText('playNow', lang)} →
          </span>
        </div>
      </div>
    </div>
  );
};
