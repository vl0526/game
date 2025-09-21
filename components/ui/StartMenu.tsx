
import React from 'react';
import DoodleButton from './DoodleButton';

interface StartMenuProps {
  onStart: () => void;
  onShowInstructions: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center">
      <h1 className="text-8xl md:text-9xl font-extrabold text-[#ff5a5f]" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
        Bắt Trứng
      </h1>
      <p className="mt-4 text-xl">A Doodle Catching Game</p>
      <div className="mt-12 space-y-6">
        <DoodleButton onClick={onStart}>
          Bắt đầu
        </DoodleButton>
        <DoodleButton onClick={onShowInstructions}>
          Hướng dẫn
        </DoodleButton>
      </div>
    </div>
  );
};

export default StartMenu;
