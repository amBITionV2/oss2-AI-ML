import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    welcome: 'Hello',
    getStarted: 'Get Started',
    deafBlindWarning: '⚠️ For deaf-blind users: Please use a refreshable Braille display with your screen reader',
    selectLanguage: 'Select Your Language',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    selectConditions: 'Please select all that apply',
    blind: 'Blind',
    deaf: 'Deaf',
    mute: 'Mute',
    continue: 'Continue',
    dashboard: 'Dashboard',
    learnBraille: 'Learn Braille',
    brailleScanner: 'Braille to Speech Scanner',
    learnSignLanguage: 'Learn Sign Language',
    signTranslator: 'Sign Language to Speech Translator',
    scan: 'Scan',
    scanning: 'Scanning...',
    dot: 'Dot',
    points: 'Points',
    learnMode: 'Learn Mode',
    quizMode: 'Quiz Mode',
    checkAnswer: 'Check Answer',
    correct: 'Correct!',
    incorrect: 'Try again',
    createLetter: 'Create the letter',
    showSign: 'Show me the sign for',
    startQuiz: 'Start Quiz',
    backToLearn: 'Back to Learn',
    yourScore: 'Your Score',
    selectCondition: 'Select condition',
    conditionSelected: 'Condition selected',
    letter: 'Letter',
    closeButton: 'Close',
    signOut: 'Sign out',
    startCamera: 'Start camera',
    stopCamera: 'Stop camera',
    playVideo: 'Play video',
    pauseVideo: 'Pause video',
    slowMotion: 'Slow motion playback',
    back: 'Back',
    practiceLetters: 'Practice Letters',
    practiceWords: 'Practice Words',
    nextQuestion: 'Next Question',
    finalScore: 'Final Score',
    questionsCompleted: 'Questions Completed',
    translatedText: 'Translated Text',
    realTimeTranslation: 'Real-time Sign Translation',
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    deafBlindWarning: '⚠️ ಕಿವುಡ-ಕುರುಡು ಬಳಕೆದಾರರಿಗೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ರೀಡರ್‌ನೊಂದಿಗೆ ರಿಫ್ರೆಶ್ ಮಾಡಬಹುದಾದ ಬ್ರೈಲ್ ಡಿಸ್ಪ್ಲೇ ಬಳಸಿ',
    selectLanguage: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    login: 'ಲಾಗಿನ್',
    signup: 'ಸೈನ್ ಅಪ್',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?',
    selectConditions: 'ದಯವಿಟ್ಟು ಅನ್ವಯವಾಗುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ',
    blind: 'ಕುರುಡು',
    deaf: 'ಕಿವುಡು',
    mute: 'ಮೂಕ',
    continue: 'ಮುಂದುವರೆಸಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    learnBraille: 'ಬ್ರೈಲ್ ಕಲಿಯಿರಿ',
    brailleScanner: 'ಬ್ರೈಲ್ ನಿಂದ ಭಾಷಣ ಸ್ಕ್ಯಾನರ್',
    learnSignLanguage: 'ಸಂಕೇತ ಭಾಷೆ ಕಲಿಯಿರಿ',
    signTranslator: 'ಸಂಕೇತ ಭಾಷೆಯಿಂದ ಭಾಷಣ ಅನುವಾದಕ',
    scan: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    scanning: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    dot: 'ಚುಕ್ಕೆ',
    points: 'ಅಂಕಗಳು',
    learnMode: 'ಕಲಿಯಿರಿ',
    quizMode: 'ಪ್ರಶ್ನೆ',
    checkAnswer: 'ಉತ್ತರ ಪರಿಶೀಲಿಸಿ',
    correct: 'ಸರಿ!',
    incorrect: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    createLetter: 'ಅಕ್ಷರ ರಚಿಸಿ',
    showSign: 'ಸಂಕೇತವನ್ನು ತೋರಿಸಿ',
    startQuiz: 'ಪ್ರಶ್ನೆ ಪ್ರಾರಂಭಿಸಿ',
    backToLearn: 'ಕಲಿಯಲು ಹಿಂತಿರುಗಿ',
    yourScore: 'ನಿಮ್ಮ ಸ್ಕೋರ್',
    selectCondition: 'ಸ್ಥಿತಿ ಆಯ್ಕೆಮಾಡಿ',
    conditionSelected: 'ಸ್ಥಿತಿ ಆಯ್ಕೆಯಾಗಿದೆ',
    letter: 'ಅಕ್ಷರ',
    closeButton: 'ಮುಚ್ಚಿ',
    signOut: 'ಸೈನ್ ಔಟ್',
    startCamera: 'ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ',
    stopCamera: 'ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ',
    playVideo: 'ವೀಡಿಯೊ ಪ್ಲೇ ಮಾಡಿ',
    pauseVideo: 'ವೀಡಿಯೊ ವಿರಾಮ',
    slowMotion: 'ನಿಧಾನ ಚಲನೆ',
    back: 'ಹಿಂದೆ',
    practiceLetters: 'ಅಕ್ಷರಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ',
    practiceWords: 'ಪದಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ',
    nextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ',
    finalScore: 'ಅಂತಿಮ ಅಂಕ',
    questionsCompleted: 'ಪ್ರಶ್ನೆಗಳು ಪೂರ್ಣಗೊಂಡವು',
    translatedText: 'ಅನುವಾದಿತ ಪಠ್ಯ',
    realTimeTranslation: 'ನೈಜ-ಸಮಯದ ಸಂಜ್ಞೆ ಅನುವಾದ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
