import React, { useState } from 'react';
import './slidingTask.css';
import { useLanguage } from '../context/languageContext';
import { CardSwiper, ProgressDots } from './slidingTaskHelper';

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

    const handleAnswer = (cardId, answer) => {
        if (answers[cardId]) return; // prevent changes once answered

        const correctAnswer = cards.find(c => c.id === cardId)?.correct;
        const newAnswers = {
            ...answers,
            [cardId]: answer
        };

        setAnswers(newAnswers);

        if (answer === correctAnswer && cardId === cards.length) {
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }

        if (answer === correctAnswer && cardId < cards.length) {
            setTimeout(() => setCurrent(cardId + 1), 400);
        }
    };

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
            {completed && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-7');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}
        </div>
    );
};

export default SlidingTask;