import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useHandDetection } from '@/hooks/useHandDetection';
import { classifyISLGesture, GestureSmoother } from '@/utils/islGestureClassifier';
import { Progress } from '@/components/ui/progress';
import signA from '@/assets/signs/a.jpg';
import signB from '@/assets/signs/b.jpg';
import signC from '@/assets/signs/c.jpg';
import signD from '@/assets/signs/d.jpg';
import signHelloVideo from '@/assets/signs/hello.mp4';
import signWelcomeVideo from '@/assets/signs/welcome.mp4';
import signThankYouVideo from '@/assets/signs/thank-you.mp4';

type QuizCategory = 'letters' | 'words';
type SignItem = 'A' | 'B' | 'C' | 'D' | 'Hello' | 'Welcome' | 'Thank You';

const signImages: Record<SignItem, string> = {
  A: signA,
  B: signB,
  C: signC,
  D: signD,
  Hello: signHelloVideo,
  Welcome: signWelcomeVideo,
  'Thank You': signThankYouVideo,
};

const isVideo = (item: SignItem) => ['Hello', 'Welcome', 'Thank You'].includes(item);

const LearnSignLanguage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'category' | 'learn' | 'quiz' | 'results'>('category');
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [currentItem, setCurrentItem] = useState<SignItem>('A');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [quizItems, setQuizItems] = useState<SignItem[]>([]);
  const [showingLearnForCurrentItem, setShowingLearnForCurrentItem] = useState(true);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [detectionMessage, setDetectionMessage] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const { detectHands, normalizeLandmarks, isLoading: isHandDetectionLoading } = useHandDetection();
  const gestureSmoother = useRef(new GestureSmoother());
  const animationFrameRef = useRef<number>();

  const startCategory = (selectedCategory: QuizCategory) => {
    setCategory(selectedCategory);
    const items: SignItem[] = 
      selectedCategory === 'letters' 
        ? ['A', 'B', 'C', 'D'] 
        : ['Hello', 'Welcome', 'Thank You'];
    setQuizItems(items);
    setCurrentItem(items[0]);
    setCurrentQuestionIndex(0);
    setShowingLearnForCurrentItem(true);
    setMode('learn');
  };

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
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsVideoReady(false);
    gestureSmoother.current.reset();
    setCurrentConfidence(0);
    setDetectionMessage('');
  };

  // Real-time hand detection and gesture classification
  useEffect(() => {
    if (!stream || !videoRef.current || mode !== 'quiz' || !isVideoReady) return;

    let lastTimestamp = 0;
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
        setDetectionMessage(gestureResult.message);

        // Check if stable gesture matches expected sign
        if (stableGesture.isStable && stableGesture.sign === currentItem) {
          validateSign(true);
          return; // Stop detection after successful validation
        }
      } else {
        setDetectionMessage('Hand not detected clearly. Please adjust your hand position.');
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
  }, [stream, mode, currentItem, isVideoReady, detectHands, normalizeLandmarks]);

  const validateSign = async (isCorrect: boolean) => {
    if (isRecording) return; // Prevent multiple validations
    setIsRecording(true);

    try {
      if (isCorrect) {
        const newScore = score + 10;
        setScore(newScore);
        
        toast({
          title: '✅ ' + t('correct'),
          description: `+10 ${t('points')} | ISL sign recognized correctly!`,
        });

        if (user) {
          await (supabase as any).rpc('add_user_points', {
            user_id_param: user.id,
            points_to_add: 10,
          });
        }

        stopCamera();
        
        // Move to next letter or finish
        if (currentQuestionIndex < quizItems.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCurrentItem(quizItems[currentQuestionIndex + 1]);
          setShowingLearnForCurrentItem(true);
          setMode('learn');
        } else {
          setMode('results');
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate sign',
        variant: 'destructive',
      });
    } finally {
      setIsRecording(false);
    }
  };

  const startQuizForCurrentItem = () => {
    setShowingLearnForCurrentItem(false);
    setMode('quiz');
    startCamera();
  };

  const resetToCategory = () => {
    stopCamera();
    setMode('category');
    setCategory(null);
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowingLearnForCurrentItem(true);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
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

        {mode === 'learn' && showingLearnForCurrentItem && (
          <Button onClick={startQuizForCurrentItem} size="lg" aria-label="Start Quiz for This Sign">
            Quiz This Sign
          </Button>
        )}

        {(mode === 'quiz' || mode === 'results') && (
          <Button
            onClick={resetToCategory}
            variant="secondary"
            size="lg"
            aria-label={t('backToLearn')}
          >
            {t('backToLearn')}
          </Button>
        )}
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground" aria-label={t('learnSignLanguage')}>
          {t('learnSignLanguage')}
        </h1>

        {mode === 'category' && (
          <div className="flex flex-col items-center gap-6">
            <Button
              onClick={() => startCategory('letters')}
              size="lg"
              className="w-full max-w-md h-32 text-2xl"
              aria-label={t('practiceLetters')}
            >
              {t('practiceLetters')}
            </Button>
            <Button
              onClick={() => startCategory('words')}
              size="lg"
              className="w-full max-w-md h-32 text-2xl"
              aria-label={t('practiceWords')}
            >
              {t('practiceWords')}
            </Button>
          </div>
        )}

        {mode === 'results' && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">{t('finalScore')}</h2>
            <p className="text-5xl font-bold text-primary">{score}</p>
            <p className="text-xl text-muted-foreground">
              {t('questionsCompleted')}: {quizItems.length}
            </p>
            <Button onClick={resetToCategory} size="lg" className="text-xl" aria-label={t('backToLearn')}>
              {t('backToLearn')}
            </Button>
          </div>
        )}

        {mode === 'learn' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-2xl aspect-square bg-muted border-4 border-foreground rounded-lg flex items-center justify-center overflow-hidden">
              {isVideo(currentItem) ? (
                <video
                  src={signImages[currentItem]}
                  controls
                  loop
                  className="w-full h-full object-contain"
                  aria-label={`Video demonstration for sign: ${currentItem}`}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={signImages[currentItem]} 
                  alt={`Sign for ${currentItem}`}
                  className="w-full h-full object-contain"
                  aria-label={`Image demonstration for sign: ${currentItem}`}
                />
              )}
            </div>

            <div className="text-center space-y-4">
              <p className="text-2xl font-medium text-foreground" aria-label={`Learning sign for: ${currentItem}`}>
                Sign: {currentItem}
              </p>
              <p className="text-lg text-muted-foreground">
                Letter {currentQuestionIndex + 1} of {quizItems.length}
              </p>
            </div>
          </div>
        )}

        {mode === 'quiz' && (
          <>
            <div className="text-center mb-8">
              <p className="text-2xl text-foreground" aria-live="polite">
                {t('showSign')} "{currentItem}"
              </p>
              <p className="text-xl text-muted-foreground mt-2">
                {t('yourScore')}: {score} | Question {currentQuestionIndex + 1}/{quizItems.length}
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-2xl aspect-video bg-muted border-4 border-foreground rounded-lg"
                aria-label="Camera viewfinder for sign language practice"
                style={{ transform: 'scaleX(-1)' }}
              />

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
                      <span className="text-sm font-medium">Confidence: {currentConfidence}%</span>
                      <span className={`text-sm font-medium ${currentConfidence >= 75 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {currentConfidence >= 75 ? '✓ Hold steady...' : 'Adjust hand position'}
                      </span>
                    </div>
                    <Progress value={currentConfidence} className="h-2" />
                  </div>
                  
                  {detectionMessage && (
                    <p className="text-center text-sm text-muted-foreground" aria-live="polite">
                      {detectionMessage}
                    </p>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={stopCamera} variant="secondary" size="lg" aria-label={t('stopCamera')}>
                      {t('stopCamera')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LearnSignLanguage;
