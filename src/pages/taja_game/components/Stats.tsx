
import React from 'react';

interface StatsProps {
  speed: number;
  accuracy: number;
  time: number;
}

const Stats: React.FC<StatsProps> = ({ speed, accuracy, time }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center">
        <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">타수 (CPM)</span>
        <span className="text-2xl font-black text-blue-700">{speed}</span>
      </div>
      <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center">
        <span className="text-xs text-green-500 font-bold uppercase tracking-wider">정확도 (%)</span>
        <span className="text-2xl font-black text-green-700">{accuracy}%</span>
      </div>
      <div className="bg-orange-50 p-4 rounded-xl flex flex-col items-center">
        <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">시간 (초)</span>
        <span className="text-2xl font-black text-orange-700">{time}s</span>
      </div>
    </div>
  );
};

export default Stats;
