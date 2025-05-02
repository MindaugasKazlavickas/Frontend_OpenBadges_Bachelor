import React, { useState, useEffect } from 'react';

export const getStoredScore = () => {
    const saved = localStorage.getItem('confirmedScore');
    return saved ? JSON.parse(saved) : 0;
};

let liveScore = getStoredScore(); // initialize from saved score after definition

export const saveConfirmedScore = (score) => {
    localStorage.setItem('confirmedScore', JSON.stringify(score));
};

export const adjustScore = (change) => {
    liveScore += change;
    return liveScore;
};

export const getLiveScore = () => liveScore;

export const resetScore = () => {
    localStorage.removeItem('confirmedScore');
    localStorage.removeItem('taskCompletion');
    liveScore = 0;
};

export const saveTaskCompletion = (taskId) => {
    const data = JSON.parse(localStorage.getItem('taskCompletion') || '{}');
    data[taskId] = true;
    localStorage.setItem('taskCompletion', JSON.stringify(data));
};

export const isTaskCompleted = (taskId) => {
    const data = JSON.parse(localStorage.getItem('taskCompletion') || '{}');
    return !!data[taskId];
};

export const useFloatingScore = () => {
    const [floatingScore, setFloatingScore] = useState(null);

    const triggerFloatingScore = (amount) => {
        setFloatingScore(amount);
        setTimeout(() => setFloatingScore(null), 1000);
    };

    const FloatingScoreBubble = () => (
        floatingScore ? (
            <div
                className="floating-score"
                style={{
                    ...floatingScoreStyle,
                    backgroundColor: floatingScore.startsWith('-') ? 'red' : 'var(--primary-color)'
                }}
            >
                {floatingScore}
            </div>
        ) : null
    );

    return { floatingScore, triggerFloatingScore, FloatingScoreBubble };
};

export const useLiveScore = () => {
    const [score, setScore] = useState(getStoredScore());

    useEffect(() => {
        const interval = setInterval(() => {
            setScore(getLiveScore());
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return score;
};

const floatingScoreStyle = {
    position: 'absolute',
    top: '0.5rem',
    right: '1rem',
    transform: 'translateY(0)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '999px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    zIndex: 1000,
    pointerEvents: 'none',
    animation: 'fadeScoreUp 1s ease-out forwards'
};
