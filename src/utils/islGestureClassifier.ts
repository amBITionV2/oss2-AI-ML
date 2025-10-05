import { HandLandmarks } from '@/hooks/useHandDetection';
import { extractHandFeatures, isFingerExtended, isFingerCurled, HandFeatures } from './islGestureFeatures';

type SignItem = 'A' | 'B' | 'C' | 'D' | 'Hello' | 'Welcome' | 'Thank You';

export interface GestureResult {
  sign: SignItem | null;
  confidence: number;
  message: string;
}

interface GestureScore {
  sign: SignItem;
  score: number;
  maxScore: number;
  confidence: number;
}

/**
 * Research-based ISL gesture classification with partial matching and scoring
 */
export const classifyISLGesture = (landmarks: HandLandmarks): GestureResult => {
  if (landmarks.length !== 21) {
    return {
      sign: null,
      confidence: 0,
      message: 'Hand not detected clearly. Please adjust your hand position.'
    };
  }

  // Extract comprehensive geometric features
  const features = extractHandFeatures(landmarks);

  // Score all gestures
  const scores: GestureScore[] = [
    scoreISL_A(features),
    scoreISL_B(features),
    scoreISL_C(features),
    scoreISL_D(features),
    scoreISL_Hello(features),
    scoreISL_ThankYou(features),
    scoreISL_Welcome(features),
  ];

  // Find best match
  const bestMatch = scores.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Threshold for detection (lowered to 0.60 for better detection)
  const DETECTION_THRESHOLD = 0.60;

  if (bestMatch.confidence >= DETECTION_THRESHOLD) {
    console.log(`✓ ISL ${bestMatch.sign} detected - Score: ${bestMatch.score.toFixed(1)}/${bestMatch.maxScore} (${(bestMatch.confidence * 100).toFixed(0)}%)`);
    return {
      sign: bestMatch.sign,
      confidence: bestMatch.confidence,
      message: `ISL sign "${bestMatch.sign}" detected!`
    };
  }

  // Debug: Show closest match even if below threshold
  console.log(`Closest match: ${bestMatch.sign} (${(bestMatch.confidence * 100).toFixed(0)}%)`);
  
  return {
    sign: null,
    confidence: 0,
    message: 'No clear gesture detected. Ensure your hand is fully visible and try again.'
  };
};

/**
 * ISL Letter A: Thumb and index finger tips touch forming O-shape, other fingers curled
 * Scoring system: 0-1 based on how well conditions are met
 */
const scoreISL_A = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    thumbIndexTouch: 3.0,  // Most critical
    otherFingersCurled: 2.0,
    thumbPosition: 1.0,
  };
  
  // Relaxed: thumb and index close (was < 0.15, now < 0.20)
  const thumbIndexDist = f.thumbIndexDistance;
  if (thumbIndexDist < 0.20) {
    score += weights.thumbIndexTouch;
    console.log(`  A: ✓ Thumb-Index touch (${thumbIndexDist.toFixed(2)} < 0.20)`);
  } else {
    console.log(`  A: ✗ Thumb-Index apart (${thumbIndexDist.toFixed(2)} >= 0.20)`);
  }
  
  // Other fingers curled
  const curledCount = [
    isFingerCurled(f.middleExtension, f.middleAngle),
    isFingerCurled(f.ringExtension, f.ringAngle),
    isFingerCurled(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (curledCount / 3) * weights.otherFingersCurled;
  console.log(`  A: ${curledCount}/3 fingers curled`);
  
  // Thumb partially extended
  if (f.thumbExtension > 0.4 && f.thumbExtension < 0.9) {
    score += weights.thumbPosition;
    console.log(`  A: ✓ Thumb position (${f.thumbExtension.toFixed(2)})`);
  }
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'A', score, maxScore, confidence };
};

/**
 * ISL Letter B: All four fingers extended upward and close together
 */
const scoreISL_B = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    fingersExtended: 3.0,
    fingersTogether: 2.0,
    palmOrientation: 1.0,
  };
  
  // All fingers extended
  const extendedCount = [
    isFingerExtended(f.indexExtension, f.indexAngle),
    isFingerExtended(f.middleExtension, f.middleAngle),
    isFingerExtended(f.ringExtension, f.ringAngle),
    isFingerExtended(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (extendedCount / 4) * weights.fingersExtended;
  console.log(`  B: ${extendedCount}/4 fingers extended`);
  
  // Relaxed: Fingers together (was < 0.3, now < 0.35)
  if (f.fingerSpread < 0.35) {
    score += weights.fingersTogether;
    console.log(`  B: ✓ Fingers together (${f.fingerSpread.toFixed(2)} < 0.35)`);
  } else {
    console.log(`  B: ✗ Fingers spread (${f.fingerSpread.toFixed(2)} >= 0.35)`);
  }
  
  // Palm orientation
  if (Math.abs(f.palmPitch) < Math.PI / 3) {
    score += weights.palmOrientation;
    console.log(`  B: ✓ Palm vertical`);
  }
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'B', score, maxScore, confidence };
};

/**
 * ISL Letter C: Hand forms curved C-shape
 */
const scoreISL_C = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    fingersCurved: 3.0,
    curvature: 2.0,
    thumbPosition: 1.5,
    fingerSpread: 1.0,
  };
  
  // Relaxed ranges by ~15%
  const curvedCount = [
    f.indexExtension > 0.45 && f.indexExtension < 0.95,
    f.middleExtension > 0.45 && f.middleExtension < 0.95,
    f.ringExtension > 0.45 && f.ringExtension < 0.95,
    f.pinkyExtension > 0.45 && f.pinkyExtension < 0.95,
  ].filter(Boolean).length;
  
  score += (curvedCount / 4) * weights.fingersCurved;
  console.log(`  C: ${curvedCount}/4 fingers curved`);
  
  // Curvature
  if (f.curvature > 0.25 && f.curvature < 0.75) {
    score += weights.curvature;
    console.log(`  C: ✓ Good curvature (${f.curvature.toFixed(2)})`);
  }
  
  // Thumb apart (forming C gap) - relaxed
  if (f.thumbIndexDistance > 0.25 && f.thumbIndexDistance < 0.75) {
    score += weights.thumbPosition;
    console.log(`  C: ✓ Thumb apart (${f.thumbIndexDistance.toFixed(2)})`);
  }
  
  // Moderate spread - relaxed
  if (f.fingerSpread > 0.12 && f.fingerSpread < 0.50) {
    score += weights.fingerSpread;
    console.log(`  C: ✓ Moderate spread (${f.fingerSpread.toFixed(2)})`);
  }
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'C', score, maxScore, confidence };
};

/**
 * ISL Letter D: Index finger extended, thumb extended to side, others curled
 */
const scoreISL_D = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    indexExtended: 3.0,
    otherFingersCurled: 2.0,
    thumbExtended: 1.5,
    thumbIndexApart: 1.0,
  };
  
  // Index extended
  if (isFingerExtended(f.indexExtension, f.indexAngle)) {
    score += weights.indexExtended;
    console.log(`  D: ✓ Index extended`);
  } else {
    console.log(`  D: ✗ Index not extended`);
  }
  
  // Other fingers curled
  const curledCount = [
    isFingerCurled(f.middleExtension, f.middleAngle),
    isFingerCurled(f.ringExtension, f.ringAngle),
    isFingerCurled(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (curledCount / 3) * weights.otherFingersCurled;
  console.log(`  D: ${curledCount}/3 fingers curled`);
  
  // Thumb extended
  if (f.thumbExtension > 0.6) {
    score += weights.thumbExtended;
    console.log(`  D: ✓ Thumb extended (${f.thumbExtension.toFixed(2)})`);
  }
  
  // Relaxed: Thumb-index apart (was > 0.4, now > 0.35)
  if (f.thumbIndexDistance > 0.35) {
    score += weights.thumbIndexApart;
    console.log(`  D: ✓ Thumb-Index apart (${f.thumbIndexDistance.toFixed(2)} > 0.35)`);
  } else {
    console.log(`  D: ✗ Thumb-Index close (${f.thumbIndexDistance.toFixed(2)} <= 0.35)`);
  }
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'D', score, maxScore, confidence };
};

/**
 * ISL Hello: Open palm with fingers spread
 */
const scoreISL_Hello = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    fingersExtended: 3.0,
    thumbExtended: 1.5,
    fingersSpread: 2.0,
    handOpen: 1.0,
  };
  
  const extendedCount = [
    isFingerExtended(f.indexExtension, f.indexAngle),
    isFingerExtended(f.middleExtension, f.middleAngle),
    isFingerExtended(f.ringExtension, f.ringAngle),
    isFingerExtended(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (extendedCount / 4) * weights.fingersExtended;
  
  if (f.thumbExtension > 0.7) score += weights.thumbExtended;
  if (f.fingerSpread > 0.4) score += weights.fingersSpread;
  if (f.handOpenness > 0.75) score += weights.handOpen;
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'Hello', score, maxScore, confidence };
};

/**
 * ISL Thank You: Palm facing inward, fingers together
 */
const scoreISL_ThankYou = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    fingersExtended: 3.0,
    fingersTogether: 2.0,
    palmOrientation: 1.5,
    thumbPosition: 1.0,
  };
  
  const extendedCount = [
    isFingerExtended(f.indexExtension, f.indexAngle),
    isFingerExtended(f.middleExtension, f.middleAngle),
    isFingerExtended(f.ringExtension, f.ringAngle),
    isFingerExtended(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (extendedCount / 4) * weights.fingersExtended;
  
  if (f.fingerSpread < 0.25) score += weights.fingersTogether;
  if (f.palmYaw < -0.3) score += weights.palmOrientation;
  if (f.thumbExtension > 0.3) score += weights.thumbPosition;
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'Thank You', score, maxScore, confidence };
};

/**
 * ISL Welcome: Open hand, palm up or forward
 */
const scoreISL_Welcome = (f: HandFeatures): GestureScore => {
  let score = 0;
  const weights = {
    fingersExtended: 3.0,
    fingerSpread: 2.0,
    palmOrientation: 1.5,
    thumbExtended: 1.0,
  };
  
  const extendedCount = [
    isFingerExtended(f.indexExtension, f.indexAngle),
    isFingerExtended(f.middleExtension, f.middleAngle),
    isFingerExtended(f.ringExtension, f.ringAngle),
    isFingerExtended(f.pinkyExtension, f.pinkyAngle),
  ].filter(Boolean).length;
  
  score += (extendedCount / 4) * weights.fingersExtended;
  
  if (f.fingerSpread > 0.2 && f.fingerSpread < 0.45) score += weights.fingerSpread;
  if (f.palmPitch > -0.5) score += weights.palmOrientation;
  if (f.thumbExtension > 0.6) score += weights.thumbExtended;
  
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const confidence = score / maxScore;
  
  return { sign: 'Welcome', score, maxScore, confidence };
};

/**
 * Enhanced temporal smoothing with improved stability
 */
export class GestureSmoother {
  private predictions: { sign: SignItem | null; confidence: number; timestamp: number }[] = [];
  private readonly windowSize = 4; // Reduced from 6 for faster response
  private readonly confidenceThreshold = 0.65; // Reduced from 0.75
  private readonly stabilityThreshold = 0.65; // Reduced from 0.75 (65% of frames)
  private readonly maxAge = 1500;
  private lastDetectedSign: SignItem | null = null;
  private lastDetectionTime = 0;
  private readonly cooldownMs = 500; // Cooldown after detection

  addPrediction(sign: SignItem | null, confidence: number) {
    const now = Date.now();
    this.predictions.push({ sign, confidence, timestamp: now });

    // Remove old predictions
    this.predictions = this.predictions.filter(p => now - p.timestamp < this.maxAge);

    // Keep reasonable buffer
    if (this.predictions.length > this.windowSize * 3) {
      this.predictions = this.predictions.slice(-this.windowSize * 3);
    }
  }

  getStableGesture(): { sign: SignItem | null; confidence: number; isStable: boolean } {
    if (this.predictions.length < this.windowSize) {
      return { sign: null, confidence: 0, isStable: false };
    }

    // Check cooldown
    const now = Date.now();
    if (this.lastDetectedSign && (now - this.lastDetectionTime) < this.cooldownMs) {
      return { sign: null, confidence: 0, isStable: false };
    }

    // Get recent predictions
    const recentPredictions = this.predictions.slice(-this.windowSize);

    // Confidence-weighted voting
    const signScores = new Map<SignItem | null, number>();
    const signConfidences = new Map<SignItem | null, number[]>();

    recentPredictions.forEach(p => {
      const currentScore = signScores.get(p.sign) || 0;
      signScores.set(p.sign, currentScore + p.confidence);
      
      if (!signConfidences.has(p.sign)) {
        signConfidences.set(p.sign, []);
      }
      signConfidences.get(p.sign)!.push(p.confidence);
    });

    // Find sign with highest weighted score
    let bestSign: SignItem | null = null;
    let bestScore = 0;

    signScores.forEach((score, sign) => {
      if (score > bestScore) {
        bestScore = score;
        bestSign = sign;
      }
    });

    // Calculate average confidence
    const confidences = signConfidences.get(bestSign) || [];
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    // Check stability: sign appears in most frames and has good confidence
    const occurrences = confidences.length;
    const isStable = 
      bestSign !== null && 
      occurrences >= Math.ceil(this.windowSize * this.stabilityThreshold) &&
      avgConfidence >= this.confidenceThreshold;

    if (isStable) {
      this.lastDetectedSign = bestSign;
      this.lastDetectionTime = now;
    }

    return {
      sign: isStable ? bestSign : null,
      confidence: avgConfidence,
      isStable
    };
  }

  reset() {
    this.predictions = [];
    this.lastDetectedSign = null;
    this.lastDetectionTime = 0;
  }
}
