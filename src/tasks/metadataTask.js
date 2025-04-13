import React, { useState } from 'react';
import './metadataTask.css';
import metadataIcon from './metadata.png';
import { useLanguage } from '../context/languageContext';

const optionsData = [
    { id: 1, textKey: 'task.option1', isCorrect: false, explanationKey: 'task.option1.explanation' },
    { id: 2, textKey: 'task.option2', isCorrect: true },
    { id: 3, textKey: 'task.option3', isCorrect: true },
    { id: 4, textKey: 'task.option4', isCorrect: true },
    { id: 5, textKey: 'task.option5', isCorrect: true },
    { id: 6, textKey: 'task.option6', isCorrect: false, explanationKey: 'task.option6.explanation' },
    { id: 7, textKey: 'task.option7', isCorrect: false, explanationKey: 'task.option7.explanation' },
    { id: 8, textKey: 'task.option8', isCorrect: false, explanationKey: 'task.option8.explanation' },
    { id: 9, textKey: 'task.option9', isCorrect: true },
    { id: 10, textKey: 'task.option10', isCorrect: false, explanationKey: 'task.option10.explanation' },
];

const MetadataTask = ({ onScoreUpdate, onUnlock }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState({});
    const [feedbackText, setFeedbackText] = useState('');
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [score, setScore] = useState(0);
    const [unlocked, setUnlocked] = useState(false);

    const handleOptionClick = (id, isCorrect, explanationKey) => {
        if (selected[id]) return;

        setSelected((prev) => ({ ...prev, [id]: isCorrect ? 'correct' : 'incorrect' }));

        if (isCorrect) {
            const newScore = score + 5;
            setScore(newScore);
            if (onScoreUpdate) onScoreUpdate(newScore);

            const newlySelected = {
                ...selected,
                [id]: 'correct'
            };

            // Check if all correct answers are now selected
            const correctIds = optionsData.filter(opt => opt.isCorrect).map(opt => opt.id);
            const selectedCorrect = correctIds.every(correctId => newlySelected[correctId] === 'correct');

            if (selectedCorrect && !unlocked) {
                setUnlocked(true);
                if (typeof onUnlock === 'function') onUnlock(); // optional external unlock
            }

            setSelected(newlySelected);
        }
    };

    const midpoint = Math.floor(optionsData.length / 2);

    return (
        <div className="metadata-task-container">
            {/* Prompt */}
            <div className="task-prompt">
                <p>{t('task.metadata.description')}</p>
                <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>Read More ?</button>
            </div>

            <div className="background-icon">
                <div className="background-image-wrapper">
                    <img src={metadataIcon} alt="Background Icon" />
                    <div className="background-gradient" />
                </div>
            </div>
            {/* Button Stack with Image in Middle */}
            <div className="staircase-wrapper">
                {optionsData.map(({ id, textKey, isCorrect, explanationKey }, index) => (
                    <button
                        key={id}
                        className={`option-btn ${selected[id]} ${index < midpoint ? `shift-right-${index}` : `shift-left-${index - midpoint}`}`}
                        onClick={() => handleOptionClick(id, isCorrect, explanationKey)}
                    >
                        {t(textKey)}
                    </button>
                ))}
            </div>

            {unlocked && (
                <button
                    className="scroll-btn"
                    onClick={() => {
                        const nextSection = document.getElementById(`section-${1}`); // 1 is the next section index
                        if (nextSection) {
                            nextSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    {t('task.metadata.continueButton') || 'Continue to next section'}
                </button>
            )}

            {/* Feedback */}
            {feedbackText && <div className="feedback-text">{feedbackText}</div>}

            {/* Overlay Help */}
            {overlayOpen && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.metadata.longHelp')}</p>
                        <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetadataTask;