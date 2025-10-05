import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      navigate('/conditions');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <main className="max-w-md w-full space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground" aria-label={t('login')}>
          {t('login')}
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xl">
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-16 text-xl"
              aria-label={t('email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xl">
              {t('password')}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-16 text-xl"
              aria-label={t('password')}
            />
          </div>

          <Button type="submit" size="lg" className="w-full h-16 text-xl" disabled={loading} aria-label={t('login')}>
            {loading ? '...' : t('login')}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full h-16 text-xl"
            onClick={() => navigate('/signup')}
            aria-label={t('noAccount') + ' ' + t('signup')}
          >
            {t('noAccount')} {t('signup')}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Login;
