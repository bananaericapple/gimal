import React from 'react';
import NeonFlowApp from './neon_flow/App';

const NeonFlowPage: React.FC = () => (
  <div className="min-h-[calc(100vh-var(--topbar-h))] w-full">
    <NeonFlowApp />
  </div>
);

export default NeonFlowPage;
