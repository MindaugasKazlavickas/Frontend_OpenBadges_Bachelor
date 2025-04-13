import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';
import './heroSection.css';

const HeroSection = () => {
    const { t, toggleLanguage } = useLanguage();

    const headlines = [
        t('hero.headline1'),
        t('hero.headline2'),
    ];

    const [headlineIndex, setHeadlineIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setHeadlineIndex((prev) => (prev + 1) % headlines.length);
                setFade(true);
            }, 500); // match fade duration in CSS
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const keywords = t('hero.keywords');
    const [revealedCount, setRevealedCount] = useState(0);
    const [animateCTA, setAnimateCTA] = useState(false);

    useEffect(() => {
        if (revealedCount < keywords.length) {
            const timer = setTimeout(() => {
                setRevealedCount((prev) => prev + 1);
            }, 700);
            return () => clearTimeout(timer);
        } else {
            // Trigger CTA animation once final word is shown
            setTimeout(() => setAnimateCTA(true), 500);
        }
    }, [revealedCount]);
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
            {/* Language Toggle */}
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <button
                    onClick={toggleLanguage}
                    style={{
                        backgroundColor: theme.colors.secondary,
                        color: 'black',
                        padding: '0.3rem 0.7rem',
                        border: 'none',
                        borderRadius: '4px',
                    }}
                >
                    {t('button.switchLang')}
                </button>
            </div>

            <div className="hero-content">
                {/* Tagline */}
                <h2 className="hero-tagline">{t('hero.tagline')}</h2>

                {/* Headline with fade */}
                <h1 className={`hero-headline ${fade ? 'fade-in' : 'fade-out'}`}>
                    {headlines[headlineIndex]}
                </h1>

                {/* Static subtitle */}
                <p className="hero-subtitle">
                    {t('hero.subtitle1')}
                </p>

                { /* keyword ticker */}
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

                {/* CTA */}
                <button
                    className={`hero-cta ${animateCTA ? 'cta-animate' : ''}`}
                    onClick={() => {
                        const anchor = document.getElementById('task-start-anchor');
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