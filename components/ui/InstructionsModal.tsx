
import React from 'react';
import DoodleButton from './DoodleButton';
import { ROTTEN_EGG_COLOR, GOLDEN_EGG_COLOR, PRIMARY_COLOR, BOMB_COLOR } from '../../constants';

const InstructionsModal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const instructions = [
    { color: PRIMARY_COLOR, name: 'Trứng Thường', description: '+1 điểm. Đừng để rơi!' },
    { color: GOLDEN_EGG_COLOR, name: 'Trứng Vàng', description: '+5 điểm! Rất hiếm.' },
    { color: ROTTEN_EGG_COLOR, name: 'Trứng Thối', description: 'Bắt trúng sẽ -1 mạng.' },
    { color: BOMB_COLOR, name: 'Bom', description: 'BÙM! Bắt trúng sẽ -1 mạng.' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 md:p-8 text-[#ff5a5f]">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
        Hướng dẫn
      </h1>
      
      <div className="text-left max-w-lg w-full space-y-4 text-lg">
        <p><span className="font-bold text-white">Điều khiển (PC):</span> Dùng phím A/D hoặc mũi tên Trái/Phải để di chuyển.</p>
        <p><span className="font-bold text-white">Điều khiển (Mobile):</span> Chạm và kéo để di chuyển.</p>
        <p><span className="font-bold text-white">Tạm dừng:</span> Nhấn phím P.</p>
        <p className="mt-4"><span className="font-bold text-white">Mục tiêu:</span> Hứng trứng rơi để ghi điểm và sống sót lâu nhất!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
        {instructions.map(item => (
          <div key={item.name} className="p-3 border-4 border-dashed border-[#ff5a5f] rounded-2xl flex flex-col items-center text-center">
            <div
              className="w-10 h-14 rounded-[50%] mb-2 border-4"
              style={{ borderColor: item.color, backgroundColor: item.name === 'Bom' ? BOMB_COLOR : 'transparent' }}
            ></div>
            <h3 className="font-bold text-xl" style={{color: item.color}}>{item.name}</h3>
            <p className="text-white text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <DoodleButton onClick={onBack}>
          Trở về
        </DoodleButton>
      </div>
    </div>
  );
};

export default InstructionsModal;
