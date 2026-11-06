import React from 'react';
import { GameDefinition } from '../lib/gamesCatalog';
import { Language } from '../lib/translations';

// Import all 27 Games
import { SnakeGame } from './games/SnakeGame';
import { FlappyGame } from './games/FlappyGame';
import { BrickBreakerGame } from './games/BrickBreakerGame';
import { SpaceShooterGame } from './games/SpaceShooterGame';
import { PacMazeGame } from './games/PacMazeGame';
import { FruitSliceGame } from './games/FruitSliceGame';
import { Game2048 } from './games/Game2048';
import { TicTacToeGame } from './games/TicTacToeGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { MemoryCardsGame } from './games/MemoryCardsGame';
import { WordleGame } from './games/WordleGame';
import { SudokuGame } from './games/SudokuGame';
import { SlidingPuzzleGame } from './games/SlidingPuzzleGame';
import { LightsOutGame } from './games/LightsOutGame';
import { ConnectFourGame } from './games/ConnectFourGame';
import { BlackjackGame } from './games/BlackjackGame';
import { SolitaireGame } from './games/SolitaireGame';
import { SpeedMathGame } from './games/SpeedMathGame';
import { ColorReflexGame } from './games/ColorReflexGame';
import { ReactionTimeGame } from './games/ReactionTimeGame';
import { TowerStackerGame } from './games/TowerStackerGame';
import { PongGame } from './games/PongGame';
import { WhackAMoleGame } from './games/WhackAMoleGame';
import { SimonSaysGame } from './games/SimonSaysGame';
import { HangmanGame } from './games/HangmanGame';
import { DoodleJumpGame } from './games/DoodleJumpGame';
import { CarRacingGame } from './games/CarRacingGame';

interface Props {
  game: GameDefinition;
  lang: Language;
  onBackToHub: () => void;
}

export const GameRenderer: React.FC<Props> = ({ game, lang, onBackToHub }) => {
  switch (game.id) {
    case 'snake':
      return <SnakeGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'flappy':
      return <FlappyGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'brick_breaker':
      return <BrickBreakerGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'space_shooter':
      return <SpaceShooterGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'pac_maze':
      return <PacMazeGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'fruit_slice':
      return <FruitSliceGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'game_2048':
      return <Game2048 game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'tic_tac_toe':
      return <TicTacToeGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'minesweeper':
      return <MinesweeperGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'memory_cards':
      return <MemoryCardsGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'wordle':
      return <WordleGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'sudoku':
      return <SudokuGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'sliding_puzzle':
      return <SlidingPuzzleGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'lights_out':
      return <LightsOutGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'connect_four':
      return <ConnectFourGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'blackjack':
      return <BlackjackGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'solitaire':
      return <SolitaireGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'speed_math':
      return <SpeedMathGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'color_reflex':
      return <ColorReflexGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'reaction_time':
      return <ReactionTimeGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'tower_stacker':
      return <TowerStackerGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'pong':
      return <PongGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'whack_mole':
      return <WhackAMoleGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'simon_says':
      return <SimonSaysGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'hangman':
      return <HangmanGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'galaxy_jumper':
      return <DoodleJumpGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    case 'car_racing':
      return <CarRacingGame game={game} lang={lang} onBackToHub={onBackToHub} />;
    default:
      return <div>Game not found</div>;
  }
};

