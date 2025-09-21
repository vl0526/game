import React, { useState, useEffect } from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { GameStats } from '../types';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  stats: GameStats;
  playerName: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart, stats, playerName }) => {
  const [aiMessage, setAiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAiSummary = async () => {
      if (typeof process === 'undefined' || typeof process.env === 'undefined' || !('API_KEY' in process.env) || !process.env.API_KEY) {
        setAiMessage("Làm tốt lắm, kỹ sư! Hãy xem lại bản thiết kế và thử lại để đạt điểm cao hơn.");
        setIsLoading(false);
        return;
      }

      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Bạn là một giáo sư kỹ thuật lập dị đang viết bài đánh giá hiệu suất cho một kỹ sư tập sự tên là ${playerName}. Họ vừa hoàn thành một bài mô phỏng cho lớp "Động lực học Bắt Trứng Nâng cao" của bạn.
        Đây là các chỉ số hiệu suất của họ:
        - Điểm cuối cùng: ${score}
        - Nguyên mẫu Vàng bắt được: ${stats.goldenEggs}
        - Hệ số nhân điểm đã sử dụng: ${stats.starsCaught}
        - Va chạm gây nổ: ${stats.bombsHit}
        - Nhiễm bẩn hợp chất dễ bay hơi (trứng thối): ${stats.rottenHit}

        Viết một bài đánh giá hiệu suất ngắn gọn, dí dỏm và đáng khích lệ trong một đoạn văn (3-4 câu). Hãy hài hước và sử dụng thuật ngữ về bản thiết kế/kỹ thuật. Hãy gọi sinh viên bằng tên của họ, ${playerName}. Không sử dụng định dạng markdown.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setAiMessage(response.text);

      } catch (e) {
        console.error("Error fetching AI summary:", e);
        const errorMessage = "Vị giáo sư AI đang đi uống cà phê. Nhưng có lẽ ông ấy sẽ nói rằng bạn đã làm rất tốt!";
        setError(errorMessage);
        setAiMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiSummary();
  }, [score, stats, playerName]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-7xl md:text-8xl font-bold text-[#0048ab]" style={{ fontFamily: "'Kalam', cursive" }}>
        Trò Chơi Kết Thúc
      </h1>
      <div className="mt-8 text-3xl space-y-4" style={{ fontFamily: "'Kalam', cursive" }}>
        <p>Điểm của bạn: <span className="font-bold text-black">{score}</span></p>
        <p>Điểm cao nhất: <span className="font-bold text-black">{highScore}</span></p>
      </div>

      <div className="mt-8 p-6 border-4 border-dashed border-[#0048ab] rounded-2xl max-w-xl min-h-[150px] flex items-center justify-center">
        {isLoading && <p className="text-xl" style={{ fontFamily: "'Kalam', cursive" }}>Đang tính toán chỉ số hiệu suất...</p>}
        {!isLoading && (
            <p className={`text-xl ${error ? 'text-red-600' : 'text-gray-800'}`} style={{ fontFamily: "'Kalam', cursive" }}>
                {aiMessage}
            </p>
        )}
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
