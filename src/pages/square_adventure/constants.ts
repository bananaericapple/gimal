import { Platform, Rect } from './types';

export const GRAVITY = 0.6;
export const FRICTION = 0.8;
export const MOVE_SPEED = 5;
export const JUMP_FORCE = -13;
export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;
export const PLAYER_SIZE = 20;

// === TARGETS ===

// L1 Target: Arrow to Body
export const L1_EXIT: Rect = { x: 1150, y: 550, w: 50, h: 100 };
// L2 Target: The Ear
export const L2_EXIT: Rect = { x: 1050, y: 150, w: 40, h: 60 };
// L3 Target: Eardrum
export const L3_EXIT: Rect = { x: 1150, y: 350, w: 40, h: 100 };
// L4 Target: Oval Window
export const L4_EXIT: Rect = { x: 1150, y: 600, w: 40, h: 80 };
// L5 Target: The Lollipop
export const LOLLIPOP_TARGET: Rect = { x: 1050, y: 150, w: 40, h: 40 };


// === LEVELS ===

// LEVEL 1: The Desk (Tutorial difficulty)
export const LEVEL_1_PLATFORMS: Platform[] = [
  { id: 'ground', x: 0, y: 750, w: 500, h: 50, type: 'desk', color: 'bg-amber-900' },
  { id: 'gap-safe', x: 550, y: 750, w: 650, h: 50, type: 'desk', color: 'bg-amber-900' },
  { id: 'eraser', x: 200, y: 710, w: 60, h: 40, type: 'book', color: 'bg-white' },
  { id: 'book1', x: 300, y: 650, w: 150, h: 20, type: 'book', color: 'bg-blue-700' },
  { id: 'book2', x: 320, y: 630, w: 130, h: 20, type: 'book', color: 'bg-green-700' },
  { id: 'pencil1', x: 500, y: 580, w: 100, h: 10, type: 'pencil', color: 'bg-yellow-400', rotation: -10 },
  { id: 'mug', x: 700, y: 550, w: 80, h: 200, type: 'cup', color: 'bg-gray-200' },
  { id: 'book-bridge', x: 850, y: 600, w: 200, h: 20, type: 'book', color: 'bg-red-800' },
];

// LEVEL 2: The Giant (Verticality)
export const LEVEL_2_PLATFORMS: Platform[] = [
  // Arm Base
  { id: 'arm-base', x: 0, y: 700, w: 300, h: 100, type: 'arm', color: 'bg-blue-500' },
  
  // Climbing up the sleeve
  { id: 'sleeve-fold-1', x: 350, y: 600, w: 100, h: 20, type: 'arm', color: 'bg-blue-600' },
  { id: 'sleeve-fold-2', x: 250, y: 500, w: 100, h: 20, type: 'arm', color: 'bg-blue-600' },
  { id: 'shoulder', x: 400, y: 400, w: 200, h: 50, type: 'shoulder', color: 'bg-blue-700' },
  
  // Neck/Collar area
  { id: 'collar', x: 700, y: 350, w: 150, h: 20, type: 'shoulder', color: 'bg-white' },
  
  // Cheek/Jaw
  { id: 'jaw', x: 900, y: 300, w: 100, h: 20, type: 'head', color: 'bg-orange-200' },
  
  // Ear Lobe (Entry point)
  { id: 'lobe', x: 1000, y: 220, w: 80, h: 20, type: 'head', color: 'bg-orange-200' },
];

// LEVEL 3: Ear Canal (Organic, some tricky jumps)
export const LEVEL_3_PLATFORMS: Platform[] = [
  { id: 'start', x: 0, y: 500, w: 200, h: 300, type: 'organic', color: 'bg-rose-900' },
  
  // Wax platforms
  { id: 'wax-1', x: 250, y: 550, w: 50, h: 30, type: 'wax', color: 'bg-yellow-600' },
  { id: 'wax-2', x: 350, y: 450, w: 50, h: 30, type: 'wax', color: 'bg-yellow-600' },
  { id: 'wax-3', x: 450, y: 550, w: 50, h: 30, type: 'wax', color: 'bg-yellow-600' },
  
  // Hair follicles (Narrow)
  { id: 'hair-1', x: 600, y: 500, w: 20, h: 100, type: 'organic', color: 'bg-rose-950' },
  { id: 'hair-2', x: 700, y: 400, w: 20, h: 100, type: 'organic', color: 'bg-rose-950' },
  
  // Canal Floor end
  { id: 'end-floor', x: 800, y: 600, w: 400, h: 100, type: 'organic', color: 'bg-rose-900' },
  // High platform to reach exit
  { id: 'high-wax', x: 1000, y: 450, w: 60, h: 20, type: 'wax', color: 'bg-yellow-500' },
];

// LEVEL 4: Middle Ear (Bones - Precision jumping)
export const LEVEL_4_PLATFORMS: Platform[] = [
  { id: 'start', x: 0, y: 600, w: 150, h: 20, type: 'bone', color: 'bg-stone-300' },
  
  // Hammer (Malleus)
  { id: 'hammer-1', x: 200, y: 500, w: 80, h: 20, type: 'bone', color: 'bg-stone-200' },
  { id: 'hammer-2', x: 250, y: 400, w: 20, h: 100, type: 'bone', color: 'bg-stone-200' },
  
  // Anvil (Incus) - Small platforms
  { id: 'anvil-1', x: 400, y: 350, w: 60, h: 20, type: 'bone', color: 'bg-stone-200' },
  { id: 'anvil-2', x: 550, y: 450, w: 60, h: 20, type: 'bone', color: 'bg-stone-200' },
  
  // Stirrup (Stapes) - Needs good jump arc
  { id: 'stirrup-1', x: 700, y: 550, w: 40, h: 20, type: 'bone', color: 'bg-stone-200' },
  { id: 'stirrup-2', x: 850, y: 500, w: 40, h: 20, type: 'bone', color: 'bg-stone-200' },
  
  // Final jump
  { id: 'end', x: 1000, y: 650, w: 200, h: 20, type: 'bone', color: 'bg-stone-300' },
];

// LEVEL 5: The Brain (Dream World - Hardest)
export const LEVEL_5_PLATFORMS: Platform[] = [
  { id: 'start', x: 0, y: 700, w: 100, h: 20, type: 'neuron', color: 'bg-purple-500' },
  
  // Floating Neurons - Wide gaps, varied heights
  { id: 'n1', x: 200, y: 600, w: 60, h: 15, type: 'neuron', color: 'bg-cyan-500' },
  { id: 'n2', x: 350, y: 500, w: 40, h: 15, type: 'neuron', color: 'bg-cyan-500' },
  { id: 'n3', x: 150, y: 400, w: 40, h: 15, type: 'neuron', color: 'bg-cyan-500' },
  
  // High path
  { id: 'n4', x: 300, y: 300, w: 40, h: 15, type: 'neuron', color: 'bg-fuchsia-500' },
  { id: 'n5', x: 500, y: 250, w: 40, h: 15, type: 'neuron', color: 'bg-fuchsia-500' },
  
  // The drop
  { id: 'n6', x: 700, y: 400, w: 30, h: 15, type: 'neuron', color: 'bg-cyan-500' },
  { id: 'n7', x: 850, y: 300, w: 30, h: 15, type: 'neuron', color: 'bg-cyan-500' },
  
  // Final platform
  { id: 'end', x: 950, y: 200, w: 100, h: 20, type: 'neuron', color: 'bg-purple-500' },
];