import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getHighScore, saveHighScore, recordGamePlayed, checkAchievement, getStoredProfile, saveProfile } from '../lib/storage';
import { sounds } from '../lib/sounds';

export function useGameStats(gameId: string) {
  const [highScore, setHighScore] = useState<number>(() => getHighScore(gameId));
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Track playtime while game is active
  useEffect(() => {
    recordGamePlayed(gameId);

    const interval = window.setInterval(() => {
      const profile = getStoredProfile();
      profile.totalPlayTime += 1;
      saveProfile(profile);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameId]);

  const updateScore = (newScore: number) => {
    setCurrentScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      setIsNewRecord(true);
      saveHighScore(gameId, newScore);
    }
  };

  const handleGameOver = (finalScore: number) => {
    const isRecord = saveHighScore(gameId, finalScore);
    if (isRecord) {
      setIsNewRecord(true);
      setHighScore(finalScore);
      sounds.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#a855f7', '#ff007f', '#00ff66', '#ffdd00'],
        });
      } catch (e) {}
    } else {
      sounds.playGameOver();
    }

    // Check achievement milestones
    if (finalScore >= 100) checkAchievement('century');
    if (finalScore >= 1000) checkAchievement('high_roller');
  };

  const resetScore = () => {
    setCurrentScore(0);
    setIsNewRecord(false);
  };

  return {
    currentScore,
    highScore,
    isNewRecord,
    updateScore,
    handleGameOver,
    resetScore,
  };
}

