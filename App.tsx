import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './src/pages/Home';
import NotFound from './src/pages/NotFound';
import SansFightPage from './src/pages/SansFightPage';
import HackerMungPage from './src/pages/HackerMungPage';
import JjeunjjaPage from './src/pages/JjeunjjaPage';
import HypnosisAppPage from './src/pages/HypnosisAppPage';
import BananaPeelerPage from './src/pages/BananaPeelerPage';
import CircleMasterPage from './src/pages/CircleMasterPage';
import SquareAdventurePage from './src/pages/SquareAdventurePage';
import FlappyBirdPage from './src/pages/FlappyBirdPage';
import InfiniteStairsPage from './src/pages/InfiniteStairsPage';
import LifeBreathingChallengePage from './src/pages/LifeBreathingChallengePage';
import YutnoriPage from './src/pages/YutnoriPage';
import DrawFlowersPage from './src/pages/DrawFlowersPage';
import NeonFlowPage from './src/pages/NeonFlowPage';
import TajaGamePage from './src/pages/TajaGamePage';
import SwordPage from './src/pages/SwordPage';
import MondrianArtMakerPage from './src/pages/MondrianArtMakerPage';
import BlockBlastHandtrackingPage from './src/pages/BlockBlastHandtrackingPage';
import HandtrackingBubblePopperPage from './src/pages/HandtrackingBubblePopperPage';
import AirDrumPage from './src/pages/AirDrumPage';

const App: React.FC = () => {
  const location = useLocation();
  const showFooter = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <main className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/life-breathing-challenge" element={<LifeBreathingChallengePage />} />
          <Route path="/sans-fight" element={<SansFightPage />} />
          <Route path="/hacker-mung" element={<HackerMungPage />} />
          <Route path="/jjeunjja" element={<JjeunjjaPage />} />
          <Route path="/hypnosis-app" element={<HypnosisAppPage />} />
          <Route path="/banana-peeler-fight" element={<BananaPeelerPage />} />
          <Route path="/circle-master" element={<CircleMasterPage />} />
          <Route path="/square-adventure" element={<SquareAdventurePage />} />
          <Route path="/flappy-bird" element={<FlappyBirdPage />} />
          <Route path="/infinite-stairs" element={<InfiniteStairsPage />} />
          <Route path="/yutnori" element={<YutnoriPage />} />
          <Route path="/draw-flowers" element={<DrawFlowersPage />} />
          <Route path="/neon-flow" element={<NeonFlowPage />} />
          <Route path="/taja-game" element={<TajaGamePage />} />
          <Route path="/sword" element={<SwordPage />} />
          <Route path="/mondrian-art-maker" element={<MondrianArtMakerPage />} />
          <Route path="/block-blast-handtracking" element={<BlockBlastHandtrackingPage />} />
          <Route path="/handtracking-bubble-popper" element={<HandtrackingBubblePopperPage />} />
          <Route path="/airdrum" element={<AirDrumPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default App;
