
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, TypingResult } from './types';
import { SENTENCES } from './constants';
import Header from './components/Header';
import Stats from './components/Stats';
import TypingArea from './components/TypingArea';
import ResultModal from './components/ResultModal';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.GENERAL);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [results, setResults] = useState<TypingResult | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  const timerRef = useRef<number | null>(null);

  const getRandomSentence = useCallback((category: Category) => {
    const filtered = SENTENCES.filter(s => s.category === category);
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex].text;
  }, []);

  const startPractice = () => {
    const sentence = getRandomSentence(selectedCategory);
    setCurrentSentence(sentence);
    setUserInput('');
    setIsStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setResults(null);
    setSpeed(0);
    setAccuracy(100);
  };

  const calculateStats = useCallback(() => {
    if (!startTime || !isStarted) return;

    const now = Date.now();
    const duration = (now - startTime) / 1000 / 60; // in minutes
    
    // Speed calculation
    const currentSpeed = duration > 0 ? Math.round(userInput.length / duration) : 0;
    
    // Accuracy calculation (Comparing up to current input length)
    let correctCount = 0;
    const compareLength = userInput.length;
    for (let i = 0; i < compareLength; i++) {
      if (userInput[i] === currentSentence[i]) {
        correctCount++;
      }
    }
    const currentAccuracy = compareLength > 0 ? Math.round((correctCount / compareLength) * 100) : 100;

    setSpeed(currentSpeed);
    setAccuracy(currentAccuracy);
    setElapsedTime(Math.floor((now - startTime) / 1000));
  }, [startTime, isStarted, userInput, currentSentence]);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = window.setInterval(calculateStats, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, calculateStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishPractice(userInput);
    } else if (e.key === 'Escape') {
      setIsStarted(false);
      setUserInput('');
    }
  };

  const finishPractice = (finalInput: string) => {
    setIsStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const endTime = Date.now();
    const totalTime = (endTime - (startTime || endTime)) / 1000;
    
    // Final Accuracy: compare against the target sentence length
    let correctCount = 0;
    const targetLength = currentSentence.length;
    for (let i = 0; i < targetLength; i++) {
      if (finalInput[i] === currentSentence[i]) {
        correctCount++;
      }
    }
    
    // Accuracy is (correct characters) / (length of target)
    // Extra characters typed are also considered errors implicitly because they don't count towards correctCount
    const finalAccuracy = Math.round((correctCount / targetLength) * 100);
    const finalSpeed = totalTime > 0 ? Math.round((finalInput.length / totalTime) * 60) : 0;

    setResults({
      accuracy: Math.max(0, finalAccuracy),
      speed: finalSpeed,
      timeTaken: parseFloat(totalTime.toFixed(1)),
      sentence: currentSentence
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-800">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <Header 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
          onStart={startPractice}
          disabled={isStarted}
        />

        <div className="mt-8 space-y-6">
          <Stats speed={speed} accuracy={accuracy} time={elapsedTime} />
          
          <TypingArea 
            targetText={currentSentence} 
            userInput={userInput} 
            isStarted={isStarted}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {!isStarted && !results && (
          <div className="mt-8 text-center text-gray-400">
            카테고리를 선택하고 시작 버튼을 눌러주세요!<br/>
            <span className="text-sm">입력 후 <kbd className="bg-gray-100 px-1 rounded border">Enter</kbd>를 누르면 제출됩니다.</span>
          </div>
        )}
      </div>

      {results && (
        <ResultModal result={results} onClose={() => setResults(null)} onRetry={startPractice} />
      )}

      <footer className="mt-8 text-sm text-gray-400">
        © 2024 HanTyper - 한글 타자 연습
      </footer>
    </div>
  );
};

export default App;
