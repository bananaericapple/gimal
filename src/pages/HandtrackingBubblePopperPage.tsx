import React from 'react';
import HandtrackingBubblePopperApp from './Handtracking-bubble-popper/src/App';

const HandtrackingBubblePopperPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-h))] w-full overflow-hidden bg-zinc-950 text-white">
      <HandtrackingBubblePopperApp />
    </div>
  );
};

export default HandtrackingBubblePopperPage;
