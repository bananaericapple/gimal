
import React, { useState, useCallback, useEffect } from 'react';
import BreathingExercise from './components/BreathingExercise';
import ResultView from './components/ResultView';
import IntroView from './components/IntroView';
import RankingModal from './components/RankingModal';
import RankingButton from './components/RankingButton';

type AppState = 'INTRO' | 'EXERCISING' | 'FINISHED';

export interface RankData {
  name: string;
  days: number;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('INTRO');
  const [userName, setUserName] = useState<string>('');
  const [showRanking, setShowRanking] = useState(false);

  // Load existing user from localstorage if any
  useEffect(() => {
    const savedName = localStorage.getItem('last_user_name');
    if (savedName) setUserName(savedName);
  }, []);

  const handleStart = useCallback((name: string) => {
    setUserName(name);
    localStorage.setItem('last_user_name', name);
    setState('EXERCISING');
  }, []);

  const handleFinish = useCallback(() => {
    // Logic to increment days is handled inside ResultView for immediate feedback
    setState('FINISHED');
  }, []);

  const handleRestart = useCallback(() => {
    setState('INTRO');
  }, []);

  return (
    <div className="relative w-full h-screen bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Global Ranking Button */}
      <RankingButton onClick={() => setShowRanking(true)} />

      <div className="relative z-10 w-full max-w-4xl px-6">
        {state === 'INTRO' && <IntroView onStart={handleStart} initialName={userName} />}
        {state === 'EXERCISING' && <BreathingExercise onComplete={handleFinish} />}
        {state === 'FINISHED' && <ResultView onRestart={handleRestart} userName={userName} />}
      </div>

      {/* Ranking Modal */}
      {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
    </div>
  );
};

export default App;
