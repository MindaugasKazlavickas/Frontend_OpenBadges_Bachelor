import React, {useEffect, useState} from 'react';
import './slidingTask.css';
import { useLanguage } from '../context/languageContext';
import { CardSwiper } from '../utils/slidingTaskHelper';
import { adjustScore, saveConfirmedScore, getLiveScore, saveTaskCompletion, isTaskCompleted, useFloatingScore } from '../utils/scoreUtils';
import { shuffleArray } from '../utils/shuffle';
import {logEvent, setCurrentSectionIndex} from "../utils/eventLogger";

const SlidingTask = ({ onUnlock, sectionIndex }) => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();
    const [disabledButtons, setDisabledButtons] = useState({});

    const [shuffledSlides] = useState(() =>
        shuffleArray([
            { id: 1, textKey: 'task.slide.1', correct: 'task.slide.student', correctKey: '1' },
            { id: 2, textKey: 'task.slide.2', correct: 'task.slide.employer', correctKey: '0' },
            { id: 3, textKey: 'task.slide.3', correct: 'task.slide.employer', correctKey: '0' },
            { id: 4, textKey: 'task.slide.4', correct: 'task.slide.student', correctKey: '1' },
            { id: 5, textKey: 'task.slide.5', correct: 'task.slide.employer', correctKey: '0' },
            { id: 6, textKey: 'task.slide.6', correct: 'task.slide.student', correctKey: '1' },
        ])
    );

    const handleAnswer = (cardId, answer) => {
        const currentSlide = shuffledSlides[currentIndex];
        if (!currentSlide || answers[currentSlide.id]) return;

        const selectedKey = answer === 'student' ? '1' : '0';
        const isCorrect = selectedKey === currentSlide.correctKey;

        if (isCorrect) {
            adjustScore(10, sectionIndex);
            triggerFloatingScore('+10');
            setAnswers(prev => ({ ...prev, [currentSlide.id]: answer }));

            const allCorrect = shuffledSlides.every(card => {
                const answered =
                    card.id === currentSlide.id
                        ? selectedKey
                        : answers[card.id] === 'student'
                            ? '1'
                            : '0';
                return answered === card.correctKey;
            });

            if (allCorrect) {
                setCompleted(true);
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.swipe');
                if (typeof onUnlock === 'function') onUnlock();
            }

            setTimeout(() => setCurrentIndex(prev => prev + 1), 1500);
        } else {
            adjustScore(-5, sectionIndex);
            triggerFloatingScore('-5');
            setDisabledButtons(prev => ({
                ...prev,
                [currentSlide.id]: [...(prev[currentSlide.id] || []), answer]
            }));
        }
    };

    useEffect(() => {
        if (isTaskCompleted('task.swipe')) {
            const completedAnswers = {};
            shuffledSlides.forEach(card => {
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
                slides={shuffledSlides}
                currentIndex={currentIndex}
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