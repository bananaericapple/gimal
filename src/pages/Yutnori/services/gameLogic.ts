
import { YutResult, Piece, Player, GameState } from '../types';
import { YUT_VALUES } from '../constants';

export interface MoveResult {
  position: number | 'FINISH' | null;
  path: 'OUTER' | 'DIAG_TR' | 'DIAG_TL';
}

/**
 * 말의 현재 위치와 경로를 기반으로 가능한 모든 다음 위치를 계산합니다.
 */
export const calculateNextPositions = (piece: Piece, distance: number): MoveResult[] => {
  const currentPos = piece.position;
  const currentPath: 'OUTER' | 'DIAG_TR' | 'DIAG_TL' = piece.path || 'OUTER';

  if (distance === 0) return [{ position: currentPos, path: currentPath }];

  // 빽도(Back-Do) 처리
  if (distance === -1) {
    // 판에 아무 말이 없는데(null) 백도가 뜨면 보드 진입 불가 (제자리 null)
    if (currentPos === null) return [{ position: null, path: 'OUTER' }];
    
    let nextPos: number | 'FINISH' | null = currentPos;
    let nextPath = currentPath;

    if (currentPos >= 0 && currentPos <= 19) {
      if (currentPos === 0) {
        nextPos = 19;
      } else if (currentPos === 1) {
        // 말이 한 칸(1번) 가 있는데 백도가 뜨면 즉시 골인
        nextPos = 'FINISH';
      } else {
        nextPos = (currentPos as number) - 1;
      }
    } else if (currentPos === 20) {
      nextPos = 5;
    } else if (currentPos === 25) {
      nextPos = 10;
    } else if (currentPos === 22) {
      // 중앙에서 빽도는 들어온 방향으로 나감
      nextPos = (currentPath === 'DIAG_TL') ? 26 : 21;
    } else if (currentPos >= 21 && currentPos <= 24) {
      nextPos = (currentPos as number) - 1;
    } else if (currentPos >= 26 && currentPos <= 28) {
      nextPos = (currentPos as number) - 1;
    }
    
    if (nextPos !== null && nextPos !== 'FINISH' && nextPos >= 0 && nextPos <= 19) {
      nextPath = 'OUTER';
    }
    if (nextPos === null) {
      nextPath = 'OUTER';
    }

    return [{ position: nextPos, path: nextPath }];
  }

  // 일반 이동 (갈림길 처리)
  const results: MoveResult[] = [];

  const traverse = (pos: number | null, path: 'OUTER' | 'DIAG_TR' | 'DIAG_TL', steps: number, isFirstStep: boolean) => {
    if (steps === 0) {
      // 0번 노드(시작점)에 다시 돌아왔을 때, 이전 위치가 존재했다면 골인으로 간주
      results.push({ position: (pos === 0 && currentPos !== null) ? 'FINISH' : pos, path });
      return;
    }

    if (pos === null) {
      // 대기 중인 말은 1번 칸부터 시작 (도 던지면 1번)
      traverse(1, 'OUTER', steps - 1, false);
    } else if (pos === 5 && isFirstStep) {
      traverse(20, 'DIAG_TR', steps - 1, false);
    } else if (pos === 10 && isFirstStep) {
      traverse(25, 'DIAG_TL', steps - 1, false);
    } else if (pos === 22 && isFirstStep) {
      // 중앙 선택지
      traverse(23, 'DIAG_TR', steps - 1, false);
      traverse(27, 'DIAG_TL', steps - 1, false);
    } else if (pos === 22) {
      const p = (path === 'DIAG_TL') ? 27 : 23;
      traverse(p, path, steps - 1, false);
    } else if (pos === 24) {
      traverse(15, 'OUTER', steps - 1, false);
    } else if (pos === 28) {
      traverse(0, 'OUTER', steps - 1, false);
    } else if (pos === 19) {
      traverse(0, 'OUTER', steps - 1, false);
    } else if (pos === 0) {
      results.push({ position: 'FINISH', path: 'OUTER' });
    } else {
      const p = (path === 'OUTER') ? (pos + 1) % 20 : pos + 1;
      traverse(p, path, steps - 1, false);
    }
  };

  traverse(currentPos, currentPath, distance, true);

  const uniqueResults: MoveResult[] = [];
  const seen = new Set();
  for (const r of results) {
    const key = `${r.position}-${r.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(r);
    }
  }

  return uniqueResults;
};

export const calculateNextPosition = (piece: Piece, distance: number): MoveResult => {
  return calculateNextPositions(piece, distance)[0];
};

export const getRandomYutResult = (): YutResult => {
  const sticks = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
  const flatCount = sticks.filter(s => s).length;

  if (flatCount === 1) {
    return sticks[0] ? 'BACK_DO' : 'DO';
  }
  if (flatCount === 2) return 'GAE';
  if (flatCount === 3) return 'GEOL';
  if (flatCount === 4) return 'YUT';
  return 'MO';
};

/**
 * AI가 현재 결과(throwResult)로 움직일 수 있는 최적의 말을 찾습니다.
 * 이동이 불가능한 경우 반드시 null을 반환해야 합니다.
 */
export const getAiMove = (gameState: GameState, playerIdx: number, throwResult: YutResult): number | null => {
  const player = gameState.players[playerIdx];
  const myPieces = gameState.pieces.filter(p => p.ownerId === player.id && !p.isFinished);
  const distance = YUT_VALUES[throwResult];

  // 1. 상대 말을 잡을 수 있는 수 우선
  for (const piece of myPieces) {
    const nexts = calculateNextPositions(piece, distance);
    for (const next of nexts) {
      if (typeof next.position === 'number') {
        const targetOpponent = gameState.pieces.find(p => p.position === next.position && p.ownerId !== player.id && !p.isFinished);
        if (targetOpponent) return piece.id;
      }
    }
  }

  // 2. 골인할 수 있는 수
  for (const piece of myPieces) {
    const nexts = calculateNextPositions(piece, distance);
    if (nexts.some(n => n.position === 'FINISH')) return piece.id;
  }

  // 3. 가능한 일반 이동 중 멀리 있는 것 우선
  const sorted = [...myPieces].sort((a, b) => {
    const posA = a.position === null ? -1 : (a.position as number);
    const posB = b.position === null ? -1 : (b.position as number);
    return posB - posA;
  });

  for (const p of sorted) {
    const nexts = calculateNextPositions(p, distance);
    // 실제로 위치가 변하는 경우에만 선택
    if (nexts.some(n => n.position !== p.position)) return p.id;
  }

  // 어떤 말도 실제로 이동할 수 없다면 null 반환
  return null;
};
