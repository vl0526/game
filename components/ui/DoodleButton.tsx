
import React from 'react';

interface DoodleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const DoodleButton: React.FC<DoodleButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="text-3xl font-bold bg-transparent text-[#ff5a5f] py-4 px-12 border-[6px] border-[#ff5a5f] rounded-[50%] hover:bg-[#ff5a5f] hover:text-black transition-colors duration-200 transform hover:scale-105 focus:outline-none"
      style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
      {...props}
    >
      {children}
    </button>
  );
};

export default DoodleButton;
