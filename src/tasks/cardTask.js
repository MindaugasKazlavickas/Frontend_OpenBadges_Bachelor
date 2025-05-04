import React, {useEffect, useState} from 'react';
import './cardTask.css';
import { useLanguage } from '../context/languageContext';
import {
    DndContext,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import {adjustScore, getLiveScore, saveConfirmedScore, useFloatingScore} from '../utils/scoreUtils';
import { saveTaskCompletion, isTaskCompleted } from '../utils/scoreUtils';

const initialCards = [
    { id: 1, text: "task.card.excelAnalysis", correctColumn: "A", mistakeKey: "task.card.mistake.excelAnalysis" },
    { id: 2, text: "task.card.programmingBasics", correctColumn: "A", mistakeKey: "task.card.mistake.programmingBasics" },
    { id: 3, text: "task.card.timeManagement", correctColumn: "B", mistakeKey: "task.card.mistake.timeManagement" },
    { id: 4, text: "task.card.readingBlueprints", correctColumn: "A", mistakeKey: "task.card.mistake.readingBlueprints" },
    { id: 5, text: "task.card.teamwork", correctColumn: "B", mistakeKey: "task.card.mistake.teamwork" },
    { id: 6, text: "task.card.publicSpeaking", correctColumn: "B", mistakeKey: "task.card.mistake.publicSpeaking" },
    { id: 7, text: "task.card.labResearch", correctColumn: "A", mistakeKey: "task.card.mistake.labResearch" },
    { id: 8, text: "task.card.conflictResolution", correctColumn: "B", mistakeKey: "task.card.mistake.conflictResolution" },
];

const DraggableCard = ({ card, from, disabled = false  }) => {
    const { t } = useLanguage();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: card.id.toString(),
        data: { card, from },
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            {...(!disabled ? attributes : {})}
            {...(!disabled ? listeners : {})}
            className={`card card-${card.status || 'pending'}`}
            style={{
                transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
                touchAction: disabled ? 'auto' : 'none',
                cursor: disabled ? 'default' : 'grab',
            }}
        >
            {t(card.text)}
        </div>
    );
};


const DroppableColumn = ({ id, label, cards, onDrop, disabled = false  }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`card-column column-${id.toLowerCase()}`}
            style={{ backgroundColor: isOver ? '#eef6ff' : undefined }}
        >
            <h4>{label}</h4>
            {cards.map((card) => (
                <DraggableCard key={card.id} card={card} from={id} disabled={disabled} />
            ))}
        </div>
    );
};


const CardSortTask = ({ onUnlock }) => {
    const { t } = useLanguage();
    const [cardStack, setCardStack] = useState([...initialCards]);
    const [columns, setColumns] = useState({ A: [], B: [] });
    const [feedbackCard, setFeedbackCard] = useState(null);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [completed, setCompleted] = useState(false);
    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || !active) return;

        const droppedColumn = over.id;
        const { card, from } = active.data.current;
        const isCorrect = card.correctColumn === droppedColumn;

        if (card.status === 'incorrect') {
            if (isCorrect) {
                adjustScore(5);
                triggerFloatingScore('+10');
                setColumns(prev => {
                    const newFrom = prev[from].filter(c => c.id !== card.id);
                    const newTo = [...prev[droppedColumn], { ...card, status: 'correct' }];
                    const updated = { ...prev, [from]: newFrom, [droppedColumn]: newTo };
                    checkCompletion(updated);
                    return updated;
                });
            } else if (from !== droppedColumn) {
                setColumns(prev => {
                    const newFrom = prev[from].filter(c => c.id !== card.id);
                    const newTo = [...prev[droppedColumn], card];
                    const updated = { ...prev, [from]: newFrom, [droppedColumn]: newTo };
                    return updated;
                });
            }
            return;
        }

        if (cardStack.length > 0 && card.id === cardStack[0].id) {
            const topCard = cardStack[0];
            const isTopCorrect = topCard.correctColumn === droppedColumn;

            setColumns(prev => {
                const updated = {
                    ...prev,
                    [droppedColumn]: [...prev[droppedColumn], { ...topCard, status: isTopCorrect ? 'correct' : 'incorrect' }]
                };
                if (isTopCorrect) {
                    adjustScore(5);
                    triggerFloatingScore('+10');
                    checkCompletion(updated);
                } else {
                    adjustScore(-2.5);
                    triggerFloatingScore('-5');
                }
                return updated;
            });
            setCardStack(prev => prev.slice(1));

            if (!isTopCorrect) setFeedbackCard(topCard);
        }
    };

    const checkCompletion = (updatedColumns) => {
        const allCards = [...updatedColumns.A, ...updatedColumns.B];
        const correctCards = allCards.filter(c => c.status === 'correct').length;

        if (correctCards === initialCards.length) {
            saveConfirmedScore(getLiveScore());
            saveTaskCompletion('task.card-sort'); // ← add this
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
        }
    };

    useEffect(() => {
        if (isTaskCompleted('task.card-sort')) {
            const completed = initialCards.reduce((acc, card) => {
                acc[card.correctColumn].push({ ...card, status: 'correct' });
                return acc;
            }, { A: [], B: [] });

            setColumns(completed);
            setCardStack([]);
            setCompleted(true);

            // 🔓 Unlock the next section if needed
            if (typeof onUnlock === 'function') onUnlock();
        }
    }, []);

    return (
        <div className="card-sort-task-container">

            <DndContext onDragEnd={handleDragEnd}>
                <div className="card-columns">
                    <DroppableColumn
                        id="A"
                        label={t('task.card.columnA')}
                        cards={columns.A}
                        onDrop={handleDragEnd}
                        className="card-column column-a"
                        disabled={completed}
                    />
                    <DroppableColumn
                        id="B"
                        label={t('task.card.columnB')}
                        cards={columns.B}
                        onDrop={handleDragEnd}
                        className="card-column column-b"
                        disabled={completed}
                    />
                </div>

                <div className="card-task-instructions">
                    <p>
                        {completed
                            ? t('task.complete') || 'Task complete!'
                            : t('task.card.instructions')}
                    </p>
                </div>

                {cardStack.length > 0 && (
                    <div className="card-bank">
                        <h4>{t('task.card.bank') || 'Skills'}</h4>
                        <DraggableCard card={cardStack[0]} from="stack" disabled={completed}/>
                    </div>
                )}
            </DndContext>

            <FloatingScoreBubble />
            {feedbackCard && (
                <div className="overlay">
                    <div className="overlay-content feedback-overlay">
                        <h3>{t('task.card.feedbackTitle') || 'Why this wasn’t right'}</h3>
                        <p>{t(feedbackCard.mistakeKey)}</p>
                        <button className="scroll-between" onClick={() => setFeedbackCard(null)}>
                            {t('button.close') || 'Got it!'}
                        </button>
                    </div>
                </div>
            )}

            {completed && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-1');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}
        </div>
    );
};

export default CardSortTask;
