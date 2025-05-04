import React, {useEffect, useState} from 'react';
import './slidingTask.css';
import { useLanguage } from '../context/languageContext';
import { CardSwiper } from './slidingTaskHelper';
import {
    adjustScore,
    saveConfirmedScore,
    getLiveScore,
    saveTaskCompletion,
    isTaskCompleted,
    useFloatingScore
} from '../utils/scoreUtils';

const slides = [
    { id: 1, textKey: 'task.slide.1', correct: 'task.slide.student', correctKey: '1' },
    { id: 2, textKey: 'task.slide.2', correct: 'task.slide.employer', correctKey: '0' },
    { id: 3, textKey: 'task.slide.3', correct: 'task.slide.employer', correctKey: '0' },
    { id: 4, textKey: 'task.slide.4', correct: 'task.slide.student', correctKey: '1' },
    { id: 5, textKey: 'task.slide.5', correct: 'task.slide.employer', correctKey: '0' },
    { id: 6, textKey: 'task.slide.6', correct: 'task.slide.student', correctKey: '1' },
];

const SlidingTask = ({ onUnlock }) => {
    const { t } = useLanguage();
    const [current, setCurrent] = useState(1);
    const [answers, setAnswers] = useState({}); // { 1: 'student' | 'employer' }
    const [completed, setCompleted] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();
    const [disabledButtons, setDisabledButtons] = useState({});

    const handleAnswer = (cardId, answer) => {
        const currentSlide = slides.find(c => c.id === cardId);
        if (!currentSlide || answers[cardId]) return;

        // Convert choice to key
        const selectedKey = answer === 'student' ? '1' : '0';
        const isCorrect = selectedKey === currentSlide.correctKey;

        if (isCorrect) {
            adjustScore(10);
            triggerFloatingScore('+10');
            setAnswers(prev => ({ ...prev, [cardId]: answer }));

            const allCorrect = slides.every(card => {
                const answered =
                    card.id === cardId ? selectedKey : (answers[card.id] === 'student' ? '1' : '0');
                return answered === card.correctKey;
            });

            if (allCorrect) {
                setCompleted(true);
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.swipe');
                if (typeof onUnlock === 'function') onUnlock();
            }

            setTimeout(() => setCurrent(cardId + 1), 1500);
        } else {
            adjustScore(-5);
            triggerFloatingScore('-5');
            setDisabledButtons(prev => ({
                ...prev,
                [cardId]: [...(prev[cardId] || []), answer]
            }));
        }
    };

    useEffect(() => {
        if (isTaskCompleted('task.swipe')) {
            const completedAnswers = {};
            slides.forEach(card => {
                completedAnswers[card.id] = card.correctKey;
            });
            setAnswers(completedAnswers);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="sliding-task-container">
            <div className="card-task-instructions">

                <p>
                    {completed
                    ? t('task.complete')
                    : t('task.slide.instructions')}
                </p>
            </div>
            {!completed && (
            <CardSwiper
                slides={slides}
                current={current}
                answers={answers}
                onAnswer={handleAnswer}
                disabledButtons={disabledButtons}
            />
            )}
            <FloatingScoreBubble />
            {completed && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('EndSection');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('button.finish') || 'Finish'}
                </button>
            )}
        </div>
    );
};

export default SlidingTask;