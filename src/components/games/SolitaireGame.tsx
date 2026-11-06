import React, { useState, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { RefreshCw } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface SolitaireCard {
  id: number;
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  rank: number; // 1 (Ace) to 13 (King)
  faceUp: boolean;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SolitaireGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [stock, setStock] = useState<SolitaireCard[]>([]);
  const [waste, setWaste] = useState<SolitaireCard[]>([]);
  const [foundations, setFoundations] = useState<SolitaireCard[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<SolitaireCard[][]>([[], [], [], [], [], [], []]);
  const [moves, setMoves] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const initGame = () => {
    let idCounter = 0;
    const deck: SolitaireCard[] = [];

    SUITS.forEach((suit) => {
      VALUES.forEach((val, idx) => {
        deck.push({
          id: idCounter++,
          suit,
          value: val,
          rank: idx + 1,
          faceUp: false,
        });
      });
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);

    // Deal 7 columns
    const tabs: SolitaireCard[][] = [[], [], [], [], [], [], []];
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r <= c; r++) {
        const card = shuffled.pop()!;
        if (r === c) card.faceUp = true;
        tabs[c].push(card);
      }
    }

    setTableau(tabs);
    setFoundations([[], [], [], []]);
    setWaste([]);
    setStock(shuffled);
    setMoves(0);
    resetScore();
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Draw card from stock
  const drawStock = () => {
    if (isGameOver || isPaused) return;

    sounds.playFlip();
    if (stock.length > 0) {
      const nextStock = [...stock];
      const card = nextStock.pop()!;
      card.faceUp = true;
      setStock(nextStock);
      setWaste((prev) => [...prev, card]);
      setMoves((m) => m + 1);
    } else {
      // Recycle waste into stock
      if (waste.length > 0) {
        sounds.playTone(280, 'sine', 0.04, 0.05);
        const recycled = [...waste].reverse().map((c) => ({ ...c, faceUp: false }));
        setStock(recycled);
        setWaste([]);
      }
    }
  };

  const isRed = (suit: string) => suit === '♥' || suit === '♦';

  // Attempt auto-move card (to foundation or tableau)
  const tryAutoMove = (card: SolitaireCard, fromColIndex: number, fromWaste: boolean = false) => {
    if (!card.faceUp || isGameOver || isPaused) return;

    // 1. Try Foundation first
    const fIdx = SUITS.indexOf(card.suit);
    const fPile = foundations[fIdx];
    const targetRank = fPile.length === 0 ? 1 : fPile[fPile.length - 1].rank + 1;

    if (card.rank === targetRank) {
      sounds.playScore();
      const nextF = foundations.map((p, idx) => (idx === fIdx ? [...p, card] : [...p]));
      setFoundations(nextF);

      if (fromWaste) {
        setWaste((prev) => prev.slice(0, -1));
      } else {
        removeCardFromTableau(card, fromColIndex);
      }

      setMoves((m) => m + 1);
      updateScore(currentScore + 20);

      // Check Win: all 4 foundations have 13 cards (52 total)
      const totalInF = nextF.reduce((acc, p) => acc + p.length, 0);
      if (totalInF === 52) {
        sounds.playWin();
        setIsGameOver(true);
        handleGameOver(currentScore + 500);
      }
      return;
    }

    // 2. Try Tableau move
    for (let c = 0; c < 7; c++) {
      if (!fromWaste && c === fromColIndex) continue;
      const targetCol = tableau[c];

      if (targetCol.length === 0) {
        // Only King can go to empty column
        if (card.rank === 13) {
          executeTableauMove(card, fromColIndex, c, fromWaste);
          return;
        }
      } else {
        const topCard = targetCol[targetCol.length - 1];
        if (topCard.faceUp && isRed(card.suit) !== isRed(topCard.suit) && card.rank === topCard.rank - 1) {
          executeTableauMove(card, fromColIndex, c, fromWaste);
          return;
        }
      }
    }

    sounds.playTone(200, 'sawtooth', 0.04, 0.03);
  };

  const executeTableauMove = (card: SolitaireCard, fromCol: number, toCol: number, fromWaste: boolean) => {
    sounds.playTone(400, 'sine', 0.04, 0.06);

    if (fromWaste) {
      setWaste((prev) => prev.slice(0, -1));
      setTableau((prev) =>
        prev.map((col, idx) => (idx === toCol ? [...col, card] : [...col]))
      );
    } else {
      const sourceCol = tableau[fromCol];
      const cardIdx = sourceCol.findIndex((c) => c.id === card.id);
      const movingCards = sourceCol.slice(cardIdx);

      setTableau((prev) =>
        prev.map((col, idx) => {
          if (idx === fromCol) {
            const nextCol = col.slice(0, cardIdx);
            if (nextCol.length > 0) nextCol[nextCol.length - 1].faceUp = true;
            return nextCol;
          }
          if (idx === toCol) {
            return [...col, ...movingCards];
          }
          return [...col];
        })
      );
    }

    setMoves((m) => m + 1);
    updateScore(currentScore + 10);
  };

  const removeCardFromTableau = (card: SolitaireCard, colIdx: number) => {
    setTableau((prev) =>
      prev.map((col, idx) => {
        if (idx === colIdx) {
          const next = col.filter((c) => c.id !== card.id);
          if (next.length > 0) next[next.length - 1].faceUp = true;
          return next;
        }
        return [...col];
      })
    );
  };

  const renderCard = (c: SolitaireCard, onClick?: () => void) => {
    if (!c.faceUp) {
      return (
        <div
          onClick={onClick}
          className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-gradient-to-tr from-purple-900 to-indigo-950 border border-purple-500/50 shadow flex items-center justify-center text-purple-400 font-mono text-xs select-none cursor-pointer"
        >
          ♠
        </div>
      );
    }

    const red = isRed(c.suit);
    return (
      <div
        onClick={onClick}
        className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-[#0f121d] border border-cyber-border shadow p-1 flex flex-col justify-between select-none cursor-pointer hover:border-cyan-400 active:scale-95 transition-all ${
          red ? 'text-rose-500' : 'text-slate-100'
        }`}
      >
        <span className="text-[10px] sm:text-xs font-black font-mono leading-none">
          {c.value}
          <span className="text-[8px] sm:text-[10px] block">{c.suit}</span>
        </span>
        <span className="text-center text-xs sm:text-sm">{c.suit}</span>
      </div>
    );
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
    >
      <div className="w-full flex flex-col items-center justify-center p-3 select-none">
        <div className="mb-2 text-xs font-bold text-slate-400">
          Moves: <span className="text-cyan-400 font-mono font-black">{moves}</span> • Tap card to auto-move
        </div>

        {/* Top: Stock, Waste, and 4 Foundations */}
        <div className="w-full max-w-xl flex justify-between gap-2 mb-4 p-2 rounded-xl bg-[#0a0b12] border border-cyber-border">
          {/* Stock & Waste */}
          <div className="flex gap-2">
            {/* Stock */}
            <div
              onClick={drawStock}
              className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg border border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-cyan-400"
            >
              {stock.length > 0 ? (
                renderCard(stock[stock.length - 1])
              ) : (
                <RefreshCw className="w-4 h-4 text-slate-600" />
              )}
            </div>

            {/* Waste */}
            <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
              {waste.length > 0 &&
                renderCard(waste[waste.length - 1], () =>
                  tryAutoMove(waste[waste.length - 1], -1, true)
                )}
            </div>
          </div>

          {/* 4 Foundations */}
          <div className="flex gap-1.5">
            {foundations.map((pile, idx) => (
              <div
                key={idx}
                className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg border border-dashed border-slate-700 flex items-center justify-center relative bg-[#0e111a]"
              >
                {pile.length > 0 ? (
                  renderCard(pile[pile.length - 1])
                ) : (
                  <span className="text-slate-600 text-xs">{SUITS[idx]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau 7 Columns */}
        <div className="w-full max-w-xl grid grid-cols-7 gap-1 sm:gap-2 min-h-[220px]">
          {tableau.map((col, cIdx) => (
            <div key={cIdx} className="flex flex-col items-center min-h-[140px] relative">
              {col.length === 0 ? (
                <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg border border-dashed border-slate-800" />
              ) : (
                col.map((c, rIdx) => (
                  <div
                    key={c.id}
                    style={{ marginTop: rIdx === 0 ? 0 : -32 }}
                    className="z-10"
                  >
                    {renderCard(c, () => tryAutoMove(c, cIdx, false))}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
