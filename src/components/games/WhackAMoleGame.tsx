import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Clock, Zap } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface MoleState {
  id: number;
  active: boolean;
  type: 'normal' | 'gold' | 'bomb';
}

export const WhackAMoleGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [holes, setHoles] = useState<MoleState[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({ id: i, active: false, type: 'normal' }))
  );
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hitHole, setHitHole] = useState<number | null>(null);

  const restartGame = () => {
    setHoles(Array.from({ length: 9 }, (_, i) => ({ id: i, active: false, type: 'normal' })));
    setTimeLeft(30);
    setHitHole(null);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  // Timer countdown
  useEffect(() => {
    let interval: number;
    if (!isPaused && !isGameOver && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sounds.playGameOver();
            setIsGameOver(true);
            handleGameOver(currentScore);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, timeLeft, currentScore]);

  // Mole popup loop
  useEffect(() => {
    let timeout: number;

    const popup = () => {
      if (isGameOver || isPaused) return;

      const randomHole = Math.floor(Math.random() * 9);
      const isBomb = Math.random() < 0.2;
      const isGold = !isBomb && Math.random() < 0.25;

      setHoles((prev) =>
        prev.map((h) =>
          h.id === randomHole
            ? { active: true, type: isBomb ? 'bomb' : isGold ? 'gold' : 'normal', id: h.id }
            : h
        )
      );

      const stayDuration = Math.max(550, 950 - (30 - timeLeft) * 15);

      timeout = window.setTimeout(() => {
        setHoles((prev) =>
          prev.map((h) => (h.id === randomHole ? { ...h, active: false } : h))
        );
        if (!isGameOver && !isPaused) {
          popup();
        }
      }, stayDuration);
    };

    popup();
    return () => clearTimeout(timeout);
  }, [isGameOver, isPaused, timeLeft]);

  const whack = (hole: MoleState) => {
    if (!hole.active || isGameOver || isPaused) return;

    setHitHole(hole.id);
    setTimeout(() => setHitHole(null), 250);

    if (hole.type === 'bomb') {
      sounds.playExplosion();
      const penalty = Math.max(0, currentScore - 30);
      updateScore(penalty);
    } else if (hole.type === 'gold') {
      sounds.playWin();
      updateScore(currentScore + 30);
    } else {
      sounds.playHit();
      updateScore(currentScore + 10);
    }

    setHoles((prev) =>
      prev.map((h) => (h.id === hole.id ? { ...h, active: false } : h))
    );
  };

  return (
    <GameWrapper
      game={game}
      lang={lang}
      onBackToHub={onBackToHub}
      currentScore={currentScore}
      highScore={highScore}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onTogglePause={() => setIsPaused((prev) => !prev)}
      onRestart={restartGame}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        {/* Timer HUD */}
        <div className="w-full max-w-sm flex items-center justify-between mb-4 px-4 py-2 rounded-xl bg-[#0a0b12] border border-cyber-border">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-sm">
            <Clock className="w-4 h-4" />
            <span>TIME: {timeLeft}s</span>
          </div>
          <div className="text-xs text-slate-400">
            Gold = 30pts • Bomb = -30pts
          </div>
        </div>

        {/* 3x3 Holes Grid */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square p-4 rounded-3xl bg-[#0a0b12] border border-cyber-border shadow-2xl grid grid-cols-3 gap-3">
          {holes.map((hole) => (
            <div
              key={hole.id}
              onClick={() => whack(hole)}
              className="relative w-full h-full rounded-2xl bg-[#111424] border border-cyber-border overflow-hidden flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              {/* Hole ground mound */}
              <div className="absolute bottom-0 inset-x-2 h-5 bg-[#1a2136] rounded-t-full border-t border-slate-700"></div>

              {/* Mole Sprite */}
              {hole.active && (
                <div
                  className={`relative z-10 text-4xl sm:text-5xl transform transition-transform animate-bounce ${
                    hole.type === 'gold' ? 'drop-shadow-[0_0_12px_#ffdd00]' : ''
                  }`}
                >
                  {hole.type === 'bomb' ? '💣' : hole.type === 'gold' ? '👑' : '👾'}
                </div>
              )}

              {/* Hammer smash effect */}
              {hitHole === hole.id && (
                <div className="absolute inset-0 bg-cyan-400/30 flex items-center justify-center text-3xl z-20 animate-ping">
                  💥
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
