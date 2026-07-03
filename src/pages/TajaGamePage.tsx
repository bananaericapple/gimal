import React from 'react';
import TajaGameApp from './taja_game/App';

const TajaGamePage: React.FC = () => (
  <div className="min-h-[calc(100vh-var(--topbar-h))] w-full">
    <TajaGameApp />
  </div>
);

export default TajaGamePage;
