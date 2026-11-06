import React, { useEffect, useRef, useState } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Zap } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface EnemyCar {
  x: number;
  y: number;
  speed: number;
  color: string;
}

interface Coin {
  x: number;
  y: number;
  type: 'coin' | 'nitro';
}

export const CarRacingGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Rush Hour');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nitroActive, setNitroActive] = useState(false);

  const LANES = [80, 160, 240];
  const playerRef = useRef({
    laneIdx: 1,
    x: 160,
    y: 380,
    w: 38,
    h: 62,
    nitroTime: 0,
  });

  const trafficRef = useRef<EnemyCar[]>([]);
  const itemsRef = useRef<Coin[]>([]);
  const roadOffsetRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastSpawnRef = useRef(0);

  const restartGame = () => {
    playerRef.current = {
      laneIdx: 1,
      x: 160,
      y: 380,
      w: 38,
      h: 62,
      nitroTime: 0,
    };
    trafficRef.current = [];
    itemsRef.current = [];
    roadOffsetRef.current = 0;
    setNitroActive(false);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    restartGame();
  }, [difficulty]);

  const changeLane = (dir: -1 | 1) => {
    const nextLane = Math.max(0, Math.min(2, playerRef.current.laneIdx + dir));
    if (nextLane !== playerRef.current.laneIdx) {
      sounds.playTone(320, 'sine', 0.04, 0.06);
      playerRef.current.laneIdx = nextLane;
    }
  };

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') changeLane(-1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') changeLane(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Main canvas loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const isNitro = playerRef.current.nitroTime > 0;
      const baseSpeed = isNitro ? 11 : difficulty === 'Nitro Hyper' ? 8.5 : difficulty === 'Rush Hour' ? 6.5 : 5;

      if (!isPaused && !isGameOver) {
        if (isNitro) {
          playerRef.current.nitroTime--;
          if (playerRef.current.nitroTime <= 0) setNitroActive(false);
        }

        // Road scroll
        roadOffsetRef.current = (roadOffsetRef.current + baseSpeed) % 40;

        // Smooth steer towards lane target
        const targetX = LANES[playerRef.current.laneIdx];
        playerRef.current.x += (targetX - playerRef.current.x) * 0.25;

        // Spawn traffic
        const now = Date.now();
        const spawnDelay = isNitro ? 500 : 1100;
        if (now - lastSpawnRef.current > spawnDelay) {
          lastSpawnRef.current = now;
          const lane = Math.floor(Math.random() * 3);
          const colors = ['#f43f5e', '#a855f7', '#eab308', '#38bdf8'];
          trafficRef.current.push({
            x: LANES[lane],
            y: -80,
            speed: 2 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
          });

          // Chance to spawn coin or nitro
          if (Math.random() < 0.4) {
            const itemLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
            itemsRef.current.push({
              x: LANES[itemLane] + 10,
              y: -100,
              type: Math.random() < 0.25 ? 'nitro' : 'coin',
            });
          }
        }

        // Update traffic
        for (let i = trafficRef.current.length - 1; i >= 0; i--) {
          const car = trafficRef.current[i];
          car.y += baseSpeed - car.speed;

          // Check Collision with player
          const player = playerRef.current;
          if (
            Math.abs(player.x - car.x) < 32 &&
            Math.abs(player.y - car.y) < 52
          ) {
            if (isNitro) {
              // Destroy oncoming car if nitro active
              sounds.playExplosion();
              trafficRef.current.splice(i, 1);
              updateScore(currentScore + 50);
              continue;
            } else {
              sounds.playGameOver();
              setIsGameOver(true);
              handleGameOver(currentScore);
              return;
            }
          }

          // Offscreen
          if (car.y > height + 80) {
            trafficRef.current.splice(i, 1);
            updateScore(currentScore + 5);
          }
        }

        // Update items
        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
          const item = itemsRef.current[i];
          item.y += baseSpeed;

          // Pickup check
          const player = playerRef.current;
          if (
            Math.abs(player.x + 10 - item.x) < 28 &&
            Math.abs(player.y + 20 - item.y) < 35
          ) {
            if (item.type === 'nitro') {
              sounds.playWin();
              player.nitroTime = 180; // 3 seconds nitro
              setNitroActive(true);
              updateScore(currentScore + 30);
            } else {
              sounds.playScore();
              updateScore(currentScore + 20);
            }
            itemsRef.current.splice(i, 1);
            continue;
          }

          if (item.y > height + 30) {
            itemsRef.current.splice(i, 1);
          }
        }
      }

      // RENDER
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Road asphalt
      ctx.fillStyle = '#111522';
      ctx.fillRect(40, 0, width - 80, height);

      // Road shoulder neon lines
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(40, height);
      ctx.moveTo(width - 40, 0);
      ctx.lineTo(width - 40, height);
      ctx.stroke();

      // Lane dividers (dashed)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffsetRef.current;
      [120, 200].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw Items
      itemsRef.current.forEach((it) => {
        ctx.save();
        if (it.type === 'nitro') {
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(it.x + 9, it.y + 9, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ffdd00';
          ctx.shadowColor = '#ffdd00';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(it.x + 9, it.y + 9, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Traffic Cars
      trafficRef.current.forEach((car) => {
        ctx.save();
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(car.x, car.y, 38, 58, 6);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(car.x + 4, car.y + 12, 30, 14);
        ctx.restore();
      });

      // Draw Player Car
      const p = playerRef.current;
      ctx.save();
      ctx.fillStyle = isNitro ? '#00f0ff' : '#a855f7';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 8);
      ctx.fill();

      // Cockpit Windshield
      ctx.fillStyle = '#0a0d1a';
      ctx.fillRect(p.x + 4, p.y + 14, 30, 14);

      // Tail lights
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x + 4, p.y + p.h - 4, 8, 4);
      ctx.fillRect(p.x + p.w - 12, p.y + p.h - 4, 8, 4);

      // Nitro exhaust flames
      if (isNitro) {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(p.x + 8, p.y + p.h);
        ctx.lineTo(p.x + p.w / 2, p.y + p.h + 20);
        ctx.lineTo(p.x + p.w - 8, p.y + p.h);
        ctx.fill();
      }
      ctx.restore();

      // Nitro status
      if (isNitro) {
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('⚡ NITRO HYPERDRIVE!', 20, 30);
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
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          className="max-w-full w-[340px] sm:w-[360px] aspect-[3/4] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12]"
        />

        {/* Steering Buttons */}
        <div className="flex gap-4 mt-3">
          <button
            onPointerDown={() => changeLane(-1)}
            className="px-8 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-black text-sm active:bg-cyan-500/30"
          >
            ◀ STEER LEFT
          </button>
          <button
            onPointerDown={() => changeLane(1)}
            className="px-8 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-black text-sm active:bg-cyan-500/30"
          >
            STEER RIGHT ▶
          </button>
        </div>
      </div>
    </GameWrapper>
  );
};
