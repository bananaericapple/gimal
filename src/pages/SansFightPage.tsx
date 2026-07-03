import React from 'react';
import SansFightApp from './sans-fight/App';
import './sans-fight/index.css';
import GameStage from '@/components/GameStage';

const SansFightPage: React.FC = () => (
  <GameStage baseWidth={960} baseHeight={720}>
    <div className="sansfight-page-wrapper h-full w-full">
      <SansFightApp />
    </div>
  </GameStage>
);

export default SansFightPage;
