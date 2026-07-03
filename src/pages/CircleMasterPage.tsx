import React from 'react';
import CircleMasterApp from './circle_master/App';
import GameStage from '@/components/GameStage';

const CircleMasterPage: React.FC = () => {
  return (
    <GameStage baseWidth={800} baseHeight={800}>
      <CircleMasterApp />
    </GameStage>
  );
};

export default CircleMasterPage;
