import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CardSwiper = ({ cards, current, answers, onAnswer }) => {
    return (
        <div className="card-swiper">
            <AnimatePresence initial={false} mode="wait">
                {cards.filter(c => c.id === current).map(card => (
                    <motion.div
                        key={card.id}
                        className={`answer-card ${answers[card.id] ? 'locked' : ''}`}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p>{card.text}</p>
                        {!answers[card.id] ? (
                            <div className="answer-buttons">
                                <button onClick={() => onAnswer(card.id, 'student')}>Student</button>
                                <button onClick={() => onAnswer(card.id, 'employer')}>Employer</button>
                            </div>
                        ) : (
                            <div className="locked-answer">
                                Correct: <strong>{card.correct === 'student' ? 'Student' : 'Employer'}</strong>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export const ProgressDots = ({ cards, answers, current, onSelect }) => {
    return (
        <div className="progress-dots">
            {cards.map(card => (
                <button
                    key={card.id}
                    className={`dot ${answers[card.id] ? 'filled' : ''} ${card.id === current ? 'active' : ''}`}
                    onClick={() => onSelect(card.id)}
                    disabled={!answers[card.id] && card.id !== current}
                >
                    {card.id}
                </button>
            ))}
        </div>
    );
};