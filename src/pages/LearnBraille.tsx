import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Braille letter patterns (dots 1-6)
const braillePatterns: Record<string, number[]> = {
  A: [1],
  B: [1, 2],
  C: [1, 4],
  D: [1, 4, 5],
  dog: [1, 4, 5, 1, 5, 1, 2, 3, 4],
  eye: [1, 5, 1, 3, 4, 5, 1, 5],
  house: [1, 2, 5, 1, 5, 1, 3, 4, 1, 3, 5, 1, 5],
};

type QuizCategory = 'letters' | 'words';
type QuizItem = 'A' | 'B' | 'C' | 'D' | 'dog' | 'eye' | 'house';

const LearnBraille = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mode, setMode] = useState<'category' | 'learn' | 'quiz' | 'results'>('category');
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [currentItem, setCurrentItem] = useState<QuizItem>('A');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);

  const dots = [
    { id: 1, position: 'top-0 left-0' },
    { id: 2, position: 'top-1/3 left-0' },
    { id: 3, position: 'top-2/3 left-0' },
    { id: 4, position: 'top-0 right-0' },
    { id: 5, position: 'top-1/3 right-0' },
    { id: 6, position: 'top-2/3 right-0' },
  ];

  const handleDotPress = (dotId: number) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(`${t('dot')} ${dotId}`);
    synth.speak(utterance);

    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    setActiveDots((prev) => (prev.includes(dotId) ? prev.filter((id) => id !== dotId) : [...prev, dotId]));
  };

  const startCategory = (selectedCategory: QuizCategory) => {
    setCategory(selectedCategory);
    const items: QuizItem[] = selectedCategory === 'letters' ? ['A', 'B', 'C', 'D'] : ['dog', 'eye', 'house'];
    setQuizItems(items);
    setCurrentItem(items[0]);
    setCurrentQuestionIndex(0);
    setMode('learn');
  };

  const checkAnswer = async () => {
    const correctPattern = braillePatterns[currentItem];
    const isCorrect =
      activeDots.length === correctPattern.length &&
      activeDots.every((dot) => correctPattern.includes(dot));

    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      
      toast({
        title: t('correct'),
        description: `+10 ${t('points')}`,
      });

      // Update user points in database
      if (user) {
        await (supabase as any).rpc('add_user_points', {
          user_id_param: user.id,
          points_to_add: 10,
        });
      }

      // Move to next question or finish
      if (currentQuestionIndex < quizItems.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentItem(quizItems[currentQuestionIndex + 1]);
        setActiveDots([]);
        setShowCorrectAnswer(false);
      } else {
        setMode('results');
      }
    } else {
      toast({
        title: t('incorrect'),
        variant: 'destructive',
      });
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      setShowCorrectAnswer(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizItems.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentItem(quizItems[currentQuestionIndex + 1]);
      setActiveDots([]);
      setShowCorrectAnswer(false);
    } else {
      setMode('results');
    }
  };

  const startQuiz = () => {
    setMode('quiz');
    setScore(0);
    setCurrentQuestionIndex(0);
    setCurrentItem(quizItems[0]);
    setActiveDots([]);
    setShowCorrectAnswer(false);
  };

  const resetToCategory = () => {
    setMode('category');
    setCategory(null);
    setActiveDots([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowCorrectAnswer(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          size="lg"
          aria-label={t('back')}
        >
          <ArrowLeft className="mr-2" />
          {t('back')}
        </Button>

        {mode === 'learn' && (
          <Button onClick={startQuiz} size="lg" aria-label={t('startQuiz')}>
            {t('startQuiz')}
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

      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-foreground" aria-label={t('learnBraille')}>
          {t('learnBraille')}
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

        {(mode === 'learn' || mode === 'quiz') && (
          <>
            {mode === 'quiz' && (
              <div className="text-center mb-8">
                <p className="text-2xl text-foreground" aria-live="polite">
                  {t('createLetter')} {currentItem}
                </p>
                <p className="text-xl text-muted-foreground mt-2">
                  {t('yourScore')}: {score} | Question {currentQuestionIndex + 1}/{quizItems.length}
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-8">
              <div className="relative w-64 h-96 border-4 border-foreground rounded-lg">
                {dots.map((dot) => (
                  <button
                    key={dot.id}
                    onClick={() => handleDotPress(dot.id)}
                    className={`absolute w-16 h-16 rounded-full border-4 border-foreground transition-all ${
                      activeDots.includes(dot.id) ? 'bg-foreground' : 'bg-background'
                    } ${dot.position}`}
                    aria-label={`${t('dot')} ${dot.id}${activeDots.includes(dot.id) ? ', active' : ''}`}
                    aria-pressed={activeDots.includes(dot.id)}
                  />
                ))}
              </div>

              {showCorrectAnswer && (
                <div className="text-center space-y-4">
                  <p className="text-xl font-semibold text-destructive">{t('incorrect')}</p>
                  <p className="text-lg text-muted-foreground">
                    Correct pattern: {braillePatterns[currentItem].join(', ')}
                  </p>
                  <Button onClick={nextQuestion} size="lg" className="text-xl" aria-label={t('nextQuestion')}>
                    {t('nextQuestion')}
                  </Button>
                </div>
              )}

              {mode === 'quiz' && !showCorrectAnswer && (
                <Button onClick={checkAnswer} size="lg" className="text-xl" aria-label={t('checkAnswer')}>
                  {t('checkAnswer')}
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LearnBraille;
