import React, { useEffect, useRef, useState } from 'react';
import { Bubble, Point } from '../types';

interface GameCanvasProps {
  handPosition: Point[] | null;
  isPlaying: boolean;
  onScoreUpdate: (score: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ handPosition, isPlaying, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const scoreRef = useRef(0);
  const requestRef = useRef<number>(null);
  const handPosRef = useRef<Point[] | null>(null);

  // Keep track of props without triggering re-renders
  useEffect(() => {
    handPosRef.current = handPosition;
  }, [handPosition]);

  const createBubble = (width: number, height: number): Bubble => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (width - 60) + 30,
      y: height + 50,
      radius: Math.random() * 20 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
    };
  };

  useEffect(() => {
    if (!isPlaying) {
      bubblesRef.current = [];
      scoreRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      const { width, height } = canvas;
      
      if (Math.random() < 0.05 && bubblesRef.current.length < 15) {
        bubblesRef.current.push(createBubble(width, height));
      }

      bubblesRef.current = bubblesRef.current
        .map(b => ({ ...b, y: b.y - b.speed }))
        .filter(b => {
          if (handPosRef.current && handPosRef.current.length > 8) {
            const indexFinger = handPosRef.current[8];
            const dx = b.x - (indexFinger.x * width);
            const dy = b.y - (indexFinger.y * height);
            if (Math.hypot(dx, dy) < b.radius + 15) {
              onScoreUpdate(scoreRef.current += 10);
              return false;
            }
          }
          return b.y + b.radius > 0;
        });

      ctx.clearRect(0, 0, width, height);
      
      if (handPosRef.current) {
        const currentHand = handPosRef.current;
        

        // 3. 검지 끝(8번)에 버블 터트리는 팝 커서 그리기
        if (currentHand.length > 8) {
          const indexFinger = currentHand[8];
          const hx = indexFinger.x * width, hy = indexFinger.y * height;
          ctx.beginPath();
          ctx.arc(hx, hy, 16, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      bubblesRef.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color + '44'; // 44 is ~25% opacity hex
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Small shine dot
        ctx.beginPath();
        ctx.arc(b.x - b.radius/3, b.y - b.radius/3, b.radius/5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, onScoreUpdate]);
 // bubbles.length to trigger re-render loop if needed, but requestAnimationFrame handles it

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
