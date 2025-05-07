import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/languageContext';

export const CardSwiper = ({ slides, currentIndex, answers, onAnswer, disabledButtons }) => {
    const { t } = useLanguage();
    return (
        <div className="card-swiper">
            <AnimatePresence initial={false} mode="wait">
                {[slides[currentIndex]].map(card => (
                    <motion.div
                        key={card.id}
                        className={`answer-card ${answers[card.id] ? 'locked' : ''}`}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p>{t(card.textKey)}</p>
                        {!answers[card.id] ? (
                            <div className="answer-buttons">
                                <button
                                    onClick={() => onAnswer(card.id, 'student')}
                                    disabled={(disabledButtons[card.id] || []).includes('student')}
                                    className={(disabledButtons[card.id] || []).includes('student') ? 'wrong' : ''}
                                >
                                    {t('task.slide.student')}
                                </button>
                                <button
                                    onClick={() => onAnswer(card.id, 'employer')}
                                    disabled={(disabledButtons[card.id] || []).includes('employer')}
                                    className={(disabledButtons[card.id] || []).includes('employer') ? 'wrong' : ''}
                                >
                                    {t('task.slide.employer')}
                                </button>
                            </div>
                        ) : (
                            <div className="locked-answer">
                                {t('task.slide.correct')}: <strong>{t(card.correct)}</strong>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};