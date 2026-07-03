import React from 'react';
import AirDrumApp from './AirDrum/src/App';

const AirDrumPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-h))] w-full overflow-hidden bg-neutral-900 text-white">
      <AirDrumApp />
    </div>
  );
};

export default AirDrumPage;
