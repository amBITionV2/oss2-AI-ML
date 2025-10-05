import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Ear, MessageSquare, Volume2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [conditions, setConditions] = useState<string[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await (supabase as any).from('profiles').select('conditions, points').eq('user_id', user.id).single();

      if (data) {
        setConditions(data.conditions || []);
        setPoints(data.points || 0);
      }
    };

    fetchProfile();
  }, [user]);

  // Check if user has deaf OR mute condition for sign translator
  const hasDeafOrMute = conditions.includes('deaf') || conditions.includes('mute');
  const hasBlind = conditions.includes('blind');
  const hasDeaf = conditions.includes('deaf');

  const availableModules = [];

  // Add blind-specific modules
  if (hasBlind) {
    availableModules.push(
      { icon: Eye, label: t('learnBraille'), path: '/learn-braille' },
      { icon: Volume2, label: t('brailleScanner'), path: '/braille-scanner' }
    );
  }

  // Add sign translator for deaf OR mute
  if (hasDeafOrMute) {
    availableModules.push(
      { icon: MessageSquare, label: t('signTranslator'), path: '/sign-translator' }
    );
  }

  // Add learn sign language only for deaf
  if (hasDeaf) {
    availableModules.push(
      { icon: Ear, label: t('learnSignLanguage'), path: '/learn-sign' }
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="max-w-4xl mx-auto mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground" aria-label={t('dashboard')}>
              {t('dashboard')}
            </h1>
            <p className="text-xl text-muted-foreground mt-2" aria-label={`${t('yourScore')}: ${points} ${t('points')}`}>
              {t('yourScore')}: {points} {t('points')}
            </p>
          </div>
          <Button onClick={signOut} variant="secondary" size="lg" aria-label={t('signOut')}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableModules.map((item) => (
          <Button
            key={item.path}
            onClick={() => navigate(item.path)}
            size="lg"
            className="h-40 text-2xl flex flex-col items-center justify-center gap-4"
            aria-label={item.label}
          >
            <item.icon size={48} />
            {item.label}
          </Button>
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
