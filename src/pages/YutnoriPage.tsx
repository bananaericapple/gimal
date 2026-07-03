import React from 'react';
import YutnoriApp from './Yutnori/App';
import GameStage from '@/components/GameStage';

const YutnoriPage: React.FC = () => {
  return (
    <GameStage baseWidth={1200} baseHeight={900}>
      <YutnoriApp />
    </GameStage>
  );
};

export default YutnoriPage;
