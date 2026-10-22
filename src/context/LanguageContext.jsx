import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLang = localStorage.getItem('digitallatino_lang');
      return savedLang === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'en' ? 'en' : 'es';
    setLanguageState(validLang);
    try {
      localStorage.setItem('digitallatino_lang', validLang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const t = (key, fallback) => {
    return translations[language]?.[key] || fallback || translations['es']?.[key] || key;
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
    // Return fallback if used outside provider
    return {
      language: 'es',
      setLanguage: () => {},
      t: (key, fallback) => translations['es']?.[key] || fallback || key,
    };
  }
  return context;
};
