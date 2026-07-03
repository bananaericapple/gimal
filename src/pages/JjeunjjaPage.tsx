import React from 'react';
import JjeunjjaApp from './jjeunjja-dressup-tycoon/App';
import './jjeunjja-dressup-tycoon/index.css';
import GameStage from '@/components/GameStage';

const JjeunjjaPage: React.FC = () => {
  return (
    <GameStage baseWidth={1280} baseHeight={720}>
      <JjeunjjaApp />
    </GameStage>
  );
};

export default JjeunjjaPage;
