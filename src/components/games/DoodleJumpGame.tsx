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

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  hasSpring?: boolean;
}

export const DoodleJumpGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const heroRef = useRef({
    x: 170,
    y: 350,
    w: 24,
    h: 30,
    vx: 0,
    vy: -9,
    gravity: 0.32,
    jumpPower: -9.5,
  });

  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const maxHeightRef = useRef<number>(0);

  const initPlatforms = (width: number, height: number) => {
    const list: Platform[] = [];
    // Base platform
    list.push({ x: 140, y: height - 40, w: 90, h: 12 });

    let currentY = height - 100;
    while (currentY > -100) {
      list.push({
        x: Math.random() * (width - 70),
        y: currentY,
        w: 65,
        h: 12,
        hasSpring: Math.random() < 0.15,
      });
      currentY -= 65 + Math.random() * 20;
    }
    platformsRef.current = list;
  };

  const restartGame = () => {
    heroRef.current = {
      x: 170,
      y: 350,
      w: 24,
      h: 30,
      vx: 0,
      vy: -9,
      gravity: 0.32,
      jumpPower: -9.5,
    };
    maxHeightRef.current = 0;
    initPlatforms(360, 480);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    restartGame();
  }, []);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
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

      if (!isPaused && !isGameOver) {
        const hero = heroRef.current;

        // Left / Right steering
        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
          hero.vx = -4.5;
        } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
          hero.vx = 4.5;
        } else {
          hero.vx *= 0.85; // Drag
        }

        hero.x += hero.vx;

        // Screen wrap
        if (hero.x < -hero.w) hero.x = width;
        if (hero.x > width) hero.x = -hero.w;

        // Gravity
        hero.vy += hero.gravity;
        hero.y += hero.vy;

        // Platform collisions (only when falling downward!)
        if (hero.vy > 0) {
          platformsRef.current.forEach((plat) => {
            if (
              hero.x + hero.w > plat.x &&
              hero.x < plat.x + plat.w &&
              hero.y + hero.h >= plat.y &&
              hero.y + hero.h <= plat.y + 14
            ) {
              if (plat.hasSpring) {
                sounds.playWin();
                hero.vy = -15; // Super spring bounce
              } else {
                sounds.playJump();
                hero.vy = hero.jumpPower;
              }
            }
          });
        }

        // Camera scroll up if hero climbs past upper half
        if (hero.y < height / 2) {
          const delta = height / 2 - hero.y;
          hero.y = height / 2;
          maxHeightRef.current += Math.round(delta);
          updateScore(maxHeightRef.current);

          // Shift all platforms down
          platformsRef.current.forEach((p) => {
            p.y += delta;
          });

          // Recycle platforms that dropped below screen
          platformsRef.current = platformsRef.current.filter((p) => p.y < height + 20);

          // Add new platforms at top
          while (platformsRef.current.length < 9) {
            const topMostY = Math.min(...platformsRef.current.map((p) => p.y));
            platformsRef.current.push({
              x: Math.random() * (width - 70),
              y: topMostY - (60 + Math.random() * 25),
              w: 65,
              h: 12,
              hasSpring: Math.random() < 0.15,
            });
          }
        }

        // Fall death
        if (hero.y > height + 40) {
          sounds.playGameOver();
          setIsGameOver(true);
          handleGameOver(maxHeightRef.current);
          return;
        }
      }

      // RENDER
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let s = 0; s < 20; s++) {
        const sx = (s * 39) % width;
        const sy = (s * 47 + maxHeightRef.current * 0.2) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Platforms
      platformsRef.current.forEach((p) => {
        ctx.save();
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();

        // Spring
        if (p.hasSpring) {
          ctx.fillStyle = '#ffdd00';
          ctx.fillRect(p.x + p.w / 2 - 6, p.y - 8, 12, 8);
        }
        ctx.restore();
      });

      // Draw Hero (Cyber Jumper Astronaut)
      const hero = heroRef.current;
      ctx.save();
      ctx.translate(hero.x + hero.w / 2, hero.y + hero.h / 2);

      // Glow
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 14;

      // Body capsule
      ctx.beginPath();
      ctx.roundRect(-hero.w / 2, -hero.h / 2, hero.w, hero.h, 10);
      ctx.fill();

      // Visor
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(hero.vx >= 0 ? 3 : -3, -4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Thruster flame when jumping
      if (hero.vy < 0) {
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.beginPath();
        ctx.moveTo(-5, hero.h / 2);
        ctx.lineTo(0, hero.h / 2 + 10);
        ctx.lineTo(5, hero.h / 2);
        ctx.fill();
      }
      ctx.restore();

      // Height Meter HUD
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`ALTITUDE: ${maxHeightRef.current}m`, 16, 24);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver, currentScore]);

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
          width={360}
          height={480}
          className="max-w-full w-[340px] sm:w-[360px] aspect-[3/4] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12]"
        />

        {/* Mobile Left / Right Buttons */}
        <div className="flex gap-4 mt-3">
          <button
            onPointerDown={() => {
              heroRef.current.vx = -5.5;
            }}
            onPointerUp={() => {
              heroRef.current.vx = 0;
            }}
            className="px-8 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-black text-sm active:bg-cyan-500/30"
          >
            ◀ LEFT
          </button>
          <button
            onPointerDown={() => {
              heroRef.current.vx = 5.5;
            }}
            onPointerUp={() => {
              heroRef.current.vx = 0;
            }}
            className="px-8 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-black text-sm active:bg-cyan-500/30"
          >
            RIGHT ▶
          </button>
        </div>
      </div>
    </GameWrapper>
  );
};
