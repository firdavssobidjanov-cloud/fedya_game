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

export const LightsOutGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('3x3 Grid');
  const [size, setSize] = useState<number>(3);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const initGrid = (n: number) => {
    // Start with all OFF
    let newGrid = Array.from({ length: n }, () => Array(n).fill(false));

    // Scramble by simulating 10-15 random button clicks to guarantee solvability!
    const scrambles = n * 4;
    for (let i = 0; i < scrambles; i++) {
      const r = Math.floor(Math.random() * n);
      const c = Math.floor(Math.random() * n);
      toggleCell(r, c, newGrid, n);
    }

    setGrid(newGrid);
    setMoves(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  const toggleCell = (r: number, c: number, currentGrid: boolean[][], n: number) => {
    const coords = [
      [r, c],
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    coords.forEach(([row, col]) => {
      if (row >= 0 && row < n && col >= 0 && col < n) {
        currentGrid[row][col] = !currentGrid[row][col];
      }
    });
  };

  useEffect(() => {
    const n = difficulty === '5x5 Grid' ? 5 : difficulty === '4x4 Grid' ? 4 : 3;
    setSize(n);
    initGrid(n);
  }, [difficulty]);

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isPaused) return;

    sounds.playTone(350 + (r + c) * 30, 'triangle', 0.04, 0.06);

    const newGrid = grid.map((row) => [...row]);
    toggleCell(r, c, newGrid, size);
    setGrid(newGrid);
    setMoves((m) => m + 1);

    // Check Win: all cells must be FALSE (dark)
    const allDark = newGrid.every((row) => row.every((val) => !val));
    if (allDark) {
      sounds.playWin();
      const pts = Math.max(20, 200 - moves * 5);
      updateScore(currentScore + pts);
      setIsGameOver(true);
      handleGameOver(currentScore + pts);
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
      onRestart={() => initGrid(size)}
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Moves Count: <span className="text-cyan-400 font-mono font-black">{moves}</span>
        </div>

        {/* Grid */}
        <div
          className={`w-full max-w-[320px] sm:max-w-[360px] aspect-square p-3 rounded-2xl bg-[#0a0b12] border border-cyber-border shadow-2xl grid gap-2.5 ${
            size === 3 ? 'grid-cols-3' : size === 4 ? 'grid-cols-4' : 'grid-cols-5'
          }`}
        >
          {grid.map((row, r) =>
            row.map((isOn, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-full h-full rounded-2xl border transition-all duration-200 active:scale-90 flex items-center justify-center ${
                  isOn
                    ? 'bg-gradient-to-tr from-cyan-400 to-purple-500 border-cyan-300 shadow-neon-cyan scale-[0.98]'
                    : 'bg-[#111422] border-cyber-border hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOn ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-slate-700'
                  }`}
                />
              </button>
            ))
          )}
        </div>
      </div>
    </GameWrapper>
  );
};
