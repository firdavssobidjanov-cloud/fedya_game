import React, { useState } from 'react';
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  HelpCircle,
  Trophy,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Award,
} from 'lucide-react';
import { GameDefinition } from '../lib/gamesCatalog';
import { getLangText, Language } from '../lib/translations';
import { sounds } from '../lib/sounds';

interface GameWrapperProps {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
  currentScore: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  difficulty?: string;
  onSelectDifficulty?: (diff: string) => void;
  children: React.ReactNode;
  customOverlay?: React.ReactNode;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({
  game,
  lang,
  onBackToHub,
  currentScore,
  highScore,
  isGameOver,
  isPaused,
  onTogglePause,
  onRestart,
  difficulty,
  onSelectDifficulty,
  children,
  customOverlay,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [soundOn, setSoundOn] = useState(sounds.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sounds.setSoundEnabled(next);
    if (next) sounds.playClick();
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

  const isNewRecord = currentScore > 0 && currentScore >= highScore;

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center select-none pb-8 animate-fade-in">
      {/* Top Game Navigation Bar */}
      <div className="w-full bg-[#0a0b12] border border-cyber-border rounded-2xl p-3 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToHub();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white hover:border-slate-400 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{getLangText('backToHub', lang)}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white">{game.title[lang]}</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-purple-950/80 border border-purple-500/40 text-purple-300">
                {game.category}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Difficulty (if supported) */}
        {game.hasDifficulty && game.difficulties && onSelectDifficulty && (
          <div className="flex items-center bg-cyber-card border border-cyber-border rounded-xl p-1 text-xs">
            {game.difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  sounds.playClick();
                  onSelectDifficulty(diff);
                }}
                className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  difficulty === diff
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}

        {/* Right: Scores & Actions */}
        <div className="flex items-center gap-2">
          {/* Score Display */}
          <div className="flex items-center gap-3 px-3 py-1 bg-cyber-card border border-cyber-border rounded-xl font-mono">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                {getLangText('score', lang)}
              </p>
              <p className="text-sm font-black text-cyan-400 leading-tight">
                {currentScore.toLocaleString()}
              </p>
            </div>
            <div className="w-[1px] h-6 bg-cyber-border"></div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                {getLangText('bestScore', lang)}
              </p>
              <p className="text-sm font-black text-amber-400 leading-tight">
                {highScore.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sound FX */}
          <button
            onClick={toggleSound}
            title="Sound FX"
            className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* How to Play Help */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowHelp(true);
            }}
            title={getLangText('howToPlay', lang)}
            className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-cyan-400"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onTogglePause();
            }}
            title={isPaused ? getLangText('resume', lang) : getLangText('pause', lang)}
            className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            title={getLangText('restart', lang)}
            className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-rose-400 hover:rotate-180 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage / Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-cyber-card border border-cyber-border shadow-2xl flex flex-col items-center justify-center min-h-[460px] sm:min-h-[540px]">
        {children}

        {/* Pause Modal Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mb-4 text-amber-400 shadow-neon-purple">
              <Pause className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
              {getLangText('pause', lang)}
            </h2>
            <p className="text-xs text-slate-400 mb-6">Game is currently paused</p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => {
                  sounds.playClick();
                  onTogglePause();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-neon-cyan flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{getLangText('resume', lang)}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onRestart();
                }}
                className="w-full py-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-slate-400 text-slate-200 font-bold text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{getLangText('restart', lang)}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onBackToHub();
                }}
                className="w-full py-3 rounded-xl bg-[#0a0b12] border border-cyber-border text-slate-400 hover:text-white font-bold text-sm"
              >
                {getLangText('backToHub', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 animate-fade-in">
            {isNewRecord && (
              <div className="mb-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-neon-pink animate-bounce flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                <span>{getLangText('newRecord', lang)}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase mb-1">
              {getLangText('gameOver', lang)}
            </h2>

            <div className="my-6 p-4 rounded-xl bg-[#0a0b12] border border-cyber-border w-full max-w-xs text-center space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                {getLangText('score', lang)}
              </p>
              <p className="text-4xl font-black font-mono text-cyan-400">
                {currentScore.toLocaleString()}
              </p>
              <div className="pt-2 border-t border-cyber-border flex items-center justify-between text-xs text-slate-400">
                <span>{getLangText('bestScore', lang)}</span>
                <span className="font-mono font-bold text-amber-400">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => {
                  sounds.playScore();
                  onRestart();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-black text-sm tracking-wide shadow-neon-purple flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{getLangText('restart', lang)}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onBackToHub();
                }}
                className="w-full py-3 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white font-bold text-sm"
              >
                {getLangText('backToHub', lang)}
              </button>
            </div>
          </div>
        )}

        {customOverlay}
      </div>

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                sounds.playClick();
                setShowHelp(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#0a0b12] border border-cyber-border text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-black text-white">{getLangText('howToPlay', lang)}</h3>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-1">
                  Objective & Rules:
                </p>
                <p className="leading-relaxed bg-[#0a0b12] p-3 rounded-xl border border-cyber-border text-xs">
                  {game.instructions[lang]}
                </p>
              </div>

              <div>
                <p className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-1">
                  Controls:
                </p>
                <p className="leading-relaxed bg-[#0a0b12] p-3 rounded-xl border border-cyber-border text-xs text-cyan-300 font-mono">
                  {game.controls[lang]}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setShowHelp(false);
              }}
              className="w-full mt-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

