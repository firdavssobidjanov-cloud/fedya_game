import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Lightbulb } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

const CATEGORIES = {
  Gaming: ['CONSOLE', 'JOYSTICK', 'PIXEL', 'MULTIPLAYER', 'ARCADE', 'AVATAR', 'CHECKPOINT', 'WARRIOR'],
  Technology: ['CYBERSPACE', 'ALGORITHM', 'DATABASE', 'KEYBOARD', 'BROWSER', 'SECURITY', 'INTERNET'],
  Science: ['GALAXY', 'QUANTUM', 'ASTEROID', 'PLANET', 'GRAVITY', 'ECLIPSE', 'TELESCOPE'],
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const HangmanGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [category, setCategory] = useState<keyof typeof CATEGORIES>('Gaming');
  const [word, setWord] = useState<string>('CONSOLE');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pickNewWord = (cat = category) => {
    const list = CATEGORIES[cat];
    const chosen = list[Math.floor(Math.random() * list.length)];
    setWord(chosen);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    pickNewWord(category);
  }, [category]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || isGameOver || isPaused) return;

    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(letter);
    setGuessedLetters(nextGuessed);

    if (word.includes(letter)) {
      sounds.playScore();
      // Check win: all letters in word are guessed
      const isWon = word.split('').every((l) => nextGuessed.has(l));
      if (isWon) {
        sounds.playWin();
        const pts = Math.max(10, 100 - wrongGuesses * 15);
        updateScore(currentScore + pts);
        setIsGameOver(true);
        handleGameOver(currentScore + pts);
      }
    } else {
      sounds.playTone(180, 'sawtooth', 0.08, 0.08);
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= 6) {
        sounds.playGameOver();
        setIsGameOver(true);
        handleGameOver(currentScore);
      }
    }
  };

  const useHint = () => {
    if (isGameOver || isPaused) return;
    const unguessed = word.split('').filter((l) => !guessedLetters.has(l));
    if (unguessed.length > 0) {
      sounds.playTone(600, 'sine', 0.05, 0.08);
      handleGuess(unguessed[0]);
    }
  };

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        handleGuess(char);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guessedLetters, isGameOver, isPaused, word, wrongGuesses]);

  // Draw Hangman Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0b12';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    // Gallows base
    ctx.beginPath();
    ctx.moveTo(30, height - 20);
    ctx.lineTo(130, height - 20);
    // Vertical post
    ctx.moveTo(80, height - 20);
    ctx.lineTo(80, 20);
    // Top beam
    ctx.lineTo(180, 20);
    // Noose rope
    ctx.lineTo(180, 50);
    ctx.stroke();

    // Body parts based on wrong guesses
    ctx.strokeStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';

    // 1. Head
    if (wrongGuesses >= 1) {
      ctx.beginPath();
      ctx.arc(180, 68, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 2. Spine / Torso
    if (wrongGuesses >= 2) {
      ctx.beginPath();
      ctx.moveTo(180, 86);
      ctx.lineTo(180, 140);
      ctx.stroke();
    }
    // 3. Left Arm
    if (wrongGuesses >= 3) {
      ctx.beginPath();
      ctx.moveTo(180, 98);
      ctx.lineTo(150, 125);
      ctx.stroke();
    }
    // 4. Right Arm
    if (wrongGuesses >= 4) {
      ctx.beginPath();
      ctx.moveTo(180, 98);
      ctx.lineTo(210, 125);
      ctx.stroke();
    }
    // 5. Left Leg
    if (wrongGuesses >= 5) {
      ctx.beginPath();
      ctx.moveTo(180, 140);
      ctx.lineTo(155, 180);
      ctx.stroke();
    }
    // 6. Right Leg
    if (wrongGuesses >= 6) {
      ctx.beginPath();
      ctx.moveTo(180, 140);
      ctx.lineTo(205, 180);
      ctx.stroke();
    }
  }, [wrongGuesses]);

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
      onRestart={() => pickNewWord(category)}
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        {/* Category & Hint */}
        <div className="w-full max-w-md flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-cyber-card border border-cyber-border text-cyan-400">
            Category: {category}
          </span>
          <button
            onClick={useHint}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-bold hover:bg-amber-900/60"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>
        </div>

        {/* Gallows Canvas */}
        <canvas
          ref={canvasRef}
          width={260}
          height={210}
          className="rounded-2xl border border-cyber-border shadow-xl bg-[#0a0b12] mb-4"
        />

        {/* Word Underlines / Letters */}
        <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap justify-center">
          {word.split('').map((letter, idx) => {
            const revealed = guessedLetters.has(letter) || isGameOver;
            return (
              <div
                key={idx}
                className="w-8 sm:w-10 h-11 sm:h-12 border-b-2 border-cyan-400 flex items-center justify-center text-xl sm:text-2xl font-black font-mono"
              >
                <span
                  className={
                    revealed
                      ? guessedLetters.has(letter)
                        ? 'text-cyan-400'
                        : 'text-rose-500'
                      : 'opacity-0'
                  }
                >
                  {letter}
                </span>
              </div>
            );
          })}
        </div>

        {/* Alphabet Keyboard */}
        <div className="w-full max-w-md flex flex-wrap justify-center gap-1.5">
          {ALPHABET.map((char) => {
            const isGuessed = guessedLetters.has(char);
            return (
              <button
                key={char}
                onClick={() => handleGuess(char)}
                disabled={isGuessed || isGameOver}
                className={`w-8 h-9 rounded-lg font-bold font-mono text-xs border transition-all active:scale-95 ${
                  isGuessed
                    ? 'bg-[#151928] border-slate-800 text-slate-600 opacity-40 cursor-default'
                    : 'bg-cyber-card border-cyber-border text-slate-100 hover:border-cyan-400 hover:text-cyan-300'
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    </GameWrapper>
  );
};
