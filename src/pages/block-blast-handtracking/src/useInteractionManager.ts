import { useRef, useEffect, useState } from 'react';
import { HandTracker, calculateDistance } from './handTracking';

export type PointerState = {
  x: number;
  y: number;
  isGrabbing: boolean;
  isActive: boolean;
};

export const useInteractionManager = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);

  const pointerStateRef = useRef<PointerState>({ x: -1000, y: -1000, isGrabbing: false, isActive: false });
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
  };

  // Smoothing states
  const PINCH_START = 0.045; // Threshold to start pinch (must be closer)
  const PINCH_END = 0.075;   // Threshold to end pinch (must be further away)
  
  const targetPosRef = useRef<{x: number, y: number} | null>(null);
  const handLostFramesRef = useRef(0);

  const onFrameRef = useRef<(p: PointerState) => void>(() => {});
  
  const isActiveRef = useRef(true);
  const animationFrameIdRef = useRef<number>(0);

  const loop = () => {
    if (!isActiveRef.current) return;
    
    let newHandIsActive = false;
    if (videoRef.current && trackerRef.current) {
      const results = trackerRef.current.detect(videoRef.current);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (canvas && ctx && videoRef.current) {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         if (results?.landmarks && results.landmarks.length > 0) {
           handLostFramesRef.current = 0; // Reset lost counter
           newHandIsActive = true;
           
           const landmarks = results.landmarks[0];
           const indexTip = landmarks[8];
           const thumbTip = landmarks[4];
           
           // Draw landmarks for debug
           ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
           for(let l of landmarks) {
             ctx.beginPath();
             ctx.arc(l.x * canvas.width, l.y * canvas.height, 2, 0, 2*Math.PI);
             ctx.fill();
           }

           // Distance
           const pinchDist = calculateDistance(indexTip, thumbTip);
           
           let newGrabbing = pointerStateRef.current.isGrabbing;
           if (!newGrabbing && pinchDist < PINCH_START) {
              newGrabbing = true;
           } else if (newGrabbing && pinchDist > PINCH_END) {
              newGrabbing = false;
           }

           // We map indexTip to screen coords. Mirror X.
           const rawX = (1 - indexTip.x) * window.innerWidth;
           const rawY = indexTip.y * window.innerHeight;

           targetPosRef.current = { x: rawX, y: rawY };

           pointerStateRef.current.isGrabbing = newGrabbing;
           pointerStateRef.current.isActive = true;
         } else {
           handLostFramesRef.current++;
         }
      }
    }

    // Debounce hand active state (don't flicker off immediately)
    if (handLostFramesRef.current > 5) {
      pointerStateRef.current.isActive = false;
      pointerStateRef.current.isGrabbing = false;
      targetPosRef.current = null;
    }

    // Apply LERP smoothing to the position if hand is active
    if (pointerStateRef.current.isActive && targetPosRef.current) {
        pointerStateRef.current.x = lerp(pointerStateRef.current.x, targetPosRef.current.x, 0.25);
        pointerStateRef.current.y = lerp(pointerStateRef.current.y, targetPosRef.current.y, 0.25);
    }

    // Notify consumer
    onFrameRef.current(pointerStateRef.current);

    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  const startCamera = async () => {
    try {
      setError(null); // Clear previous errors
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
           if(videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                videoRef.current!.play();
                if (canvasRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
                resolve();
              };
           }
        });
      }

      if (!trackerRef.current) {
         trackerRef.current = new HandTracker();
         await trackerRef.current.initialize();
      }

      setIsCameraActive(true);
      
      // Prevent multiple loops
      cancelAnimationFrame(animationFrameIdRef.current);
      isActiveRef.current = true;
      loop();
    } catch (err: any) {
      console.warn("Camera failed to initialize", err);
      setError("Camera not available or permission denied. Click here to allow.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    // Try auto-starting, but know it might fail due to iframe/autoplay policies
    startCamera();

    // Setup mouse/touch listeners as well
    const updatePointer = (clientX: number, clientY: number) => {
      // Force immediate update for mouse/touch
      pointerStateRef.current.x = clientX;
      pointerStateRef.current.y = clientY;
      pointerStateRef.current.isActive = false; // Mouse overrides hand cursor visual
    };
    
    const handleMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
    const handleMouseDown = (e: MouseEvent) => {
      pointerStateRef.current.isGrabbing = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      pointerStateRef.current.isGrabbing = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      pointerStateRef.current.isGrabbing = true;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      pointerStateRef.current.isGrabbing = false;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      isActiveRef.current = false;
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (trackerRef.current) trackerRef.current.dispose();
      if (videoRef.current?.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return { cameraVideoRef: videoRef, cameraCanvasRef: canvasRef, pointerStateRef, error, onFrameRef, startCamera };
};
