import React, { useEffect, useMemo } from 'react';

interface GameStageProps {
  baseWidth: number;
  baseHeight: number;
  children: React.ReactNode;
  className?: string;
}

const GameStage: React.FC<GameStageProps> = ({ baseWidth, baseHeight, children, className }) => {
  const aspectRatio = useMemo(() => baseWidth / baseHeight, [baseWidth, baseHeight]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className={`game-stage ${className ?? ''}`}>
      <div
        className="game-wrap"
        style={{
          aspectRatio: `${baseWidth} / ${baseHeight}`,
          width: `min(100vw, calc((100vh - var(--topbar-h)) * ${aspectRatio}))`,
          maxWidth: '100vw',
          maxHeight: 'calc(100vh - var(--topbar-h))',
        }}
      >
        <div className="game-viewport">{children}</div>
      </div>
    </div>
  );
};

export default GameStage;
