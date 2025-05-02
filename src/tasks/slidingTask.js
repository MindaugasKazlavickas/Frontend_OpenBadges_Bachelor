import React, {useEffect, useState} from 'react';
import './slidingTask.css';
import { useLanguage } from '../context/languageContext';
import { CardSwiper, ProgressDots } from './slidingTaskHelper';
import {
    adjustScore,
    saveConfirmedScore,
    getLiveScore,
    saveTaskCompletion,
    isTaskCompleted,
    useFloatingScore
} from '../utils/scoreUtils';

const cards = [
    { id: 1, text: 'Badge padeda parodyti savarankiškai įgytas kompetencijas.', correct: 'student' },
    { id: 2, text: 'Padeda greičiau atrinkti kandidatus su reikiamais įgūdžiais.', correct: 'employer' },
    { id: 3, text: 'Atveria papildomas galimybes tarptautinėse programose.', correct: 'student' },
    { id: 4, text: 'Suteikia aiškesnį supratimą apie darbuotojų mokymosi patirtį.', correct: 'employer' }
];

const SlidingTask = ({ onUnlock }) => {
    const { t } = useLanguage();
    const [current, setCurrent] = useState(1);
    const [answers, setAnswers] = useState({}); // { 1: 'student' | 'employer' }
    const [completed, setCompleted] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    const handleAnswer = (cardId, answer) => {
        if (answers[cardId]) return; // prevent changes once answered

        const correctAnswer = cards.find(c => c.id === cardId)?.correct;
        const newAnswers = {
            ...answers,
            [cardId]: answer
        };

        setAnswers(newAnswers);

        if (answer === correctAnswer) {
            adjustScore(10);
            triggerFloatingScore('+10');
        } else {
            adjustScore(-5);
            triggerFloatingScore('-5');
        }

        const allCorrect = cards.every(card => newAnswers[card.id] === card.correct);
        if (allCorrect) {
            setCompleted(true);
            saveConfirmedScore(getLiveScore());
            saveTaskCompletion('task.swipe');
            if (typeof onUnlock === 'function') onUnlock();
        }

        if (cardId < cards.length) {
            setTimeout(() => setCurrent(cardId + 1), 400);
        }
    };

    useEffect(() => {
        if (isTaskCompleted('task.swipe')) {
            const completedAnswers = {};
            cards.forEach(card => completedAnswers[card.id] = card.correct);
            setAnswers(completedAnswers);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="sliding-task-container">
            <ProgressDots
                cards={cards}
                answers={answers}
                current={current}
                onSelect={(id) => {
                    if (id <= Object.keys(answers).length) setCurrent(id);
                }}
            />
            <CardSwiper
                cards={cards}
                current={current}
                answers={answers}
                onAnswer={handleAnswer}
            />
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