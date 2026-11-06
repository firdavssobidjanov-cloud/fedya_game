import React, { useState, useEffect, useRef } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Flag, Bomb, Clock } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const MinesweeperGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Easy (9x9)');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [minesLeft, setMinesLeft] = useState(10);
  const isStartedRef = useRef(false);

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'Medium (16x16)': return { rows: 14, cols: 14, mines: 28 };
      case 'Expert (16x30)': return { rows: 16, cols: 20, mines: 50 };
      default: return { rows: 9, cols: 9, mines: 10 };
    }
  };

  const initBoard = () => {
    const { rows, cols, mines } = getDifficultySettings();
    const newBoard: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setMinesLeft(mines);
    setTimer(0);
    isStartedRef.current = false;
    setIsGameOver(false);
    setIsPaused(false);
    setHasWon(false);
    resetScore();
  };

  useEffect(() => {
    initBoard();
  }, [difficulty]);

  // Timer tick
  useEffect(() => {
    let interval: number;
    if (isStartedRef.current && !isGameOver && !hasWon && !isPaused) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameOver, hasWon, isPaused]);

  // Place mines ensuring the first clicked cell (and neighbors) are safe
  const placeMines = (startR: number, startC: number, currentBoard: Cell[][]) => {
    const { rows, cols, mines } = getDifficultySettings();
    let placed = 0;

    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Avoid start cell and its 8 neighbors
      if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) continue;

      if (!currentBoard[r][c].isMine) {
        currentBoard[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!currentBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && currentBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          currentBoard[r][c].neighborMines = count;
        }
      }
    }
  };

  const revealCell = (r: number, c: number, currentBoard: Cell[][]) => {
    const { rows, cols } = getDifficultySettings();
    const cell = currentBoard[r][c];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    // Flood fill if 0 neighbor mines
    if (cell.neighborMines === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            revealCell(nr, nc, currentBoard);
          }
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || hasWon || isPaused) return;

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = newBoard[r][c];

    if (cell.isRevealed) return;

    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    if (cell.isFlagged) return;

    // First click generates mines
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      placeMines(r, c, newBoard);
    }

    // Hit mine
    if (newBoard[r][c].isMine) {
      sounds.playExplosion();
      // Reveal all mines
      newBoard.forEach((row) => {
        row.forEach((c) => {
          if (c.isMine) c.isRevealed = true;
        });
      });
      setBoard(newBoard);
      setIsGameOver(true);
      handleGameOver(currentScore);
      return;
    }

    // Reveal
    sounds.playTone(400 + (cell.neighborMines || 0) * 50, 'sine', 0.04, 0.05);
    revealCell(r, c, newBoard);
    setBoard(newBoard);

    // Check Win
    const { rows, cols, mines } = getDifficultySettings();
    let unrevealedSafe = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine && !newBoard[row][col].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      sounds.playWin();
      setHasWon(true);
      const winScore = Math.max(10, 1000 - timer * 5);
      updateScore(winScore);
      handleGameOver(winScore);
    }
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isGameOver || hasWon || isPaused) return;

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = newBoard[r][c];

    if (cell.isRevealed) return;

    sounds.playTone(600, 'triangle', 0.04, 0.06);
    cell.isFlagged = !cell.isFlagged;
    setBoard(newBoard);
    setMinesLeft((prev) => (cell.isFlagged ? prev - 1 : prev + 1));
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-cyan-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-rose-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-amber-400';
      case 6: return 'text-teal-300';
      default: return 'text-white';
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
      onRestart={initBoard}
      difficulty={difficulty}
      onSelectDifficulty={(d) => {
        setDifficulty(d);
      }}
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between w-full max-w-sm mb-3 px-4 py-2 rounded-xl bg-[#0a0b12] border border-cyber-border">
          <div className="flex items-center gap-1.5 text-rose-400 font-mono font-black text-sm">
            <Bomb className="w-4 h-4" />
            <span>{minesLeft}</span>
          </div>

          {/* Toggle Flag Mode (Crucial for mobile) */}
          <button
            onClick={() => {
              sounds.playClick();
              setFlagMode((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
              flagMode
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-neon-pink'
                : 'bg-cyber-card border-cyber-border text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flagMode ? 'FLAG MODE' : 'REVEAL MODE'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-black text-sm">
            <Clock className="w-4 h-4" />
            <span>{timer}s</span>
          </div>
        </div>

        {/* Minesweeper Grid */}
        <div className="overflow-auto max-w-full p-2 rounded-2xl bg-[#0a0b12] border border-cyber-border shadow-2xl">
          <div className="flex flex-col gap-1">
            {board.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => toggleFlag(r, c, e)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono border transition-all ${
                      cell.isRevealed
                        ? cell.isMine
                          ? 'bg-rose-950/90 border-rose-600 text-rose-400'
                          : 'bg-[#151928] border-slate-800'
                        : 'bg-[#1e2338] border-cyber-border hover:border-slate-500 active:scale-95'
                    }`}
                  >
                    {cell.isRevealed ? (
                      cell.isMine ? (
                        '💣'
                      ) : cell.neighborMines > 0 ? (
                        <span className={getNumberColor(cell.neighborMines)}>
                          {cell.neighborMines}
                        </span>
                      ) : (
                        ''
                      )
                    ) : cell.isFlagged ? (
                      '🚩'
                    ) : (
                      ''
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameWrapper>
  );
};
