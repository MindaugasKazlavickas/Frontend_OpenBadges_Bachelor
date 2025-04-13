import React, { useState } from 'react';
import './cardTask.css';
import { useLanguage } from '../context/languageContext';

const initialCards = [
    { id: 1, text: "Duomenų analizė naudojant „Excel“", correctColumn: "A" },
    { id: 2, text: "Programavimo pagrindai", correctColumn: "A" },
    { id: 3, text: "Laiko planavimas", correctColumn: "B" },
    { id: 4, text: "Statybinių brėžinių skaitymas", correctColumn: "A" },
    { id: 5, text: "Komandinis darbas", correctColumn: "B" },
    { id: 6, text: "Viešasis kalbėjimas", correctColumn: "B" },
    { id: 7, text: "Laboratorinių tyrimų atlikimas", correctColumn: "A" },
    { id: 8, text: "Laiko planavimas", correctColumn: "B" },
];

const CardSortTask = ({ onUnlock }) => {
    const { t } = useLanguage();
    const [cardStack, setCardStack] = useState([...initialCards]);
    const [columns, setColumns] = useState({ A: [], B: [] });
    const [feedbackCard, setFeedbackCard] = useState(null);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleDrop = (columnId, event) => {
        event.preventDefault();
        const draggedData = event.dataTransfer.getData('card-id');

        if (draggedData) {
            const { id, text, correctColumn, status, from } = JSON.parse(draggedData);

            // ✅ Fix: re-check correctness if card is red
            if (status === 'incorrect') {
                if (correctColumn === columnId) {
                    // ✅ Red card is now placed correctly
                    setColumns(prev => {
                        const newFrom = prev[from].filter(c => c.id !== id);
                        const newTo = [...prev[columnId], { id, text, correctColumn, status: 'correct' }];
                        return {
                            ...prev,
                            [from]: newFrom,
                            [columnId]: newTo,
                        };
                    });

                    // ✅ Check for task completion
                    const totalCorrect = [...columns.A, ...columns.B].filter(c => c.status === 'correct').length + 1;
                    if (totalCorrect === initialCards.length) {
                        setCompleted(true);
                        if (typeof onUnlock === 'function') onUnlock();
                    }
                    return;
                }

                // 🟥 Still incorrect: perform regular swap
                if (from !== columnId) {
                    handleSwap({ id, text, correctColumn, status }, from, columnId);
                }

                return;
            }
        }

        if (cardStack.length === 0) return;
        const card = cardStack[0];
        const isCorrect = card.correctColumn === columnId;

        if (isCorrect) {
            setColumns(prev => ({
                ...prev,
                [columnId]: [...prev[columnId], { ...card, status: 'correct' }]
            }));
            setCardStack(prev => prev.slice(1));
        } else {
            setFeedbackCard(card);
            setColumns(prev => ({
                ...prev,
                [columnId]: [...prev[columnId], { ...card, status: 'incorrect' }]
            }));
            setCardStack(prev => prev.slice(1));
        }

        setTimeout(() => {
            const allCorrect = [...columns.A, ...columns.B].filter(c => c.status === 'correct').length + (isCorrect ? 1 : 0);
            if (allCorrect === initialCards.length) {
                setCompleted(true);
                if (typeof onUnlock === 'function') onUnlock();
            }
        }, 200);
    };

    const handleSwap = (card, fromColumn, toColumn) => {
        if (card.status !== 'incorrect') return;

        setColumns(prev => {
            const newFrom = prev[fromColumn].filter(c => c.id !== card.id);
            const newTo = [...prev[toColumn], card];
            return {
                ...prev,
                [fromColumn]: newFrom,
                [toColumn]: newTo,
            };
        });
    };

    return (
        <div className="card-sort-task-container">
            <div className="task-prompt">
                <p>{t('task.card.description') || 'Perskaityk korteles ir pabandyk priskirti jas prie kietųjų arba minkštųjų kompetencijų.'}</p>
                <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>Read More ?</button>
            </div>

            <div className="card-columns">
                {['A', 'B'].map(col => (
                    <div key={col} className="card-column" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(col, e)}>
                        <h4>{col === 'A' ? 'Kietosios kompetencijos' : 'Minkštosios kompetencijos'}</h4>
                        {columns[col].map((card) => (
                            <div
                                key={card.id}
                                className={`card card-${card.status}`}
                                draggable={card.status === 'incorrect'}
                                onDragStart={(e) => e.dataTransfer.setData('card-id', JSON.stringify({ ...card, from: col }))}
                            >
                                {card.text}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="card-bank" onDragOver={(e) => e.preventDefault()}>
                {cardStack.length > 0 && (
                    <div
                        className="card card-pending"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', '')}>
                        {cardStack[0].text}
                    </div>
                )}
            </div>

            {feedbackCard && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.card.mistakeExplanation') || `Incorrect placement of card: ${feedbackCard.text}`}</p>
                        <button onClick={() => setFeedbackCard(null)}>{t('button.close') || 'Close'}</button>
                    </div>
                </div>
            )}

            {overlayOpen && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.card.longHelp') || 'Kietosios kompetencijos yra įgyjamos formalaus mokymo metu, o minkštosios - įgyjamos neformaliai – per popaskaitinę veiklą, savanorystę, komandinį darbą ir kt.'}</p>
                        <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                    </div>
                </div>
            )}

            {completed && (
                <>
                    <button className="scroll-btn" onClick={() => {
                        const next = document.getElementById('section-4');
                        if (next) next.scrollIntoView({ behavior: 'smooth' });
                    }}>{t('task.card.continueButton') || 'Continue to next section'}</button>
                </>
            )}
        </div>
    );
};

export default CardSortTask;
