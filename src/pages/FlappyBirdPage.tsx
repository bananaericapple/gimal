import React from 'react';
import FlappyBirdApp from './flappy_bird/App';
import GameStage from '@/components/GameStage';

const FlappyBirdPage: React.FC = () => {
  return (
    <GameStage baseWidth={720} baseHeight={720}>
      <FlappyBirdApp />
    </GameStage>
  );
};

export default FlappyBirdPage;
