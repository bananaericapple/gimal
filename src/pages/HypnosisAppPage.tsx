import React from 'react';
import HypnosisApp from './hypnosis-app/App';
import './hypnosis-app/index.css';
import GameStage from '@/components/GameStage';

const HypnosisAppPage: React.FC = () => {
  return (
    <GameStage baseWidth={1280} baseHeight={720}>
      <HypnosisApp />
    </GameStage>
  );
};

export default HypnosisAppPage;
