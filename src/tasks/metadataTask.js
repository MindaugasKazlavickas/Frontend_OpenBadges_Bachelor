import React, {useEffect, useState} from 'react';
import './metadataTask.css';
import { useLanguage } from '../context/languageContext';
import {
    adjustScore,
    saveConfirmedScore,
    getLiveScore,
    saveTaskCompletion,
    isTaskCompleted,
    useFloatingScore
} from '../utils/scoreUtils';

const optionsData = [
    { id: 1, textKey: 'task.metadata.recipientEmailEncrypted', isCorrect: true },
    { id: 2, textKey: 'task.metadata.earningCriteria', isCorrect: true },
    { id: 3, textKey: 'task.metadata.socialMediaLinks', isCorrect: false, explanationKey: 'task.metadata.mistake.socialMediaLinks' },
    { id: 4, textKey: 'task.metadata.badgeClass', isCorrect: true },
    { id: 5, textKey: 'task.metadata.badgeAnimation', isCorrect: false, explanationKey: 'task.metadata.mistake.badgeAnimation' },
    { id: 6, textKey: 'task.metadata.issuer', isCorrect: true },
    { id: 7, textKey: 'task.metadata.issueDate', isCorrect: true },
    { id: 8, textKey: 'task.metadata.visualDesign', isCorrect: false, explanationKey: 'task.metadata.mistake.visualDesign' },
    { id: 9, textKey: 'task.metadata.achievementDescription', isCorrect: true },
    { id: 10, textKey: 'task.metadata.unencryptedEmail', isCorrect: false, explanationKey: 'task.metadata.mistake.unencryptedEmail' }
];


const MetadataTask = ({onUnlock, sectionIndex, revealContinue }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState({});
    const [feedbackCard, setFeedbackCard] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    const handleOptionClick = (id, isCorrect, explanationKey) => {
        if (selected[id] || completed) return;

        const newState = { ...selected, [id]: isCorrect ? 'correct' : 'incorrect' };
        setSelected(newState);

        if (isCorrect) {
            adjustScore(10);
            triggerFloatingScore('+10');

            const correctIds = optionsData.filter(opt => opt.isCorrect).map(opt => opt.id);
            const allCorrectSelected = correctIds.every(cid => newState[cid] === 'correct');

            if (allCorrectSelected && !unlocked) {
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.metadata');
                setCompleted(true);
                setUnlocked(true);
                if (typeof onUnlock === 'function') onUnlock();
            }
        } else if (explanationKey) {
            adjustScore(-5);
            triggerFloatingScore('-5');
            setFeedbackCard({ mistakeKey: explanationKey });
        }
    };

    const midpoint = Math.floor(optionsData.length / 2);
    const correctIds = optionsData.filter(opt => opt.isCorrect).map(opt => opt.id);

    useEffect(() => {
        if (isTaskCompleted('task.metadata')) {
            const restored = {};
            optionsData.forEach(({ id, isCorrect }) => {
                if (isCorrect) restored[id] = 'correct';
            });
            setSelected(restored);
            setUnlocked(true);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="metadata-task-container">
            <div className="card-task-instructions">
                <p>
                    {completed
                        ? t('task.complete') || 'Task complete!'
                        : t('task.metadata.instructions')}
                </p>
            </div>

            <div style={{ marginTop: 32 }} className="staircase-wrapper">
                    {optionsData.map(({ id, textKey, isCorrect, explanationKey }, index) => (
                        <button
                            key={id}
                            className={`option-btn ${selected[id]} ${index < midpoint ? `shift-right-${index}` : `shift-left-${index - midpoint}`} metadata-btn`}
                            onClick={() => handleOptionClick(id, isCorrect, explanationKey)}
                        >
                            {t(textKey)}
                        </button>
                    ))}
            </div>
            {feedbackCard && (
                    <div className="overlay">
                        <div className="overlay-content feedback-overlay">
                            <h3>{t('task.card.feedbackTitle') || 'Why this wasn’t right'}</h3>
                            <p>{t(feedbackCard.mistakeKey)}</p>
                            <button className="scroll-between" onClick={() => setFeedbackCard(null)}>
                                {t('button.close') || 'Got it!'}
                            </button>
                        </div>
                    </div>
            )}
            <FloatingScoreBubble />
            {completed && (
                    <button className="scroll-btn" onClick={() => {
                        const next = document.getElementById('section-2');
                        if (next) next.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        {t('task.metadata.continueButton') || 'Continue to next section'}
                    </button>
            )}
        </div>
    );
};

export default MetadataTask;