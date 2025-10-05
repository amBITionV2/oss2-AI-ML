import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang: 'en' | 'kn') => {
    setLanguage(lang);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <main className="max-w-2xl w-full space-y-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground" aria-label={t('selectLanguage')}>
          {t('selectLanguage')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            onClick={() => handleLanguageSelect('en')}
            size="lg"
            className="h-32 text-3xl"
            aria-label="Select English language"
          >
            {t('english')}
          </Button>

          <Button
            onClick={() => handleLanguageSelect('kn')}
            size="lg"
            className="h-32 text-3xl"
            aria-label="Select Kannada language"
          >
            {t('kannada')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LanguageSelection;
