import React, { useState, useEffect } from 'react';
import { GameWrapper } from '../GameWrapper';
import { GameDefinition } from '../../lib/gamesCatalog';
import { Language } from '../../lib/translations';
import { useGameStats } from '../../hooks/useGameStats';
import { sounds } from '../../lib/sounds';
import { Coins, Plus, ShieldCheck } from 'lucide-react';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  num: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const BlackjackGame: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  const { currentScore, highScore, updateScore, handleGameOver, resetScore } = useGameStats(game.id);

  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [chips, setChips] = useState<number>(500);
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [gameState, setGameState] = useState<'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'ROUND_OVER'>('BETTING');
  const [resultMessage, setResultMessage] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const createDeck = (): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const val of VALUES) {
        let num = parseInt(val, 10);
        if (['J', 'Q', 'K'].includes(val)) num = 10;
        if (val === 'A') num = 11;
        newDeck.push({ suit, value: val, num });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateHand = (hand: Card[]): number => {
    let total = hand.reduce((acc, c) => acc + c.num, 0);
    let aces = hand.filter((c) => c.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const startRound = () => {
    if (chips < currentBet) return;

    sounds.playTone(400, 'sine', 0.04, 0.06);
    const d = createDeck();
    const pHand = [d.pop()!, d.pop()!];
    const dHand = [d.pop()!, d.pop()!];

    setDeck(d);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setChips((prev) => prev - currentBet);
    setResultMessage('');
    setGameState('PLAYER_TURN');

    // Natural 21 Check
    const pScore = calculateHand(pHand);
    if (pScore === 21) {
      setTimeout(() => {
        handleStand(pHand, dHand, d);
      }, 500);
    }
  };

  const handleHit = () => {
    sounds.playFlip();
    const d = [...deck];
    const newCard = d.pop()!;
    const newHand = [...playerHand, newCard];
    setDeck(d);
    setPlayerHand(newHand);

    const total = calculateHand(newHand);
    if (total > 21) {
      // BUST
      sounds.playGameOver();
      setGameState('ROUND_OVER');
      setResultMessage('BUST! OVER 21');
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand, dDeck = deck) => {
    sounds.playClick();
    setGameState('DEALER_TURN');

    let currentDealer = [...dHand];
    let workingDeck = [...dDeck];

    // Dealer hits until 17 or more
    while (calculateHand(currentDealer) < 17) {
      currentDealer.push(workingDeck.pop()!);
    }

    setDealerHand(currentDealer);
    setDeck(workingDeck);
    setGameState('ROUND_OVER');

    const pTotal = calculateHand(pHand);
    const dTotal = calculateHand(currentDealer);

    if (dTotal > 21) {
      sounds.playWin();
      setResultMessage('DEALER BUST! YOU WIN!');
      const winAmt = currentBet * 2;
      setChips((prev) => prev + winAmt);
      updateScore(currentScore + winAmt);
    } else if (pTotal > dTotal) {
      sounds.playWin();
      setResultMessage('YOU WIN!');
      const winAmt = currentBet * 2;
      setChips((prev) => prev + winAmt);
      updateScore(currentScore + winAmt);
    } else if (pTotal < dTotal) {
      sounds.playGameOver();
      setResultMessage('DEALER WINS!');
    } else {
      sounds.playTone(300, 'triangle', 0.08, 0.06);
      setResultMessage('PUSH (TIE)');
      setChips((prev) => prev + currentBet);
    }
  };

  const handleDouble = () => {
    if (chips < currentBet) return;
    setChips((prev) => prev - currentBet);
    setCurrentBet((prev) => prev * 2);

    const d = [...deck];
    const newHand = [...playerHand, d.pop()!];
    setDeck(d);
    setPlayerHand(newHand);

    setTimeout(() => {
      handleStand(newHand, dealerHand, d);
    }, 400);
  };

  const resetAll = () => {
    setChips(500);
    setCurrentBet(50);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('BETTING');
    setResultMessage('');
    resetScore();
    setIsGameOver(false);
  };

  const renderCard = (c: Card, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-950 border-2 border-purple-500/60 shadow-lg flex items-center justify-center text-xl text-purple-400 font-bold select-none">
          ♠
        </div>
      );
    }

    const isRed = c.suit === '♥' || c.suit === '♦';
    return (
      <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-[#0f121d] border-2 border-cyber-border shadow-lg p-1.5 flex flex-col justify-between select-none">
        <div className={`text-xs font-black font-mono leading-none ${isRed ? 'text-rose-500' : 'text-slate-100'}`}>
          {c.value}
          <span className="block text-[10px]">{c.suit}</span>
        </div>
        <div className={`text-center text-lg sm:text-xl ${isRed ? 'text-rose-500' : 'text-slate-100'}`}>
          {c.suit}
        </div>
        <div className={`text-xs font-black font-mono leading-none self-end rotate-180 ${isRed ? 'text-rose-500' : 'text-slate-100'}`}>
          {c.value}
        </div>
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
      onRestart={resetAll}
    >
      <div className="w-full flex flex-col items-center justify-center p-4 select-none">
        {/* Chip Bankroll */}
        <div className="flex items-center gap-4 mb-4 px-6 py-2 rounded-2xl bg-[#0a0b12] border border-cyber-border">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-sm">
            <Coins className="w-4 h-4" />
            <span>CHIPS: ${chips}</span>
          </div>
          <div className="text-cyan-400 font-mono font-black text-sm">
            BET: ${currentBet}
          </div>
        </div>

        {/* Dealer Hand Area */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Dealer{' '}
            {gameState === 'ROUND_OVER' && `(${calculateHand(dealerHand)})`}
          </p>
          <div className="flex gap-2 min-h-[96px]">
            {dealerHand.map((c, i) => (
              <div key={i}>
                {renderCard(c, i === 1 && gameState === 'PLAYER_TURN')}
              </div>
            ))}
          </div>
        </div>

        {/* Result Message Banner */}
        {resultMessage && (
          <div className="my-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-purple-900 to-cyan-900 border border-cyan-400 text-white font-black text-xs uppercase tracking-widest shadow-neon-cyan animate-bounce">
            {resultMessage}
          </div>
        )}

        {/* Player Hand Area */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 min-h-[96px] mb-1.5">
            {playerHand.map((c, i) => (
              <div key={i}>{renderCard(c)}</div>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Player {playerHand.length > 0 && `(${calculateHand(playerHand)})`}
          </p>
        </div>

        {/* Actions Controls */}
        {gameState === 'PLAYER_TURN' ? (
          <div className="flex gap-3">
            <button
              onClick={handleHit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-neon-cyan active:scale-95"
            >
              HIT
            </button>
            <button
              onClick={() => handleStand()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-sm active:scale-95"
            >
              STAND
            </button>
            <button
              onClick={handleDouble}
              disabled={chips < currentBet || playerHand.length > 2}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider active:scale-95"
            >
              DOUBLE
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Bet Chip Selectors */}
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentBet(amt);
                  }}
                  className={`w-12 h-10 rounded-xl font-bold font-mono text-xs border transition-all ${
                    currentBet === amt
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                      : 'bg-cyber-card border-cyber-border text-slate-400 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={startRound}
              disabled={chips < currentBet}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-neon-green active:scale-95 disabled:opacity-40"
            >
              DEAL CARDS
            </button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
};
