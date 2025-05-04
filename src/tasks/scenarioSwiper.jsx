import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/languageContext';

const ScenarioSwiper = ({ scenarios, current, answers, locked, onSelect }) => {
    const { t } = useLanguage();
    return (
        <div className="scenario-swiper">
            <AnimatePresence initial={false} mode="wait">
                {scenarios.filter(s => s.id === current).map(scenario => (
                    <motion.div
                        key={scenario.id}
                        className="scenario-box"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h3 className="scenario-header">
                            {t(`task.scenario.${scenario.headerKey}`)}
                        </h3>
                        <p style={{ fontSize: 16}}>{scenario.text}</p>
                        <div className="scenario-options">
                            {scenario.options.map(opt => {
                                const selected = answers[scenario.id]?.has(opt.id);
                                const isLocked = locked[scenario.id];

                                return (
                                    <button
                                        key={opt.id}
                                        className={`scenario-option 
                      ${selected && opt.correct ? 'correct' : ''}
                      ${selected && !opt.correct ? 'incorrect' : ''}`}
                                        onClick={() => onSelect(scenario.id, opt)}
                                        disabled={isLocked}
                                    >

                                        <span className="option-label">{t(opt.textKey)}</span>
                                        <img src={opt.badge} alt="Badge" className="badge-icon" />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ScenarioSwiper;
