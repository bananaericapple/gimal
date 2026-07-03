import React, { useLayoutEffect, useRef } from 'react';

interface TerminalProps {
  content: string;
}

export const Terminal: React.FC<TerminalProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever content changes
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-black p-4 md:p-8 font-mono text-sm md:text-base lg:text-lg overflow-y-auto pb-20 box-border break-words whitespace-pre-wrap leading-tight"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Hacker Green Text */}
      <div className="text-[#0f0] shadow-[0_0_10px_#0f0] drop-shadow-md">
        {content}
        <span className="inline-block w-3 h-5 bg-[#0f0] ml-1 align-middle cursor-blink"></span>
      </div>
    </div>
  );
};
