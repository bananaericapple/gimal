import React, { useState, useEffect } from 'react';
import HypnoticSpiral from './components/HypnoticSpiral';

// The sequence of texts to display
const SEQUENCES = [
  { text: "자 이제 당신은 잠에 빠져들게 됩니다.", duration: 5000 },
  { text: "당신이 투명인간이 된다면 하고 싶은 일을 생각해 보세요", duration: 5000 },
  { text: "해보세요!", duration: 5000 },
  { text: "나 같은 경우에는 대놓고 잠 자기!", duration: 5000 },
  { text: "ㄲ ㅡ ㅌ", duration: 0 } // Final state
];

const App: React.FC = () => {
  const [step, setStep] = useState<number>(-1); // -1: Initial waiting period
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [showText, setShowText] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSequence = async () => {
      // 1. Initial Delay: 2 seconds before first text
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 2000);
      });

      // 2. Loop through sequences
      for (let i = 0; i < SEQUENCES.length; i++) {
        const sequence = SEQUENCES[i];
        
        // Update step content
        setStep(i);
        setShowText(true);

        // If it's the last step ("The End"), we handle logic differently
        if (i === SEQUENCES.length - 1) {
          setIsSpinning(false); // Stop spinning
          return; // Stay on this step
        }

        // Wait for the duration of the text display
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, sequence.duration);
        });

        // Hide text
        setShowText(false);

        // Small pause between texts (optional, but makes "disappearing" clearer)
        // The prompt says "3초 뒤에 없어지고 또...", implying a cycle.
        // We add a tiny gap to ensure the fade-out completes before the new one comes in
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 500); 
        });
      }
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, []);

  const currentText = step >= 0 && step < SEQUENCES.length ? SEQUENCES[step].text : "";
  const isFinalStep = step === SEQUENCES.length - 1;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Spiral */}
      <HypnoticSpiral isSpinning={isSpinning} />

      {/* Overlay Text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4 text-center">
        {showText && (
          <div
            key={step}
            className="max-w-5xl w-full hypnosis-text"
            style={{
              opacity: showText ? 1 : 0,
              transform: showText ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            }}
          >
            <h1 
              className={`
                font-black tracking-tight leading-tight drop-shadow-2xl break-keep whitespace-pre-wrap
                ${isFinalStep ? 'text-8xl text-white' : 'text-4xl md:text-6xl text-green-400'}
              `}
              style={{
                wordBreak: 'keep-all',
                overflowWrap: 'break-word',
                textShadow: isFinalStep 
                  ? '0 0 20px rgba(255,255,255,0.8)' 
                  : '0 0 10px rgba(74, 222, 128, 0.5), 0 0 20px rgba(0,0,0,0.8)'
              }}
            >
              {currentText}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
