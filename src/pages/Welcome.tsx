import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting((prev) => (prev === 'Hello' ? 'ನಮಸ್ಕಾರ' : 'Hello'));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <main className="max-w-2xl w-full text-center space-y-12">
        <h1
          className="text-6xl md:text-8xl font-bold text-foreground"
          aria-live="polite"
          aria-label={`Welcome greeting: ${greeting}`}
        >
          {greeting}
        </h1>

        <p className="text-2xl md:text-3xl text-foreground" aria-label="Setu - Your AI accessibility bridge">
          Setu
        </p>

        <Button
          onClick={() => navigate('/language')}
          size="lg"
          className="w-full max-w-md h-20 text-2xl"
          aria-label={t('getStarted')}
        >
          {t('getStarted')}
        </Button>

        <div
          className="bg-muted border-2 border-border p-6 rounded-lg"
          role="alert"
          aria-label={t('deafBlindWarning')}
        >
          <p className="text-lg text-foreground">{t('deafBlindWarning')}</p>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
