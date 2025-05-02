import React, {useEffect, useState} from 'react';
import './scenarioTask.css';
import { useLanguage } from '../context/languageContext';
import {
    adjustScore,
    saveConfirmedScore,
    getLiveScore,
    saveTaskCompletion,
    isTaskCompleted,
    useFloatingScore
} from '../utils/scoreUtils';

const scenarios = [
    {
        id: 1,
        text: 'Ana organizavo kassavaitinius stalo žaidimų vakarus, skirtus visiems studentams – taip pat ir tarptautiniams bei mainų programų dalyviams. Ši iniciatyva padėjo skatinti bendrystę, mažinti socialinę atskirtį ir aktyviai įtraukti mažiau atstovaujamas studentų grupes.',
        options: [
            { id: 1, text: 'Option 1 (correct)', badge: '/badges/badge1.png', correct: true },
            { id: 2, text: 'Option 2 (wrong)', badge: '/badges/badge2.png', correct: false },
            { id: 3, text: 'Option 3 (wrong)', badge: '/badges/badge3.png', correct: false },
        ]
    },
    {
        id: 2,
        text: 'Scenario 2 text goes here.',
        options: [
            { id: 1, text: 'Option A (correct)', badge: '/badges/badge4.png', correct: true },
            { id: 2, text: 'Option B (wrong)', badge: '/badges/badge5.png', correct: false },
            { id: 3, text: 'Option C (wrong)', badge: '/badges/badge6.png', correct: false },
        ]
    },
    {
        id: 3,
        text: 'Scenario 3 text goes here.',
        options: [
            { id: 1, text: 'Option X (wrong)', badge: '/badges/badge7.png', correct: false },
            { id: 2, text: 'Option Y (wrong)', badge: '/badges/badge8.png', correct: false },
            { id: 3, text: 'Option Z (correct)', badge: '/badges/badge9.png', correct: true },
        ]
    },
];

const ScenarioTask = ({ onUnlock }) => {
    const { t } = useLanguage();

    const [currentScenario, setCurrentScenario] = useState(1);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { 1: 'correct' | 'incorrect' | undefined }
    const [completed, setCompleted] = useState(false);

    const handleSelect = (scenarioId, optionId) => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        const selectedOption = scenario.options.find(opt => opt.id === optionId);

        if (selectedAnswers[scenarioId] === 'correct') return; // already answered correctly, no changes

        const newAnswers = {
            ...selectedAnswers,
            [scenarioId]: selectedOption.correct ? 'correct' : 'incorrect'
        };

        setSelectedAnswers(newAnswers);

        if (selectedOption.correct) {
            adjustScore(10);
            triggerFloatingScore('+10');

            const allCorrect = scenarios.every(s => newAnswers[s.id] === 'correct');
            if (allCorrect) {
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.scenario');
                setCompleted(true);
                if (typeof onUnlock === 'function') onUnlock();
            }
        } else {
            adjustScore(-5);
            triggerFloatingScore('-5');
    }
    };

    const renderScenario = (scenario) => (
        <div key={scenario.id} className="scenario-box">
            <p>{scenario.text}</p>
            <div className="scenario-options">
                {scenario.options.map(opt => (
                    <button
                        key={opt.id}
                        className={`scenario-option ${selectedAnswers[scenario.id] && opt.correct && selectedAnswers[scenario.id] === 'correct' ? 'correct' : ''}
                            ${selectedAnswers[scenario.id] && !opt.correct && selectedAnswers[scenario.id] === 'incorrect' ? 'incorrect' : ''}`}
                        onClick={() => handleSelect(scenario.id, opt.id)}
                        disabled={selectedAnswers[scenario.id] === 'correct'}
                    >
                        <img src={opt.badge} alt="Badge" className="badge-icon" />
                        {opt.text}
                    </button>
                ))}
            </div>
            {selectedAnswers[scenario.id] === 'incorrect' && (
                <div className="feedback-text">
                    {t('task.scenario.incorrectFeedback') || 'Not quite right – try reviewing the scenario and reasoning again.'}
                </div>
            )}
        </div>
    );

    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    useEffect(() => {
        if (isTaskCompleted('task.scenario')) {
            const preFilled = {};
            scenarios.forEach(s => {
                preFilled[s.id] = 'correct';
            });
            setSelectedAnswers(preFilled);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="scenario-task-container">
            <div className="scenario-progress">
                {scenarios.map((s) => (
                    <button
                        key={s.id}
                        className={`progress-square 
                            ${selectedAnswers[s.id] === 'correct' ? 'green' : ''}
                            ${selectedAnswers[s.id] === 'incorrect' ? 'red' : ''}`}
                        onClick={() => setCurrentScenario(s.id)}
                    >
                        {s.id}
                    </button>
                ))}
            </div>
            <FloatingScoreBubble />

            {renderScenario(scenarios.find(s => s.id === currentScenario))}
            {completed && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-3');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}
        </div>
    );
};

export default ScenarioTask;
