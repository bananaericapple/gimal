import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export class HandTracker {
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private isInitialized = false;
  private lastVideoTime = -1;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      this.isInitialized = true;
    } catch (e) {
      console.error("Failed to initialize hand landmarker:", e);
      throw e;
    }
  }

  public detect(video: HTMLVideoElement): HandLandmarkerResult | null {
    if (!this.handLandmarker || !this.isInitialized) return null;
    
    // Ensure video is ready and playing
    if (video.readyState < 2 || video.videoWidth === 0) return null;

    let result = null;
    if (this.lastVideoTime !== video.currentTime) {
      this.lastVideoTime = video.currentTime;
      try {
        result = this.handLandmarker.detectForVideo(video, performance.now());
      } catch (e) {
        console.error("Detection error:", e);
      }
    }
    return result;
  }
  
  public dispose() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
  }
}

// -----------------------------------------------------
// Utility functions for pinch calculation
// -----------------------------------------------------

// Calculate distance between two 3D points
export const calculateDistance = (p1: {x:number,y:number,z:number}, p2: {x:number,y:number,z:number}) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2) + 
    Math.pow(p1.z - p2.z, 2)
  );
}
