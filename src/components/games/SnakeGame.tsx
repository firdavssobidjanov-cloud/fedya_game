import React, { useEffect, useRef, useState } from 'react';
import { GameWrapper } from '../GameWrapper';
import { VirtualControls } from '../VirtualControls';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

const GRID_SIZE = 20;

export const SnakeGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Snake state
  const snakeRef = useRef<Array<{ x: number; y: number }>>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number; isGold?: boolean }>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const getSpeed = () => {
    switch (difficulty) {
      case 'Easy': return 130;
      case 'Hard': return 70;
      default: return 95;
    }
  };

  const spawnFood = () => {
    const isGold = Math.random() < 0.2;
    let newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      isGold,
    };
    // Ensure food does not spawn inside snake
    while (snakeRef.current.some((part) => part.x === newFood.x && part.y === newFood.y)) {
      newFood.x = Math.floor(Math.random() * GRID_SIZE);
      newFood.y = Math.floor(Math.random() * GRID_SIZE);
    }
    foodRef.current = newFood;
  };

  const restartGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    spawnFood();
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  const handleDirectionInput = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const current = dirRef.current;
    if (dir === 'UP' && current.y === 0) nextDirRef.current = { x: 0, y: -1 };
    if (dir === 'DOWN' && current.y === 0) nextDirRef.current = { x: 0, y: 1 };
    if (dir === 'LEFT' && current.x === 0) nextDirRef.current = { x: -1, y: 0 };
    if (dir === 'RIGHT' && current.x === 0) nextDirRef.current = { x: 1, y: 0 };
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirectionInput('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirectionInput('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirectionInput('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirectionInput('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main animation loop
  useEffect(() => {
    let animId: number;

    const tick = (time: number) => {
      if (!isPaused && !isGameOver) {
        const speed = getSpeed();
        if (time - lastTimeRef.current >= speed) {
          lastTimeRef.current = time;

          // Update snake position
          dirRef.current = nextDirRef.current;
          const head = {
            x: snakeRef.current[0].x + dirRef.current.x,
            y: snakeRef.current[0].y + dirRef.current.y,
          };

          // Check Wall collision
          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            setIsGameOver(true);
            handleGameOver(currentScore);
            return;
          }

          // Check Self collision
          if (snakeRef.current.some((part) => part.x === head.x && part.y === head.y)) {
            setIsGameOver(true);
            handleGameOver(currentScore);
            return;
          }

          const newSnake = [head, ...snakeRef.current];

          // Check Food eaten
          if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
            sounds.playEat();
            const points = foodRef.current.isGold ? 25 : 10;
            updateScore(currentScore + points);
            spawnFood();
          } else {
            newSnake.pop();
          }

          snakeRef.current = newSnake;
        }
      }

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cellSize = canvas.width / GRID_SIZE;

          // Background Grid
          ctx.fillStyle = '#0a0b12';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#151928';
          ctx.lineWidth = 1;
          for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
          }

          // Draw Food
          const food = foodRef.current;
          ctx.save();
          if (food.isGold) {
            ctx.fillStyle = '#ffdd00';
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 15;
          } else {
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 12;
          }
          ctx.beginPath();
          ctx.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            cellSize / 2 - 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();

          // Draw Snake
          snakeRef.current.forEach((part, index) => {
            ctx.save();
            if (index === 0) {
              // Head
              ctx.fillStyle = '#00f0ff';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 14;
            } else {
              // Body gradient
              ctx.fillStyle = '#10b981';
              ctx.shadowColor = '#059669';
              ctx.shadowBlur = 4;
            }

            const x = part.x * cellSize + 1.5;
            const y = part.y * cellSize + 1.5;
            const size = cellSize - 3;
            const radius = index === 0 ? 6 : 4;

            ctx.beginPath();
            ctx.roundRect(x, y, size, size, radius);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver, currentScore, difficulty]);

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
      <div className="flex flex-col items-center justify-center p-3 w-full">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full w-[360px] sm:w-[400px] aspect-square rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12]"
        />

        {/* Mobile On-Screen D-Pad */}
        <div className="w-full max-w-sm mt-3">
          <VirtualControls
            onDirection={handleDirectionInput}
            showDpad={true}
            showAction={false}
          />
        </div>
      </div>
    </GameWrapper>
  );
};
