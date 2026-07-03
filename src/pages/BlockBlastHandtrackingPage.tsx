import React from 'react';
import BlockBlastHandtrackingApp from './block-blast-handtracking/src/App';
import './block-blast-handtracking/src/index.css';

const BlockBlastHandtrackingPage: React.FC = () => {
  return (
    <div className="blockblast-page min-h-[calc(100vh-var(--topbar-h))] w-full overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <BlockBlastHandtrackingApp />
    </div>
  );
};

export default BlockBlastHandtrackingPage;
