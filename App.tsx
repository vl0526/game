
import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import StartMenu from './components/ui/StartMenu';
import GameOverScreen from './components/ui/GameOverScreen';
import InstructionsModal from './components/ui/InstructionsModal';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('bat_trung_high_score');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setGameState(GameState.PLAYING);
  }, []);

  const handleShowInstructions = useCallback(() => {
    setGameState(GameState.INSTRUCTIONS);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setGameState(GameState.START_MENU);
  }, []);
  
  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('bat_trung_high_score', finalScore.toString());
    }
    setGameState(GameState.GAME_OVER);
  }, [highScore]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.START_MENU:
        return <StartMenu onStart={handleStartGame} onShowInstructions={handleShowInstructions} />;
      case GameState.INSTRUCTIONS:
        return <InstructionsModal onBack={handleBackToMenu} />;
      case GameState.PLAYING:
        return <Game onGameOver={handleGameOver} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} highScore={highScore} onRestart={handleStartGame} />;
      default:
        return <StartMenu onStart={handleStartGame} onShowInstructions={handleShowInstructions} />;
    }
  };

  return (
    <div className="bg-black text-[#ff5a5f] min-h-screen flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-screen-lg max-h-screen-md aspect-[4/3]">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
