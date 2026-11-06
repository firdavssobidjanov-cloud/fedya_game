import React, { useState, useEffect } from 'react';
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

export const SlidingPuzzleGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('4x4 (15-Puzzle)');
  const [size, setSize] = useState<number>(4);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Generate solvable scrambled puzzle
  const generateSolvableBoard = (n: number) => {
    let arr = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));

    // Perform random valid moves from solved state to guarantee solvability
    let emptyIdx = arr.indexOf(0);
    for (let i = 0; i < 150; i++) {
      const neighbors: number[] = [];
      const r = Math.floor(emptyIdx / n);
      const c = emptyIdx % n;

      if (r > 0) neighbors.push(emptyIdx - n);
      if (r < n - 1) neighbors.push(emptyIdx + n);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < n - 1) neighbors.push(emptyIdx + 1);

      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      arr[emptyIdx] = arr[chosen];
      arr[chosen] = 0;
      emptyIdx = chosen;
    }

    setTiles(arr);
    setMoves(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    const s = difficulty === '3x3 (8-Puzzle)' ? 3 : 4;
    setSize(s);
    generateSolvableBoard(s);
  }, [difficulty]);

  const handleTileClick = (index: number) => {
    if (isGameOver || isPaused) return;

    const emptyIdx = tiles.indexOf(0);
    const r1 = Math.floor(index / size);
    const c1 = index % size;
    const r2 = Math.floor(emptyIdx / size);
    const c2 = emptyIdx % size;

    // Check adjacency
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
      sounds.playTone(300 + tiles[index] * 20, 'sine', 0.04, 0.06);

      const newTiles = [...tiles];
      newTiles[emptyIdx] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      setMoves((m) => m + 1);

      // Check Win
      let isSolved = true;
      for (let i = 0; i < size * size - 1; i++) {
        if (newTiles[i] !== i + 1) {
          isSolved = false;
          break;
        }
      }

      if (isSolved) {
        sounds.playWin();
        const pts = Math.max(10, 500 - moves * 5);
        updateScore(currentScore + pts);
        setIsGameOver(true);
        handleGameOver(currentScore + pts);
      }
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
      onRestart={() => generateSolvableBoard(size)}
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Moves Count: <span className="text-cyan-400 font-mono font-black">{moves}</span>
        </div>

        {/* Puzzle Grid */}
        <div
          className={`w-full max-w-[320px] sm:max-w-[360px] aspect-square p-3 rounded-2xl bg-[#0a0b12] border border-cyber-border shadow-2xl grid gap-2 ${
            size === 3 ? 'grid-cols-3' : 'grid-cols-4'
          }`}
        >
          {tiles.map((val, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className={`w-full h-full rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black font-mono border transition-all duration-150 ${
                val === 0
                  ? 'bg-transparent border-transparent cursor-default'
                  : 'bg-gradient-to-tr from-cyber-card to-[#191f33] border-cyber-border hover:border-cyan-400 text-cyan-300 shadow-md active:scale-95'
              }`}
            >
              {val > 0 ? val : ''}
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
