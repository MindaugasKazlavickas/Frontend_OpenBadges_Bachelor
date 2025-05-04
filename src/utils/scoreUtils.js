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
    const [floatingScore, setFloatingScore] = useState(null);

    const triggerFloatingScore = (amount) => {
        setFloatingScore(amount);
        setTimeout(() => setFloatingScore(null), 1000);
    };

    const FloatingScoreBubble = () => {
        if (!floatingScore) return null;

        const container = ensureFloatingScoreContainer();
        return createPortal(
            <div
                className="floating-score"
                style={{
                    ...floatingScoreStyle,
                    backgroundColor: floatingScore.startsWith('-') ? 'red' : 'var(--primary-color)'
                }}
            >
                {floatingScore}
            </div>,
            container
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
    position: 'absolute',
    right: '100%',
    marginRight: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '0.3rem 0.6rem',
    borderRadius: '999px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    zIndex: 9999,
    pointerEvents: 'none',
    animation: 'fadeScoreUp 1s ease-out forwards'
};

const FLOATING_SCORE_PORTAL_ID = 'floating-score-root';

const ensureFloatingScoreContainer = () => {
    let el = document.getElementById(FLOATING_SCORE_PORTAL_ID);
    if (!el) {
        el = document.createElement('div');
        el.id = FLOATING_SCORE_PORTAL_ID;
        document.body.appendChild(el);
    }
    return el;
};