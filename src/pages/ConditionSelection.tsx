import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ConditionSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const conditionOptions = [
    { id: 'blind', label: t('blind') },
    { id: 'deaf', label: t('deaf') },
    { id: 'mute', label: t('mute') },
  ];

  const toggleCondition = (conditionId: string) => {
    setConditions((prev) => {
      if (prev.includes(conditionId)) {
        return prev.filter((c) => c !== conditionId);
      } else {
        return [...prev, conditionId];
      }
    });
  };

  const handleContinue = async () => {
    if (conditions.length === 0) {
      toast({
        title: 'Please select at least one condition',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // First check if profile exists
    const { data: existingProfile } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id)
      .maybeSingle();

    let error;
    
    if (existingProfile) {
      // Update existing profile
      ({ error } = await (supabase as any)
        .from('profiles')
        .update({ conditions, language_preference: language })
        .eq('user_id', user?.id));
    } else {
      // Get user email from auth.users
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Insert new profile
      ({ error } = await (supabase as any)
        .from('profiles')
        .insert([{ 
          user_id: user?.id, 
          email: authUser?.email || '', 
          conditions, 
          language_preference: language 
        }]));
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <main className="max-w-2xl w-full space-y-12">
        <h1 className="text-4xl font-bold text-center text-foreground" aria-label={t('selectConditions')}>
          {t('selectConditions')}
        </h1>

        <div className="space-y-6">
          {conditionOptions.map((option) => {
            const isSelected = conditions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleCondition(option.id)}
                className={`w-full flex items-center space-x-4 border-2 p-6 rounded-lg transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-secondary'
                }`}
                aria-label={`${t('selectCondition')} ${option.label}. ${isSelected ? t('conditionSelected') : ''}`}
                aria-pressed={isSelected}
              >
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  onCheckedChange={() => toggleCondition(option.id)}
                  className="w-8 h-8"
                  aria-hidden="true"
                />
                <label htmlFor={option.id} className="text-2xl font-medium cursor-pointer flex-1 text-left">
                  {option.label}
                </label>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full h-20 text-2xl"
          disabled={loading || conditions.length === 0}
          aria-label={t('continue')}
        >
          {loading ? '...' : t('continue')}
        </Button>
      </main>
    </div>
  );
};

export default ConditionSelection;
