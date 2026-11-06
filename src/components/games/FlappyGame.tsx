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

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export const FlappyGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Bird physics
  const birdRef = useRef({
    x: 80,
    y: 200,
    radius: 14,
    velocity: 0,
    gravity: 0.42,
    jump: -6.8,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef(0);

  const restartGame = () => {
    birdRef.current.y = 200;
    birdRef.current.velocity = 0;
    pipesRef.current = [];
    frameCountRef.current = 0;
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  const jump = () => {
    if (isGameOver) {
      restartGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    birdRef.current.velocity = birdRef.current.jump;
    sounds.playJump();
  };

  // Keyboard Space listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, gameStarted]);

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
      const GAP = 120;
      const PIPE_WIDTH = 52;
      const PIPE_SPEED = 2.4;

      if (gameStarted && !isPaused && !isGameOver) {
        frameCountRef.current++;

        // Bird physics
        birdRef.current.velocity += birdRef.current.gravity;
        birdRef.current.y += birdRef.current.velocity;

        // Ground / Ceiling collision
        if (birdRef.current.y + birdRef.current.radius >= height - 30 || birdRef.current.y - birdRef.current.radius <= 0) {
          setIsGameOver(true);
          handleGameOver(currentScore);
          return;
        }

        // Spawn pipes every 90 frames
        if (frameCountRef.current % 85 === 0) {
          const minH = 50;
          const maxH = height - GAP - minH - 30;
          const topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
          const bottomH = height - 30 - topH - GAP;

          pipesRef.current.push({
            x: width,
            topHeight: topH,
            bottomHeight: bottomH,
            passed: false,
          });
        }

        // Update & check pipes
        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const p = pipesRef.current[i];
          p.x -= PIPE_SPEED;

          // Check if passed bird
          if (!p.passed && p.x + PIPE_WIDTH < birdRef.current.x) {
            p.passed = true;
            sounds.playScore();
            updateScore(currentScore + 1);
          }

          // Pipe Collision check (AABB with circle)
          const bird = birdRef.current;
          if (
            bird.x + bird.radius > p.x &&
            bird.x - bird.radius < p.x + PIPE_WIDTH
          ) {
            // Check top pipe or bottom pipe hit
            if (bird.y - bird.radius < p.topHeight || bird.y + bird.radius > height - 30 - p.bottomHeight) {
              setIsGameOver(true);
              handleGameOver(currentScore);
              return;
            }
          }

          // Remove offscreen
          if (p.x + PIPE_WIDTH < -10) {
            pipesRef.current.splice(i, 1);
          }
        }
      }

      // DRAWING
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0d1a');
      bgGrad.addColorStop(1, '#151b33');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 0; s < 15; s++) {
        const sx = ((s * 37 + frameCountRef.current * 0.2) % width);
        const sy = (s * 23) % (height - 50);
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Draw Pipes
      pipesRef.current.forEach((p) => {
        // Top pipe
        ctx.save();
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        ctx.fillStyle = '#0891b2';
        ctx.fillRect(p.x - 3, p.topHeight - 14, PIPE_WIDTH + 6, 14);

        // Bottom pipe
        const bottomY = height - 30 - p.bottomHeight;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.x, bottomY, PIPE_WIDTH, p.bottomHeight);
        ctx.fillStyle = '#0891b2';
        ctx.fillRect(p.x - 3, bottomY, PIPE_WIDTH + 6, 14);
        ctx.restore();
      });

      // Draw Ground
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, height - 30, width, 30);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      ctx.lineTo(width, height - 30);
      ctx.stroke();

      // Draw Bird
      const bird = birdRef.current;
      ctx.save();
      ctx.translate(bird.x, bird.y);

      // Rotation based on velocity
      const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.velocity * 4 * Math.PI) / 180));
      ctx.rotate(rotation);

      // Bird body glow
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(-4, 2, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0b12';
      ctx.beginPath();
      ctx.arc(8, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(18, 2);
      ctx.lineTo(10, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Initial Tap to Start prompt
      if (!gameStarted && !isGameOver) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.fillText('TAP OR PRESS SPACE TO FLY', width / 2, height / 2 + 50);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, isPaused, isGameOver, currentScore]);

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
      <div
        onClick={jump}
        className="w-full flex flex-col items-center justify-center p-3 cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          className="max-w-full w-[340px] sm:w-[360px] aspect-[3/4] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0d1a]"
        />
        <p className="text-xs text-slate-400 mt-3 font-medium">
          Tap screen or press Spacebar to flap wings
        </p>
      </div>
    </GameWrapper>
  );
};
