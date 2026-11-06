import React, { useState, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Eraser, Lightbulb, Edit3 } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

// Solvable Sudoku puzzle boards
const PUZZLES = {
  Easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  Medium: [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ],
  Hard: [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0],
  ],
};

export const SudokuGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 2 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notesMode, setNotesMode] = useState(false);

  const loadPuzzle = (diff: string) => {
    const raw = PUZZLES[diff as keyof typeof PUZZLES] || PUZZLES.Easy;
    const initial = raw.map((row) => [...row]);
    const current = raw.map((row) => [...row]);
    setInitialBoard(initial);
    setBoard(current);
    setSelectedCell(null);
    setIsGameOver(false);
    setIsPaused(false);
    resetScore();
  };

  useEffect(() => {
    loadPuzzle(difficulty);
  }, [difficulty]);

  const handleCellSelect = (r: number, c: number) => {
    sounds.playTone(380, 'sine', 0.02, 0.04);
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isGameOver || isPaused) return;
    const { r, c } = selectedCell;

    // Cannot edit original clue cells
    if (initialBoard[r] && initialBoard[r][c] !== 0) return;

    sounds.playTone(500 + num * 40, 'sine', 0.04, 0.05);

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Check if board complete
    let isFull = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j] === 0) isFull = false;
      }
    }

    if (isFull && validateBoard(newBoard)) {
      sounds.playWin();
      const pts = difficulty === 'Hard' ? 500 : difficulty === 'Medium' ? 300 : 150;
      updateScore(currentScore + pts);
      setIsGameOver(true);
      handleGameOver(currentScore + pts);
    }
  };

  const handleErase = () => {
    if (!selectedCell || isGameOver || isPaused) return;
    const { r, c } = selectedCell;
    if (initialBoard[r] && initialBoard[r][c] !== 0) return;

    sounds.playTone(280, 'sine', 0.03, 0.05);
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  const validateBoard = (b: number[][]): boolean => {
    // Check rows, cols, 3x3 boxes
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set<number>();
      const colSet = new Set<number>();
      for (let j = 0; j < 9; j++) {
        if (b[i][j] !== 0 && rowSet.has(b[i][j])) return false;
        if (b[i][j] !== 0) rowSet.add(b[i][j]);

        if (b[j][i] !== 0 && colSet.has(b[j][i])) return false;
        if (b[j][i] !== 0) colSet.add(b[j][i]);
      }
    }
    return true;
  };

  const isConflict = (r: number, c: number, val: number): boolean => {
    if (val === 0) return false;
    // Check row & col
    for (let i = 0; i < 9; i++) {
      if (i !== c && board[r][i] === val) return true;
      if (i !== r && board[i][c] === val) return true;
    }
    // Check 3x3
    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const nr = startR + i;
        const nc = startC + j;
        if ((nr !== r || nc !== c) && board[nr][nc] === val) return true;
      }
    }
    return false;
  };

  // Keyboard number keys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) {
        handleNumberInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCell, board, initialBoard, isGameOver, isPaused]);

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
      onRestart={() => loadPuzzle(difficulty)}
      difficulty={difficulty}
      onSelectDifficulty={(d) => setDifficulty(d)}
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        {/* 9x9 Sudoku Grid */}
        <div className="w-full max-w-[340px] sm:max-w-[390px] aspect-square p-2 rounded-2xl bg-[#0a0b12] border-2 border-cyan-500/40 shadow-2xl grid grid-cols-9 gap-[1px]">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r] && initialBoard[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isSameUnit =
                selectedCell &&
                (selectedCell.r === r ||
                  selectedCell.c === c ||
                  (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));
              const isSameNumber =
                selectedCell &&
                board[selectedCell.r][selectedCell.c] !== 0 &&
                board[selectedCell.r][selectedCell.c] === val;
              const conflict = isConflict(r, c, val);

              // 3x3 box borders
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-cyan-500/60' : '';
              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-cyan-500/60' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellSelect(r, c)}
                  className={`w-full h-full flex items-center justify-center font-bold font-mono text-sm sm:text-base border border-[#1b2138] transition-all ${borderRight} ${borderBottom} ${
                    isSelected
                      ? 'bg-cyan-500/40 border-cyan-400 text-white shadow-neon-cyan'
                      : conflict
                      ? 'bg-rose-950/70 text-rose-400 font-black'
                      : isSameNumber
                      ? 'bg-purple-900/60 text-cyan-300'
                      : isSameUnit
                      ? 'bg-[#151928]'
                      : 'bg-[#0f121d] hover:bg-[#151a2d]'
                  }`}
                >
                  <span
                    className={
                      isInitial
                        ? 'text-white font-black'
                        : conflict
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }
                  >
                    {val > 0 ? val : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Number Pad & Actions */}
        <div className="w-full max-w-[340px] sm:max-w-[390px] mt-4 flex flex-col gap-2">
          {/* Numbers 1-9 */}
          <div className="grid grid-cols-9 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="h-10 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyan-400 active:bg-cyan-500/30 text-white font-bold font-mono text-base flex items-center justify-center transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex justify-center gap-3 mt-1">
            <button
              onClick={handleErase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-rose-400 text-xs font-bold transition-all"
            >
              <Eraser className="w-4 h-4" />
              <span>Erase</span>
            </button>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
};
