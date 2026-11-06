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

const TILE_SIZE = 20;
const ROWS = 19;
const COLS = 19;

// 1 = Wall, 0 = Dot, 2 = Power Pellet, 3 = Empty/Spawn
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 3, 1, 3, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 3, 1, 3, 3, 3, 1, 3, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 3, 1, 1, 1, 1, 1, 3, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 2, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 2, 1],
  [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

interface Ghost {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  color: string;
}

export const PacMazeGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [powerTimeLeft, setPowerTimeLeft] = useState(0);

  const mapRef = useRef<number[][]>([]);
  const pacRef = useRef({
    x: 9,
    y: 14,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    mouthAngle: 0.2,
    mouthDir: 0.05,
  });

  const ghostsRef = useRef<Ghost[]>([
    { x: 9, y: 8, dirX: 1, dirY: 0, color: '#ff0055' },
    { x: 8, y: 9, dirX: -1, dirY: 0, color: '#00f0ff' },
    { x: 10, y: 9, dirX: 1, dirY: 0, color: '#ec4899' },
  ]);

  const initGame = () => {
    mapRef.current = INITIAL_MAP.map((row) => [...row]);
    pacRef.current = {
      x: 9,
      y: 14,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      mouthAngle: 0.2,
      mouthDir: 0.05,
    };
    ghostsRef.current = [
      { x: 9, y: 8, dirX: 1, dirY: 0, color: '#ff0055' },
      { x: 8, y: 9, dirX: -1, dirY: 0, color: '#00f0ff' },
      { x: 10, y: 9, dirX: 1, dirY: 0, color: '#ec4899' },
    ];
    setPowerTimeLeft(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleDirInput = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (dir === 'UP') {
      pacRef.current.nextDirX = 0;
      pacRef.current.nextDirY = -1;
    } else if (dir === 'DOWN') {
      pacRef.current.nextDirX = 0;
      pacRef.current.nextDirY = 1;
    } else if (dir === 'LEFT') {
      pacRef.current.nextDirX = -1;
      pacRef.current.nextDirY = 0;
    } else if (dir === 'RIGHT') {
      pacRef.current.nextDirX = 1;
      pacRef.current.nextDirY = 0;
    }
  };

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirInput('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirInput('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirInput('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirInput('RIGHT');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    let animId: number;
    let stepCount = 0;

    const tick = () => {
      stepCount++;

      if (!isPaused && !isGameOver) {
        // Move Pac-Man every 12 frames
        if (stepCount % 12 === 0) {
          const pac = pacRef.current;
          const map = mapRef.current;

          // Check if can turn next direction
          const targetNextX = (pac.x + pac.nextDirX + COLS) % COLS;
          const targetNextY = (pac.y + pac.nextDirY + ROWS) % ROWS;
          if (map[targetNextY] && map[targetNextY][targetNextX] !== 1) {
            pac.dirX = pac.nextDirX;
            pac.dirY = pac.nextDirY;
          }

          // Move current direction
          const targetX = (pac.x + pac.dirX + COLS) % COLS;
          const targetY = (pac.y + pac.dirY + ROWS) % ROWS;
          if (map[targetY] && map[targetY][targetX] !== 1) {
            pac.x = targetX;
            pac.y = targetY;

            // Eat Dot
            if (map[pac.y][pac.x] === 0) {
              map[pac.y][pac.x] = 3;
              sounds.playTone(480, 'sine', 0.03, 0.04);
              updateScore(currentScore + 10);
            } else if (map[pac.y][pac.x] === 2) {
              // Power Pellet
              map[pac.y][pac.x] = 3;
              sounds.playScore();
              updateScore(currentScore + 50);
              setPowerTimeLeft(40); // 40 steps
            }
          }
        }

        // Animate mouth
        pacRef.current.mouthAngle += pacRef.current.mouthDir;
        if (pacRef.current.mouthAngle > 0.45 || pacRef.current.mouthAngle < 0.05) {
          pacRef.current.mouthDir = -pacRef.current.mouthDir;
        }

        // Move Ghosts every 16 frames
        if (stepCount % 15 === 0) {
          if (powerTimeLeft > 0) setPowerTimeLeft((prev) => prev - 1);

          ghostsRef.current.forEach((g) => {
            const map = mapRef.current;
            const validDirs = [
              { x: 0, y: -1 },
              { x: 0, y: 1 },
              { x: -1, y: 0 },
              { x: 1, y: 0 },
            ].filter((d) => {
              const nx = (g.x + d.x + COLS) % COLS;
              const ny = (g.y + d.y + ROWS) % ROWS;
              // Don't reverse immediately unless trapped
              if (d.x === -g.dirX && d.y === -g.dirY) return false;
              return map[ny] && map[ny][nx] !== 1;
            });

            if (validDirs.length > 0) {
              const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
              g.dirX = chosen.x;
              g.dirY = chosen.y;
              g.x = (g.x + g.dirX + COLS) % COLS;
              g.y = (g.y + g.dirY + ROWS) % ROWS;
            } else {
              g.dirX = -g.dirX;
              g.dirY = -g.dirY;
            }

            // Check collision with Pac
            if (g.x === pacRef.current.x && g.y === pacRef.current.y) {
              if (powerTimeLeft > 0) {
                // Eat ghost
                sounds.playWin();
                updateScore(currentScore + 200);
                g.x = 9;
                g.y = 9;
              } else {
                // Pac caught
                sounds.playHit();
                setIsGameOver(true);
                handleGameOver(currentScore);
              }
            }
          });
        }
      }

      // RENDER
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0b12';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const map = mapRef.current;
          // Draw Walls & Dots
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const val = map[r] ? map[r][c] : 1;
              const x = c * TILE_SIZE;
              const y = r * TILE_SIZE;

              if (val === 1) {
                // Wall
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
              } else if (val === 0) {
                // Pellet
                ctx.fillStyle = '#ffdd00';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else if (val === 2) {
                // Power Pellet
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }

          // Draw Pac-Man
          const pac = pacRef.current;
          ctx.save();
          const pacPx = pac.x * TILE_SIZE + TILE_SIZE / 2;
          const pacPy = pac.y * TILE_SIZE + TILE_SIZE / 2;
          ctx.translate(pacPx, pacPy);

          let baseAngle = 0;
          if (pac.dirX === 1) baseAngle = 0;
          if (pac.dirX === -1) baseAngle = Math.PI;
          if (pac.dirY === 1) baseAngle = Math.PI / 2;
          if (pac.dirY === -1) baseAngle = -Math.PI / 2;

          ctx.fillStyle = '#ffdd00';
          ctx.shadowColor = '#ffdd00';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, TILE_SIZE / 2 - 1, baseAngle + pac.mouthAngle, baseAngle + Math.PI * 2 - pac.mouthAngle);
          ctx.lineTo(0, 0);
          ctx.fill();
          ctx.restore();

          // Draw Ghosts
          ghostsRef.current.forEach((g) => {
            ctx.save();
            const gx = g.x * TILE_SIZE + 2;
            const gy = g.y * TILE_SIZE + 2;
            const size = TILE_SIZE - 4;

            ctx.fillStyle = powerTimeLeft > 0 ? '#38bdf8' : g.color;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;

            // Ghost Dome
            ctx.beginPath();
            ctx.arc(gx + size / 2, gy + size / 2, size / 2, Math.PI, 0);
            ctx.lineTo(gx + size, gy + size);
            ctx.lineTo(gx, gy + size);
            ctx.closePath();
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(gx + size * 0.35, gy + size * 0.4, 2.5, 0, Math.PI * 2);
            ctx.arc(gx + size * 0.65, gy + size * 0.4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver, currentScore, powerTimeLeft]);

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
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="max-w-full w-[360px] sm:w-[380px] aspect-square rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12]"
        />

        <div className="w-full max-w-sm mt-3">
          <VirtualControls
            onDirection={handleDirInput}
            showDpad={true}
            showAction={false}
          />
        </div>
      </div>
    </GameWrapper>
  );
};
