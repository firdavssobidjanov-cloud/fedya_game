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

type Board = (string | null)[];

export const TicTacToeGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Unbeatable AI');
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [stats, setStats] = useState({ xWins: 0, oWins: 0, ties: 0 });

  const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (b: Board) => {
    for (const [x, y, z] of WIN_PATTERNS) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return { winner: b[x], line: [x, y, z] };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'Tie', line: null };
    }
    return null;
  };

  const restartGame = () => {
    sounds.playClick();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsGameOver(false);
    setIsPaused(false);
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (b: Board, depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(b);
    if (res) {
      if (res.winner === 'O') return 10 - depth;
      if (res.winner === 'X') return depth - 10;
      if (res.winner === 'Tie') return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = 'O';
          const evalScore = minimax(b, depth + 1, false);
          b[i] = null;
          maxEval = Math.max(maxEval, evalScore);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = 'X';
          const evalScore = minimax(b, depth + 1, true);
          b[i] = null;
          minEval = Math.min(minEval, evalScore);
        }
      }
      return minEval;
    }
  };

  const makeAIMove = (currentBoard: Board) => {
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (available.length === 0) return;

    let chosenIdx: number;

    if (difficulty === 'Smart AI' && Math.random() < 0.35) {
      // 35% chance of random move for Smart AI
      chosenIdx = available[Math.floor(Math.random() * available.length)];
    } else {
      // Unbeatable minimax
      let bestScore = -Infinity;
      chosenIdx = available[0];
      for (const idx of available) {
        currentBoard[idx] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[idx] = null;
        if (score > bestScore) {
          bestScore = score;
          chosenIdx = idx;
        }
      }
    }

    currentBoard[chosenIdx] = 'O';
    sounds.playTone(320, 'sine', 0.05, 0.08);

    const winCheck = checkWinner(currentBoard);
    if (winCheck) {
      finishGame(winCheck.winner, winCheck.line);
    } else {
      setIsXNext(true);
    }
    setBoard([...currentBoard]);
  };

  const finishGame = (winResult: string, line: number[] | null) => {
    setWinner(winResult);
    setWinningLine(line);
    setIsGameOver(true);

    if (winResult === 'X') {
      sounds.playWin();
      const nextScore = currentScore + 10;
      updateScore(nextScore);
      setStats((prev) => ({ ...prev, xWins: prev.xWins + 1 }));
    } else if (winResult === 'O') {
      sounds.playGameOver();
      setStats((prev) => ({ ...prev, oWins: prev.oWins + 1 }));
    } else {
      sounds.playTone(250, 'triangle', 0.1, 0.08);
      setStats((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isGameOver || isPaused) return;

    const newBoard = [...board];
    const currentMark = isXNext ? 'X' : 'O';
    newBoard[index] = currentMark;
    setBoard(newBoard);
    sounds.playTone(isXNext ? 540 : 380, 'sine', 0.05, 0.08);

    const winCheck = checkWinner(newBoard);
    if (winCheck) {
      finishGame(winCheck.winner, winCheck.line);
      return;
    }

    if (difficulty === '2-Player Local') {
      setIsXNext(!isXNext);
    } else {
      setIsXNext(false);
      // AI Move with slight delay for realism
      setTimeout(() => {
        makeAIMove(newBoard);
      }, 250);
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
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        {/* Scoreboard */}
        <div className="flex items-center gap-6 mb-6 px-6 py-2.5 rounded-2xl bg-[#0a0b12] border border-cyber-border">
          <div className="text-center">
            <span className="text-xs font-bold text-cyan-400">PLAYER (X)</span>
            <p className="text-xl font-black font-mono text-white">{stats.xWins}</p>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500">TIES</span>
            <p className="text-xl font-black font-mono text-slate-300">{stats.ties}</p>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-pink-400">
              {difficulty === '2-Player Local' ? 'PLAYER (O)' : 'AI (O)'}
            </span>
            <p className="text-xl font-black font-mono text-white">{stats.oWins}</p>
          </div>
        </div>

        {/* Turn Status */}
        <div className="text-sm font-bold text-slate-300 mb-4">
          {!winner ? (
            <span className="flex items-center gap-2">
              Turn:{' '}
              <span className={isXNext ? 'text-cyan-400' : 'text-pink-400'}>
                {isXNext ? 'X' : 'O'}
              </span>
            </span>
          ) : winner === 'Tie' ? (
            <span className="text-amber-400">IT'S A DRAW!</span>
          ) : (
            <span className={winner === 'X' ? 'text-cyan-400' : 'text-pink-400'}>
              WINNER: {winner}!
            </span>
          )}
        </div>

        {/* 3x3 Grid */}
        <div className="w-full max-w-[320px] sm:max-w-[360px] aspect-square p-3 rounded-2xl bg-[#0a0b12] border border-cyber-border shadow-2xl grid grid-cols-3 gap-3">
          {board.map((cell, idx) => {
            const isWinCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black font-mono border transition-all duration-200 ${
                  isWinCell
                    ? 'bg-gradient-to-tr from-cyan-600/40 to-pink-600/40 border-cyan-400 shadow-neon-cyan scale-105'
                    : 'bg-[#111422] border-cyber-border hover:border-slate-500 active:scale-95'
                }`}
              >
                {cell === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                    X
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameWrapper>
  );
};
