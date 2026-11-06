import React, { useState, useEffect } from 'react';
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

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_POOL = ['🎮', '🚀', '👾', '💎', '⚡', '🔥', '👑', '🛡️', '⚔️', '🤖', '🛸', '🎯'];

export const MemoryCardsGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [difficulty, setDifficulty] = useState<string>('4x4 (Normal)');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getPairCount = () => {
    switch (difficulty) {
      case '4x3 (Casual)': return 6;
      case '6x4 (Master)': return 12;
      default: return 8;
    }
  };

  const initGame = () => {
    const pairCount = getPairCount();
    const selectedEmojis = EMOJI_POOL.slice(0, pairCount);
    let cardList: Card[] = [];

    selectedEmojis.forEach((emoji, index) => {
      cardList.push({
        id: index * 2,
        pairId: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        id: index * 2 + 1,
        pairId: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    cardList = cardList.sort(() => Math.random() - 0.5);

    setCards(cardList);
    setFlippedIds([]);
    setMoves(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const handleCardClick = (card: Card) => {
    if (card.isFlipped || card.isMatched || flippedIds.length >= 2 || isPaused || isGameOver) return;

    sounds.playFlip();

    const newCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedIds, card.id];
    setCards(newCards);
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards.find((c) => c.id === newFlipped[0])!;
      const secondCard = card;

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          sounds.playSuccess();
          const matchedCards = newCards.map((c) =>
            c.id === firstCard.id || c.id === secondCard.id ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setFlippedIds([]);

          // Update Score
          const nextScore = currentScore + 25;
          updateScore(nextScore);

          // Check if all matched
          if (matchedCards.every((c) => c.isMatched)) {
            sounds.playWin();
            const bonus = Math.max(0, 300 - moves * 10);
            updateScore(nextScore + bonus);
            setIsGameOver(true);
            handleGameOver(nextScore + bonus);
          }
        }, 350);
      } else {
        // Mismatch - flip back
        setTimeout(() => {
          sounds.playTone(200, 'sawtooth', 0.08, 0.04);
          setCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const getGridColsClass = () => {
    switch (difficulty) {
      case '4x3 (Casual)': return 'grid-cols-4 max-w-sm';
      case '6x4 (Master)': return 'grid-cols-6 max-w-lg';
      default: return 'grid-cols-4 max-w-md';
    }
  };

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
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Moves Made: <span className="text-cyan-400 font-mono font-black">{moves}</span>
        </div>

        {/* Cards Grid */}
        <div className={`w-full grid ${getGridColsClass()} gap-2.5 sm:gap-3`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-3xl sm:text-4xl border transition-all duration-300 transform perspective-1000 ${
                card.isMatched
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-neon-green scale-95 opacity-80 cursor-default'
                  : card.isFlipped
                  ? 'bg-[#151a2d] border-cyan-400 shadow-neon-cyan rotate-y-180'
                  : 'bg-[#0f121d] border-cyber-border hover:border-slate-500 hover:scale-105 active:scale-95'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span>{card.emoji}</span>
              ) : (
                <span className="text-sm font-bold text-slate-600 font-mono">?</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
