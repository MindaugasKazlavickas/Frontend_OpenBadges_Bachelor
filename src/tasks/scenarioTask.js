import React, {useEffect, useState} from 'react';
import './scenarioTask.css';
import { useLanguage } from '../context/languageContext';
import { adjustScore, saveConfirmedScore, getLiveScore, saveTaskCompletion, isTaskCompleted, useFloatingScore } from '../utils/scoreUtils';
import ScenarioSwiper from '../utils/scenarioSwiper';
import { shuffleArray } from '../utils/shuffle';
import s1b1 from '../assets/scenario1badge1.png';
import s1b2 from '../assets/scenario1badge2.png';
import s1b3 from '../assets/scenario1badge3.png';
import s2b1 from '../assets/scenario2badge1.png';
import s2b2 from '../assets/scenario2badge2.png';
import s2b3 from '../assets/scenario2badge3.png';
import s3b1 from '../assets/scenario3badge1.png';
import s3b2 from '../assets/scenario3badge2.png';
import s3b3 from '../assets/scenario3badge3.png';
import {logEvent, setCurrentSectionIndex} from "../utils/eventLogger";

const rawScenarios = [
    {
        id: 1,
        headerKey: 'science',
        storyKey: 'task.scenario.story.story1',
        options: [
            { id: 1, badge: s1b1, textKey: 'task.scenario.scenarios.scenario1.0', correct: true },
            { id: 2, badge: s1b2, textKey: 'task.scenario.scenarios.scenario1.1', correct: false },
            { id: 3, badge: s1b3, textKey: 'task.scenario.scenarios.scenario1.2', correct: false }
        ]
    },
    {
        id: 2,
        headerKey: 'international',
        storyKey: 'task.scenario.story.story2',
        options: [
            { id: 1, badge: s2b1, textKey: 'task.scenario.scenarios.scenario2.0', correct: false },
            { id: 2, badge: s2b2, textKey: 'task.scenario.scenarios.scenario2.1', correct: false },
            { id: 3, badge: s2b3, textKey: 'task.scenario.scenarios.scenario2.2', correct: true }
        ]
    },
    {
        id: 3,
        headerKey: 'studentrep',
        storyKey: 'task.scenario.story.story3',
        options: [
            { id: 1, badge: s3b1, textKey: 'task.scenario.scenarios.scenario3.0', correct: true },
            { id: 2, badge: s3b2, textKey: 'task.scenario.scenarios.scenario3.1', correct: false },
            { id: 3, badge: s3b3, textKey: 'task.scenario.scenarios.scenario3.2', correct: false }
        ]
    }
];

const ScenarioTask = ({ onUnlock, sectionIndex }) => {
    const { t } = useLanguage();
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();
    const [lockedScenarios, setLockedScenarios] = useState({});
    const [currentScenario, setCurrentScenario] = useState(1);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [completed, setCompleted] = useState(false);

    const [scenarios] = useState(() =>
        shuffleArray(rawScenarios).map((scenario, index) => ({
            id: index + 1,
            headerKey: scenario.headerKey,
            text: t(scenario.storyKey),
            options: shuffleArray(scenario.options).map((opt, i) => ({
                id: i + 1,
                badge: opt.badge,
                textKey: opt.textKey,
                correct: opt.correct
            }))
        }))
    );

    const handleSelect = (scenarioId, selectedOption) => {
        if (lockedScenarios[scenarioId]) return;
        const prevSelections = selectedAnswers[scenarioId] || new Set();

        if (prevSelections.has(selectedOption.id)) return;
        const isCorrect = selectedOption.correct;
        const newSelections = new Set(prevSelections).add(selectedOption.id);

        setSelectedAnswers(prev => ({
            ...prev,
            [scenarioId]: newSelections
        }));

        if (isCorrect) {
            adjustScore(10, sectionIndex);
            triggerFloatingScore('+10');

            setLockedScenarios(prev => ({ ...prev, [scenarioId]: true }));

            const nextScenario = scenarioId + 1;
            if (nextScenario <= scenarios.length) {
                setTimeout(() => setCurrentScenario(nextScenario), 1000);
            }

            const allCorrect = scenarios.every(s => lockedScenarios[s.id] || s.id === scenarioId);
            if (allCorrect) {
                saveConfirmedScore(getLiveScore());
                saveTaskCompletion('task.scenario');
                setCompleted(true);
                if (typeof onUnlock === 'function') onUnlock();
            }
        } else {
            adjustScore(-5, sectionIndex);
            triggerFloatingScore('-5');
        }
    };

    useEffect(() => {
        if (isTaskCompleted('task.scenario')) {
            const preFilled = {};
            const locked = {};
            scenarios.forEach(s => {
                const correctOption = s.options.find(opt => opt.correct);
                if (correctOption) {
                    preFilled[s.id] = new Set([correctOption.id]);
                    locked[s.id] = true;
                }
            });
            setSelectedAnswers(preFilled);
            setLockedScenarios(locked);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="scenario-task-container">
            <FloatingScoreBubble />
            <div className="card-task-instructions">
                <p>
                    {completed
                        ? t('task.complete') || 'Task complete!'
                        : t('task.scenario.instructions')}
                </p>
            </div>
            <ScenarioSwiper
                scenarios={scenarios}
                current={currentScenario}
                answers={selectedAnswers}
                locked={lockedScenarios}
                onSelect={handleSelect}
            />
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
