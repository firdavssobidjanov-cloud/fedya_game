import React from 'react';
import { Play, Sparkles, Trophy, Zap } from 'lucide-react';
import { GameDefinition } from '../lib/gamesCatalog';
import { getLangText, Language } from '../lib/translations';
import { getHighScore } from '../lib/storage';
import { sounds } from '../lib/sounds';

interface FeaturedBannerProps {
  game: GameDefinition;
  onPlayGame: (id: string) => void;
  lang: Language;
}

export const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ game, onPlayGame, lang }) => {
  const highScore = getHighScore(game.id);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyber-card via-[#131626] to-[#0d1020] border border-cyber-border shadow-2xl p-6 md:p-8 mb-8 group">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-pink-600/15 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black tracking-wider uppercase bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              FEATURED GAME
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-cyber-card border border-cyber-border text-cyan-400 rounded-lg uppercase">
              {game.category}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            {game.title[lang]}
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {game.description[lang]}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => {
                sounds.playScore();
                onPlayGame(game.id);
              }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-black text-sm tracking-wide shadow-neon-purple hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{getLangText('playNow', lang)}</span>
            </button>

            {highScore > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  {getLangText('bestScore', lang)}: {highScore.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Graphic Preview */}
        <div className="hidden sm:flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-tr from-purple-900/40 to-cyan-900/40 border border-purple-500/30 shadow-inner group-hover:border-cyan-400 group-hover:scale-105 transition-all">
          <div className="text-6xl md:text-7xl animate-pulse">🎮</div>
        </div>
      </div>
    </div>
  );
};

