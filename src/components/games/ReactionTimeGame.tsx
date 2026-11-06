import React, { useState, useRef, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Zap, Timer, Award } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

type Stage = 'IDLE' | 'WAITING' | 'CLICK_NOW' | 'RESULT' | 'EARLY';

export const ReactionTimeGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [stage, setStage] = useState<Stage>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const startTest = () => {
    sounds.playTone(300, 'sine', 0.04, 0.05);
    setStage('WAITING');
    const delay = 1800 + Math.random() * 3200; // 1.8 to 5 seconds

    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      sounds.playTone(880, 'sine', 0.05, 0.1);
      setStage('CLICK_NOW');
    }, delay);
  };

  const handleClick = () => {
    if (isPaused) return;

    if (stage === 'IDLE') {
      startTest();
    } else if (stage === 'WAITING') {
      // False start!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sounds.playTone(180, 'sawtooth', 0.15, 0.1);
      setStage('EARLY');
    } else if (stage === 'CLICK_NOW') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sounds.playScore();
      setReactionTime(elapsed);
      setHistory((prev) => [elapsed, ...prev].slice(0, 5));
      setStage('RESULT');

      // Score: higher score for lower time (e.g. 500 - time)
      const calculatedScore = Math.max(10, 600 - elapsed);
      updateScore(calculatedScore);
    } else if (stage === 'RESULT' || stage === 'EARLY') {
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getRank = (ms: number) => {
    if (ms < 200) return { title: 'CYBER GODLIKE', color: 'text-cyan-400', emoji: '⚡' };
    if (ms < 250) return { title: 'ESPORTS PRO', color: 'text-purple-400', emoji: '🎮' };
    if (ms < 320) return { title: 'FAST REFLEXES', color: 'text-emerald-400', emoji: '🚀' };
    if (ms < 420) return { title: 'AVERAGE HUMAN', color: 'text-amber-400', emoji: '👤' };
    return { title: 'SLEEPY TURTLE', color: 'text-rose-400', emoji: '🐢' };
  };

  const getStageColor = () => {
    switch (stage) {
      case 'WAITING': return 'bg-rose-950/80 border-rose-500 shadow-neon-pink';
      case 'CLICK_NOW': return 'bg-emerald-950/80 border-emerald-400 shadow-neon-green';
      case 'EARLY': return 'bg-amber-950/80 border-amber-500';
      case 'RESULT': return 'bg-[#121626] border-cyan-500/50 shadow-neon-cyan';
      default: return 'bg-[#0f121d] border-cyber-border hover:border-cyan-400';
    }
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
      onRestart={() => {
        setStage('IDLE');
        setReactionTime(null);
        resetScore();
      }}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        {/* Main Touch Reflex Pad */}
        <div
          onClick={handleClick}
          className={`w-full max-w-md h-72 sm:h-80 rounded-3xl border-2 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 active:scale-[0.99] select-none ${getStageColor()}`}
        >
          {stage === 'IDLE' && (
            <div className="space-y-3">
              <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">TAP TO START</h2>
              <p className="text-xs text-slate-400 max-w-xs">
                Wait for screen to turn glowing green, then tap as fast as you can!
              </p>
            </div>
          )}

          {stage === 'WAITING' && (
            <div className="space-y-2">
              <div className="w-4 h-4 rounded-full bg-rose-500 mx-auto animate-ping" />
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                WAIT FOR GREEN...
              </h2>
              <p className="text-xs text-rose-300">Don't tap yet!</p>
            </div>
          )}

          {stage === 'CLICK_NOW' && (
            <div className="space-y-2 animate-bounce">
              <Zap className="w-16 h-16 text-emerald-400 mx-auto" />
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_#00ff66]">
                TAP NOW!
              </h2>
            </div>
          )}

          {stage === 'EARLY' && (
            <div className="space-y-3">
              <span className="text-4xl">⚠️</span>
              <h2 className="text-2xl font-black text-amber-300 uppercase">TOO EARLY!</h2>
              <p className="text-xs text-slate-400">Click to try again</p>
            </div>
          )}

          {stage === 'RESULT' && reactionTime && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Reaction Time:
              </p>
              <h1 className="text-5xl sm:text-6xl font-black font-mono text-cyan-300 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
                {reactionTime} ms
              </h1>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="text-2xl">{getRank(reactionTime).emoji}</span>
                <span
                  className={`font-black text-sm uppercase ${getRank(reactionTime).color}`}
                >
                  {getRank(reactionTime).title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2">Click anywhere to test again</p>
            </div>
          )}
        </div>

        {/* Recent Attempts History */}
        {history.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase">Recent:</span>
            {history.map((ms, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-[#0a0b12] border border-cyber-border font-mono text-xs text-cyan-400"
              >
                {ms}ms
              </span>
            ))}
          </div>
        )}
      </div>
    </GameWrapper>
  );
};
