import React, { useEffect, useRef } from 'react';
import YutnoriApp from './Yutnori/App';
import GameStage from '@/components/GameStage';

const YUTNORI_BGM = `${import.meta.env.BASE_URL}BGM.mp3`;

const YutnoriPage: React.FC = () => {
  return (
    <GameStage baseWidth={1200} baseHeight={900}>
      <YutnoriAudioWrapper>
        <YutnoriApp />
      </YutnoriAudioWrapper>
    </GameStage>
  );
};

const YutnoriAudioWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(YUTNORI_BGM);
    audio.loop = true;
    audioRef.current = audio;

    const startAudio = () => {
      audio.play().catch(() => {});
    };

    startAudio();

    const resumeOnInteraction = () => {
      if (!audioRef.current) return;
      audioRef.current.play().catch(() => {});
    };

    window.addEventListener('pointerdown', resumeOnInteraction, { once: true });
    window.addEventListener('keydown', resumeOnInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', resumeOnInteraction);
      window.removeEventListener('keydown', resumeOnInteraction);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  return <div>{children}</div>;
};

export default YutnoriPage;
