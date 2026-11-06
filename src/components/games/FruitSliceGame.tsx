import React, { useEffect, useRef, useState } from 'react';
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

interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'fruit' | 'bomb';
  sliced: boolean;
  sliceAngle: number;
  emoji: string;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

interface Splatter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

export const FruitSliceGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [misses, setMisses] = useState(0);

  const fruitsRef = useRef<Fruit[]>([]);
  const splattersRef = useRef<Splatter[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const isPointerDownRef = useRef(false);
  const lastSpawnRef = useRef<number>(0);

  const restartGame = () => {
    fruitsRef.current = [];
    splattersRef.current = [];
    trailRef.current = [];
    setMisses(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  const FRUIT_TYPES = [
    { emoji: '🍉', color: '#ff0055' },
    { emoji: '🍊', color: '#ff8800' },
    { emoji: '🍎', color: '#ef4444' },
    { emoji: '🥝', color: '#10b981' },
    { emoji: '🍍', color: '#ffdd00' },
  ];

  const spawnFruit = (width: number, height: number) => {
    const isBomb = Math.random() < 0.22;
    const chosen = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

    fruitsRef.current.push({
      x: 60 + Math.random() * (width - 120),
      y: height + 20,
      vx: (Math.random() - 0.5) * 4,
      vy: -(11 + Math.random() * 4),
      radius: isBomb ? 20 : 22,
      color: isBomb ? '#94a3b8' : chosen.color,
      type: isBomb ? 'bomb' : 'fruit',
      sliced: false,
      sliceAngle: 0,
      emoji: isBomb ? '💣' : chosen.emoji,
    });
  };

  // Slicing touch / pointer tracking
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    addTrailPoint(e);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    addTrailPoint(e);
  };

  const addTrailPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    trailRef.current.push({ x, y, time: Date.now() });

    // Check collision with unsliced fruits
    fruitsRef.current.forEach((f) => {
      if (!f.sliced) {
        const dist = Math.hypot(f.x - x, f.y - y);
        if (dist <= f.radius + 10) {
          f.sliced = true;
          if (f.type === 'bomb') {
            sounds.playExplosion();
            setIsGameOver(true);
            handleGameOver(currentScore);
          } else {
            sounds.playSlice();
            updateScore(currentScore + 10);

            // Create fruit juice splatters
            for (let s = 0; s < 12; s++) {
              splattersRef.current.push({
                x: f.x,
                y: f.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: f.color,
                alpha: 1,
              });
            }
          }
        }
      }
    });
  };

  // Main game tick
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      if (!isPaused && !isGameOver) {
        // Spawn fruits periodically
        const now = Date.now();
        if (now - lastSpawnRef.current > 1400) {
          lastSpawnRef.current = now;
          spawnFruit(width, height);
          if (Math.random() > 0.5) spawnFruit(width, height);
        }

        // Update Fruits
        for (let i = fruitsRef.current.length - 1; i >= 0; i--) {
          const f = fruitsRef.current[i];
          f.x += f.vx;
          f.y += f.vy;
          f.vy += 0.28; // Gravity

          // Check if fruit dropped past screen without being sliced
          if (f.y > height + 40) {
            if (!f.sliced && f.type === 'fruit') {
              const nextMisses = misses + 1;
              setMisses(nextMisses);
              sounds.playTone(180, 'sawtooth', 0.1, 0.08);
              if (nextMisses >= 3) {
                setIsGameOver(true);
                handleGameOver(currentScore);
                return;
              }
            }
            fruitsRef.current.splice(i, 1);
          }
        }

        // Update Splatters
        for (let i = splattersRef.current.length - 1; i >= 0; i--) {
          const s = splattersRef.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= 0.03;
          if (s.alpha <= 0) splattersRef.current.splice(i, 1);
        }

        // Filter expired trail points
        trailRef.current = trailRef.current.filter((p) => now - p.time < 160);
      }

      // RENDER
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Splatters
      splattersRef.current.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Fruits
      fruitsRef.current.forEach((f) => {
        ctx.save();
        ctx.translate(f.x, f.y);

        if (f.sliced) {
          // Half left
          ctx.font = '24px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(f.emoji, -8, 0);
          ctx.fillText(f.emoji, 8, 0);
        } else {
          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(f.emoji, 0, 0);
        }
        ctx.restore();
      });

      // Blade Neon Slice Trail
      if (trailRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Strikes / Misses HUD
      ctx.fillStyle = '#ff0055';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`STRIKES: ${'❌ '.repeat(misses)}${'⭕ '.repeat(Math.max(0, 3 - misses))}`, 16, 26);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver, currentScore, misses]);

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
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        <canvas
          ref={canvasRef}
          width={380}
          height={480}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="max-w-full w-[350px] sm:w-[380px] aspect-[38/48] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12] cursor-crosshair touch-none"
        />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Drag mouse or swipe finger across fruits to slice! Avoid bombs 💣.
        </p>
      </div>
    </GameWrapper>
  );
};
