/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && (savedLang === 'EN' || savedLang === 'TE')) {
      return savedLang;
    }
    return 'EN';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS['EN'];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
