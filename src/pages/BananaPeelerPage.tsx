import React from 'react';
import BananaApp from './banana-peeler-fight/App';
import './banana-peeler-fight/index.css';
import GameStage from '@/components/GameStage';

const BananaPeelerPage: React.FC = () => {
  return (
    <GameStage baseWidth={1280} baseHeight={720}>
      <BananaApp />
    </GameStage>
  );
};

export default BananaPeelerPage;
