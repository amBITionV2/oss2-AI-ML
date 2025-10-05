import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BrailleScanner = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
  };

  const handleScan = async () => {
    setScanning(true);

    // Mock OCR result for demo
    setTimeout(() => {
      const mockText = 'Hello World';
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(mockText);
      synth.speak(utterance);

      toast({
        title: 'Scanned Text',
        description: mockText,
      });

      setScanning(false);
    }, 2000);
  };

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
          aria-label={`${t('back')} ${t('dashboard')}`}
        >
          <ArrowLeft className="mr-2" />
          {t('back')}
        </Button>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground">{t('brailleScanner')}</h1>

        <div className="flex flex-col items-center gap-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-2xl aspect-video bg-muted border-4 border-foreground rounded-lg"
            aria-label="Camera viewfinder"
          />

          <div className="flex gap-4">
            {!stream ? (
              <Button onClick={startCamera} size="lg" className="text-xl" aria-label={t('startCamera')}>
                <Camera className="mr-2" />
                {t('startCamera')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleScan}
                  size="lg"
                  className="text-xl"
                  disabled={scanning}
                  aria-label={scanning ? t('scanning') : t('scan')}
                >
                  {scanning ? t('scanning') : t('scan')}
                </Button>
                <Button onClick={stopCamera} variant="secondary" size="lg" aria-label={t('stopCamera')}>
                  {t('stopCamera')}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrailleScanner;
