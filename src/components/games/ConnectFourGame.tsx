import React, { useState } from 'react';
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

const ROWS = 6;
const COLS = 7;
type Board = (string | null)[][];

export const ConnectFourGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Hard AI');
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'RED' | 'YELLOW'>('RED');
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<{ r: number; c: number }[] | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  function createEmptyBoard(): Board {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  const restartGame = () => {
    sounds.playClick();
    setBoard(createEmptyBoard());
    setCurrentPlayer('RED');
    setWinner(null);
    setWinningCells(null);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const checkWin = (b: Board) => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = b[r][c];
        if (p && p === b[r][c + 1] && p === b[r][c + 2] && p === b[r][c + 3]) {
          return {
            winner: p,
            cells: [
              { r, c },
              { r, c: c + 1 },
              { r, c: c + 2 },
              { r, c: c + 3 },
            ],
          };
        }
      }
    }
    // Check vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = b[r][c];
        if (p && p === b[r + 1][c] && p === b[r + 2][c] && p === b[r + 3][c]) {
          return {
            winner: p,
            cells: [
              { r, c },
              { r: r + 1, c },
              { r: r + 2, c },
              { r: r + 3, c },
            ],
          };
        }
      }
    }
    // Check diagonal down-right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = b[r][c];
        if (p && p === b[r + 1][c + 1] && p === b[r + 2][c + 2] && p === b[r + 3][c + 3]) {
          return {
            winner: p,
            cells: [
              { r, c },
              { r: r + 1, c: c + 1 },
              { r: r + 2, c: c + 2 },
              { r: r + 3, c: c + 3 },
            ],
          };
        }
      }
    }
    // Check diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = b[r][c];
        if (p && p === b[r - 1][c + 1] && p === b[r - 2][c + 2] && p === b[r - 3][c + 3]) {
          return {
            winner: p,
            cells: [
              { r, c },
              { r: r - 1, c: c + 1 },
              { r: r - 2, c: c + 2 },
              { r: r - 3, c: c + 3 },
            ],
          };
        }
      }
    }

    // Tie
    if (b.every((row) => row.every((cell) => cell !== null))) {
      return { winner: 'Tie', cells: [] };
    }

    return null;
  };

  const dropDisc = (col: number) => {
    if (winner || isGameOver || isPaused) return;

    // Find lowest available row in this column
    let rowToDrop = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        rowToDrop = r;
        break;
      }
    }
    if (rowToDrop === -1) return; // Column full

    sounds.playTone(320 + (ROWS - rowToDrop) * 30, 'sine', 0.05, 0.08);

    const newBoard = board.map((r) => [...r]);
    newBoard[rowToDrop][col] = currentPlayer;
    setBoard(newBoard);

    const winRes = checkWin(newBoard);
    if (winRes) {
      finishGame(winRes.winner, winRes.cells);
      return;
    }

    if (difficulty === '2-Player Local') {
      setCurrentPlayer(currentPlayer === 'RED' ? 'YELLOW' : 'RED');
    } else {
      setCurrentPlayer('YELLOW');
      // AI Move
      setTimeout(() => {
        makeAIMove(newBoard);
      }, 300);
    }
  };

  const makeAIMove = (currentBoard: Board) => {
    const validCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (currentBoard[0][c] === null) validCols.push(c);
    }
    if (validCols.length === 0) return;

    let chosenCol = validCols[0];

    // 1. Check if AI can win this move
    for (const c of validCols) {
      const temp = currentBoard.map((row) => [...row]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (temp[r][c] === null) {
          temp[r][c] = 'YELLOW';
          break;
        }
      }
      if (checkWin(temp)?.winner === 'YELLOW') {
        chosenCol = c;
        break;
      }
    }

    // 2. Block player if player can win next move
    if (difficulty === 'Hard AI') {
      for (const c of validCols) {
        const temp = currentBoard.map((row) => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (temp[r][c] === null) {
            temp[r][c] = 'RED';
            break;
          }
        }
        if (checkWin(temp)?.winner === 'RED') {
          chosenCol = c;
          break;
        }
      }
    }

    // Drop AI disc
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r][chosenCol] === null) {
        currentBoard[r][chosenCol] = 'YELLOW';
        break;
      }
    }

    sounds.playTone(400, 'sine', 0.05, 0.08);
    setBoard([...currentBoard]);

    const winRes = checkWin(currentBoard);
    if (winRes) {
      finishGame(winRes.winner, winRes.cells);
    } else {
      setCurrentPlayer('RED');
    }
  };

  const finishGame = (winResult: string, cells: { r: number; c: number }[]) => {
    setWinner(winResult);
    setWinningCells(cells);
    setIsGameOver(true);

    if (winResult === 'RED') {
      sounds.playWin();
      const nextScore = currentScore + 25;
      updateScore(nextScore);
      handleGameOver(nextScore);
    } else if (winResult === 'YELLOW') {
      sounds.playGameOver();
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
      difficulty={difficulty}
      onSelectDifficulty={(d) => {
        setDifficulty(d);
        restartGame();
      }}
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        <div className="mb-3 text-sm font-bold text-slate-300">
          {!winner ? (
            <span className="flex items-center gap-2">
              Current Turn:{' '}
              <span className={currentPlayer === 'RED' ? 'text-rose-400' : 'text-amber-400'}>
                {currentPlayer === 'RED' ? 'RED DISC' : 'YELLOW DISC'}
              </span>
            </span>
          ) : (
            <span className={winner === 'RED' ? 'text-rose-400' : 'text-amber-400'}>
              WINNER: {winner}!
            </span>
          )}
        </div>

        {/* 7x6 Connect 4 Cabinet */}
        <div className="p-3 sm:p-4 rounded-3xl bg-blue-950/80 border-2 border-blue-500/50 shadow-2xl flex flex-col gap-2">
          {board.map((row, r) => (
            <div key={r} className="flex gap-2">
              {row.map((cell, c) => {
                const isWinCell = winningCells?.some((wc) => wc.r === r && wc.c === c);
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => dropDisc(c)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all flex items-center justify-center ${
                      cell === 'RED'
                        ? isWinCell
                          ? 'bg-rose-500 border-white shadow-neon-pink scale-105'
                          : 'bg-rose-600 border-rose-400 shadow-md'
                        : cell === 'YELLOW'
                        ? isWinCell
                          ? 'bg-amber-400 border-white shadow-neon-cyan scale-105'
                          : 'bg-amber-500 border-amber-300 shadow-md'
                        : 'bg-[#0a0d1a] border-blue-900 hover:border-blue-400'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
