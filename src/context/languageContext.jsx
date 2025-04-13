import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import lt from '../locales/lt.json';

const translations = { en, lt };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'lt' : 'en'));
    };

    const t = (key) => {
        const keys = key.split('.');
        return keys.reduce((obj, k) => (obj && obj[k] ? obj[k] : key), translations[language]);
    };

    return (
        <LanguageContext.Provider value={{ t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
