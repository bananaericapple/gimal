
import React from 'react';
import { TypingResult } from '../types';

interface ResultModalProps {
  result: TypingResult;
  onClose: () => void;
  onRetry: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">참 잘했어요!</h2>
          <p className="text-blue-100 text-sm mt-1">타자 연습 결과를 확인하세요</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">최고 타수</div>
              <div className="text-3xl font-black text-gray-800">{result.speed}<span className="text-sm font-normal ml-1">타</span></div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-xs text-gray-400 font-bold uppercase mb-1">정확도</div>
              <div className="text-3xl font-black text-gray-800">{result.accuracy}<span className="text-sm font-normal ml-1">%</span></div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">소요 시간</span>
              <span className="text-gray-800 font-medium">{result.timeTaken}초</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">연습 문장</span>
              <span className="text-gray-800 font-medium truncate ml-4 max-w-[200px]" title={result.sentence}>{result.sentence}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
            <button 
              onClick={onRetry}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              다시 하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
