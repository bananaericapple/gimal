import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandUpdate: (points: { x: number; y: number }[] | null) => void;
  onReady: () => void;
  onError?: (message: string) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onReady, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(null);
  
  // Use refs for callbacks to avoid re-running useEffect when they change
  const onHandUpdateRef = useRef(onHandUpdate);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onHandUpdateRef.current = onHandUpdate;
  }, [onHandUpdate]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let isMounted = true;

    const setupHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (!isMounted) {
          handLandmarker.close();
          return;
        }

        handLandmarkerRef.current = handLandmarker;
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isMounted) return;
            videoRef.current?.play();
            setIsLoading(false);
            setError(null);
            onReadyRef.current();
            startDetection();
          };
        }
      } catch (error: any) {
        console.error("Error setting up hand tracking:", error);
        setIsLoading(false);
        if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
          const message = "Camera access denied. Please enable camera permissions in your browser settings and refresh.";
          setError(message);
          onErrorRef.current?.(message);
        } else {
          const message = "Failed to initialize camera. Please ensure no other app is using it.";
          setError(message);
          onErrorRef.current?.(message);
        }
      }
    };

    const startDetection = () => {
      let frameCount = 0;
      const detect = async () => {
        if (!isMounted) return;

        if (videoRef.current && handLandmarkerRef.current && videoRef.current.readyState >= 2) {
          const startTimeMs = performance.now();
          const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

          // 30프레임(약 0.5초)마다 한 번씩 콘솔에 데이터 출력 (브라우저 멈춤 방지)
          frameCount++;
          if (frameCount % 30 === 0) {
            console.log("🖐️ MediaPipe 감지 데이터:", results.landmarks);
          }

          if (results.landmarks && results.landmarks.length > 0) {
            const points = results.landmarks[0].map(pt => ({
              x: 1 - pt.x,
              y: pt.y
            }));
            onHandUpdateRef.current(points);
          } else {
            onHandUpdateRef.current(null);
          }
        }
        requestRef.current = requestAnimationFrame(detect);
      };
      requestRef.current = requestAnimationFrame(detect);
    };

    setupHandTracking();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run only once

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-black/10 shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">Initializing Neural Engine...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-red-500 font-mono text-sm mb-2 uppercase tracking-tighter font-bold">Access Violation</p>
          <p className="text-white/70 text-xs max-w-[200px] leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase tracking-widest transition-colors rounded"
          >
            Retry Connection
          </button>
        </div>
      )}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="text-[10px] font-mono text-black/40 uppercase tracking-wider">
          {isLoading ? 'System Offline' : 'Optical Sensor Active'}
        </span>
      </div>
    </div>
  );
};
