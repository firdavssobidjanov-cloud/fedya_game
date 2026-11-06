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

export const PongGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('Challenger');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const PADDLE_H = 70;
  const PADDLE_W = 10;

  const playerRef = useRef({ y: 125, speed: 6.5 });
  const aiRef = useRef({ y: 125, speed: 4.5 });
  const ballRef = useRef({ x: 200, y: 160, vx: 4, vy: 2.5, radius: 7 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const rallyRef = useRef(0);

  // Sync refs to avoid re-triggering requestAnimationFrame loop
  const isGameOverRef = useRef(false);
  const isPausedRef = useRef(false);
  const difficultyRef = useRef(difficulty);
  const scoresRef = useRef({ player: 0, ai: 0, current: 0 });

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    scoresRef.current.current = currentScore;
  }, [currentScore]);

  const getAiSpeed = () => {
    switch (difficultyRef.current) {
      case 'Casual': return 3.2;
      case 'Master AI': return 5.8;
      default: return 4.5;
    }
  };

  const resetBall = (towardsPlayer: boolean) => {
    ballRef.current = {
      x: 200,
      y: 160,
      vx: (towardsPlayer ? -1 : 1) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 7,
    };
    rallyRef.current = 0;
  };

  const restartGame = () => {
    scoresRef.current.player = 0;
    scoresRef.current.ai = 0;
    setPlayerScore(0);
    setAiScore(0);
    playerRef.current.y = 125;
    aiRef.current.y = 125;
    resetBall(true);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  // Keyboard controls
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

  // Pointer / Touch move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const clientY = (e.clientY - rect.top) * scaleY;
    playerRef.current.y = Math.max(0, Math.min(canvas.height - PADDLE_H, clientY - PADDLE_H / 2));
  };

  // Main 60 FPS animation loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      if (!isPausedRef.current && !isGameOverRef.current) {
        const player = playerRef.current;
        const ai = aiRef.current;
        const ball = ballRef.current;

        // Player keyboard move
        if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
          player.y = Math.max(0, player.y - player.speed);
        }
        if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
          player.y = Math.min(height - PADDLE_H, player.y + player.speed);
        }

        // AI movement
        const aiCenter = ai.y + PADDLE_H / 2;
        const aiSpeed = getAiSpeed();
        if (aiCenter < ball.y - 10) {
          ai.y = Math.min(height - PADDLE_H, ai.y + aiSpeed);
        } else if (aiCenter > ball.y + 10) {
          ai.y = Math.max(0, ai.y - aiSpeed);
        }

        // Ball movement
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top / Bottom wall bounce
        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = Math.abs(ball.vy);
          sounds.playTone(280, 'triangle', 0.03, 0.05);
        } else if (ball.y + ball.radius >= height) {
          ball.y = height - ball.radius;
          ball.vy = -Math.abs(ball.vy);
          sounds.playTone(280, 'triangle', 0.03, 0.05);
        }

        // Player paddle bounce (Left side at x = 20)
        if (
          ball.x - ball.radius <= 20 + PADDLE_W &&
          ball.x + ball.radius >= 20 &&
          ball.y >= player.y &&
          ball.y <= player.y + PADDLE_H &&
          ball.vx < 0
        ) {
          ball.vx = Math.min(9, -ball.vx * 1.05);
          const hitPos = (ball.y - (player.y + PADDLE_H / 2)) / (PADDLE_H / 2);
          ball.vy = hitPos * 5;
          sounds.playTone(520, 'sine', 0.04, 0.08);
          rallyRef.current++;
          const nextScore = scoresRef.current.current + 2;
          scoresRef.current.current = nextScore;
          updateScore(nextScore);
        }

        // AI paddle bounce (Right side at x = width - 20 - PADDLE_W)
        const aiX = width - 20 - PADDLE_W;
        if (
          ball.x + ball.radius >= aiX &&
          ball.x - ball.radius <= aiX + PADDLE_W &&
          ball.y >= ai.y &&
          ball.y <= ai.y + PADDLE_H &&
          ball.vx > 0
        ) {
          ball.vx = -Math.abs(ball.vx);
          const hitPos = (ball.y - (ai.y + PADDLE_H / 2)) / (PADDLE_H / 2);
          ball.vy = hitPos * 5;
          sounds.playTone(400, 'sine', 0.04, 0.08);
        }

        // Scoring Left (AI scored)
        if (ball.x < -15) {
          sounds.playTone(180, 'sawtooth', 0.1, 0.08);
          scoresRef.current.ai += 1;
          const nextAI = scoresRef.current.ai;
          setAiScore(nextAI);
          if (nextAI >= 7) {
            sounds.playGameOver();
            isGameOverRef.current = true;
            setIsGameOver(true);
            handleGameOver(scoresRef.current.current);
          } else {
            resetBall(true);
          }
        }

        // Scoring Right (Player scored)
        if (ball.x > width + 15) {
          sounds.playScore();
          scoresRef.current.player += 1;
          const nextP = scoresRef.current.player;
          setPlayerScore(nextP);
          const nextScore = scoresRef.current.current + 20;
          scoresRef.current.current = nextScore;
          updateScore(nextScore);

          if (nextP >= 7) {
            sounds.playWin();
            isGameOverRef.current = true;
            setIsGameOver(true);
            handleGameOver(nextScore + 100);
          } else {
            resetBall(false);
          }
        }
      }

      // RENDER
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Center court dotted line
      ctx.strokeStyle = '#1e2438';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores display
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${scoresRef.current.player}`, width / 4, 50);

      ctx.fillStyle = '#ff007f';
      ctx.fillText(`${scoresRef.current.ai}`, (width * 3) / 4, 50);

      // Player Paddle
      ctx.save();
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(20, playerRef.current.y, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.restore();

      // AI Paddle
      ctx.save();
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(width - 20 - PADDLE_W, aiRef.current.y, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.restore();

      // Ball
      const ball = ballRef.current;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

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
          width={400}
          height={320}
          onPointerMove={handlePointerMove}
          className="max-w-full w-[360px] sm:w-[400px] aspect-[4/3] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12] cursor-ns-resize touch-none"
        />
        <div className="flex gap-4 mt-3">
          <button
            onPointerDown={() => {
              playerRef.current.y = Math.max(0, playerRef.current.y - 35);
            }}
            className="px-6 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-bold active:bg-cyan-500/30"
          >
            ▲ UP
          </button>
          <button
            onPointerDown={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                playerRef.current.y = Math.min(canvas.height - PADDLE_H, playerRef.current.y + 35);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-cyan-400 font-bold active:bg-cyan-500/30"
          >
            ▼ DOWN
          </button>
        </div>
      </div>
    </GameWrapper>
  );
};
