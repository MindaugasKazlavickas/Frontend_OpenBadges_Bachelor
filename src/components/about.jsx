import React from 'react';
import { useLanguage } from '../context/languageContext';
import './about.css';
import './toTop.css';
import toTop from '../assets/toTop.png';
import logo from '../assets/logo.png';

const AboutPanel = ({ isVisible, onClose }) => {
    const { t } = useLanguage();

    return (
        <div
            className={`about-slide-panel ${isVisible ? 'visible' : ''}`}
            onClick={onClose}
        >
            <div
                className="about-panel-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="about-header" style={{ marginBottom: '2rem'}}>
                    <button className="about-close-button back-to-top" onClick={onClose} aria-label="Close">
                        <img className="toTopImage rotated" src={toTop} alt="Back" />
                    </button>
                    <h2>{t('about.title')}</h2>
                </div>

                <p>{t('about.paragraph1')}</p>
                <p>{t('about.paragraph2')}</p>


                <div className="about-contact">
                    <h3 style={{ textAlign: 'center'}}>{t('about.contactTitle')}</h3>
                    <p>{t('about.emailLabel')}: <a href="mailto:atviriejizenkliukai@gmail.com">atviriejizenkliukai@gmail.com</a></p>
                    <p>{t('about.uniEmail')}: <a href="mailto:badge@vilniustech.lt">badge@vilniustech.lt</a></p>
                    <p>{t('about.githubLabel')}: <a href="https://github.com/MindaugasKazlavickas/Frontend_OpenBadges_Bachelor" target="_blank" rel="noreferrer">{t('about.repoName')}</a></p>
                    <p>{t('about.date')}</p>
                    <img src={logo} alt="Site Logo" className="about-logo" />
                </div>

            </div>
        </div>
    );
};

export default AboutPanel;
