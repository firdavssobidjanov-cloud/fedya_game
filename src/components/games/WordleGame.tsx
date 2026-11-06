import React, { useState, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Delete, CornerDownLeft } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

const WORDS = [
  'CYBER', 'PIXEL', 'ROBOT', 'LASER', 'GAMER', 'QUEST', 'BLITZ', 'ARENA',
  'MAGIC', 'GHOST', 'TITAN', 'BLADE', 'FLASH', 'SPACE', 'RADAR', 'SCORE',
  'POWER', 'SWORD', 'FORCE', 'LEVEL', 'SPEED', 'ARMOR', 'RETRO', 'CHAMP',
  'SONIC', 'DRIVE', 'MOTOR', 'CLASH', 'STORM', 'SHINE', 'GLOWS', 'SOLAR',
  'NEXUS', 'ALPHA', 'BRAVO', 'DELTA', 'OMEGA', 'SPARK', 'TURBO', 'FLAME'
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

type Status = 'correct' | 'present' | 'absent' | 'empty';

export const WordleGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [targetWord, setTargetWord] = useState<string>('CYBER');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState<string>('');

  const initGame = () => {
    const chosen = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(chosen);
    setGuesses([]);
    setCurrentGuess('');
    setMessage('');
    setIsGameOver(false);
    setIsPaused(false);
    resetScore();
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleKeyPress = (key: string) => {
    if (isGameOver || isPaused) return;

    if (key === 'ENTER') {
      if (currentGuess.length < 5) {
        sounds.playTone(200, 'sawtooth', 0.08, 0.08);
        setMessage('Too short!');
        setTimeout(() => setMessage(''), 1500);
        return;
      }

      sounds.playFlip();
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      // Check Win
      if (currentGuess === targetWord) {
        sounds.playWin();
        const pts = Math.max(10, (7 - newGuesses.length) * 20);
        updateScore(currentScore + pts);
        setMessage('EXCELLENT! YOU WON!');
        setIsGameOver(true);
        handleGameOver(currentScore + pts);
      } else if (newGuesses.length >= 6) {
        sounds.playGameOver();
        setMessage(`WORD WAS: ${targetWord}`);
        setIsGameOver(true);
        handleGameOver(currentScore);
      }
    } else if (key === 'BACK' || key === 'BACKSPACE') {
      sounds.playTone(300, 'sine', 0.03, 0.05);
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      sounds.playTone(450, 'sine', 0.03, 0.05);
      setCurrentGuess((prev) => prev + key);
    }
  };

  // Physical Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('BACK');
      else {
        const char = e.key.toUpperCase();
        if (/^[A-Z]$/.test(char)) handleKeyPress(char);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentGuess, guesses, isGameOver, isPaused, targetWord]);

  // Evaluate letter status for a row
  const getLetterStatus = (letter: string, index: number, word: string): Status => {
    if (!word) return 'empty';
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  // Keyboard letter color
  const getKeyStatus = (key: string): Status => {
    let status: Status = 'empty';
    guesses.forEach((guess) => {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) {
            status = 'correct';
            return;
          } else if (targetWord.includes(key) && status !== 'correct') {
            status = 'present';
          } else if (status === 'empty') {
            status = 'absent';
          }
        }
      }
    });
    return status;
  };

  const getStatusClass = (status: Status) => {
    switch (status) {
      case 'correct': return 'bg-emerald-600 border-emerald-400 text-white shadow-sm';
      case 'present': return 'bg-amber-600 border-amber-400 text-white shadow-sm';
      case 'absent': return 'bg-[#151928] border-slate-700 text-slate-500';
      default: return 'bg-[#0f121d] border-cyber-border text-white';
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
      onRestart={initGame}
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        {message && (
          <div className="mb-2 px-4 py-1 rounded-xl bg-purple-950 border border-purple-500 text-cyan-300 font-bold text-xs uppercase animate-bounce">
            {message}
          </div>
        )}

        {/* 6x5 Wordle Board */}
        <div className="grid grid-rows-6 gap-1.5 mb-4">
          {Array.from({ length: 6 }).map((_, r) => {
            const guess = guesses[r] || (r === guesses.length ? currentGuess : '');
            const isCompletedRow = r < guesses.length;

            return (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, c) => {
                  const letter = guess[c] || '';
                  const status = isCompletedRow
                    ? getLetterStatus(letter, c, guesses[r])
                    : 'empty';

                  return (
                    <div
                      key={c}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black font-mono border transition-all duration-300 ${
                        letter && !isCompletedRow
                          ? 'border-cyan-400 bg-[#14192b] scale-105'
                          : getStatusClass(status)
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Virtual Keyboard */}
        <div className="w-full max-w-sm flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((k) => {
                const status = getKeyStatus(k);
                const isSpecial = k === 'ENTER' || k === 'BACK';

                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className={`h-10 rounded-lg font-bold text-xs flex items-center justify-center border transition-all active:scale-95 ${
                      isSpecial
                        ? 'px-2.5 bg-cyber-card border-cyber-border text-cyan-400'
                        : `w-8 sm:w-9 ${getStatusClass(status)}`
                    }`}
                  >
                    {k === 'BACK' ? <Delete className="w-4 h-4" /> : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
