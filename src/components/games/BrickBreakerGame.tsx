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

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  hp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

export const BrickBreakerGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);

  const paddleRef = useRef({
    x: 160,
    y: 440,
    w: 80,
    h: 12,
    speed: 7,
  });

  const ballRef = useRef({
    x: 200,
    y: 420,
    radius: 7,
    dx: 3.5,
    dy: -3.5,
    speed: 5,
  });

  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const initBricks = () => {
    const rows = 5;
    const cols = 7;
    const brickW = 46;
    const brickH = 16;
    const padding = 6;
    const offsetLeft = 18;
    const offsetTop = 40;

    const colors = ['#ff007f', '#a855f7', '#00f0ff', '#00ff66', '#ffdd00'];
    const newBricks: Brick[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newBricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: colors[r % colors.length],
          points: (rows - r) * 10,
          hp: 1,
        });
      }
    }
    bricksRef.current = newBricks;
  };

  const restartGame = () => {
    paddleRef.current.w = 80;
    paddleRef.current.x = 160;
    ballRef.current = {
      x: 200,
      y: 420,
      radius: 7,
      dx: 3.5 * (Math.random() > 0.5 ? 1 : -1),
      dy: -3.5,
      speed: 5,
    };
    initBricks();
    particlesRef.current = [];
    livesRef.current = 3;
    setLives(3);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    initBricks();
  }, []);

  // Keyboard handlers
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

  // Touch & Mouse paddle movement
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    paddleRef.current.x = Math.max(0, Math.min(canvas.width - paddleRef.current.w, clientX - paddleRef.current.w / 2));
  };

  // Main game loop
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
        const paddle = paddleRef.current;
        const ball = ballRef.current;

        // Move paddle via keys
        if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
          paddle.x = Math.max(0, paddle.x - paddle.speed);
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
          paddle.x = Math.min(width - paddle.w, paddle.x + paddle.speed);
        }

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collisions (Left & Right)
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.dx = Math.abs(ball.dx);
          sounds.playTone(300, 'triangle', 0.04, 0.05);
        } else if (ball.x + ball.radius >= width) {
          ball.x = width - ball.radius;
          ball.dx = -Math.abs(ball.dx);
          sounds.playTone(300, 'triangle', 0.04, 0.05);
        }

        // Top wall collision
        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.dy = Math.abs(ball.dy);
          sounds.playTone(320, 'triangle', 0.04, 0.05);
        }

        // Paddle collision
        if (
          ball.y + ball.radius >= paddle.y &&
          ball.y - ball.radius <= paddle.y + paddle.h &&
          ball.x >= paddle.x &&
          ball.x <= paddle.x + paddle.w &&
          ball.dy > 0
        ) {
          const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const angle = hitPos * (Math.PI / 3);
          const speed = Math.hypot(ball.dx, ball.dy);
          ball.dx = speed * Math.sin(angle);
          ball.dy = -speed * Math.cos(angle);
          sounds.playTone(450, 'sine', 0.05, 0.08);
        }

        // Bottom collision (Lose Life)
        if (ball.y - ball.radius > height) {
          sounds.playHit();
          livesRef.current -= 1;
          const remaining = livesRef.current;
          setLives(remaining);

          if (remaining <= 0) {
            setIsGameOver(true);
            handleGameOver(currentScore);
            return;
          } else {
            ball.x = paddle.x + paddle.w / 2;
            ball.y = paddle.y - 15;
            ball.dx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -3.5;
          }
        }

        // Brick collisions
        for (let i = bricksRef.current.length - 1; i >= 0; i--) {
          const b = bricksRef.current[i];
          if (
            ball.x + ball.radius > b.x &&
            ball.x - ball.radius < b.x + b.w &&
            ball.y + ball.radius > b.y &&
            ball.y - ball.radius < b.y + b.h
          ) {
            ball.dy = -ball.dy;
            sounds.playTone(600 + Math.random() * 200, 'square', 0.05, 0.08);
            updateScore(currentScore + b.points);

            // Spawn particles
            for (let p = 0; p < 8; p++) {
              particlesRef.current.push({
                x: b.x + b.w / 2,
                y: b.y + b.h / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: b.color,
                alpha: 1,
              });
            }

            bricksRef.current.splice(i, 1);

            // Win check / Respawn next wave
            if (bricksRef.current.length === 0) {
              sounds.playWin();
              updateScore(currentScore + 200);
              initBricks();
              ball.x = 200;
              ball.y = 400;
              ball.dy = -4;
            }
            break;
          }
        }

        // Update particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.04;
          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }
      }

      // DRAWING
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Draw Bricks
      bricksRef.current.forEach((b) => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();
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

      // Draw Paddle
      const paddle = paddleRef.current;
      ctx.save();
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
      ctx.fill();
      ctx.restore();

      // Draw Ball
      const ball = ballRef.current;
      ctx.save();
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Lives indicator
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`LIVES: ${'❤️ '.repeat(Math.max(0, livesRef.current))}`, 14, 20);

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
          width={380}
          height={480}
          onPointerMove={handlePointerMove}
          className="max-w-full w-[350px] sm:w-[380px] aspect-[38/48] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12] cursor-ew-resize touch-none"
        />
        <div className="flex items-center gap-4 mt-3">
          <button
            onPointerDown={() => {
              paddleRef.current.x = Math.max(0, paddleRef.current.x - 30);
            }}
            className="px-5 py-2 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-bold active:bg-cyan-500/30"
          >
            ◀ LEFT
          </button>
          <button
            onPointerDown={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                paddleRef.current.x = Math.min(canvas.width - paddleRef.current.w, paddleRef.current.x + 30);
              }
            }}
            className="px-5 py-2 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-bold active:bg-cyan-500/30"
          >
            RIGHT ▶
          </button>
        </div>
      </div>
    </GameWrapper>
  );
};
