import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { 
  initAudio, loadDrumSamples, 
  playKick, playSnare, playHighTom, playMidTom, playFloorTom, 
  playCrash, playHiHat, playRide, playSplash 
} from '../utils/audio';

// 드럼 패드 설정 (현실적인 9기통 드럼 세트 배치 및 크기)
const DRUM_PADS = [
  // Cymbals
  { id: 'crash1', name: 'Crash', type: 'cymbal', radius: 65, x: 0.25, y: 0.25, play: playCrash },
  { id: 'ride', name: 'Ride', type: 'cymbal', radius: 75, x: 0.8, y: 0.25, play: playRide },
  { id: 'hihat', name: 'Hi-Hat', type: 'cymbal', radius: 50, x: 0.15, y: 0.55, play: playHiHat },
  { id: 'splash', name: 'Splash', type: 'cymbal', radius: 45, x: 0.5, y: 0.15, play: playSplash },
  
  // Toms
  { id: 'high_tom', name: 'High Tom', type: 'drum', radius: 55, x: 0.4, y: 0.35, play: playHighTom },
  { id: 'mid_tom', name: 'Mid Tom', type: 'drum', radius: 55, x: 0.6, y: 0.35, play: playMidTom },
  { id: 'floor_tom', name: 'Floor', type: 'drum', radius: 65, x: 0.75, y: 0.65, play: playFloorTom },
  
  // Snare & Kick
  { id: 'snare', name: 'Snare', type: 'drum', radius: 60, x: 0.3, y: 0.65, play: playSnare },
  { id: 'kick', name: 'Kick', type: 'drum', radius: 80, x: 0.5, y: 0.7, play: playKick },
];

export default function AirDrum() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoadingMsg, setAudioLoadingMsg] = useState("");
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  
  // 이전 프레임의 손가락 y 좌표를 저장하여 하향 이동 감지
  const prevFingerPos = useRef<Record<string, { x: number, y: number, timestamp: number }>>({});
  // 중복 타격 방지를 위한 타임아웃
  const hitTimeout = useRef<Record<string, number>>({});
  // 타격된 드럼 패드의 시각 효과를 위한 상태
  const activeHits = useRef<Record<string, number>>({});

  useEffect(() => {
    async function initializeMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("MediaPipe 초기화 실패:", error);
      }
    }

    initializeMediaPipe();

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startCamera = async () => {
    setAudioLoadingMsg("오디오 샘플 다운로드 중...");
    await initAudio(); // 오디오 활성화 (사용자 인터랙션 필요)
    await loadDrumSamples((loaded, total) => {
      setAudioLoadingMsg(`고음질 드럼 샘플 로딩 중... (${loaded}/${total})`);
    });
    setAudioLoadingMsg("");
    setIsPlaying(true);
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        requestRef.current = requestAnimationFrame(renderLoop);
      };
    } catch (err) {
      console.error("카메라 접근 실패:", err);
      alert("카메라 권한을 허용해주세요.");
    }
  };

  const renderLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 비디오 프레임 그리기 (거울모드를 위해 캔버스 스케일링 설정)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 손가락 추적
        const results = landmarker.detectForVideo(video, performance.now());
        
        // 드럼 패드 그리기
        const now = performance.now();
        DRUM_PADS.forEach(pad => {
          const padX = pad.x * canvas.width;
          const padY = pad.y * canvas.height;
          const isHit = (now - (activeHits.current[pad.id] || 0)) < 150;
          
          let drawX = padX;
          let drawY = padY;
          
          // 타격 시 흔들림(Shake) 효과
          if (isHit) {
            drawX += (Math.random() - 0.5) * 12;
            drawY += (Math.random() - 0.5) * 12;
          }
          
          ctx.save();
          ctx.translate(drawX, drawY);

          if (pad.type === 'cymbal') {
            // 금빛 그라데이션 심벌
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pad.radius);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.7, '#eab308');
            grad.addColorStop(1, '#a16207');
            
            ctx.beginPath();
            ctx.arc(0, 0, pad.radius, 0, 2 * Math.PI);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#854d0e';
            ctx.stroke();

            // 심벌 질감(동심원)
            ctx.beginPath();
            ctx.arc(0, 0, pad.radius * 0.7, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(133, 77, 14, 0.3)';
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, pad.radius * 0.4, 0, 2 * Math.PI);
            ctx.stroke();

            // 중앙 돔
            ctx.beginPath();
            ctx.arc(0, 0, pad.radius * 0.15, 0, 2 * Math.PI);
            ctx.fillStyle = '#854d0e';
            ctx.fill();

          } else {
            // 드럼 쉘 (빨간색 몸통 - 사용자 사진 참고)
            ctx.beginPath();
            ctx.arc(0, 20, pad.radius, 0, 2 * Math.PI);
            const shellGrad = ctx.createLinearGradient(0, -pad.radius, 0, pad.radius + 20);
            shellGrad.addColorStop(0, '#ef4444'); // Red-500
            shellGrad.addColorStop(1, '#7f1d1d'); // Red-900
            ctx.fillStyle = shellGrad;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#450a0a';
            ctx.stroke();

            // 드럼 헤드 (하얀 가죽)
            const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pad.radius);
            headGrad.addColorStop(0, '#ffffff');
            headGrad.addColorStop(0.8, '#f3f4f6');
            headGrad.addColorStop(1, '#d1d5db');

            ctx.beginPath();
            ctx.arc(0, 0, pad.radius, 0, 2 * Math.PI);
            ctx.fillStyle = headGrad;
            ctx.fill();

            // 림(테두리)
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#9ca3af';
            ctx.stroke();
          }

          // 타격 효과
          if (isHit) {
            ctx.beginPath();
            ctx.arc(0, 0, pad.radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            ctx.lineWidth = 6;
            ctx.strokeStyle = 'white';
            ctx.stroke();
          }

          // 텍스트 라벨
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = 'white';
          ctx.font = 'bold 14px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pad.name, 0, 0);

          ctx.restore();
        });

        // 손가락 좌표 처리 및 그리기
        if (results.landmarks) {
          results.landmarks.forEach((landmarks, index) => {
            // 검지 손가락 끝 (Landmark index 8)
            const indexFinger = landmarks[8];
            // 거울 모드이므로 x 좌표 반전 계산
            const px = 1 - indexFinger.x;
            const py = indexFinger.y;
            const fingerX = px * canvas.width;
            const fingerY = py * canvas.height;

            // 충돌 및 하향 타격 감지 (preventGhostTouch)
            const handId = `hand_${index}`;
            const prev = prevFingerPos.current[handId];
            let isStriking = false;
            
            if (prev) {
              const dy = (py - prev.y) * canvas.height;
              const dt = now - prev.timestamp;
              
              // 속도 및 하향 이동폭 계산 (위에서 아래로 빠르게 내리칠 때만)
              if (dt > 0) {
                const velocity = dy / dt;
                // 이동 거리가 5px 이상이고 속도가 일정 이상일 때 타격 인정
                if (dy > 5 && velocity > 0.2) {
                  isStriking = true;
                  for (const pad of DRUM_PADS) {
                    const padX = pad.x * canvas.width;
                    const padY = pad.y * canvas.height;
                    const dist = Math.sqrt(Math.pow(fingerX - padX, 2) + Math.pow(fingerY - padY, 2));

                    if (dist < pad.radius && (!hitTimeout.current[pad.id] || now - hitTimeout.current[pad.id] > 200)) {
                      pad.play();
                      hitTimeout.current[pad.id] = now;
                      activeHits.current[pad.id] = now;
                      break; 
                    }
                  }
                }
              }
            }
            
            // 드럼 스틱(나무 막대기) 그리기
            ctx.save();
            ctx.translate(fingerX, fingerY);
            
            // 타격 모션: 치는 순간 스틱이 살짝 길어지거나 커지는 효과 (내려치는 느낌)
            if (isStriking) {
              ctx.scale(1.2, 1.2);
            }
            
            // 왼손/오른손에 따라 스틱 기울기 다르게 설정
            const stickDirX = (index % 2 === 0) ? 60 : -60; 
            
            // 나무 스틱 몸통 그림자/테두리
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(stickDirX, 150);
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#78350f'; // 짙은 나무색
            ctx.stroke();
            
            // 나무 스틱 몸통
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(stickDirX, 150);
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#d97706'; // 밝은 나무색
            ctx.stroke();

            // 스틱 팁 (드럼 치는 둥근 끝부분)
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, 2 * Math.PI);
            ctx.fillStyle = '#fef3c7'; // 매우 밝은 나무색
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#b45309';
            ctx.stroke();
            
            ctx.restore();
            
            prevFingerPos.current[handId] = { x: px, y: py, timestamp: now };
          });
        }
      }
    }
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  return (
    <div className="flex min-h-[calc(100vh-var(--topbar-h))] flex-col items-center justify-center bg-neutral-900 p-4 text-white">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          AirBeat: AI Virtual Drum
        </h1>
      </div>

      <div className="relative w-full max-w-5xl aspect-video bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-700">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            {audioLoadingMsg ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xl font-medium animate-pulse text-blue-400">
                  {audioLoadingMsg}
                </div>
              </div>
            ) : isLoaded ? (
              <button 
                onClick={startCamera}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-2xl transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105 cursor-pointer"
              >
                시작하기 (Start)
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xl font-medium animate-pulse text-blue-400">
                  AI 모델 로딩 중... (최초 1회)
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 비디오는 화면에 보이지 않고 처리용으로만 사용 */}
        <video 
          ref={videoRef} 
          className="hidden"
          playsInline
        />
        
        {/* 캔버스에 비디오 + 그래픽 모두 렌더링 */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-yellow-400"></span> 심벌류 (Cymbals)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-neutral-400 bg-white"></span> 드럼류 (Drums)
        </div>
      </div>
      
      <div className="mt-12 text-center text-neutral-500 text-sm max-w-2xl">
        <p>💡 <b>Tip:</b> 검지 손가락을 패드 위에서 아래로 가볍게 '툭' 내리치면 소리가 납니다. <br/>
        (호버링만으로는 소리가 나지 않으며, 내려치는 동작(Downward Hit)을 감지합니다)</p>
      </div>
    </div>
  );
}
