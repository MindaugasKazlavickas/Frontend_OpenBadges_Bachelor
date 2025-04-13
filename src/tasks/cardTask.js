import React, { useState } from 'react';
import './cardTask.css';
import { useLanguage } from '../context/languageContext';
import {
    DndContext,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';

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

const DraggableCard = ({ card, from }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: card.id.toString(),
        data: { card, from },
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`card card-${card.status || 'pending'}`}
            style={{
                transform: transform
                    ? `translate(${transform.x}px, ${transform.y}px)`
                    : undefined,
                touchAction: 'none',
                cursor: 'grab',
            }}
        >
            {card.text}
        </div>
    );
};

const DroppableColumn = ({ id, label, cards, onDrop }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="card-column"
            style={{ backgroundColor: isOver ? '#eef6ff' : undefined }}
        >
            <h4>{label}</h4>
            {cards.map((card) => (
                <DraggableCard key={card.id} card={card} from={id} />
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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || !active) return;

        const droppedColumn = over.id;
        const { card, from } = active.data.current;

        const isCorrect = card.correctColumn === droppedColumn;

        if (card.status === 'incorrect') {
            // Dragging red card to new place
            if (isCorrect) {
                setColumns(prev => {
                    const newFrom = prev[from].filter(c => c.id !== card.id);
                    const newTo = [...prev[droppedColumn], { ...card, status: 'correct' }];
                    return { ...prev, [from]: newFrom, [droppedColumn]: newTo };
                });
            } else if (from !== droppedColumn) {
                // Swap red card
                setColumns(prev => {
                    const newFrom = prev[from].filter(c => c.id !== card.id);
                    const newTo = [...prev[droppedColumn], card];
                    return { ...prev, [from]: newFrom, [droppedColumn]: newTo };
                });
            }
            return;
        }

        // Normal top card from the stack
        if (cardStack.length > 0 && card.id === cardStack[0].id) {
            const topCard = cardStack[0];
            const isTopCorrect = topCard.correctColumn === droppedColumn;

            if (isTopCorrect) {
                setColumns(prev => ({
                    ...prev,
                    [droppedColumn]: [...prev[droppedColumn], { ...topCard, status: 'correct' }],
                }));
                setCardStack(prev => prev.slice(1));
            } else {
                setFeedbackCard(topCard);
                setColumns(prev => ({
                    ...prev,
                    [droppedColumn]: [...prev[droppedColumn], { ...topCard, status: 'incorrect' }],
                }));
                setCardStack(prev => prev.slice(1));
            }

            // Check completion after a short delay
            setTimeout(() => {
                const allCorrect = [...columns.A, ...columns.B].filter(c => c.status === 'correct').length +
                    (isTopCorrect ? 1 : 0);
                if (allCorrect === initialCards.length) {
                    setCompleted(true);
                    if (typeof onUnlock === 'function') onUnlock();
                }
            }, 200);
        }
    };

    return (
        <div className="card-sort-task-container">
            <div className="task-prompt">
                <p>{t('task.card.description') || 'Perskaityk korteles ir pabandyk priskirti jas prie kietųjų arba minkštųjų kompetencijų.'}</p>
                <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>Read More ?</button>
            </div>

            <DndContext onDragEnd={handleDragEnd}>
                <div className="card-columns">
                    <DroppableColumn
                        id="A"
                        label="Kietosios kompetencijos"
                        cards={columns.A}
                        onDrop={handleDragEnd}
                    />
                    <DroppableColumn
                        id="B"
                        label="Minkštosios kompetencijos"
                        cards={columns.B}
                        onDrop={handleDragEnd}
                    />
                </div>

                <div className="card-bank">
                    {cardStack.length > 0 && (
                        <DraggableCard card={cardStack[0]} from="stack" />
                    )}
                </div>
            </DndContext>

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
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-4');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}
        </div>
    );
};

export default CardSortTask;
