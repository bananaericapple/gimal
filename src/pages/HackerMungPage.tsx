import React from 'react';
import HackerMungApp from './hakcker_mung/App';
import './hakcker_mung/index.css';
import GameStage from '@/components/GameStage';

const HackerMungPage: React.FC = () => {
  return (
    <GameStage baseWidth={1280} baseHeight={720}>
      <div className="hacker-mung-shell">
        <HackerMungApp />
      </div>
    </GameStage>
  );
};

export default HackerMungPage;
