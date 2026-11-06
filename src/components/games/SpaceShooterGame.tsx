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

interface Bullet {
  x: number;
  y: number;
  isEnemy?: boolean;
}

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

export const SpaceShooterGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Normal');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lives, setLives] = useState(3);

  const playerRef = useRef({
    x: 180,
    y: 440,
    w: 36,
    h: 36,
    speed: 6,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotRef = useRef<number>(0);
  const waveRef = useRef<number>(1);
  const enemyDirRef = useRef<number>(1);

  const spawnWave = () => {
    const rows = 4;
    const cols = 7;
    const list: Enemy[] = [];
    const colors = ['#ec4899', '#a855f7', '#06b6d4', '#10b981'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: 35 + c * 45,
          y: 40 + r * 35,
          w: 28,
          h: 22,
          hp: r === 0 ? 2 : 1,
          color: colors[r % colors.length],
        });
      }
    }
    enemiesRef.current = list;
  };

  const restartGame = () => {
    playerRef.current.x = 180;
    bulletsRef.current = [];
    particlesRef.current = [];
    waveRef.current = 1;
    setLives(3);
    spawnWave();
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    spawnWave();
  }, []);

  // Fire laser
  const fireLaser = () => {
    if (isGameOver || isPaused) return;
    const now = Date.now();
    if (now - lastShotRef.current > 200) {
      lastShotRef.current = now;
      sounds.playLaser();
      bulletsRef.current.push({
        x: playerRef.current.x + playerRef.current.w / 2,
        y: playerRef.current.y,
      });
    }
  };

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        fireLaser();
      }
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
  }, [isGameOver, isPaused]);

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
        const player = playerRef.current;

        // Player movement
        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
          player.x = Math.max(10, player.x - player.speed);
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
          player.x = Math.min(width - player.w - 10, player.x + player.speed);
        }

        // Bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          if (b.isEnemy) {
            b.y += 4;
            // Check hit player
            if (
              b.x > player.x &&
              b.x < player.x + player.w &&
              b.y > player.y &&
              b.y < player.y + player.h
            ) {
              sounds.playHit();
              bulletsRef.current.splice(i, 1);
              const nextLives = lives - 1;
              setLives(nextLives);
              if (nextLives <= 0) {
                setIsGameOver(true);
                handleGameOver(currentScore);
                return;
              }
              continue;
            }
          } else {
            b.y -= 7;
            // Check hit enemy
            let hit = false;
            for (let e = enemiesRef.current.length - 1; e >= 0; e--) {
              const enemy = enemiesRef.current[e];
              if (
                b.x > enemy.x &&
                b.x < enemy.x + enemy.w &&
                b.y > enemy.y &&
                b.y < enemy.y + enemy.h
              ) {
                hit = true;
                enemy.hp--;
                sounds.playTone(500, 'square', 0.04, 0.06);

                if (enemy.hp <= 0) {
                  sounds.playExplosion();
                  updateScore(currentScore + 20);

                  // Explosion particles
                  for (let p = 0; p < 8; p++) {
                    particlesRef.current.push({
                      x: enemy.x + enemy.w / 2,
                      y: enemy.y + enemy.h / 2,
                      vx: (Math.random() - 0.5) * 5,
                      vy: (Math.random() - 0.5) * 5,
                      color: enemy.color,
                      alpha: 1,
                    });
                  }
                  enemiesRef.current.splice(e, 1);
                }
                break;
              }
            }
            if (hit) {
              bulletsRef.current.splice(i, 1);
              continue;
            }
          }

          if (b.y < -10 || b.y > height + 10) {
            bulletsRef.current.splice(i, 1);
          }
        }

        // Enemies movement
        let switchDir = false;
        const enemySpeed = difficulty === 'Hardcore' ? 1.6 : difficulty === 'Veteran' ? 1.2 : 0.8;

        enemiesRef.current.forEach((en) => {
          en.x += enemyDirRef.current * enemySpeed;
          if (en.x <= 10 || en.x + en.w >= width - 10) {
            switchDir = true;
          }
          // Enemy reach bottom = Game Over
          if (en.y + en.h >= player.y) {
            setIsGameOver(true);
            handleGameOver(currentScore);
          }

          // Random enemy fire
          if (Math.random() < 0.003) {
            bulletsRef.current.push({
              x: en.x + en.w / 2,
              y: en.y + en.h,
              isEnemy: true,
            });
          }
        });

        if (switchDir) {
          enemyDirRef.current = -enemyDirRef.current;
          enemiesRef.current.forEach((en) => {
            en.y += 12;
          });
        }

        // Wave clear
        if (enemiesRef.current.length === 0) {
          sounds.playWin();
          waveRef.current++;
          updateScore(currentScore + 150);
          spawnWave();
        }

        // Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.04;
          if (p.alpha <= 0) particlesRef.current.splice(i, 1);
        }
      }

      // RENDER
      ctx.fillStyle = '#080911';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let s = 0; s < 25; s++) {
        const sx = (s * 41) % width;
        const sy = (s * 53 + Date.now() * 0.05) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Enemies
      enemiesRef.current.forEach((en) => {
        ctx.save();
        ctx.fillStyle = en.color;
        ctx.shadowColor = en.color;
        ctx.shadowBlur = 8;
        // Alien polygon
        ctx.beginPath();
        ctx.moveTo(en.x + en.w / 2, en.y);
        ctx.lineTo(en.x + en.w, en.y + en.h / 2);
        ctx.lineTo(en.x + en.w * 0.8, en.y + en.h);
        ctx.lineTo(en.x + en.w * 0.2, en.y + en.h);
        ctx.lineTo(en.x, en.y + en.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Draw Bullets
      bulletsRef.current.forEach((b) => {
        ctx.save();
        if (b.isEnemy) {
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 8;
          ctx.fillRect(b.x - 2, b.y, 4, 10);
        } else {
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;
          ctx.fillRect(b.x - 2, b.y, 4, 12);
        }
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.restore();
      });

      // Draw Player Ship
      const player = playerRef.current;
      ctx.save();
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.lineTo(player.x + player.w / 2, player.y + player.h - 8);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Top HUD
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`LIVES: ${'🚀 '.repeat(lives)}`, 12, 20);
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`WAVE: ${waveRef.current}`, width - 75, 20);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver, currentScore, lives, difficulty]);

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
          width={380}
          height={490}
          className="max-w-full w-[350px] sm:w-[380px] aspect-[38/49] rounded-xl border border-cyber-border shadow-2xl bg-[#080911]"
        />

        <div className="w-full max-w-sm mt-3">
          <VirtualControls
            onDirection={(dir) => {
              if (dir === 'LEFT') playerRef.current.x = Math.max(10, playerRef.current.x - 25);
              if (dir === 'RIGHT') playerRef.current.x = Math.min(380 - playerRef.current.w - 10, playerRef.current.x + 25);
            }}
            onAction={fireLaser}
            showDpad={true}
            showAction={true}
            actionLabel="FIRE"
          />
        </div>
      </div>
    </GameWrapper>
  );
};
