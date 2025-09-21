
import React from 'react';
import DoodleButton from './DoodleButton';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center">
      <h1 className="text-7xl md:text-8xl font-extrabold text-[#ff5a5f]" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
        Game Over
      </h1>
      <div className="mt-8 text-3xl space-y-4">
        <p>Your Score: <span className="font-bold text-white">{score}</span></p>
        <p>High Score: <span className="font-bold text-white">{highScore}</span></p>
      </div>
      <div className="mt-12">
        <DoodleButton onClick={onRestart}>
          Chơi lại
        </DoodleButton>
      </div>
    </div>
  );
};

export default GameOverScreen;
