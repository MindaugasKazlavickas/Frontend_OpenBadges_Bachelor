import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';
import './heroSection.css';
import ltFlag from '../assets/ltFlag.png';
import enFlag from '../assets/enFlag.png';

const HeroSection = () => {
    const { t, toggleLanguage, language  } = useLanguage();

    const [headlines, setHeadlines] = useState([]);
    const [headlineIndex, setHeadlineIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        setHeadlines([
            t('hero.headline1'),
            t('hero.headline2'),
        ]);
    }, [t]);

    useEffect(() => {
        if (headlines.length === 0) return;

        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setHeadlineIndex((prev) => (prev + 1) % headlines.length);
                setFade(true);
            }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, [headlines]);

    const [keywords, setKeywords] = useState([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const [animateCTA, setAnimateCTA] = useState(false);

    useEffect(() => {
        setKeywords(t('hero.keywords'));
        setRevealedCount(0);
    }, [t]);

    useEffect(() => {
        if (revealedCount < keywords.length) {
            const timer = setTimeout(() => {
                setRevealedCount((prev) => prev + 1);
            }, 700);
            return () => clearTimeout(timer);
        } else {
            const ctaTimer = setTimeout(() => setAnimateCTA(true), 500);
            return () => clearTimeout(ctaTimer);
        }
    }, [revealedCount, keywords.length]);

    return (
        <section
            id="hero"
            className="hero-container"
            style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                textAlign: 'center',
                position: 'relative',
                padding: '2rem',
            }}
        >
            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className="about-us-button"
                    onClick={() => {
                        const about = document.getElementById('about-section');
                        if (about) {
                            about.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.background}`,
                        color: theme.colors.background,
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {t('hero.about')}
                </button>

                {language === 'lt' ? (
                    <img
                        src={enFlag}
                        alt="Switch to English"
                        className="flag-icon"
                        onClick={() => toggleLanguage('en')}
                    />
                ) : (
                    <img
                        src={ltFlag}
                        alt="Perjungti į Lietuvių"
                        className="flag-icon"
                        onClick={() => toggleLanguage('lt')}
                    />
                )}
            </div>

            <div className="hero-content">
                <h2 className="hero-tagline">{t('hero.tagline')}</h2>

                <div style={{ minHeight: 180, alignContent: 'center' }}>
                    <h1 className={`hero-headline ${fade ? 'fade-in' : 'fade-out'}`}>
                        {headlines[headlineIndex]}
                    </h1>
                </div>

                <div className="hero-keyword-stack">
                    {keywords.map((word, index) => (
                        <div
                            key={index}
                            className={`keyword-word ${index < revealedCount ? 'show' : ''}`}
                            style={{
                                top: `${index * 1.8}rem`,
                                left: `${index * 2.4}rem`,
                            }}
                        >
                            {word}
                        </div>
                    ))}
                </div>

                <button
                    className={`hero-cta ${animateCTA ? 'cta-animate' : ''}`}
                    onClick={() => {
                        const anchor = document.getElementById('intro-start-anchor');
                        if (anchor) {
                            anchor.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    {t('button.start')}
                </button>
            </div>
        </section>
    );
};

export default HeroSection;