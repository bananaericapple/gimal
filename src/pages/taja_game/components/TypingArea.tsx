
import React, { useRef, useEffect } from 'react';

interface TypingAreaProps {
  targetText: string;
  userInput: string;
  isStarted: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ targetText, userInput, isStarted, onInputChange, onKeyDown }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted]);

  // Function to render chars with highlighting
  const renderChars = () => {
    if (!targetText) return null;
    
    return targetText.split('').map((char, index) => {
      let colorClass = 'text-gray-300';
      if (index < userInput.length) {
        colorClass = userInput[index] === char ? 'text-gray-800' : 'text-red-500 underline decoration-2';
      }
      
      const isCurrent = index === userInput.length && isStarted;

      return (
        <span 
          key={index} 
          className={`relative text-2xl font-medium transition-colors ${colorClass} ${isCurrent ? 'bg-blue-100 rounded-sm' : ''}`}
        >
          {char}
          {isCurrent && <span className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 animate-pulse"></span>}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="min-h-[120px] bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-wrap gap-x-0.5 items-center justify-center text-center leading-relaxed">
        {renderChars() || <span className="text-gray-300 italic">준비 되셨나요?</span>}
      </div>

      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          disabled={!isStarted}
          placeholder={isStarted ? "문장을 입력하고 Enter를 누르세요..." : "시작 버튼을 눌러주세요"}
          className={`w-full px-6 py-4 text-xl bg-white border-2 rounded-xl outline-none transition-all shadow-sm ${
            isStarted 
            ? 'border-blue-200 focus:border-blue-500 group-hover:border-blue-300' 
            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
          }`}
        />
        {isStarted && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded-lg">Enter</kbd>
                  <span className="text-[10px] text-gray-400 font-bold">제출</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded-lg">ESC</kbd>
                  <span className="text-[10px] text-gray-400 font-bold">취소</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TypingArea;
