/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Download, Share2, Info } from 'lucide-react';

type Color = 'red' | 'yellow' | 'blue' | null;

interface Rect {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  color: Color;
  split: {
    type: 'h' | 'v';
    pos: number; // percentage within this rect (0-100)
    first: Rect;
    second: Rect;
  } | null;
}

const COLORS = {
  red: '#E70000',
  yellow: '#FFD500',
  blue: '#0046AD',
  white: '#FFFFFF',
  black: '#000000',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const createRect = (x: number, y: number, w: number, h: number): Rect => ({
  id: generateId(),
  x, y, w, h,
  color: null,
  split: null,
});

export default function App() {
  const [root, setRoot] = useState<Rect>(createRect(0, 0, 100, 100));
  const [history, setHistory] = useState<Rect[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const splitRect = useCallback((rect: Rect, px: number, py: number): Rect => {
    // If this rect is already split, recurse
    if (rect.split) {
      const { type, pos, first, second } = rect.split;
      if (type === 'v') {
        const splitX = rect.x + (rect.w * pos) / 100;
        if (px < splitX) {
          return { ...rect, split: { ...rect.split, first: splitRect(first, px, py) } };
        } else {
          return { ...rect, split: { ...rect.split, second: splitRect(second, px, py) } };
        }
      } else {
        const splitY = rect.y + (rect.h * pos) / 100;
        if (py < splitY) {
          return { ...rect, split: { ...rect.split, first: splitRect(first, px, py) } };
        } else {
          return { ...rect, split: { ...rect.split, second: splitRect(second, px, py) } };
        }
      }
    }

    // Leaf node reached
    // If colored, clear and split
    if (rect.color) {
      const type = rect.w > rect.h ? 'v' : 'h';
      const pos = 50; // Split in middle for simplicity or use click pos?
      // Let's use click pos for more control
      const newPos = type === 'v' 
        ? ((px - rect.x) / rect.w) * 100 
        : ((py - rect.y) / rect.h) * 100;

      return {
        ...rect,
        color: null,
        split: {
          type,
          pos: newPos,
          first: createRect(rect.x, rect.y, type === 'v' ? (rect.w * newPos) / 100 : rect.w, type === 'h' ? (rect.h * newPos) / 100 : rect.h),
          second: createRect(
            type === 'v' ? rect.x + (rect.w * newPos) / 100 : rect.x,
            type === 'h' ? rect.y + (rect.h * newPos) / 100 : rect.y,
            type === 'v' ? rect.w * (1 - newPos / 100) : rect.w,
            type === 'h' ? rect.h * (1 - newPos / 100) : rect.h
          ),
        },
      };
    }

    // If white, decide whether to split or fill
    // Criteria: if area is large, split. If small, fill.
    // Or just alternate? Let's try: if width and height > 15%, split.
    if (rect.w > 15 && rect.h > 15) {
      const type = rect.w > rect.h ? 'v' : 'h';
      const newPos = type === 'v' 
        ? ((px - rect.x) / rect.w) * 100 
        : ((py - rect.y) / rect.h) * 100;

      return {
        ...rect,
        split: {
          type,
          pos: newPos,
          first: createRect(rect.x, rect.y, type === 'v' ? (rect.w * newPos) / 100 : rect.w, type === 'h' ? (rect.h * newPos) / 100 : rect.h),
          second: createRect(
            type === 'v' ? rect.x + (rect.w * newPos) / 100 : rect.x,
            type === 'h' ? rect.y + (rect.h * newPos) / 100 : rect.y,
            type === 'v' ? rect.w * (1 - newPos / 100) : rect.w,
            type === 'h' ? rect.h * (1 - newPos / 100) : rect.h
          ),
        },
      };
    } else {
      // Fill with random primary color
      const colors: Color[] = ['red', 'yellow', 'blue'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return { ...rect, color: randomColor };
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - bounds.left) / bounds.width) * 100;
    const py = ((e.clientY - bounds.top) / bounds.height) * 100;

    setHistory(prev => [...prev, root]);
    setRoot(prev => splitRect(prev, px, py));
  };

  const handleReset = () => {
    setHistory([]);
    setRoot(createRect(0, 0, 100, 100));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRoot(last);
    setHistory(prev => prev.slice(0, -1));
  };

  // Recursive component to render rectangles
  const RectComponent = ({ rect }: { rect: Rect }) => {
    if (rect.split) {
      const { type, pos, first, second } = rect.split;
      return (
        <div className="relative w-full h-full flex overflow-hidden" style={{ flexDirection: type === 'v' ? 'row' : 'column' }}>
          <div style={{ [type === 'v' ? 'width' : 'height']: `${pos}%`, [type === 'v' ? 'height' : 'width']: '100%' }}>
            <RectComponent rect={first} />
          </div>
          {/* The Line */}
          <div 
            className="bg-black z-10" 
            style={{ 
              [type === 'v' ? 'width' : 'height']: '8px',
              [type === 'v' ? 'height' : 'width']: '100%',
              margin: type === 'v' ? '0 -4px' : '-4px 0'
            }} 
          />
          <div style={{ [type === 'v' ? 'width' : 'height']: `${100 - pos}%`, [type === 'v' ? 'height' : 'width']: '100%' }}>
            <RectComponent rect={second} />
          </div>
        </div>
      );
    }

    return (
      <motion.div
        layout
        initial={false}
        animate={{ backgroundColor: rect.color ? COLORS[rect.color] : COLORS.white }}
        transition={{ duration: 0.3 }}
        className="w-full h-full border-black"
        style={{ backgroundColor: rect.color ? COLORS[rect.color] : COLORS.white }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-sans text-black selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-end mix-blend-difference text-white pointer-events-none">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
            Mondrian<br />Art Maker
          </h1>
          <p className="mt-2 text-xs font-mono tracking-widest uppercase opacity-70">
            Recursive Subdivision Tool
          </p>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="h-screen w-full flex items-center justify-center p-8 md:p-16 lg:p-24">
        <div 
          ref={containerRef}
          onClick={handleClick}
          className="relative w-full h-full max-w-5xl aspect-square bg-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-[8px] border-black cursor-crosshair overflow-hidden group"
        >
          <RectComponent rect={root} />
          
          {/* Empty State Hint */}
          {!root.split && !root.color && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
              <p className="text-sm font-mono uppercase tracking-[0.2em]">Click to begin</p>
            </div>
          )}
        </div>
      </main>

      {/* Controls */}
      <nav className="fixed bottom-0 left-0 right-0 p-8 flex justify-center gap-4 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-black/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-xl">
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:opacity-60 transition-opacity"
          >
            Undo
          </button>
          <div className="w-px h-4 bg-black/10" />
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-red-600 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </nav>

      {/* Info Overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md bg-white p-10 rounded-3xl text-black"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">How it works</h2>
              <ul className="space-y-4 text-sm leading-relaxed">
                <li className="flex gap-4">
                  <span className="font-mono font-bold">01</span>
                  <p>Click any white area to split it with a horizontal or vertical line.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-mono font-bold">02</span>
                  <p>When an area becomes small enough, clicking it will fill it with a primary color (Red, Yellow, or Blue).</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-mono font-bold">03</span>
                  <p>Clicking a colored area will clear the color and split it further.</p>
                </li>
                <li className="flex gap-4">
                  <span className="font-mono font-bold">04</span>
                  <p>The direction of the line is determined by the shape of the rectangle (splitting the longer side).</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowInfo(false)}
                className="mt-10 w-full py-4 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-yellow-400 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
