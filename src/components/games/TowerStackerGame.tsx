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

interface Block {
  x: number;
  y: number;
  width: number;
  color: string;
}

export const TowerStackerGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [perfectCombo, setPerfectCombo] = useState(0);

  const BLOCK_HEIGHT = 20;
  const BASE_Y = 400;

  const stackRef = useRef<Block[]>([]);
  const currentBlockRef = useRef<{
    x: number;
    width: number;
    speed: number;
    dir: number;
  }>({
    x: 0,
    width: 140,
    speed: 3.5,
    dir: 1,
  });

  const cameraYRef = useRef<number>(0);

  const getColor = (index: number) => {
    const hue = (index * 24) % 360;
    return `hsl(${hue}, 85%, 60%)`;
  };

  const restartGame = () => {
    stackRef.current = [
      {
        x: 120,
        y: BASE_Y,
        width: 140,
        color: getColor(0),
      },
    ];
    currentBlockRef.current = {
      x: 0,
      width: 140,
      speed: 3.5,
      dir: 1,
    };
    cameraYRef.current = 0;
    setPerfectCombo(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    restartGame();
  }, []);

  const placeBlock = () => {
    if (isGameOver || isPaused) return;

    const stack = stackRef.current;
    const topPlaced = stack[stack.length - 1];
    const current = currentBlockRef.current;

    const diff = current.x - topPlaced.x;
    const tolerance = 4; // Perfect placement threshold

    if (Math.abs(diff) <= tolerance) {
      // PERFECT placement!
      sounds.playScore();
      current.x = topPlaced.x; // Snap to align
      setPerfectCombo((c) => c + 1);

      stack.push({
        x: current.x,
        y: BASE_Y - stack.length * BLOCK_HEIGHT,
        width: current.width,
        color: getColor(stack.length),
      });

      const nextScore = currentScore + 25;
      updateScore(nextScore);
    } else if (Math.abs(diff) >= topPlaced.width) {
      // Completely missed!
      sounds.playGameOver();
      setIsGameOver(true);
      handleGameOver(currentScore);
      return;
    } else {
      // Trim overhanging edge
      sounds.playTone(400, 'triangle', 0.05, 0.08);
      setPerfectCombo(0);

      let newWidth = topPlaced.width - Math.abs(diff);
      let newX = diff > 0 ? current.x : topPlaced.x;

      stack.push({
        x: newX,
        y: BASE_Y - stack.length * BLOCK_HEIGHT,
        width: newWidth,
        color: getColor(stack.length),
      });

      current.width = newWidth;
      const nextScore = currentScore + 10;
      updateScore(nextScore);
    }

    // Set speed for next moving layer
    current.x = 0;
    current.dir = 1;
    current.speed = Math.min(7.5, 3.5 + stack.length * 0.12);

    // Scroll camera up if tower gets high
    const targetCamY = Math.max(0, (stack.length - 8) * BLOCK_HEIGHT);
    cameraYRef.current = targetCamY;
  };

  // Keyboard Space
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        placeBlock();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGameOver, isPaused, currentScore]);

  // Main canvas animation
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
        const cur = currentBlockRef.current;
        cur.x += cur.dir * cur.speed;
        if (cur.x <= 0) {
          cur.x = 0;
          cur.dir = 1;
        } else if (cur.x + cur.width >= width) {
          cur.x = width - cur.width;
          cur.dir = -1;
        }
      }

      // RENDER
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(0, cameraYRef.current);

      // Draw Stack
      stackRef.current.forEach((b) => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();
        ctx.restore();
      });

      // Draw Current Moving Block
      if (!isGameOver) {
        const cur = currentBlockRef.current;
        const curY = BASE_Y - stackRef.current.length * BLOCK_HEIGHT;
        const curColor = getColor(stackRef.current.length);

        ctx.save();
        ctx.fillStyle = curColor;
        ctx.shadowColor = curColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(cur.x, curY, cur.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // Top HUD: Height count
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`FLOOR: ${stackRef.current.length}`, 16, 24);

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
      <div
        onClick={placeBlock}
        className="w-full flex flex-col items-center justify-center p-3 select-none cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={480}
          className="max-w-full w-[350px] sm:w-[380px] aspect-[38/48] rounded-xl border border-cyber-border shadow-2xl bg-[#0a0b12]"
        />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Tap screen or press Spacebar to place the moving block!
        </p>
      </div>
    </GameWrapper>
  );
};
