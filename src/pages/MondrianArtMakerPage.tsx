import React from 'react';
import MondrianApp from './mondrian_art_maker/src/App';

const MondrianArtMakerPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-h))] w-full bg-[#F0F0F0]">
      <MondrianApp />
    </div>
  );
};

export default MondrianArtMakerPage;
