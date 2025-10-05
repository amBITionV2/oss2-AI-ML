import { HandLandmarks } from '@/hooks/useHandDetection';

export interface HandFeatures {
  // Finger extension ratios (0 = curled, 1 = extended)
  thumbExtension: number;
  indexExtension: number;
  middleExtension: number;
  ringExtension: number;
  pinkyExtension: number;

  // Finger angles (radians)
  thumbAngle: number;
  indexAngle: number;
  middleAngle: number;
  ringAngle: number;
  pinkyAngle: number;

  // Inter-finger distances
  thumbIndexDistance: number;
  fingerSpread: number; // average distance between adjacent fingers

  // Palm orientation (radians)
  palmPitch: number; // rotation around X axis
  palmYaw: number; // rotation around Y axis
  palmRoll: number; // rotation around Z axis

  // Hand shape metrics
  handOpenness: number; // how open/closed the hand is (0-1)
  curvature: number; // how curved the fingers are (0-1)

  // 3D depth features
  avgDepth: number;
  depthVariation: number;
}

/**
 * Extract comprehensive geometric features from hand landmarks
 */
export const extractHandFeatures = (landmarks: HandLandmarks): HandFeatures => {
  // Landmark indices
  const WRIST = 0;
  const THUMB_TIP = 4, THUMB_IP = 3, THUMB_MCP = 2, THUMB_CMC = 1;
  const INDEX_TIP = 8, INDEX_DIP = 7, INDEX_PIP = 6, INDEX_MCP = 5;
  const MIDDLE_TIP = 12, MIDDLE_DIP = 11, MIDDLE_PIP = 10, MIDDLE_MCP = 9;
  const RING_TIP = 16, RING_DIP = 15, RING_PIP = 14, RING_MCP = 13;
  const PINKY_TIP = 20, PINKY_DIP = 19, PINKY_PIP = 18, PINKY_MCP = 17;

  // Helper: Calculate Euclidean distance
  const distance = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) => {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
  };

  // Helper: Calculate angle between three points (returns radians)
  const angle = (p1: { x: number; y: number; z: number }, vertex: { x: number; y: number; z: number }, p3: { x: number; y: number; z: number }) => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y, z: p1.z - vertex.z };
    const v2 = { x: p3.x - vertex.x, y: p3.y - vertex.y, z: p3.z - vertex.z };
    
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  };

  // Palm size for normalization (wrist to middle finger MCP)
  const palmSize = distance(landmarks[WRIST], landmarks[MIDDLE_MCP]);

  // Finger extension ratios
  const thumbExtension = distance(landmarks[THUMB_TIP], landmarks[THUMB_CMC]) / (palmSize * 1.5);
  const indexExtension = distance(landmarks[INDEX_TIP], landmarks[INDEX_MCP]) / (palmSize * 1.2);
  const middleExtension = distance(landmarks[MIDDLE_TIP], landmarks[MIDDLE_MCP]) / (palmSize * 1.2);
  const ringExtension = distance(landmarks[RING_TIP], landmarks[RING_MCP]) / (palmSize * 1.2);
  const pinkyExtension = distance(landmarks[PINKY_TIP], landmarks[PINKY_MCP]) / (palmSize * 1.0);

  // Finger bend angles (smaller angle = more bent)
  const thumbAngle = angle(landmarks[THUMB_TIP], landmarks[THUMB_IP], landmarks[THUMB_CMC]);
  const indexAngle = angle(landmarks[INDEX_TIP], landmarks[INDEX_PIP], landmarks[INDEX_MCP]);
  const middleAngle = angle(landmarks[MIDDLE_TIP], landmarks[MIDDLE_PIP], landmarks[MIDDLE_MCP]);
  const ringAngle = angle(landmarks[RING_TIP], landmarks[RING_PIP], landmarks[RING_MCP]);
  const pinkyAngle = angle(landmarks[PINKY_TIP], landmarks[PINKY_PIP], landmarks[PINKY_MCP]);

  // Inter-finger distances
  const thumbIndexDistance = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / palmSize;
  const fingerSpread = (
    distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]) +
    distance(landmarks[MIDDLE_TIP], landmarks[RING_TIP]) +
    distance(landmarks[RING_TIP], landmarks[PINKY_TIP])
  ) / (3 * palmSize);

  // Palm orientation vectors
  const palmNormal = {
    x: landmarks[MIDDLE_MCP].x - landmarks[WRIST].x,
    y: landmarks[MIDDLE_MCP].y - landmarks[WRIST].y,
    z: landmarks[MIDDLE_MCP].z - landmarks[WRIST].z
  };
  
  const palmPitch = Math.atan2(palmNormal.y, Math.sqrt(palmNormal.x ** 2 + palmNormal.z ** 2));
  const palmYaw = Math.atan2(palmNormal.x, palmNormal.z);
  const palmRoll = Math.atan2(
    landmarks[PINKY_MCP].y - landmarks[INDEX_MCP].y,
    landmarks[PINKY_MCP].x - landmarks[INDEX_MCP].x
  );

  // Hand openness (how spread out fingers are)
  const handOpenness = Math.min(1, (indexExtension + middleExtension + ringExtension + pinkyExtension) / 4);

  // Curvature (how curved vs straight the fingers are)
  const avgAngle = (indexAngle + middleAngle + ringAngle + pinkyAngle) / 4;
  const curvature = 1 - (avgAngle / Math.PI); // 0 = straight, 1 = fully bent

  // Depth features
  const depths = landmarks.map(l => l.z);
  const avgDepth = depths.reduce((sum, z) => sum + z, 0) / depths.length;
  const depthVariation = Math.sqrt(
    depths.reduce((sum, z) => sum + Math.pow(z - avgDepth, 2), 0) / depths.length
  );

  return {
    thumbExtension: Math.min(1, thumbExtension),
    indexExtension: Math.min(1, indexExtension),
    middleExtension: Math.min(1, middleExtension),
    ringExtension: Math.min(1, ringExtension),
    pinkyExtension: Math.min(1, pinkyExtension),
    thumbAngle,
    indexAngle,
    middleAngle,
    ringAngle,
    pinkyAngle,
    thumbIndexDistance,
    fingerSpread,
    palmPitch,
    palmYaw,
    palmRoll,
    handOpenness,
    curvature,
    avgDepth,
    depthVariation
  };
};

/**
 * Check if a finger is extended (based on extension ratio and angle)
 */
export const isFingerExtended = (extension: number, angle: number): boolean => {
  return extension > 0.7 && angle > 2.4; // ~137 degrees
};

/**
 * Check if a finger is curled/bent
 */
export const isFingerCurled = (extension: number, angle: number): boolean => {
  return extension < 0.5 || angle < 1.8; // ~103 degrees
};
