import React, { useState, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Flame, Clock } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface Question {
  text: string;
  answer: number;
  options: number[];
}

export const SpeedMathGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Easy (+ -)');
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [streak, setStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateQuestion = (): Question => {
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    let op = '+';
    let ans = a + b;

    if (difficulty === 'Easy (+ -)') {
      if (Math.random() > 0.5) {
        op = '-';
        if (a < b) [a, b] = [b, a];
        ans = a - b;
      }
    } else if (difficulty === 'Medium (x /)') {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      if (Math.random() > 0.5) {
        op = '×';
        ans = a * b;
      } else {
        op = '÷';
        ans = a;
        a = a * b; // ensure clean integer division
      }
    } else {
      // Hard
      const r = Math.random();
      if (r < 0.25) {
        ans = a + b;
      } else if (r < 0.5) {
        op = '-';
        if (a < b) [a, b] = [b, a];
        ans = a - b;
      } else if (r < 0.75) {
        a = Math.floor(Math.random() * 15) + 3;
        b = Math.floor(Math.random() * 10) + 3;
        op = '×';
        ans = a * b;
      } else {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 10) + 2;
        op = '÷';
        ans = a;
        a = a * b;
      }
    }

    // Generate 3 unique wrong options
    const optionsSet = new Set<number>([ans]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = Math.max(0, ans + offset);
      optionsSet.add(wrong);
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return {
      text: `${a} ${op} ${b} = ?`,
      answer: ans,
      options,
    };
  };

  const restartGame = () => {
    setTimeLeft(60);
    setStreak(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
    setQuestion(generateQuestion());
  };

  useEffect(() => {
    restartGame();
  }, [difficulty]);

  // 60-Second Countdown Timer
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

  const handleSelectAnswer = (chosen: number) => {
    if (isGameOver || isPaused || !question) return;

    if (chosen === question.answer) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      sounds.playScore();

      const multiplier = Math.min(4, Math.floor(nextStreak / 3) + 1);
      const points = 10 * multiplier;
      updateScore(currentScore + points);

      setQuestion(generateQuestion());
    } else {
      // Wrong answer
      sounds.playTone(180, 'sawtooth', 0.1, 0.08);
      setStreak(0);
      setQuestion(generateQuestion());
    }
  };

  // Keyboard 1-4 shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key) && question) {
        const idx = parseInt(e.key, 10) - 1;
        if (question.options[idx] !== undefined) {
          handleSelectAnswer(question.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [question, isGameOver, isPaused]);

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
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        {/* Timer Bar & Streak */}
        <div className="w-full max-w-md flex items-center justify-between mb-6 px-4 py-2.5 rounded-xl bg-[#0a0b12] border border-cyber-border">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-sm">
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s REMAINING</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 text-pink-400 font-bold text-xs uppercase animate-pulse">
              <Flame className="w-4 h-4 fill-current" />
              <span>{streak}X STREAK!</span>
            </div>
          )}
        </div>

        {/* Problem Card */}
        {question && (
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#0a0b12] border-2 border-cyan-500/50 shadow-2xl flex flex-col items-center justify-center mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Solve Problem:
            </span>
            <h2 className="text-4xl sm:text-5xl font-black font-mono text-gradient tracking-wider">
              {question.text}
            </h2>
          </div>
        )}

        {/* Options 2x2 Grid */}
        {question && (
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(opt)}
                className="py-4 px-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyan-400 hover:shadow-neon-cyan text-white font-black font-mono text-2xl active:scale-95 transition-all flex items-center justify-between group"
              >
                <span className="text-xs text-slate-500 font-bold">[{idx + 1}]</span>
                <span className="group-hover:text-cyan-300">{opt}</span>
                <span className="w-4"></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </GameWrapper>
  );
};
