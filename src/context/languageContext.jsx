import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import lt from '../locales/lt.json';
import { loadUserSettings, updateUserSetting } from '../utils/userSettings';

const translations = { en, lt };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const initialLang = loadUserSettings().language || 'en';
    const [language, setLanguage] = useState(initialLang);

    const toggleLanguage = (lang) => {
        const newLang = lang || (language === 'en' ? 'lt' : 'en');
        setLanguage(newLang);
        updateUserSetting('language', newLang);
    };

    const t = (key) => {
        const keys = key.split('.');
        return keys.reduce((obj, k) => (obj && obj[k] ? obj[k] : key), translations[language]);
    };

    return (
        <LanguageContext.Provider value={{ t, toggleLanguage, language }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);