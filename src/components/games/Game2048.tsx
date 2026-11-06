import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { VirtualControls } from '../VirtualControls';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { RotateCcw } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

type Grid = number[][];

export const Game2048: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [grid, setGrid] = useState<Grid>(() => getInitialGrid());
  const [prevGrid, setPrevGrid] = useState<Grid | null>(null);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  function getInitialGrid(): Grid {
    const g: Grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    addRandomTile(g);
    addRandomTile(g);
    return g;
  }

  function addRandomTile(g: Grid) {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      g[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const restartGame = () => {
    sounds.playClick();
    resetScore();
    const g = getInitialGrid();
    setGrid(g);
    setPrevGrid(null);
    setIsGameOver(false);
    setIsPaused(false);
    setHasWon(false);
  };

  const undoMove = () => {
    if (prevGrid) {
      sounds.playClick();
      setGrid(prevGrid);
      updateScore(prevScore);
      setPrevGrid(null);
    }
  };

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (isGameOver || isPaused) return;

    let rotated = grid.map((r) => [...r]);
    // Save state for undo
    const backupGrid = grid.map((r) => [...r]);
    const backupScore = currentScore;

    // Rotate matrix so we can always slide Left
    if (direction === 'UP') rotated = rotateLeft(rotated);
    if (direction === 'RIGHT') rotated = rotateLeft(rotateLeft(rotated));
    if (direction === 'DOWN') rotated = rotateRight(rotated);

    let moved = false;
    let earned = 0;

    for (let r = 0; r < 4; r++) {
      const row = rotated[r].filter((v) => v !== 0);
      const newRow: number[] = [];
      for (let c = 0; c < row.length; c++) {
        if (c < row.length - 1 && row[c] === row[c + 1]) {
          const merged = row[c] * 2;
          newRow.push(merged);
          earned += merged;
          if (merged === 2048 && !hasWon) {
            setHasWon(true);
            sounds.playWin();
          }
          c++;
          moved = true;
        } else {
          newRow.push(row[c]);
        }
      }
      while (newRow.length < 4) newRow.push(0);

      for (let c = 0; c < 4; c++) {
        if (rotated[r][c] !== newRow[c]) moved = true;
        rotated[r][c] = newRow[c];
      }
    }

    // Rotate back
    if (direction === 'UP') rotated = rotateRight(rotated);
    if (direction === 'RIGHT') rotated = rotateRight(rotateRight(rotated));
    if (direction === 'DOWN') rotated = rotateLeft(rotated);

    if (moved) {
      sounds.playTone(320 + earned * 0.1, 'triangle', 0.05, 0.06);
      addRandomTile(rotated);
      setPrevGrid(backupGrid);
      setPrevScore(backupScore);
      setGrid(rotated);
      const nextScore = currentScore + earned;
      updateScore(nextScore);

      // Check game over
      if (checkGameOver(rotated)) {
        setIsGameOver(true);
        handleGameOver(nextScore);
      }
    }
  };

  function rotateLeft(mat: Grid): Grid {
    const N = 4;
    const res: Grid = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[N - 1 - c][r] = mat[r][c];
      }
    }
    return res;
  }

  function rotateRight(mat: Grid): Grid {
    const N = 4;
    const res: Grid = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[c][N - 1 - r] = mat[r][c];
      }
    }
    return res;
  }

  function checkGameOver(g: Grid): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  }

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('RIGHT');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [grid, currentScore, isGameOver, isPaused]);

  // Touch swipe support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx > 0) move('RIGHT');
      else move('LEFT');
    } else if (Math.abs(dy) > 30) {
      if (dy > 0) move('DOWN');
      else move('UP');
    }
  };

  const getTileStyle = (val: number) => {
    switch (val) {
      case 2: return 'bg-[#1e293b] text-slate-100 border-slate-700';
      case 4: return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-sm';
      case 8: return 'bg-blue-900/70 text-blue-200 border-blue-500/50 shadow-sm';
      case 16: return 'bg-indigo-900/80 text-indigo-100 border-indigo-500/60 shadow-sm';
      case 32: return 'bg-purple-900/80 text-purple-100 border-purple-500/60 shadow-neon-purple';
      case 64: return 'bg-pink-900/80 text-pink-100 border-pink-500/60 shadow-neon-pink';
      case 128: return 'bg-rose-900/90 text-rose-100 border-rose-500/70 shadow-neon-pink';
      case 256: return 'bg-amber-900/90 text-amber-200 border-amber-500/70 shadow-sm';
      case 512: return 'bg-yellow-900/90 text-yellow-200 border-yellow-500/80 shadow-neon-cyan';
      case 1024: return 'bg-emerald-900 text-emerald-100 border-emerald-400 shadow-neon-green';
      case 2048: return 'bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white border-white shadow-2xl font-black animate-pulse';
      default: return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
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
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full flex flex-col items-center justify-center p-4 select-none touch-none"
      >
        {/* Undo button */}
        <div className="w-full max-w-xs flex justify-end mb-2">
          <button
            onClick={undoMove}
            disabled={!prevGrid}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              prevGrid
                ? 'bg-cyber-card border-cyber-border text-cyan-400 hover:border-cyan-400'
                : 'bg-[#0a0b12] border-cyber-border text-slate-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Move</span>
          </button>
        </div>

        {/* 4x4 Grid */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square p-3 rounded-2xl bg-[#0a0b12] border border-cyber-border shadow-2xl grid grid-cols-4 gap-2.5">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black font-mono border transition-all duration-100 ${
                  val === 0 ? 'bg-[#111422] border-[#181d30]' : getTileStyle(val)
                }`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Mobile D-Pad */}
        <div className="w-full max-w-sm mt-3">
          <VirtualControls onDirection={move} showDpad={true} showAction={false} />
        </div>
      </div>
    </GameWrapper>
  );
};
