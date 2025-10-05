import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHandDetection } from '@/hooks/useHandDetection';
import { classifyISLGesture, GestureSmoother } from '@/utils/islGestureClassifier';
import { Progress } from '@/components/ui/progress';

const SignTranslator = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const { detectHands, normalizeLandmarks, isLoading: isHandDetectionLoading } = useHandDetection();
  const gestureSmoother = useRef(new GestureSmoother());
  const animationFrameRef = useRef<number>();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video metadata to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
        };
      }
      setStream(mediaStream);
      setIsTranslating(true);
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsTranslating(false);
      setTranslatedText('');
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsVideoReady(false);
    gestureSmoother.current.reset();
    setCurrentConfidence(0);
  };

  // Real-time continuous translation with MediaPipe
  useEffect(() => {
    if (!stream || !videoRef.current || !isTranslating || !isVideoReady) return;

    const detectGesture = async () => {
      if (!videoRef.current) return;

      const now = performance.now();
      const result = detectHands(videoRef.current, now);

      if (result && result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0].map(l => ({ x: l.x, y: l.y, z: l.z }));
        const normalized = normalizeLandmarks(landmarks);
        const gestureResult = classifyISLGesture(normalized);

        gestureSmoother.current.addPrediction(gestureResult.sign, gestureResult.confidence);
        const stableGesture = gestureSmoother.current.getStableGesture();

        setCurrentConfidence(Math.round(stableGesture.confidence * 100));

        // Update translated text when stable gesture detected
        if (stableGesture.isStable && stableGesture.sign) {
          const newText = stableGesture.sign;
          if (newText !== translatedText) {
            setTranslatedText(newText);
            
            // Speak the translated text
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(newText);
            synth.speak(utterance);
            
            // Reset smoother after detection to allow new gesture
            setTimeout(() => gestureSmoother.current.reset(), 1000);
          }
        }
      } else {
        setCurrentConfidence(0);
      }

      animationFrameRef.current = requestAnimationFrame(detectGesture);
    };

    detectGesture();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, isTranslating, translatedText, isVideoReady, detectHands, normalizeLandmarks]);

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="max-w-4xl mx-auto mb-12">
        <Button
          onClick={() => {
            stopCamera();
            navigate('/dashboard');
          }}
          variant="secondary"
          size="lg"
          aria-label={t('back')}
        >
          <ArrowLeft className="mr-2" />
          {t('back')}
        </Button>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground" aria-label={t('realTimeTranslation')}>
          {t('realTimeTranslation')}
        </h1>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video bg-muted border-4 border-foreground rounded-lg"
              aria-label="Camera viewfinder for sign language translation"
              style={{ transform: 'scaleX(-1)' }}
            />

            {translatedText && stream && (
              <div
                className="absolute bottom-0 left-0 right-0 p-6 bg-black/70 backdrop-blur-sm border-t-2 border-border rounded-b-lg"
                aria-live="polite"
                aria-label={`${t('translatedText')}: ${translatedText}`}
              >
                <p className="text-3xl font-bold text-center text-white">{translatedText}</p>
              </div>
            )}
          </div>

          {!stream ? (
            <Button 
              onClick={startCamera} 
              size="lg" 
              className="text-xl" 
              aria-label={t('startCamera')}
              disabled={isHandDetectionLoading}
            >
              <Camera className="mr-2" />
              {isHandDetectionLoading ? 'Loading detection model...' : t('startCamera')}
            </Button>
          ) : (
            <div className="w-full max-w-2xl space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Detection Confidence: {currentConfidence}%</span>
                  <span className={`text-sm font-medium ${currentConfidence >= 75 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {currentConfidence >= 75 ? '✓ Stable' : 'Detecting...'}
                  </span>
                </div>
                <Progress value={currentConfidence} className="h-2" />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={stopCamera} 
                  variant="secondary" 
                  size="lg" 
                  aria-label={t('stopCamera')}
                >
                  {t('stopCamera')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SignTranslator;
