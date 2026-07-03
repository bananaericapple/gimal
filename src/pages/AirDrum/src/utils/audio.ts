// 오디오 컨텍스트 및 버퍼 캐시
let audioCtx: AudioContext | null = null;
const audioBuffers: Record<string, AudioBuffer> = {};

// 고품질 어쿠스틱 드럼 샘플 URL
const SAMPLE_URLS = {
  kick: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/kick.mp3',
  snare: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/snare.mp3',
  hihat: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/hihat.mp3',
  tom1: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/tom1.mp3',
  tom2: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/tom2.mp3',
  tom3: 'https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/acoustic-kit/tom3.mp3',
  crash: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav',
  ride: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/ride.wav',
  splash: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav'
};

export async function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}

export async function loadDrumSamples(onProgress?: (loaded: number, total: number) => void) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  const keys = Object.keys(SAMPLE_URLS);
  let loadedCount = 0;
  
  const promises = keys.map(async (key) => {
    if (audioBuffers[key]) {
      loadedCount++;
      if (onProgress) onProgress(loadedCount, keys.length);
      return; // 이미 로드됨
    }
    
    try {
      const response = await fetch(SAMPLE_URLS[key as keyof typeof SAMPLE_URLS]);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx!.decodeAudioData(arrayBuffer);
      audioBuffers[key] = audioBuffer;
    } catch (e) {
      console.error(`Failed to load sample: ${key}`, e);
    }
    loadedCount++;
    if (onProgress) onProgress(loadedCount, keys.length);
  });
  
  await Promise.all(promises);
}

// 버퍼 재생 공통 함수
function playBuffer(key: string, volume: number = 1.0) {
  if (!audioCtx || !audioBuffers[key]) return;
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffers[key];
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
}

// 드럼별 재생 함수 노출
export function playKick() { playBuffer('kick', 1.2); }
export function playSnare() { playBuffer('snare', 1.0); }
export function playHighTom() { playBuffer('tom1', 1.0); }
export function playMidTom() { playBuffer('tom2', 1.0); }
export function playFloorTom() { playBuffer('tom3', 1.0); }
export function playCrash() { playBuffer('crash', 0.8); } // 크래시는 소리가 클 수 있으므로 약간 조절
export function playRide() { playBuffer('ride', 0.9); }
export function playHiHat(open = false) { playBuffer('hihat', 1.0); } // Tonejs 킷은 닫힌 하이햇 위주
export function playSplash() { playBuffer('splash', 0.8); }

