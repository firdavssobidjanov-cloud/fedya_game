import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Check, X, Flame } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

const COLORS = [
  { name: 'RED', color: '#ff0055', textClass: 'text-rose-500' },
  { name: 'BLUE', color: '#00f0ff', textClass: 'text-cyan-400' },
  { name: 'GREEN', color: '#00ff66', textClass: 'text-emerald-400' },
  { name: 'YELLOW', color: '#ffdd00', textClass: 'text-amber-400' },
  { name: 'PURPLE', color: '#a855f7', textClass: 'text-purple-400' },
];

export const ColorReflexGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [word, setWord] = useState(COLORS[0]);
  const [ink, setInk] = useState(COLORS[0]);
  const [streak, setStreak] = useState(0);
  const [roundTimer, setRoundTimer] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<number | null>(null);

  const nextRound = () => {
    const isMatch = Math.random() < 0.45;
    const w = COLORS[Math.floor(Math.random() * COLORS.length)];
    let i = w;
    if (!isMatch) {
      const others = COLORS.filter((c) => c.name !== w.name);
      i = others[Math.floor(Math.random() * others.length)];
    }
    setWord(w);
    setInk(i);
    setRoundTimer(100);
  };

  const restartGame = () => {
    setStreak(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
    nextRound();
  };

  useEffect(() => {
    restartGame();
  }, []);

  // Round countdown
  useEffect(() => {
    if (!isPaused && !isGameOver) {
      timerRef.current = window.setInterval(() => {
        setRoundTimer((prev) => {
          if (prev <= 2) {
            sounds.playGameOver();
            setIsGameOver(true);
            handleGameOver(currentScore);
            return 0;
          }
          const decay = 2 + Math.min(4, Math.floor(streak / 5));
          return Math.max(0, prev - decay);
        });
      }, 50);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isGameOver, streak, currentScore]);

  const handleAnswer = (answeredMatch: boolean) => {
    if (isGameOver || isPaused) return;

    const actualMatch = word.name === ink.name;
    if (answeredMatch === actualMatch) {
      sounds.playScore();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = 10 + nextStreak * 2;
      updateScore(currentScore + points);
      nextRound();
    } else {
      sounds.playTone(180, 'sawtooth', 0.1, 0.08);
      setIsGameOver(true);
      handleGameOver(currentScore);
    }
  };

  // Keyboard Left / Right
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') handleAnswer(false);
      if (e.key === 'ArrowRight' || e.code === 'KeyD') handleAnswer(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [word, ink, isGameOver, isPaused]);

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
        {/* Streak HUD */}
        <div className="flex items-center gap-2 mb-3">
          {streak > 1 && (
            <span className="px-3 py-1 rounded-full bg-pink-950/70 border border-pink-500/50 text-pink-400 font-bold text-xs uppercase flex items-center gap-1 animate-pulse">
              <Flame className="w-4 h-4 fill-current" />
              {streak} Streak Combo
            </span>
          )}
        </div>

        {/* Timer Bar */}
        <div className="w-full max-w-sm h-3 rounded-full bg-[#0a0b12] border border-cyber-border overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-75 ${
              roundTimer < 30 ? 'bg-rose-500' : 'bg-cyan-400 shadow-neon-cyan'
            }`}
            style={{ width: `${roundTimer}%` }}
          />
        </div>

        {/* Stroop Card */}
        <div className="w-full max-w-sm py-12 px-6 rounded-3xl bg-[#0a0b12] border-2 border-cyber-border shadow-2xl flex flex-col items-center justify-center mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Does meaning match color?
          </p>
          <h1
            style={{ color: ink.color }}
            className="text-5xl sm:text-6xl font-black font-mono tracking-wider drop-shadow-[0_0_15px_currentColor]"
          >
            {word.name}
          </h1>
        </div>

        {/* Answer Buttons */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(false)}
            className="py-4 px-6 rounded-2xl bg-rose-950/40 border border-rose-500/50 hover:bg-rose-900/50 text-rose-400 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-pink active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
            <span>NO MATCH</span>
          </button>

          <button
            onClick={() => handleAnswer(true)}
            className="py-4 px-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-400 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-green active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>MATCH</span>
          </button>
        </div>
      </div>
    </GameWrapper>
  );
};
