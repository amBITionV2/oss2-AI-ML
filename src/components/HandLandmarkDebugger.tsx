import { useEffect, useRef } from 'react';
import { HandLandmarks } from '@/hooks/useHandDetection';
import { extractHandFeatures } from '@/utils/islGestureFeatures';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface HandLandmarkDebuggerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: HandLandmarks | null;
  enabled: boolean;
  onToggle: () => void;
}

export const HandLandmarkDebugger = ({ 
  videoRef, 
  landmarks, 
  enabled,
  onToggle 
}: HandLandmarkDebuggerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current || !videoRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      
      // Color code: wrist=red, thumb=blue, index=green, others=yellow
      if (index === 0) ctx.fillStyle = 'red';
      else if (index >= 1 && index <= 4) ctx.fillStyle = 'blue';
      else if (index >= 5 && index <= 8) ctx.fillStyle = 'lime';
      else ctx.fillStyle = 'yellow';
      
      ctx.fill();

      // Draw index number
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(index.toString(), x + 8, y + 4);
    });

    // Draw connections (simplified hand skeleton)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm
    ];

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      ctx.stroke();
    });

    // Extract and display features
    const features = extractHandFeatures(landmarks);
    
    // Draw feature info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 250, 180);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    let yPos = 30;
    
    const featureText = [
      `Thumb Ext: ${features.thumbExtension.toFixed(2)}`,
      `Index Ext: ${features.indexExtension.toFixed(2)}`,
      `Middle Ext: ${features.middleExtension.toFixed(2)}`,
      `Ring Ext: ${features.ringExtension.toFixed(2)}`,
      `Pinky Ext: ${features.pinkyExtension.toFixed(2)}`,
      `Thumb-Index: ${features.thumbIndexDistance.toFixed(2)}`,
      `Finger Spread: ${features.fingerSpread.toFixed(2)}`,
      `Hand Open: ${features.handOpenness.toFixed(2)}`,
      `Curvature: ${features.curvature.toFixed(2)}`,
      `Palm Pitch: ${(features.palmPitch * 180 / Math.PI).toFixed(0)}°`,
      `Palm Yaw: ${(features.palmYaw * 180 / Math.PI).toFixed(0)}°`,
    ];
    
    featureText.forEach(text => {
      ctx.fillText(text, 20, yPos);
      yPos += 15;
    });

  }, [landmarks, videoRef, enabled]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none ${enabled ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'scaleX(-1)' }}
      />
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10"
        aria-label={enabled ? "Hide Debug Overlay" : "Show Debug Overlay"}
      >
        {enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {enabled ? 'Hide Debug' : 'Show Debug'}
      </Button>
    </div>
  );
};
