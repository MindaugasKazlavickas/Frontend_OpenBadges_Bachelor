import React, { useState } from 'react';
import './scenarioTask.css';
import { useLanguage } from '../context/languageContext';

const ScenarioTask = ({ onUnlock }) => {
    const { t } = useLanguage();

    const [selectedId, setSelectedId] = useState(null);
    const [feedbackShown, setFeedbackShown] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);

    const options = [
        { id: 1, text: 'Option 1 (correct)', correct: true },
        { id: 2, text: 'Option 2 (wrong)', correct: false },
        { id: 3, text: 'Option 3 (wrong)', correct: false },
    ];

    const handleSelect = (id) => {
        if (selectedId !== null) return; // prevent reselection

        const selectedOption = options.find(opt => opt.id === id);
        setSelectedId(id);
        setFeedbackShown(true);

        if (selectedOption.correct) {
            setIsCorrect(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    };

    return (
        <div className="scenario-task-container">
            <div className="task-prompt">
                <p>{t('task.scenario.description') || 'Select the badge that best fits the described scenario.'}</p>
                <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>Read More ?</button>
            </div>

            <div className="scenario-box">
                <strong>1/3</strong>
                <p>
                    Ana organizavo kassavaitinius stalo žaidimų vakarus, skirtus visiems studentams – taip pat ir tarptautiniams bei mainų programų dalyviams. Ši iniciatyva padėjo skatinti bendrystę, mažinti socialinę atskirtį ir aktyviai įtraukti mažiau atstovaujamas studentų grupes.
                </p>
            </div>

            <div className="scenario-options">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        className={`scenario-option ${selectedId === opt.id ? (opt.correct ? 'correct' : 'incorrect') : ''}`}
                        onClick={() => handleSelect(opt.id)}
                    >
                        {opt.text}
                    </button>
                ))}
            </div>

            {feedbackShown && !isCorrect && (
                <div className="feedback-text">
                    {t('task.scenario.incorrectFeedback') || 'Not quite right – try reviewing the scenario and reasoning again.'}
                </div>
            )}

            {isCorrect && (
                <>
                    <div className="unlock-prompt">✅ {t('task.scenario.unlockedMessage') || 'Correct badge selected!'}</div>
                    <button className="scroll-btn" onClick={() => {
                        const next = document.getElementById('section-4');
                        if (next) next.scrollIntoView({ behavior: 'smooth' });
                    }}>{t('task.scenario.continueButton') || 'Continue to next section'}</button>
                </>
            )}

            {overlayOpen && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.scenario.longHelp') || 'Read the scenario carefully and pick the badge that best represents the actions or outcome.'}</p>
                        <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScenarioTask;
