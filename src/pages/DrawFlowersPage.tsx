import React from 'react';

const drawFlowersUrl = new URL('./draw_flowers/index.html', import.meta.url).toString();

const DrawFlowersPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-h))] w-full">
      <iframe
        title="Draw Flowers"
        src={drawFlowersUrl}
        className="w-full h-[calc(100vh-var(--topbar-h))] border-0"
        allow="autoplay; fullscreen"
      />
    </div>
  );
};

export default DrawFlowersPage;
