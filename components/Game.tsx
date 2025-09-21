
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Egg, EggType, FloatingText } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  BASKET_WIDTH,
  BASKET_HEIGHT,
  BASKET_OFFSET_Y,
  EGG_WIDTH,
  EGG_HEIGHT,
  BOMB_RADIUS,
  INITIAL_EGG_SPEED,
  INITIAL_SPAWN_RATE,
  MAX_DIFFICULTY_SCORE,
  SCORE_NORMAL,
  SCORE_GOLDEN,
  COMBO_THRESHOLD,
  COMBO_DURATION,
  PRIMARY_COLOR,
  BACKGROUND_COLOR,
  ROTTEN_EGG_COLOR,
  GOLDEN_EGG_COLOR,
  BOMB_COLOR,
  LINE_WIDTH,
} from '../constants';
import Sfx from '../services/Sfx';

interface GameProps {
  onGameOver: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const sfx = useRef(new Sfx());

  // Game state refs to avoid re-renders inside the loop
  const score = useRef(0);
  const lives = useRef(3);
  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const eggs = useRef<Egg[]>([]);
  const floatingTexts = useRef<FloatingText[]>([]);
  const isPaused = useRef(false);
  const inputState = useRef({ left: false, right: false, touchX: null as number | null });
  const lastTime = useRef(performance.now());
  const spawnTimer = useRef(0);
  const screenShake = useRef({ magnitude: 0, duration: 0 });
  const comboCounter = useRef(0);
  const comboActive = useRef(false);
  const comboTimer = useRef(0);

  const drawDoodleText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) => {
    ctx.font = `bold ${size}px 'Comic Sans MS', cursive, sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = BACKGROUND_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  };
  
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const x = playerX.current;
    const y = GAME_HEIGHT - PLAYER_HEIGHT;
    ctx.strokeStyle = PRIMARY_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Head
    ctx.beginPath();
    ctx.arc(x + PLAYER_WIDTH / 2, y + 25, 20, 0, Math.PI * 2);
    ctx.stroke();
    // Mouth
    ctx.beginPath();
    ctx.arc(x + PLAYER_WIDTH / 2, y + 28, 8, 0, Math.PI);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(x + PLAYER_WIDTH / 2, y + 45);
    ctx.lineTo(x + PLAYER_WIDTH / 2, y + 80);
    ctx.stroke();
    
    // Arms
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 60);
    ctx.lineTo(x + PLAYER_WIDTH / 2, y + 60);
    ctx.lineTo(x + PLAYER_WIDTH - 10, y + 60);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x + PLAYER_WIDTH / 2, y + 80);
    ctx.lineTo(x + 25, y + PLAYER_HEIGHT);
    ctx.moveTo(x + PLAYER_WIDTH / 2, y + 80);
    ctx.lineTo(x + PLAYER_WIDTH - 25, y + PLAYER_HEIGHT);
    ctx.stroke();

    // Basket
    ctx.beginPath();
    ctx.moveTo(x + PLAYER_WIDTH / 2 - BASKET_WIDTH / 2, y + BASKET_OFFSET_Y);
    ctx.lineTo(x + PLAYER_WIDTH / 2 - BASKET_WIDTH / 2, y + BASKET_OFFSET_Y + BASKET_HEIGHT);
    ctx.arcTo(x + PLAYER_WIDTH / 2, y + BASKET_OFFSET_Y + BASKET_HEIGHT + 15, x + PLAYER_WIDTH / 2 + BASKET_WIDTH / 2, y + BASKET_OFFSET_Y + BASKET_HEIGHT, 30);
    ctx.lineTo(x + PLAYER_WIDTH / 2 + BASKET_WIDTH / 2, y + BASKET_OFFSET_Y);
    ctx.stroke();
  };
  
  const drawEgg = (ctx: CanvasRenderingContext2D, egg: Egg) => {
    switch (egg.type) {
      case EggType.GOLDEN:
        ctx.strokeStyle = GOLDEN_EGG_COLOR;
        ctx.shadowColor = GOLDEN_EGG_COLOR;
        ctx.shadowBlur = 10;
        break;
      case EggType.ROTTEN:
        ctx.strokeStyle = ROTTEN_EGG_COLOR;
        break;
      case EggType.BOMB:
        ctx.fillStyle = BOMB_COLOR;
        ctx.strokeStyle = PRIMARY_COLOR;
        break;
      default:
        ctx.strokeStyle = PRIMARY_COLOR;
    }
    
    ctx.lineWidth = LINE_WIDTH - 2;
    if (egg.type === EggType.BOMB) {
      ctx.beginPath();
      ctx.arc(egg.x + BOMB_RADIUS, egg.y + BOMB_RADIUS, BOMB_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fuse
      ctx.beginPath();
      ctx.moveTo(egg.x + BOMB_RADIUS, egg.y);
      ctx.quadraticCurveTo(egg.x + BOMB_RADIUS + 10, egg.y - 10, egg.x + BOMB_RADIUS + 5, egg.y - 15);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(egg.x + egg.width / 2, egg.y + egg.height / 2, egg.width / 2, egg.height / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    // Score
    drawDoodleText(ctx, `Score: ${score.current}`, 20, 40, 30, PRIMARY_COLOR);

    // Lives
    for (let i = 0; i < lives.current; i++) {
        ctx.strokeStyle = PRIMARY_COLOR;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(GAME_WIDTH - 40 - i * 45, 30, EGG_WIDTH / 2.5, EGG_HEIGHT / 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Difficulty Bar
    const difficultyProgress = Math.min(score.current / MAX_DIFFICULTY_SCORE, 1);
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH * difficultyProgress, 5);
    
    // Combo Text
    if (comboActive.current) {
        drawDoodleText(ctx, 'COMBO x2!', GAME_WIDTH / 2 - 100, 60, 40, GOLDEN_EGG_COLOR);
    }
  };

  const addFloatingText = (text: string, x: number, y: number) => {
    floatingTexts.current.push({
        id: Date.now() + Math.random(),
        text,
        x,
        y,
        vy: -50,
        opacity: 1,
        life: 1,
    });
  };

  const triggerScreenShake = (magnitude: number, duration: number) => {
      screenShake.current = { magnitude, duration };
  };

  const spawnEgg = useCallback(() => {
    const rand = Math.random();
    let type: EggType;
    if (rand < 0.03) type = EggType.BOMB;
    else if (rand < 0.1) type = EggType.GOLDEN;
    else if (rand < 0.2) type = EggType.ROTTEN;
    else type = EggType.NORMAL;

    const width = type === EggType.BOMB ? BOMB_RADIUS * 2 : EGG_WIDTH;
    const x = Math.random() * (GAME_WIDTH - width);
    
    eggs.current.push({
      id: Date.now() + Math.random(),
      type,
      x,
      y: -EGG_HEIGHT,
      width: width,
      height: type === EggType.BOMB ? BOMB_RADIUS * 2 : EGG_HEIGHT,
      vy: 0,
    });
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    const dt = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // --- UPDATE ---
    if (!isPaused.current) {
        // Player movement
        if (inputState.current.touchX !== null) {
            const targetX = inputState.current.touchX - PLAYER_WIDTH / 2;
            playerX.current += (targetX - playerX.current) * 0.2;
        } else {
            if (inputState.current.left) playerX.current -= PLAYER_SPEED * dt;
            if (inputState.current.right) playerX.current += PLAYER_SPEED * dt;
        }
        playerX.current = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, playerX.current));

        // Egg Spawning
        const difficulty = Math.min(score.current / MAX_DIFFICULTY_SCORE, 1);
        const currentSpawnRate = INITIAL_SPAWN_RATE - (INITIAL_SPAWN_RATE - 0.3) * difficulty;
        spawnTimer.current += dt;
        if (spawnTimer.current > currentSpawnRate) {
            spawnTimer.current = 0;
            spawnEgg();
        }

        // Update Eggs
        const eggBaseSpeed = INITIAL_EGG_SPEED + (300 * difficulty);
        eggs.current.forEach(egg => {
            egg.vy = eggBaseSpeed;
            egg.y += egg.vy * dt;
        });
        
        // Update Floating Texts
        floatingTexts.current.forEach(text => {
            text.y += text.vy * dt;
            text.life -= dt;
            text.opacity = Math.max(0, text.life);
        });
        floatingTexts.current = floatingTexts.current.filter(t => t.life > 0);
        
        // Update Combo Timer
        if (comboActive.current) {
            comboTimer.current -= dt * 1000;
            if (comboTimer.current <= 0) {
                comboActive.current = false;
            }
        }

        // Collision detection
        const basket = {
            x: playerX.current + (PLAYER_WIDTH - BASKET_WIDTH) / 2,
            y: GAME_HEIGHT - PLAYER_HEIGHT + BASKET_OFFSET_Y,
            width: BASKET_WIDTH,
            height: BASKET_HEIGHT,
        };
        
        const caughtEggs: number[] = [];
        eggs.current.forEach(egg => {
            if (egg.y + egg.height > basket.y && egg.y < basket.y + basket.height && egg.x + egg.width > basket.x && egg.x < basket.x + basket.width) {
                caughtEggs.push(egg.id);
                
                let pointsEarned = 0;
                
                switch(egg.type) {
                    case EggType.NORMAL:
                        pointsEarned = SCORE_NORMAL;
                        sfx.current.playCatch();
                        break;
                    case EggType.GOLDEN:
                        pointsEarned = SCORE_GOLDEN;
                        sfx.current.playGoldenCatch();
                        break;
                    case EggType.ROTTEN:
                        lives.current--;
                        sfx.current.playMiss();
                        triggerScreenShake(8, 200);
                        break;
                    case EggType.BOMB:
                        lives.current--;
                        sfx.current.playBomb();
                        triggerScreenShake(20, 500);
                        break;
                }
                
                if (pointsEarned > 0) {
                    comboCounter.current++;
                    if (comboCounter.current >= COMBO_THRESHOLD) {
                        comboActive.current = true;
                        comboTimer.current = COMBO_DURATION;
                    }
                    if (comboActive.current) {
                        pointsEarned *= 2;
                    }
                    score.current += pointsEarned;
                    addFloatingText(`+${pointsEarned}`, egg.x, egg.y);
                }
            }
        });
        eggs.current = eggs.current.filter(egg => !caughtEggs.includes(egg.id));
        
        // Check missed eggs
        const missedEggs: number[] = [];
        eggs.current.forEach(egg => {
           if (egg.y > GAME_HEIGHT) {
               missedEggs.push(egg.id);
               if (egg.type !== EggType.ROTTEN && egg.type !== EggType.BOMB) {
                   lives.current--;
                   comboCounter.current = 0;
                   comboActive.current = false;
                   sfx.current.playMiss();
                   triggerScreenShake(8, 200);
               }
           }
        });
        eggs.current = eggs.current.filter(egg => !missedEggs.includes(egg.id));
        
        // Check Game Over
        if (lives.current <= 0) {
            onGameOver(score.current);
            return;
        }

        // Update Screen Shake
        if (screenShake.current.duration > 0) {
            screenShake.current.duration -= dt * 1000;
        } else {
            screenShake.current.magnitude = 0;
        }
    }
    
    // --- DRAW ---
    ctx.save();
    if(screenShake.current.magnitude > 0) {
        const dx = (Math.random() - 0.5) * screenShake.current.magnitude;
        const dy = (Math.random() - 0.5) * screenShake.current.magnitude;
        ctx.translate(dx, dy);
    }
    
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawPlayer(ctx);
    eggs.current.forEach(egg => drawEgg(ctx, egg));
    floatingTexts.current.forEach(text => {
        ctx.globalAlpha = text.opacity;
        drawDoodleText(ctx, text.text, text.x, text.y, 24, GOLDEN_EGG_COLOR);
        ctx.globalAlpha = 1.0;
    });
    drawUI(ctx);
    
    if (isPaused.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        drawDoodleText(ctx, "PAUSED", GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2, 60, PRIMARY_COLOR);
    }
    ctx.restore();
    
    requestAnimationFrame(gameLoop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGameOver]);
  
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = gameContainerRef.current;
    if (canvas && container) {
      const { width, height } = container.getBoundingClientRect();
      const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);
      canvas.style.width = `${GAME_WIDTH * scale}px`;
      canvas.style.height = `${GAME_HEIGHT * scale}px`;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(canvas) {
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = true;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = true;
        if (e.key === 'p' || e.key === 'P') isPaused.current = !isPaused.current;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') inputState.current.left = false;
        if (e.key === 'd' || e.key === 'ArrowRight') inputState.current.right = false;
    };
    
    const getTouchX = (e: TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return (e.touches[0].clientX - rect.left) / (rect.width / GAME_WIDTH);
    }
    
    const handleTouchStart = (e: TouchEvent) => {
        inputState.current.touchX = getTouchX(e);
    };
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        inputState.current.touchX = getTouchX(e);
    };
    const handleTouchEnd = () => {
        inputState.current.touchX = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    requestAnimationFrame(gameLoop);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameLoop, handleResize]);
  
  return (
    <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="bg-black"></canvas>
    </div>
  );
};

export default Game;
