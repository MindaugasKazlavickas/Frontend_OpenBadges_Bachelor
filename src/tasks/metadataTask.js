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

const MetadataTask = ({onUnlock, sectionIndex, revealContinue }) => {
    const {t} = useLanguage();
    const [selected, setSelected] = useState({});
    const [feedbackText, setFeedbackText] = useState('');
    const [completed, setCompleted] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    const handleOptionClick = (id, isCorrect, explanationKey) => {
        if (selected[id]) return;

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

            if (selectedCorrect && revealContinue) {
                revealContinue();
            }

            if (selectedCorrect && !unlocked) {
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.metadata');
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

                    <div className="staircase-wrapper">
                        {optionsData.map(({ id, textKey, isCorrect, explanationKey }, index) => (
                            <button
                                key={id}
                                className={`option-btn ${selected[id]} ${index < midpoint ? `shift-right-${index}` : `shift-left-${index - midpoint}`}`}
                                onClick={() => handleOptionClick(id, isCorrect, explanationKey)}
                            >
                                {t(textKey)}
                            </button>
                        ))}<ProgressRing current={numCorrectSelected} total={correctIds.length} />
                    </div>
                    <FloatingScoreBubble />
                </div>
                {completed && (
                    <button className="scroll-btn" onClick={() => {
                        const next = document.getElementById('section-2');
                        if (next) next.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        {t('task.card.continueButton') || 'Continue to next section'}
                    </button>
                )}
            </div>

    );
};

export default MetadataTask;