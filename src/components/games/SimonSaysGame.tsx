import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

const PAD_CONFIG = [
  { id: 0, color: 'bg-emerald-500', glow: 'shadow-neon-green', activeBg: 'bg-emerald-300', freq: 329.63, border: 'border-emerald-400' },
  { id: 1, color: 'bg-rose-500', glow: 'shadow-neon-pink', activeBg: 'bg-rose-300', freq: 440.0, border: 'border-rose-400' },
  { id: 2, color: 'bg-amber-500', glow: 'shadow-neon-cyan', activeBg: 'bg-amber-300', freq: 554.37, border: 'border-amber-400' },
  { id: 3, color: 'bg-cyan-500', glow: 'shadow-neon-cyan', activeBg: 'bg-cyan-300', freq: 659.25, border: 'border-cyan-400' },
];

export const SimonSaysGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startNextRound = (currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSeq(true);
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seq.length; i++) {
      const padId = seq[i];
      flashPad(padId);
      await new Promise((r) => setTimeout(r, 450));
    }

    setIsPlayingSeq(false);
  };

  const flashPad = (id: number) => {
    setActivePad(id);
    sounds.playTone(PAD_CONFIG[id].freq, 'triangle', 0.25, 0.12);
    setTimeout(() => {
      setActivePad(null);
    }, 280);
  };

  const restartGame = () => {
    setSequence([]);
    setPlayerStep(0);
    setActivePad(null);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
    startNextRound([]);
  };

  useEffect(() => {
    restartGame();
  }, []);

  const handlePadClick = (id: number) => {
    if (isPlayingSeq || isGameOver || isPaused || sequence.length === 0) return;

    flashPad(id);

    if (id === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Sequence completed successfully!
        sounds.playScore();
        const nextScore = currentScore + 10;
        updateScore(nextScore);
        setTimeout(() => {
          startNextRound(sequence);
        }, 800);
      }
    } else {
      // Wrong pad clicked!
      sounds.playGameOver();
      setIsGameOver(true);
      handleGameOver(currentScore);
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
      onRestart={restartGame}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isPlayingSeq ? (
            <span className="text-cyan-400 animate-pulse">WATCH & LISTEN...</span>
          ) : (
            <span className="text-emerald-400">YOUR TURN! REPEAT THE SEQUENCE</span>
          )}
        </div>

        {/* 4 Quadrants Circular Simon Pad */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-3 bg-[#0a0b12] border-4 border-cyber-border shadow-2xl grid grid-cols-2 gap-3 overflow-hidden">
          {PAD_CONFIG.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isPlayingSeq}
                className={`w-full h-full rounded-2xl border-2 transition-all duration-100 ${pad.border} ${
                  isActive
                    ? `${pad.activeBg} ${pad.glow} scale-95`
                    : `${pad.color} opacity-70 hover:opacity-100 hover:scale-[0.98] active:scale-90`
                }`}
              />
            );
          })}

          {/* Center Hub Indicator */}
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-[#0a0b12] border-4 border-cyber-border flex flex-col items-center justify-center shadow-inner pointer-events-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase">LEVEL</span>
            <span className="text-2xl font-black font-mono text-cyan-400">
              {sequence.length}
            </span>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
};
