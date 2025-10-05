import { useState, useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export type HandLandmarks = {
  x: number;
  y: number;
  z: number;
}[];

export const useHandDetection = () => {
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setHandLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize hand detection:", err);
        setError("Failed to initialize hand detection");
        setIsLoading(false);
      }
    };

    initializeHandDetection();

    return () => {
      handLandmarker?.close();
    };
  }, []);

  const detectHands = (videoElement: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null => {
    if (!handLandmarker || !videoElement) return null;
    
    // CRITICAL: Validate video element is ready before detection
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null; // Video not ready yet (0x0 dimensions)
    }
    
    if (videoElement.readyState < 2) {
      return null; // Video doesn't have current frame data yet
    }
    
    try {
      return handLandmarker.detectForVideo(videoElement, timestamp);
    } catch (err) {
      console.error("Hand detection error:", err);
      return null;
    }
  };

  const normalizeLandmarks = (landmarks: HandLandmarks): HandLandmarks => {
    if (landmarks.length === 0) return [];

    // Use wrist (landmark 0) as reference point
    const wrist = landmarks[0];
    const middleMCP = landmarks[9]; // Middle finger base
    
    // Translate to wrist origin
    const translated = landmarks.map(point => ({
      x: point.x - wrist.x,
      y: point.y - wrist.y,
      z: point.z - wrist.z
    }));

    // Calculate palm size for scale normalization (wrist to middle finger base)
    const palmSize = Math.sqrt(
      Math.pow(middleMCP.x - wrist.x, 2) +
      Math.pow(middleMCP.y - wrist.y, 2) +
      Math.pow(middleMCP.z - wrist.z, 2)
    );

    // Normalize scale based on palm size
    if (palmSize > 0.01) {
      const scaled = translated.map(point => ({
        x: point.x / palmSize,
        y: point.y / palmSize,
        z: point.z / palmSize
      }));

      // Rotate to standard orientation (palm facing camera, fingers pointing up)
      // Calculate palm plane normal vector
      const palmVector = {
        x: scaled[9].x - scaled[0].x, // Wrist to middle MCP
        y: scaled[9].y - scaled[0].y,
        z: scaled[9].z - scaled[0].z
      };

      // Normalize palm vector
      const palmVecLen = Math.sqrt(
        palmVector.x ** 2 + palmVector.y ** 2 + palmVector.z ** 2
      );

      if (palmVecLen > 0) {
        palmVector.x /= palmVecLen;
        palmVector.y /= palmVecLen;
        palmVector.z /= palmVecLen;

        // Calculate rotation to align palm with Y-axis (fingers point up)
        const rotationAngle = Math.atan2(palmVector.x, palmVector.y);
        const cosTheta = Math.cos(-rotationAngle);
        const sinTheta = Math.sin(-rotationAngle);

        // Apply 2D rotation in XY plane
        return scaled.map(point => ({
          x: point.x * cosTheta - point.y * sinTheta,
          y: point.x * sinTheta + point.y * cosTheta,
          z: point.z
        }));
      }

      return scaled;
    }

    return translated;
  };

  return {
    handLandmarker,
    detectHands,
    normalizeLandmarks,
    isLoading,
    error
  };
};
