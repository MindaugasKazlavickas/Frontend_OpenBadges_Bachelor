import React, {useEffect, useState} from 'react';
import './metadataTask.css';
import metadataIcon from './metadata.png';
import { useLanguage } from '../context/languageContext';
import ProgressRing from './progressRing';
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
    const {t} = useLanguage();
    const [selected, setSelected] = useState({});
    const [feedbackText, setFeedbackText] = useState('');
    const [completed, setCompleted] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();
    const [overlayOpen, setOverlayOpen] = useState(false);

    const handleOptionClick = (id, isCorrect, explanationKey) => {
        if (selected[id] || completed) return;

        setSelected((prev) => ({...prev, [id]: isCorrect ? 'correct' : 'incorrect'}));

        if (isCorrect) {
            adjustScore(10);
            triggerFloatingScore('+10');


            const newlySelected = {
                ...selected,
                [id]: 'correct'
            };

            const correctIds = optionsData.filter(opt => opt.isCorrect).map(opt => opt.id);
            const selectedCorrect = correctIds.every(correctId => newlySelected[correctId] === 'correct');

            if (selectedCorrect && !unlocked) {
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.metadata');
                setCompleted(true);
                setUnlocked(true);
                if (typeof onUnlock === 'function') onUnlock();
            }

            setSelected(newlySelected);
        } else if (explanationKey) {
            adjustScore(-5);
            triggerFloatingScore('-5');
            setFeedbackText(t(explanationKey));
        }
    };

    const midpoint = Math.floor(optionsData.length / 2);
    const correctIds = optionsData.filter(opt => opt.isCorrect).map(opt => opt.id);
    const numCorrectSelected = correctIds.filter((id) => selected[id] === 'correct').length;

    useEffect(() => {
        if (isTaskCompleted('task.metadata')) {
            const completed = {};
            optionsData.forEach(({ id, isCorrect }) => {
                if (isCorrect) completed[id] = 'correct';
            });
            setSelected(completed);
            setUnlocked(true);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
            <div className="metadata-task-container">
                <div className="background-icon">
                    <div className="background-image-wrapper">
                        <img src={metadataIcon} alt="Background Icon"/>
                        <div className="background-gradient"/>
                    </div>
                </div>

                <div className="task-content-row">
                    <div className="progress-ring-wrapper">

                    </div>

                    <div className="metadata-task-interaction">
                        <div className="floating-progress-ring">
                            <ProgressRing current={numCorrectSelected} total={correctIds.length} />
                        </div>

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
                    </div>
                </div>

                {feedbackText && (
                    <div className="overlay">
                        <div className="overlay-content">
                            <p>{feedbackText}</p>
                            <button onClick={() => setFeedbackText('')}>{t('button.close') || 'Close'}</button>
                        </div>
                    </div>
                )}

                {overlayOpen && (
                    <div className="overlay">
                        <div className="overlay-content">
                            <p>{t('task.section2.longHelp')}</p>
                            <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                        </div>
                    </div>
                )}
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