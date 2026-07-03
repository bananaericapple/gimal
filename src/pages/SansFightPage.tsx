import React, { useEffect, useRef } from 'react';
import SansFightApp from './sans-fight/App';
import './sans-fight/index.css';
import GameStage from '@/components/GameStage';

const SANS_FIGHT_TRACK = `${import.meta.env.BASE_URL}megalovania.mp3`;

const SansFightPage: React.FC = () => (
  <GameStage baseWidth={960} baseHeight={720}>
    <SansFightAudioWrapper>
      <SansFightApp />
    </SansFightAudioWrapper>
  </GameStage>
);

const SansFightAudioWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(SANS_FIGHT_TRACK);
    audio.loop = true;
    audioRef.current = audio;

    // Try to play immediately; if blocked, start on first pointer/key
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

  return <div className="sansfight-page-wrapper h-full w-full">{children}</div>;
};

export default SansFightPage;
