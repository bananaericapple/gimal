import React from 'react';
import InfiniteStairsApp from './infinite_stairs/App';
import GameStage from '@/components/GameStage';

const InfiniteStairsPage: React.FC = () => {
  return (
    <GameStage baseWidth={540} baseHeight={960}>
      <InfiniteStairsApp />
    </GameStage>
  );
};

export default InfiniteStairsPage;
