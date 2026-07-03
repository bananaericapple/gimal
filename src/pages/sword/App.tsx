
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  SwordStats, PlayerState, GameLog, GameLogType 
} from './types';
import { 
  INITIAL_GOLD, PROTECTION_TICKET_PRICE, MATERIAL_UNIT_PRICE, MAX_LEVEL, 
  SWORD_DATA, getEnhanceCost, getSellPrice, getRates, getMaterialCost, getReviveTicketCost
} from './constants';
import { getSwordLore } from './geminiService';

const App: React.FC = () => {
  // Player State
  const [gold, setGold] = useState(INITIAL_GOLD);
  const [tickets, setTickets] = useState(10);
  const [materials, setMaterials] = useState(50);

  // Sword State
  const [level, setLevel] = useState(0);
  const [lore, setLore] = useState("전설의 대장간에 오신 것을 환영합니다.");
  const [isLoreLoading, setIsLoreLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: GameLogType, id: number } | null>(null);

  // Game Options
  const [autoRevive, setAutoRevive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  // UI State
  const [logs, setLogs] = useState<GameLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 최신 로그가 항상 보이도록 자동 스크롤 (컨테이너 내부 스크롤)
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (type: GameLogType, message: string) => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
    };
    // 로그를 최대 30개로 제한하여 성능 및 레이아웃 유지
    setLogs(prev => [...prev, newLog].slice(-30));
  };

  const updateLore = async (lvl: number) => {
    if (lvl === 0) {
      setLore("새로운 시작입니다. 검을 강화해보세요.");
      return;
    }
    
    if (lvl % 5 === 0) {
      setIsLoreLoading(true);
      try {
        const newLore = await getSwordLore(lvl, SWORD_DATA[Math.min(lvl, SWORD_DATA.length - 1)]);
        setLore(newLore);
      } catch (e) {
        setLore(`${lvl}단계 강화에 성공하여 신비로운 빛을 내뿜습니다.`);
      } finally {
        setIsLoreLoading(false);
      }
    } else {
      setLore(`${lvl}단계 강화에 성공하여 위력이 더욱 상승했습니다.`);
    }
  };

  const handleEnhance = useCallback(() => {
    if (isEnhancing || isDestroyed || level >= MAX_LEVEL) return;

    const cost = getEnhanceCost(level);
    const matCost = getMaterialCost(level);

    if (gold < cost) {
      addLog(GameLogType.FAILURE, "골드가 부족합니다!");
      return;
    }
    if (materials < matCost) {
      addLog(GameLogType.FAILURE, "강화 재료(💎)가 부족합니다!");
      return;
    }

    setGold(prev => prev - cost);
    setMaterials(prev => prev - matCost);
    
    const { success, destroy } = getRates(level);
    const rand = Math.random() * 100;

    let resultType: GameLogType;

    if (rand < success) {
      const newLvl = level + 1;
      const swordName = SWORD_DATA[Math.min(newLvl, SWORD_DATA.length - 1)];
      setLevel(newLvl);
      resultType = GameLogType.SUCCESS;
      addLog(GameLogType.SUCCESS, `강화 성공! +${newLvl} ${swordName}`);
      updateLore(newLvl);
    } else if (rand < success + destroy) {
      const reviveCost = getReviveTicketCost(level);
      if (autoRevive && tickets >= reviveCost) {
        setTickets(prev => prev - reviveCost);
        resultType = GameLogType.FAILURE;
        addLog(GameLogType.FAILURE, `파괴 위기! 자동 방지권(${reviveCost}개)으로 복구했습니다.`);
      } else {
        setIsDestroyed(true);
        resultType = GameLogType.DESTROYED;
        addLog(GameLogType.DESTROYED, `검이 파괴되었습니다!`);
      }
    } else {
      resultType = GameLogType.FAILURE;
      addLog(GameLogType.FAILURE, "강화 실패! 아무 일도 일어나지 않았습니다.");
    }

    setLastResult({ type: resultType, id: Date.now() });
    setIsEnhancing(true);
    setTimeout(() => setIsEnhancing(false), 300);

  }, [level, gold, materials, tickets, isEnhancing, isDestroyed, autoRevive]);

  const handleSell = () => {
    if (level === 0 || isEnhancing || isDestroyed) return;
    const price = getSellPrice(level);
    setGold(prev => prev + price);
    addLog(GameLogType.SELL, `검을 ${price.toLocaleString()}원에 판매했습니다.`);
    setLevel(0);
    setLastResult(null);
    updateLore(0);
  };

  const handleRevive = () => {
    const cost = getReviveTicketCost(level);
    if (tickets < cost) {
      addLog(GameLogType.FAILURE, `방지권이 부족합니다! (${cost}개 필요)`);
      return;
    }
    setTickets(prev => prev - cost);
    setIsDestroyed(false);
    setLastResult(null);
    addLog(GameLogType.SHOP, "방지권을 사용하여 검을 복구했습니다!");
  };

  const handleDecompose = () => {
    const gainedMats = Math.max(1, Math.floor(level * 2.5));
    setMaterials(prev => prev + gainedMats);
    addLog(GameLogType.DESTROYED, `검을 분해하여 재료 ${gainedMats}개를 획득했습니다.`);
    setLevel(0);
    setIsDestroyed(false);
    setLastResult(null);
    updateLore(0);
  };

  const buyItem = (type: 'ticket' | 'material') => {
    const unitPrice = type === 'ticket' ? PROTECTION_TICKET_PRICE : MATERIAL_UNIT_PRICE;
    const totalPrice = unitPrice * buyQuantity;
    
    if (gold < totalPrice) {
      addLog(GameLogType.FAILURE, "골드가 부족합니다!");
      return;
    }
    
    setGold(prev => prev - totalPrice);
    if (type === 'ticket') {
      setTickets(prev => prev + buyQuantity);
      addLog(GameLogType.SHOP, `방지권 ${buyQuantity}개를 구매했습니다.`);
    } else {
      setMaterials(prev => prev + buyQuantity);
      addLog(GameLogType.SHOP, `강화 재료 ${buyQuantity}개를 구매했습니다.`);
    }
  };

  const visualTheme = useMemo(() => {
    if (isDestroyed) {
      return {
        icon: '☠️',
        mainColor: '#450a0a',
        glowStyle: 'border-red-900 shadow-none grayscale opacity-40',
        auraContent: null
      };
    }

    if (level === 0) return { icon: '🗡️', mainColor: '#1e293b', glowStyle: 'border-slate-800 shadow-none', auraContent: null };

    let hue = (level * 7) % 360; 
    let saturation = 70 + (level / MAX_LEVEL) * 30;
    let brightness = 50 + (level / MAX_LEVEL) * 20;
    const color = `hsl(${hue}, ${saturation}%, ${brightness}%)`;

    let icon = '🗡️';
    if (level >= 10) icon = '⚔️';
    if (level >= 20) icon = '🪄';
    if (level >= 30) icon = '🔱';
    if (level >= 40) icon = '🔥';
    if (level >= 45) icon = '💎';
    if (level >= 50) icon = '🌌';

    const auraScale = 1 + (level / MAX_LEVEL) * 1.5;
    const particleOpacity = 0.1 + (level / MAX_LEVEL) * 0.6;

    return {
      icon,
      mainColor: color,
      glowStyle: `border-white/20 shadow-2xl`,
      auraContent: (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible" style={{ '--aura-color': color } as React.CSSProperties}>
          <div className="absolute w-[300px] h-[300px] rounded-full aura-breath blur-[80px]" style={{ backgroundColor: color }}></div>
          <div className="absolute w-[400px] h-[400px] border border-white/10 rounded-full aura-rotate-slow blur-[2px]" style={{ transform: `scale(${auraScale})` }}></div>
          {level >= 15 && (
            <div className="absolute w-[450px] h-[450px] border-2 border-dashed border-white/5 rounded-full aura-rotate-fast" style={{ transform: `scale(${auraScale * 1.1})` }}></div>
          )}
          {level >= 35 && (
            <div className="absolute w-[550px] h-[550px] border-4 border-white/5 rounded-full aura-rotate-slow blur-xl" style={{ transform: `scale(${auraScale * 1.2})` }}></div>
          )}
          <div className="particle-layer" style={{ opacity: particleOpacity, '--aura-color': color } as React.CSSProperties}></div>
          <div className="absolute w-64 h-64 rounded-full blur-[40px] animate-pulse" style={{ backgroundColor: `${color}44` }}></div>
        </div>
      )
    };
  }, [level, isDestroyed]);

  const rates = getRates(level);
  const cost = getEnhanceCost(level);
  const matCost = getMaterialCost(level);
  const sellPrice = getSellPrice(level);
  const reviveCost = getReviveTicketCost(level);

  return (
    <div className="h-screen bg-slate-950 flex flex-col p-4 md:p-8 overflow-hidden text-slate-100">
      {/* 상단 정보 바 (고정 높이) */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 flex flex-wrap justify-between items-center gap-6 mb-8 z-50 shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">나의 자산</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-2xl drop-shadow-lg">💰</span>
              <span className="text-2xl font-black">{gold.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">보호 티켓</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-2xl drop-shadow-lg">🛡️</span>
              <span className="text-2xl font-black">{tickets.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">희귀 재료</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-2xl drop-shadow-lg">💎</span>
              <span className="text-2xl font-black">{materials.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {[1, 10, 100, 1000].map(q => (
              <button
                key={q}
                onClick={() => setBuyQuantity(q)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${buyQuantity === q ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                x{q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => buyItem('ticket')} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-5 py-3 rounded-2xl text-xs font-black border border-blue-500/20 transition-all active:scale-95">
              🛡️ 구매 ({(buyQuantity * PROTECTION_TICKET_PRICE).toLocaleString()})
            </button>
            <button onClick={() => buyItem('material')} className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-5 py-3 rounded-2xl text-xs font-black border border-emerald-500/20 transition-all active:scale-95">
              💎 구매 ({(buyQuantity * MATERIAL_UNIT_PRICE).toLocaleString()})
            </button>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition-all shadow-xl active:rotate-90"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 레이아웃 (높이 제한) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full overflow-hidden pb-4">
        
        {/* 검 표시 및 강화 영역 (좌측 2열) */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          {/* 검 비주얼 창 (고정 비율 또는 적절한 높이) */}
          <div className={`relative flex-1 min-h-[400px] bg-black/40 rounded-[50px] border-2 p-12 flex flex-col items-center justify-center transition-all duration-700 overflow-visible ${visualTheme.glowStyle} ${isEnhancing ? 'shake' : ''}`} style={{ borderColor: isDestroyed ? '#450a0a' : `${visualTheme.mainColor}33` }}>
            
            {visualTheme.auraContent}

            {/* 검 정보 (절대 위치) */}
            <div className={`absolute top-12 left-12 text-left z-20 transition-all ${isDestroyed ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                  {level < 15 ? '일반' : level < 30 ? '희귀' : level < 45 ? '에픽' : '신화'}
                </span>
                <span className="text-white/30 font-black text-xs tracking-widest">{level}단계</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3" style={{ textShadow: `0 0 20px ${visualTheme.mainColor}` }}>
                {level > 0 && <span className="mr-3 opacity-40 font-mono">+{level}</span>}
                {SWORD_DATA[Math.min(level, SWORD_DATA.length - 1)]}
              </h2>
              <p className={`text-slate-400 italic max-w-sm text-sm leading-relaxed transition-opacity duration-500 ${isLoreLoading ? 'opacity-30' : 'opacity-100'}`}>
                "{lore}"
              </p>
            </div>

            {/* 메인 아이콘 */}
            <div className={`text-[140px] md:text-[180px] transition-all duration-700 z-20 floating relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${isEnhancing ? 'scale-125' : 'scale-100'} ${isDestroyed ? 'rotate-90 opacity-10' : ''}`}>
              <div className={level > 0 && !isDestroyed ? 'glow-active' : ''} style={{ '--aura-color': visualTheme.mainColor } as React.CSSProperties}>
                {visualTheme.icon}
              </div>
            </div>

            {/* 파괴 레이어 */}
            {isDestroyed && (
              <div className="absolute inset-0 bg-red-950/90 backdrop-blur-3xl flex flex-col items-center justify-center p-12 z-40 animate-in fade-in zoom-in duration-500 rounded-[50px]">
                <div className="text-8xl mb-8 animate-bounce drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">💥</div>
                <h3 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase">파괴됨</h3>
                <p className="text-red-200/70 mb-10 text-center max-w-sm text-base leading-relaxed">
                  강화의 중압감을 견디지 못하고 검이 산산조각 났습니다. <br/>방지권으로 되살리시겠습니까?
                </p>
                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                  <button onClick={handleRevive} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95 flex flex-col items-center border-b-8 border-blue-800">
                    <span className="text-xl uppercase tracking-widest">방지권 사용</span>
                    <span className="text-xs opacity-70 mt-2 font-mono tracking-tight">🛡️ {reviveCost.toLocaleString()}개 소모</span>
                  </button>
                  <button onClick={handleDecompose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95 flex flex-col items-center border-b-8 border-slate-950">
                    <span className="text-xl uppercase tracking-widest">파편 수집</span>
                    <span className="text-xs opacity-70 mt-2 font-mono tracking-tight">💎 {Math.max(1, Math.floor(level * 2.5)).toLocaleString()}개 획득</span>
                  </button>
                </div>
              </div>
            )}

            {/* 확률 수치 */}
            {!isDestroyed && (
              <div className="w-full max-w-xl grid grid-cols-3 gap-4 text-center z-20 mt-12 px-4">
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1 opacity-60">성공</p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tighter">{rates.success}%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
                  <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mb-1 opacity-60">실패</p>
                  <p className="text-3xl font-black text-yellow-400 tracking-tighter">{rates.fail}%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1 opacity-60">파괴</p>
                  <p className="text-3xl font-black text-red-500 tracking-tighter">{rates.destroy}%</p>
                </div>
              </div>
            )}

            {/* 결과 토스트 */}
            {lastResult && !isDestroyed && (
              <div key={lastResult.id} className={`absolute bottom-8 text-xl font-black px-10 py-4 rounded-full animate-bounce shadow-2xl z-30 border-2 backdrop-blur-md ${
                lastResult.type === GameLogType.SUCCESS ? 'bg-emerald-500/80 text-white border-emerald-400' : 
                lastResult.type === GameLogType.DESTROYED ? 'bg-red-500/80 text-white border-red-400' : 'bg-yellow-500/80 text-slate-900 border-yellow-400'
              }`}>
                {lastResult.type === GameLogType.SUCCESS ? '✨ 강화 성공' : '💨 강화 실패'}
              </div>
            )}
          </div>

          {/* 강화/판매 버튼 영역 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-32">
            <button 
              onClick={handleEnhance}
              disabled={level >= MAX_LEVEL || isDestroyed || isEnhancing}
              className={`h-full rounded-[40px] flex flex-col items-center justify-center transition-all shadow-2xl relative overflow-hidden group ${
                isDestroyed ? 'bg-slate-900 text-slate-700' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-blue-900/40'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl font-black uppercase tracking-tighter mb-1">검 강화하기</span>
              <div className="flex gap-6 text-xs font-black opacity-80">
                <span className="text-yellow-200">💰 {cost.toLocaleString()}</span>
                {matCost > 0 && <span className="text-emerald-300">💎 {matCost.toLocaleString()}</span>}
              </div>
            </button>
            <button 
              onClick={handleSell}
              disabled={level === 0 || isDestroyed || isEnhancing}
              className={`h-full rounded-[40px] flex flex-col items-center justify-center transition-all shadow-2xl relative overflow-hidden group ${
                level === 0 || isDestroyed ? 'bg-slate-900 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-900/40'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl font-black uppercase tracking-tighter mb-1">검 판매하기</span>
              {level > 0 && <span className="text-xs font-black text-yellow-100">💰 {sellPrice.toLocaleString()}원 획득</span>}
            </button>
          </div>
        </div>

        {/* 강화 기록 영역 (우측 1열, 고정 높이 컨테이너) */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-[50px] flex flex-col h-full lg:h-[calc(100vh-250px)] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">실시간 강화 기록</h3>
            <span className="text-[9px] bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-black">최근 30개</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 bg-slate-950/20 scrollbar-hide">
            {logs.map((log) => (
              <div key={log.id} className="text-[13px] py-4 px-5 rounded-[24px] bg-white/5 border border-white/5 animate-in fade-in slide-in-from-right-4 backdrop-blur-md transition-all hover:bg-white/10 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-tighter ${
                    log.type === GameLogType.SUCCESS ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    log.type === GameLogType.DESTROYED ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    log.type === GameLogType.FAILURE ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                    log.type === GameLogType.SHOP ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {log.type === GameLogType.SUCCESS ? '성공' : 
                     log.type === GameLogType.DESTROYED ? '파괴' :
                     log.type === GameLogType.FAILURE ? '실패' :
                     log.type === GameLogType.SHOP ? '상점' : '매각'}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <span className="text-slate-300 font-bold leading-relaxed">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} className="h-2" />
          </div>
        </div>
      </div>

      {/* 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[60px] w-full max-w-md p-12 shadow-[0_0_150px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black text-white tracking-tighter">환경 설정</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white p-4 bg-white/5 rounded-3xl transition-all">✕</button>
            </div>
            
            <div className="space-y-10">
              <div className="flex items-center justify-between p-8 bg-white/5 rounded-[40px] border border-white/5 transition-all hover:bg-white/10">
                <div>
                  <p className="font-black text-white text-xl">자동 방지권 사용</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">검 파괴 시 자동으로 방지권을 소모하여 부활합니다.</p>
                </div>
                <button 
                  onClick={() => setAutoRevive(!autoRevive)}
                  className={`w-20 h-10 rounded-full transition-all relative ${autoRevive ? 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full shadow-2xl transition-transform ${autoRevive ? 'left-11' : 'left-1.5'}`}></div>
                </button>
              </div>

              <div className="pt-8 space-y-6">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full bg-white text-black font-black py-6 rounded-[32px] transition-all hover:scale-[1.03] active:scale-95 text-xl uppercase tracking-widest"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-4 text-center text-slate-800 text-[10px] font-black uppercase tracking-[0.5em] opacity-30 shrink-0">
        <p>Infinite Enhancement • Master Smith Edition • v5.1.0</p>
      </footer>
    </div>
  );
};

export default App;
