import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
    const [floatingScore, setFloatingScore] = useState(null); // ← always visible for testing

    const triggerFloatingScore = (amount) => {
        setFloatingScore(amount);
        setTimeout(() => setFloatingScore(null), 1000);
    };

    const FloatingScoreBubble = () => {
        if (!floatingScore) return null;

        return (
            <div
                className="floating-score"
                style={{
                    ...floatingScoreStyle,
                    backgroundColor: floatingScore.startsWith('-') ? 'red' : 'var(--primary-color)'
                }}
            >
                {floatingScore}
            </div>
        );
    };

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
    position: 'fixed',
    top: '80px',
    right: '24px', // adjust based on actual header layout
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '0.3rem 0.6rem',
    border: '1px solid var(--primary-color)',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '16px',
    minHeight: '20px',
    minWidth: '32px',
    zIndex: 9999,
    pointerEvents: 'none',
    fontFamily: 'monospace',
    animation: 'fadeScoreUp 5s ease-out forwards'
};