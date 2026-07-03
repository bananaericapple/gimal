import React from 'react';
import SquareAdventureApp from './square_adventure/App';
import GameStage from '@/components/GameStage';

const SquareAdventurePage: React.FC = () => {
  return (
    <GameStage baseWidth={1200} baseHeight={800}>
      <SquareAdventureApp />
    </GameStage>
  );
};

export default SquareAdventurePage;
