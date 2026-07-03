
import React, { useEffect, useRef, useState } from 'react';
import { Bullet, Soul } from '../types';

interface BattleArenaProps {
  isActive: boolean;
  mode: 'ATTACK' | 'DEFEND';
  onHit: () => void;
  onTurnEnd: () => void;
  onAttackEnd?: (damage: number) => void;
  difficulty: number;
}

// 기본 상수
const STD_DEFEND_WIDTH = 450;
const STD_ARENA_HEIGHT = 200;
const STD_SOUL_SPEED = 2.4;

// 3번째 패턴 전용 (점프 패턴)
const BIG_DEFEND_WIDTH = 540;
const BIG_ARENA_HEIGHT = 240;

const ATTACK_WIDTH = 750;
const SOUL_SIZE = 16;

// 중력 및 점프 상수 (플레이어 요청에 따라 대폭 상향)
const GRAVITY = 0.32; // 공중 체공을 위해 살짝 낮춤
const JUMP_IMPULSE = -11.2; // 기존 -8.2에서 대폭 강화 (높은 구멍 도달 가능)
const FALL_GRAVITY_MULTIPLIER = 2.8; // 키를 떼었을 때 더 급격히 하강하게 하여 짧은 점프 변별력 강화

const BattleArena: React.FC<BattleArenaProps> = ({ isActive, mode, onHit, onTurnEnd, onAttackEnd, difficulty }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const turnEndingRef = useRef<boolean>(false);
  
  // 현재 패턴 타입 (0: 점프 패턴, 1: 웨이브, 2: 비)
  const patternType = difficulty % 3;
  const isJumpPattern = patternType === 0 && mode === 'DEFEND';

  const currentWidth = mode === 'ATTACK' ? ATTACK_WIDTH : (isJumpPattern ? BIG_DEFEND_WIDTH : STD_DEFEND_WIDTH);
  const currentHeight = isJumpPattern ? BIG_ARENA_HEIGHT : STD_ARENA_HEIGHT;

  const soulRef = useRef<Soul & { vy: number; isGrounded: boolean }>({ 
    x: currentWidth / 2 - SOUL_SIZE / 2, 
    y: currentHeight - SOUL_SIZE - 6, 
    width: SOUL_SIZE, 
    height: SOUL_SIZE, 
    speed: STD_SOUL_SPEED,
    vy: 0,
    isGrounded: false
  });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  const attackStateRef = useRef({
    barX: 40,
    direction: 1, 
    speed: 9,
    isStopped: false,
    flashFrames: 0, 
    phase: 'AIMING' as 'AIMING' | 'HIT_ANIMATION' | 'DONE'
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    if (mode === 'DEFEND') return Math.max(2, 7 + Math.floor(difficulty / 4)); 
    return -1;
  });

  useEffect(() => {
    soulRef.current = {
      x: currentWidth / 2 - SOUL_SIZE / 2,
      y: isJumpPattern ? currentHeight - SOUL_SIZE - 6 : currentHeight / 2 - SOUL_SIZE / 2,
      width: SOUL_SIZE,
      height: SOUL_SIZE,
      speed: STD_SOUL_SPEED,
      vy: 0,
      isGrounded: false
    };
    bulletsRef.current = [];
    frameCountRef.current = 0;
    turnEndingRef.current = false;
  }, [difficulty, mode, currentWidth, currentHeight, isJumpPattern]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = true;
      keysRef.current[e.key.toLowerCase()] = true;
      
      if (isActive && mode === 'ATTACK' && e.code === 'Space' && attackStateRef.current.phase === 'AIMING') {
        triggerAttackHit();
      }

      // 점프 시작
      if (isJumpPattern && (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w')) {
        if (soulRef.current.isGrounded) {
          soulRef.current.vy = JUMP_IMPULSE;
          soulRef.current.isGrounded = false;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = false;
      keysRef.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, mode, isJumpPattern]);

  useEffect(() => {
    if (!isActive) return;
    if (mode === 'DEFEND') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (mode === 'ATTACK') {
      attackStateRef.current = {
        barX: 40,
        direction: 1,
        speed: 10 + Math.random() * 4,
        isStopped: false,
        flashFrames: 0,
        phase: 'AIMING'
      };
    }
  }, [isActive, mode]);

  const triggerAttackHit = () => {
    attackStateRef.current.isStopped = true;
    attackStateRef.current.phase = 'HIT_ANIMATION';
    attackStateRef.current.flashFrames = 10;
    const center = ATTACK_WIDTH / 2;
    const distance = Math.abs(attackStateRef.current.barX - center);
    let damage = distance < 12 ? 150 : distance < 100 ? 110 - distance / 2 : 30;
    setTimeout(() => onAttackEnd?.(damage), 200);
  };

  const drawHeartHead = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, flipped: boolean, rotate: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    if (rotate !== 0) ctx.rotate(rotate);
    if (flipped) ctx.scale(1, -1);
    ctx.fillStyle = color;
    ctx.beginPath();
    const hSize = size / 2;
    const yOffset = -hSize * 0.75;
    ctx.moveTo(0, yOffset + hSize / 2);
    ctx.bezierCurveTo(0, yOffset, -hSize, yOffset - hSize, -hSize, yOffset);
    ctx.bezierCurveTo(-hSize, yOffset + hSize, 0, yOffset + hSize * 1.5, 0, yOffset + hSize * 1.5);
    ctx.bezierCurveTo(0, yOffset + hSize * 1.5, hSize, yOffset + hSize, hSize, yOffset);
    ctx.bezierCurveTo(hSize, yOffset - hSize, 0, yOffset, 0, yOffset + hSize / 2);
    ctx.fill();
    ctx.restore();
  };

  const updateDefend = (ctx: CanvasRenderingContext2D) => {
    frameCountRef.current++;
    const soul = soulRef.current;

    if (isJumpPattern) {
      // 가변 점프 시스템 최적화
      let currentGravity = GRAVITY;
      const isHoldingJump = keysRef.current['Space'] || keysRef.current['ArrowUp'] || keysRef.current['KeyW'] || keysRef.current['w'];
      
      // 상승 중일 때 키를 떼면 중력이 대폭 강화되어 즉시 하강 (짧은 점프 구현)
      if (soul.vy < 0 && !isHoldingJump) {
        currentGravity = GRAVITY * FALL_GRAVITY_MULTIPLIER;
      }
      
      soul.vy += currentGravity;
      soul.y += soul.vy;

      // 바닥 충돌 판정
      if (soul.y > currentHeight - soul.height - 6) {
        soul.y = currentHeight - soul.height - 6;
        soul.vy = 0;
        soul.isGrounded = true;
      }
      // 천장 충돌 판정 (너무 높게 뛰는 경우 방지)
      if (soul.y < 4) {
        soul.y = 4;
        soul.vy = 0;
      }
    } else {
      if (keysRef.current['ArrowUp'] || keysRef.current['w']) soul.y = Math.max(4, soul.y - soul.speed);
      if (keysRef.current['ArrowDown'] || keysRef.current['s']) soul.y = Math.min(currentHeight - soul.height - 4, soul.y + soul.speed);
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) soul.x = Math.max(4, soul.x - soul.speed);
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) soul.x = Math.min(currentWidth - soul.width - 4, soul.x + soul.speed);
    }

    // 장애물 생성 로직
    if (timeLeft > 0) {
      if (patternType === 1 && frameCountRef.current % 5 === 0) {
        // 웨이브 패턴
        const waveSpeed = 12;
        const gapSize = 70;
        const midY = currentHeight / 2;
        const gapY = midY + Math.sin(frameCountRef.current * 0.04) * 60 - gapSize/2;
        bulletsRef.current.push({ x: currentWidth, y: 0, width: 14, height: gapY, vx: -waveSpeed, vy: 0, type: 'BONE', id: Math.random() });
        bulletsRef.current.push({ x: currentWidth, y: gapY + gapSize, width: 14, height: currentHeight - (gapY + gapSize), vx: -waveSpeed, vy: 0, type: 'BONE', id: Math.random() });
      } else if (patternType === 2 && frameCountRef.current % 8 === 0) {
        // 비 패턴
        const rainSpeed = 12;
        const boneHeight = 50 + Math.random() * 60;
        const isTop = Math.random() > 0.5;
        bulletsRef.current.push({ x: Math.random() * (currentWidth - 20), y: isTop ? -boneHeight : currentHeight, width: 16, height: boneHeight, vx: 0, vy: isTop ? rainSpeed : -rainSpeed, type: 'BONE', id: Math.random() });
      } else if (patternType === 0 && frameCountRef.current % 90 === 0) {
        // 점프 패턴: 양쪽 뼈 틈새 위치 동기화 및 얇은 뼈
        const gapHeight = 78; // 틈새를 살짝 더 넓힘
        const boneWidth = 14;
        const bulletSpeed = 5.2;
        
        // 양쪽에서 오는 뼈의 틈새 높이를 동일하게 생성 (이제 플레이어 점프력이 좋아져서 어디든 도달 가능)
        const sharedGapY = Math.random() * (currentHeight - gapHeight - 60) + 10;

        // 왼쪽 벽
        bulletsRef.current.push({ x: -boneWidth, y: 0, width: boneWidth, height: sharedGapY, vx: bulletSpeed, vy: 0, type: 'BONE', id: Math.random() });
        bulletsRef.current.push({ x: -boneWidth, y: sharedGapY + gapHeight, width: boneWidth, height: currentHeight - (sharedGapY + gapHeight), vx: bulletSpeed, vy: 0, type: 'BONE', id: Math.random() });

        // 오른쪽 벽
        bulletsRef.current.push({ x: currentWidth, y: 0, width: boneWidth, height: sharedGapY, vx: -bulletSpeed, vy: 0, type: 'BONE', id: Math.random() });
        bulletsRef.current.push({ x: currentWidth, y: sharedGapY + gapHeight, width: boneWidth, height: currentHeight - (sharedGapY + gapHeight), vx: -bulletSpeed, vy: 0, type: 'BONE', id: Math.random() });
      }
    }

    // 뼈 업데이트 및 충돌 체크
    bulletsRef.current.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.hitCooldown && b.hitCooldown > 0) b.hitCooldown--;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      const hSize = 18;
      
      // 뼈 머리 장식
      if (patternType !== 2) {
        const isTop = b.y === 0;
        drawHeartHead(ctx, b.x + b.width / 2, isTop ? b.height : b.y, hSize, 'white', isTop);
      } else {
        const down = b.vy > 0;
        drawHeartHead(ctx, b.x + b.width / 2, down ? b.y + b.height : b.y, hSize, 'white', !down);
      }

      // 충돌 판정
      if (soul.x < b.x + b.width && soul.x + soul.width > b.x && soul.y < b.y + b.height && soul.y + soul.height > b.y) {
        if (!b.hitCooldown || b.hitCooldown <= 0) {
          onHit();
          b.hitCooldown = 20;
        }
      }
    });

    bulletsRef.current = bulletsRef.current.filter(b => b.x + b.width > -50 && b.x < currentWidth + 50 && b.y + b.height > -50 && b.y < currentHeight + 50);
    
    if (timeLeft === 0 && bulletsRef.current.length === 0 && !turnEndingRef.current) {
      turnEndingRef.current = true;
      onTurnEnd();
    }

    // 소울 렌더링
    ctx.shadowBlur = 15;
    ctx.shadowColor = isJumpPattern ? '#0077ff' : 'red';
    drawSoul(ctx, soul.x, soul.y, isJumpPattern ? '#4488ff' : 'red');
    ctx.shadowBlur = 0;
  };

  const drawAttackUI = (ctx: CanvasRenderingContext2D) => {
    const centerY = currentHeight / 2;
    const centerX = ATTACK_WIDTH / 2;
    const ellipseW = ATTACK_WIDTH - 60;
    const ellipseH = 160;
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ellipseW / 2, ellipseH / 2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#adff2f';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.clip();

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ATTACK_WIDTH, currentHeight);

    // Target zones
    ctx.fillStyle = '#ff0000';
    const redW = 25;
    const redOffset = ellipseW * 0.38;
    ctx.fillRect(centerX - redOffset - redW, centerY - 80, redW, 160);
    ctx.fillRect(centerX + redOffset, centerY - 80, redW, 160);

    ctx.fillStyle = '#ffff00';
    const yellowW = 10;
    const yellowOffset = ellipseW * 0.22;
    ctx.fillRect(centerX - yellowOffset - yellowW, centerY - 80, yellowW, 160);
    ctx.fillRect(centerX + yellowOffset, centerY - 80, yellowW, 160);

    ctx.fillStyle = '#adff2f';
    const greenW = 40;
    const greenOffset = 15;
    ctx.fillRect(centerX - greenOffset - greenW, centerY - 80, greenW, 160);
    ctx.fillRect(centerX + greenOffset, centerY - 80, greenW, 160);

    ctx.fillStyle = 'white';
    ctx.fillRect(centerX - 4, centerY - 90, 8, 180);
    ctx.restore();

    const { barX, flashFrames } = attackStateRef.current;
    if (flashFrames > 0) {
      if (Math.floor(flashFrames / 3) % 2 === 0) {
         ctx.fillStyle = 'white';
         ctx.globalAlpha = 0.5;
         ctx.fillRect(0, 0, ATTACK_WIDTH, currentHeight);
         ctx.globalAlpha = 1;
      }
      attackStateRef.current.flashFrames--;
    }

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.fillRect(barX - 6, 0, 12, currentHeight);
    ctx.restore();
  };

  const updateAttack = (ctx: CanvasRenderingContext2D) => {
    const state = attackStateRef.current;
    if (!state.isStopped) {
      state.barX += state.speed * state.direction;
      if (state.barX >= ATTACK_WIDTH - 30) {
        state.barX = ATTACK_WIDTH - 30;
        state.direction = -1;
      } else if (state.barX <= 30) {
        state.barX = 30;
        state.direction = 1;
      }
    }
    drawAttackUI(ctx);
  };

  const drawSoul = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const size = SOUL_SIZE / 2;
    const cx = x + SOUL_SIZE / 2;
    const cy = y + SOUL_SIZE / 2;
    ctx.moveTo(cx, cy + size / 2);
    ctx.bezierCurveTo(cx, cy, cx - size, cy - size, cx - size, cy);
    ctx.bezierCurveTo(cx - size, cy + size, cx, cy + size * 1.5, cx, cy + size * 1.5);
    ctx.bezierCurveTo(cx, cy + size * 1.5, cx + size, cy + size, cx + size, cy);
    ctx.bezierCurveTo(cx + size, cy - size, cx, cy, cx, cy + size / 2);
    ctx.fill();
  };

  const loop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, currentWidth, currentHeight);

    if (mode === 'ATTACK') {
      updateAttack(ctx);
    } else {
      updateDefend(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (isActive) requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  });

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={currentWidth}
        height={currentHeight}
        className="border-4 border-white bg-black mx-auto block shadow-lg transition-all duration-300"
      />
      {mode === 'ATTACK' && isActive && !attackStateRef.current.isStopped && (
        <div className="absolute bottom-2 w-full text-center text-white text-lg pixel-font animate-pulse tracking-widest">
          PRESS [SPACE] TO ATTACK
        </div>
      )}
      {isJumpPattern && (
        <div className="absolute -bottom-8 w-full text-center text-blue-400 text-sm pixel-font animate-pulse">
          TAP [SPACE] FOR SHORT JUMP, HOLD FOR MAX JUMP
        </div>
      )}
    </div>
  );
};

export default BattleArena;
