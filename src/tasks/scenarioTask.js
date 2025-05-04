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

import s1b1 from '../assets/scenario1badge1.png';
import s1b2 from '../assets/scenario1badge2.png';
import s1b3 from '../assets/scenario1badge3.png';

import s2b1 from '../assets/scenario2badge1.png';
import s2b2 from '../assets/scenario2badge2.png';
import s2b3 from '../assets/scenario2badge3.png';

import s3b1 from '../assets/scenario3badge1.png';
import s3b2 from '../assets/scenario3badge2.png';
import s3b3 from '../assets/scenario3badge3.png';

const ScenarioTask = ({ onUnlock }) => {
    const { t } = useLanguage();
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    const [currentScenario, setCurrentScenario] = useState(1);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [completed, setCompleted] = useState(false);

    const scenarios = [
        {
            id: 1,
            text: t('task.scenario.story1') || 'You presented research at an international scientific conference, actively participated in Vilnius Tech’s internal research events, and were often seen studying or helping others at the university library.',
            options: [
                { id: 1, badge: s1b1, textKey: 'task.scenario.scenarios.scenario1.0', correct: true },
                { id: 2, badge: s1b2, textKey: 'task.scenario.scenarios.scenario1.1', correct: false },
                { id: 3, badge: s1b3, textKey: 'task.scenario.scenarios.scenario1.2', correct: false }
            ]
        },
        {
            id: 2,
            text: t('task.scenario.story2') || 'You joined the Erasmus+ program for a semester abroad, volunteered at events welcoming international students, and helped organize intercultural activities.',
            options: [
                { id: 1, badge: s2b1, textKey: 'task.scenario.scenarios.scenario2.0', correct: true },
                { id: 2, badge: s2b2, textKey: 'task.scenario.scenarios.scenario2.1', correct: false },
                { id: 3, badge: s2b3, textKey: 'task.scenario.scenarios.scenario2.2', correct: false }
            ]
        },
        {
            id: 3,
            text: t('task.scenario.story3') || 'You led your student group, mentored first-years, and volunteered as student representative during several events in 2024.',
            options: [
                { id: 1, badge: s3b1, textKey: 'task.scenario.scenarios.scenario3.0', correct: true },
                { id: 2, badge: s3b2, textKey: 'task.scenario.scenarios.scenario3.1', correct: false },
                { id: 3, badge: s3b3, textKey: 'task.scenario.scenarios.scenario3.2', correct: false }
            ]
        }
    ];

    const handleSelect = (scenarioId, optionId) => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        const selectedOption = scenario.options.find(opt => opt.id === optionId);

        if (selectedAnswers[scenarioId] === 'correct') return;

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
                        {t(opt.textKey)}
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
                    {t('task.scenario.continueButton') || 'Continue'}
                </button>
            )}
        </div>
    );
};

export default ScenarioTask;
