import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage, default to 'en'
    const savedLanguage = localStorage.getItem('tierlist-language') as Language;
    return savedLanguage && ['en', 'zh'].includes(savedLanguage) ? savedLanguage : 'en';
  });

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tierlist-language', language);
  }, [language]);

  const t = translations[language];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
