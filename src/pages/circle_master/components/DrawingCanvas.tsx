import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, GameState, CircleResult } from '../types';
import { analyzeCircle } from '../utils/geometry';

interface DrawingCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setResult: (result: CircleResult | null) => void;
  result: CircleResult | null;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ gameState, setGameState, setResult, result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);

  // Initialize and Resize Canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        // If we have a result, re-draw it after resize
        if (result) {
            drawResult(result);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Drawing Logic Helpers
  const drawLine = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string, width: number) => {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const drawResult = (res: CircleResult) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw background slightly dimmed
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Ideal Circle
    ctx.beginPath();
    ctx.arc(res.center.x, res.center.y, res.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4ade80'; // Green 400
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]); // Dashed line
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Center Point
    ctx.beginPath();
    ctx.arc(res.center.x, res.center.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#4ade80';
    ctx.fill();

    // Draw User Path
    if (res.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(res.points[0].x, res.points[0].y);
        for (let i = 1; i < res.points.length; i++) {
            ctx.lineTo(res.points[i].x, res.points[i].y);
        }
        // Gradient stroke based on grade
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (res.score > 90) {
             gradient.addColorStop(0, '#60a5fa');
             gradient.addColorStop(1, '#a78bfa');
        } else if (res.score > 70) {
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(1, '#f87171');
        } else {
            gradient.addColorStop(0, '#f87171');
            gradient.addColorStop(1, '#ef4444');
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
    }
  };

  // Interaction Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState === GameState.RESULT || gameState === GameState.ANALYZING) return;
    
    // Reset if IDLE
    if (gameState === GameState.IDLE) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPoints([]);
    }

    setGameState(GameState.DRAWING);
    
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    const canvas = canvasRef.current;
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        setPoints([{ x, y }]);
    }
  }, [gameState, setGameState]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== GameState.DRAWING) return;

    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    const canvas = canvasRef.current;
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const newPoint = { x, y };

        setPoints(prev => {
            const lastPoint = prev[prev.length - 1];
            // Only add point if distance moved is significant (optimization)
            if (lastPoint && (Math.abs(lastPoint.x - x) > 2 || Math.abs(lastPoint.y - y) > 2)) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    drawLine(ctx, lastPoint, newPoint, '#f8fafc', 3);
                }
                return [...prev, newPoint];
            }
            return prev;
        });
    }
  }, [gameState]);

  const handleMouseUp = useCallback(() => {
    if (gameState !== GameState.DRAWING) return;

    setGameState(GameState.ANALYZING);
    
    // Small timeout to allow the last render to finish
    setTimeout(() => {
        const result = analyzeCircle(points);
        setResult(result);
        setGameState(GameState.RESULT);
        
        if (result) {
            drawResult(result);
        } else {
             // Too few points or invalid
             setGameState(GameState.IDLE);
             const canvas = canvasRef.current;
             const ctx = canvas?.getContext('2d');
             if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
             setPoints([]);
        }
    }, 50);
  }, [gameState, points, setGameState, setResult]);

  // Touch support needs preventDefault to stop scrolling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventDefault);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair touch-none">
      <canvas
        ref={canvasRef}
        className="block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
      
      {/* Helper Text Overlay */}
      {gameState === GameState.IDLE && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-full px-6 py-3 text-slate-300 animate-pulse">
                  Draw a circle here
              </div>
          </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
