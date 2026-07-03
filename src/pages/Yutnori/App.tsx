
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, User, Play, RotateCcw, Swords, Trophy, Move, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { GameState, Player, Piece, YutResult } from './types';
import { PLAYER_COLORS, PIECES_PER_PLAYER, YUT_VALUES } from './constants';
import { getRandomYutResult, calculateNextPositions, getAiMove } from './services/gameLogic';
import YutBoard from './components/YutBoard';
import YutStick from './components/YutStick';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'SETUP',
    players: [],
    pieces: [],
    currentTurn: 0,
    throwResults: [],
    lastThrow: null,
    isThrowing: false,
    winners: [],
    bonusThrows: 0
  });

  const [playerCount, setPlayerCount] = useState(2);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPlayer = gameState.players[gameState.currentTurn];

  const validTargets = useMemo(() => {
    if (draggedPieceId === null || gameState.throwResults.length === 0 || !currentPlayer) return [];
    
    const piece = gameState.pieces.find(p => p.id === draggedPieceId);
    if (!piece || piece.ownerId !== currentPlayer.id) return [];

    const targets: number[] = [];
    gameState.throwResults.forEach(res => {
      const moveResults = calculateNextPositions(piece, YUT_VALUES[res]);
      moveResults.forEach(next => {
        const targetNodeId = next.position === 'FINISH' ? 0 : next.position;
        if (targetNodeId !== null && !targets.includes(targetNodeId)) {
          targets.push(targetNodeId);
        }
      });
    });
    return targets;
  }, [draggedPieceId, gameState.throwResults, gameState.pieces, currentPlayer]);

  const hasAnyValidMove = useMemo(() => {
    if (gameState.throwResults.length === 0) return true;
    if (!currentPlayer) return false;

    return gameState.pieces.some(p => 
      p.ownerId === currentPlayer.id && 
      !p.isFinished &&
      gameState.throwResults.some(res => {
        const nexts = calculateNextPositions(p, YUT_VALUES[res]);
        return nexts.some(next => next.position !== p.position);
      })
    );
  }, [gameState.throwResults, gameState.pieces, currentPlayer]);

  const startGame = () => {
    const players: Player[] = [];
    const pieces: Piece[] = [];

    for (let i = 0; i < playerCount; i++) {
      const isUser = i === 0;
      players.push({
        id: i,
        name: isUser ? "나" : `AI ${i}`,
        avatar: isUser && userAvatar ? userAvatar : `https://api.dicebear.com/7.x/bottts/svg?seed=ai${i}`,
        isAi: !isUser,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        finishedCount: 0
      });

      for (let j = 0; j < PIECES_PER_PLAYER; j++) {
        pieces.push({
          id: i * PIECES_PER_PLAYER + j,
          ownerId: i,
          position: null,
          isFinished: false,
          path: 'OUTER'
        });
      }
    }

    setGameState({
      status: 'PLAYING',
      players,
      pieces,
      currentTurn: 0,
      throwResults: [],
      winners: [],
      lastThrow: null,
      isThrowing: false,
      bonusThrows: 0
    });
  };

  const throwYut = () => {
    // 윷, 모가 나왔거나 상대 말을 잡은 경우 추가로 던질 수 있음
    const isFirstThrow = gameState.throwResults.length === 0 && gameState.bonusThrows === 0;
    const canThrow = isFirstThrow || gameState.bonusThrows > 0;
    
    if (gameState.isThrowing || !canThrow) return;

    setGameState(prev => ({ 
      ...prev, 
      isThrowing: true,
      // 보너스 기회가 있는 상태에서 던지면 차감 (말을 미리 움직여서 throwResults가 비었더라도 bonusThrows가 있다면 차감해야 함)
      bonusThrows: prev.bonusThrows > 0 ? prev.bonusThrows - 1 : 0
    }));
    
    setTimeout(() => {
      const result = getRandomYutResult();
      setGameState(prev => ({
        ...prev,
        throwResults: [...prev.throwResults, result],
        lastThrow: result,
        isThrowing: false,
        // 윷이나 모가 나오면 추가 기회 +1
        bonusThrows: ['YUT', 'MO'].includes(result) ? prev.bonusThrows + 1 : prev.bonusThrows
      }));
    }, 1000);
  };

  const movePiece = (pieceId: number, targetNodeId: number) => {
    if (gameState.throwResults.length === 0) return;

    setGameState(prev => {
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece) return prev;

      let usedResultIdx = -1;
      let moveRes = null;

      for (let i = 0; i < prev.throwResults.length; i++) {
        const res = prev.throwResults[i];
        const possible = calculateNextPositions(piece, YUT_VALUES[res]);
        const matched = possible.find(p => (p.position === 'FINISH' ? 0 : p.position) === targetNodeId);
        if (matched) {
          usedResultIdx = i;
          moveRes = matched;
          break;
        }
      }

      if (usedResultIdx === -1) return prev;

      const newResults = [...prev.throwResults];
      newResults.splice(usedResultIdx, 1);

      const piecesToMove = prev.pieces.filter(p => 
        p.ownerId === piece.ownerId && 
        p.position === piece.position && 
        p.position !== null &&
        !p.isFinished
      );
      if (piecesToMove.length === 0) piecesToMove.push(piece);

      const isFinish = moveRes?.position === 'FINISH';
      let capturedAny = false;
      let updatedPieces = prev.pieces.map(p => {
        if (piecesToMove.find(m => m.id === p.id)) {
          return { 
            ...p, 
            position: isFinish ? null : targetNodeId as number,
            isFinished: isFinish,
            path: moveRes?.path || p.path
          };
        }
        return p;
      });

      if (!isFinish) {
        const opponents = updatedPieces.filter(p => 
          p.position === targetNodeId && 
          p.ownerId !== piece.ownerId && 
          !p.isFinished
        );
        if (opponents.length > 0) {
          capturedAny = true;
          updatedPieces = updatedPieces.map(p => {
            if (opponents.find(o => o.id === p.id)) {
              return { ...p, position: null, path: 'OUTER' };
            }
            return p;
          });
        }
      }

      const player = prev.players[prev.currentTurn];
      const newFinishedCount = isFinish ? player.finishedCount + piecesToMove.length : player.finishedCount;
      const updatedPlayers = prev.players.map(pl => 
        pl.id === player.id ? { ...pl, finishedCount: newFinishedCount } : pl
      );

      let newWinners = [...prev.winners];
      if (newFinishedCount === PIECES_PER_PLAYER && !newWinners.includes(player.id)) {
        newWinners.push(player.id);
      }

      const isGameOver = updatedPlayers.filter(p => p.finishedCount < PIECES_PER_PLAYER).length <= 1;

      // 새 보너스 기회 계산
      const nextBonusThrows = capturedAny ? prev.bonusThrows + 1 : prev.bonusThrows;

      // 턴 종료 여부 판단: 
      // 1. 남은 이동 결과가 없고
      // 2. 잡아서 생긴 기회를 포함하여 남아있는 보너스 던지기 기회도 없을 때
      const shouldEndTurn = newResults.length === 0 && nextBonusThrows === 0;

      let nextTurn = prev.currentTurn;
      if (shouldEndTurn && !isGameOver) {
        nextTurn = (prev.currentTurn + 1) % prev.players.length;
        while (updatedPlayers[nextTurn].finishedCount === PIECES_PER_PLAYER) {
          nextTurn = (nextTurn + 1) % prev.players.length;
        }
      }

      return {
        ...prev,
        pieces: updatedPieces,
        players: updatedPlayers,
        throwResults: newResults,
        currentTurn: nextTurn,
        winners: newWinners,
        status: isGameOver ? 'GAMEOVER' : 'PLAYING',
        bonusThrows: nextBonusThrows
      };
    });
    setDraggedPieceId(null);
  };

  const skipTurn = () => {
    setGameState(prev => {
      let nextTurn = (prev.currentTurn + 1) % prev.players.length;
      while (prev.players[nextTurn].finishedCount === PIECES_PER_PLAYER) {
        nextTurn = (nextTurn + 1) % prev.players.length;
      }
      return { ...prev, currentTurn: nextTurn, throwResults: [], lastThrow: null, bonusThrows: 0 };
    });
  };

  // AI 턴 처리
  useEffect(() => {
    if (gameState.status === 'PLAYING' && currentPlayer?.isAi && !gameState.isThrowing) {
      const timer = setTimeout(() => {
        // AI가 던질 수 있는 조건: 결과가 아예 없거나 보너스 기회가 있을 때
        const canThrow = gameState.throwResults.length === 0 || gameState.bonusThrows > 0;
        
        if (canThrow) {
          throwYut();
        } else if (gameState.throwResults.length > 0) {
          // 던지기가 모두 끝나면 이동 시작
          const res = gameState.throwResults[0];
          const pieceId = getAiMove(gameState, gameState.currentTurn, res);
          
          if (pieceId !== null) {
            const piece = gameState.pieces.find(p => p.id === pieceId)!;
            const nexts = calculateNextPositions(piece, YUT_VALUES[res]);
            const target = nexts[0].position === 'FINISH' ? 0 : nexts[0].position;
            if (target !== null) {
              movePiece(pieceId, target as number);
            }
          } else {
            // 이동할 수 없는 결과인 경우 (예: 말 없는 상태에서 백도)
            if (gameState.throwResults.length > 1) {
              // 다른 결과가 있다면 현재 결과만 버림
              setGameState(p => ({ ...p, throwResults: p.throwResults.slice(1) }));
            } else {
              // 더 이상 할 수 있는게 없으면 턴 종료
              skipTurn();
            }
          }
        }
      }, 1200); // 딜레이를 약간 줄여서 쾌적하게 조정
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.currentTurn, gameState.throwResults, gameState.isThrowing, gameState.bonusThrows]);

  const startCamera = async () => {
    setGameState(prev => ({ ...prev, status: 'CAMERA' }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setGameState(prev => ({ ...prev, status: 'SETUP' }));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setUserAvatar(canvasRef.current.toDataURL('image/png'));
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setGameState(prev => ({ ...prev, status: 'SETUP' }));
      }
    }
  };

  if (gameState.status === 'CAMERA') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={() => setGameState(prev => ({ ...prev, status: 'SETUP' }))} className="px-8 py-4 bg-slate-800 rounded-xl font-bold text-white">취소</button>
          <button onClick={capturePhoto} className="px-12 py-4 bg-amber-500 text-black rounded-xl font-black text-lg flex items-center gap-2"><Camera size={24} /> 촬영</button>
        </div>
      </div>
    );
  }

  if (gameState.status === 'SETUP') {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-[#2a2a2a] p-10 rounded-[3rem] shadow-2xl space-y-10 border border-white/10 text-center animate-in fade-in zoom-in duration-500">
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">SUPER YUT</h1>
          <div className="space-y-1">
            <p className="text-amber-500 font-bold text-xl">100% 실력과 운의 자연빵 승부</p>
            <p className="text-amber-100/20 text-sm italic">아닌듯..</p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-amber-500/20 bg-slate-800 flex items-center justify-center shadow-inner">
                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User size={80} className="text-slate-600" />}
              </div>
              <button onClick={startCamera} className="absolute bottom-1 right-1 p-4 bg-amber-500 rounded-full text-black hover:scale-110 transition shadow-xl"><Camera size={24} /></button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">인원 선택</p>
            <div className="flex gap-4">
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setPlayerCount(n)} className={`flex-1 py-5 rounded-2xl font-black text-2xl transition-all border-4 ${playerCount === n ? 'bg-amber-500 border-amber-400 text-black scale-105' : 'bg-slate-800 border-transparent text-slate-500 hover:border-white/10'}`}>{n}인</button>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="w-full py-6 bg-gradient-to-br from-amber-400 to-orange-600 text-black rounded-3xl font-black text-3xl shadow-2xl hover:scale-105 transition-transform">게임 시작</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 lg:p-10 flex flex-col lg:flex-row gap-8 items-center justify-center">
      <div className="w-full lg:w-80 bg-[#1e1e1e] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl self-start">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-amber-500"><Swords /> PLAYERS</h2>
        <div className="space-y-4">
          {gameState.players.map((p, idx) => (
            <div key={p.id} className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${gameState.currentTurn === idx ? 'bg-amber-500/10 border-amber-500 shadow-lg' : 'bg-slate-900/40 border-transparent opacity-40'}`}>
              <img src={p.avatar} className="w-12 h-12 rounded-full border-2" style={{ borderColor: p.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-black truncate text-sm">{p.name}</p>
                <div className="flex gap-1 mt-1">
                  {[...Array(PIECES_PER_PLAYER)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < p.finishedCount ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              {gameState.winners.includes(p.id) && <Trophy className="text-yellow-500" size={20} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-8 max-w-4xl">
        <YutBoard 
          pieces={gameState.pieces} players={gameState.players} validTargets={validTargets}
          onDragStartPiece={setDraggedPieceId} onDropPiece={(nodeId) => movePiece(draggedPieceId!, nodeId)}
        />
        <div className="bg-[#1e1e1e] p-6 rounded-[2.5rem] w-full border border-white/5 flex flex-wrap justify-center gap-4">
          {gameState.pieces.filter(p => p.ownerId === currentPlayer?.id && p.position === null && !p.isFinished).map(p => (
            <div 
              key={p.id} draggable={!currentPlayer?.isAi && (gameState.throwResults.length > 0 || gameState.bonusThrows > 0)}
              onDragStart={() => setDraggedPieceId(p.id)}
              className="w-14 h-14 rounded-full border-4 border-white cursor-grab shadow-xl hover:scale-110 transition active:cursor-grabbing"
              style={{ backgroundColor: currentPlayer?.color }}
            />
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6 self-start">
        <div className="bg-[#1e1e1e] p-8 rounded-[3rem] border border-white/5 shadow-2xl text-center">
          <h3 className="text-slate-500 font-black uppercase tracking-widest text-xs mb-8">Throw Results</h3>
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map(i => {
              let isFlat = false;
              if (gameState.lastThrow) {
                if (gameState.lastThrow === 'BACK_DO') isFlat = i === 0;
                else if (gameState.lastThrow === 'YUT') isFlat = true;
                else if (gameState.lastThrow === 'MO') isFlat = false;
                else isFlat = i < YUT_VALUES[gameState.lastThrow];
              }
              return <YutStick key={i} isFlat={isFlat} isMarked={i === 0 && gameState.lastThrow === 'BACK_DO'} animate={gameState.isThrowing} />;
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[50px]">
            {gameState.throwResults.map((res, i) => (
              <span key={i} className="px-6 py-3 bg-amber-500 text-black font-black rounded-xl text-xl animate-bounce">{res}</span>
            ))}
          </div>
          <button 
            onClick={throwYut} 
            disabled={gameState.isThrowing || currentPlayer?.isAi || (gameState.throwResults.length > 0 && gameState.bonusThrows === 0)}
            className={`w-full py-6 rounded-[2rem] font-black text-3xl shadow-2xl transition-all ${
              gameState.isThrowing || currentPlayer?.isAi || (gameState.throwResults.length > 0 && gameState.bonusThrows === 0)
              ? 'bg-slate-800 text-slate-600' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            {gameState.isThrowing ? <RefreshCw className="animate-spin mx-auto" /> : '던지기'}
          </button>
          
          {gameState.bonusThrows > 0 && !gameState.isThrowing && !currentPlayer?.isAi && (
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-bold animate-pulse">
              <Sparkles size={18} /> 보너스 던지기 기회! ({gameState.bonusThrows}회)
            </div>
          )}

          {!hasAnyValidMove && gameState.throwResults.length > 0 && !currentPlayer?.isAi && (
            <button onClick={skipTurn} className="w-full mt-4 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/5"><RotateCcw size={18} /> 턴 넘기기</button>
          )}
        </div>
        <button onClick={() => window.location.reload()} className="p-4 bg-slate-900/50 rounded-2xl text-slate-500 font-bold hover:text-white transition">처음으로</button>
      </div>

      {gameState.status === 'GAMEOVER' && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-700">
          <div className="bg-[#2a2a2a] w-full max-w-md p-12 rounded-[4rem] text-center border-t-8 border-amber-500">
            <Trophy size={80} className="text-amber-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl font-black mb-10 italic">GAME OVER</h2>
            <div className="space-y-4 mb-12">
              {gameState.winners.map((wid, i) => {
                const p = gameState.players.find(pl => pl.id === wid);
                return (
                  <div key={wid} className="flex items-center gap-6 p-5 bg-slate-800/50 rounded-3xl border border-white/5">
                    <span className="text-3xl font-black text-amber-500 italic w-10">{i + 1}</span>
                    <img src={p?.avatar} className="w-16 h-16 rounded-full border-4 border-white/10" />
                    <span className="font-black text-2xl flex-1 text-left">{p?.name}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-6 bg-amber-500 text-black rounded-3xl font-black text-2xl hover:scale-105 transition shadow-2xl">다시 하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
