import React, {useEffect, useState} from 'react';
import './mergeTask.css';
import { useLanguage } from '../context/languageContext';
import badge1 from '../components/metaBadge1.png';
import badge2 from '../components/metaBadge2.png';
import badge3 from '../components/metaBadge3.png';
import metaBadge from './metadata.png';
import {
    DndContext,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import MergeCenterDisplay from "./mergeCenterDisplay";
import {
    adjustScore,
    saveConfirmedScore,
    getLiveScore,
    saveTaskCompletion,
    isTaskCompleted,
    useFloatingScore
} from '../utils/scoreUtils';

const DraggableBadge = ({ id, src }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <img
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            src={src}
            alt={`Badge ${id}`}
            className="draggable-badge"
            style={{
                transform: transform
                    ? `translate(${transform.x}px, ${transform.y}px)`
                    : undefined,
                touchAction: 'none',
                cursor: 'grab',
            }}
        />
    );
};

const DropZone = ({ onDropBadge, droppedItems, isComplete, dropProgress, children }) => {
    const { setNodeRef } = useDroppable({ id: 'meta-zone' });

    return (
        <div ref={setNodeRef} className="drop-zone">
            {children ? (
                children
            ) : (
                <div className={`meta-badge-wrapper reveal-${droppedItems.length} ${isComplete ? 'complete' : ''}`}>
                    <img src={metaBadge} alt="Meta Badge" className="meta-badge" />
                    <div
                        className="meta-badge-mask"
                        style={{
                            transform: `translate(-${(1 - dropProgress) * 100}%, -${(1 - dropProgress) * 100}%)`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const BadgeMergeTask = ({ onUnlock }) => {
    const { t } = useLanguage();

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [droppedItems, setDroppedItems] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

    const badgeList = [
        { id: 'badge1', src: badge1 },
        { id: 'badge2', src: badge2 },
        { id: 'badge3', src: badge3 },
    ];

    const handleDragEnd = (event) => {
        const { over, active } = event;
        if (over?.id === 'meta-zone') {
            const badgeId = active.id;
            if (!droppedItems.includes(badgeId)) {
                const updated = [...droppedItems, badgeId];
                setDroppedItems(updated);
                adjustScore(10);
                triggerFloatingScore('+10');

                if (updated.length === 3 && !completed) {
                    setCompleted(true);
                    saveConfirmedScore(getLiveScore());
                    saveTaskCompletion('task.merging');
                    if (typeof onUnlock === 'function') onUnlock();

                    setTimeout(() => setShowContinue(true), 7000);
                }
            }
        }
    };

    const dropProgress = droppedItems.length / badgeList.length;

    const { triggerFloatingScore, FloatingScoreBubble } = useFloatingScore();

    useEffect(() => {
        if (isTaskCompleted('task.merging')) {
            setDroppedItems(['badge1', 'badge2', 'badge3']);
            setCompleted(true);
            if (typeof onUnlock === 'function') onUnlock();
            setTimeout(() => setShowContinue(true), 7000);
        }
    }, []);

    return (
        <div className="badge-merge-container">

            <DndContext onDragEnd={handleDragEnd}>
                <div className="badge-layout">
                    {badgeList
                        .filter(({ id }) => !droppedItems.includes(id)) // 👈 Skip dropped ones
                        .map(({ id, src }) => (
                            <DraggableBadge key={id} id={id} src={src} />
                        ))}
                </div>

                <DropZone
                    onDropBadge={handleDragEnd}
                    droppedItems={droppedItems}
                    isComplete={completed}
                    dropProgress={dropProgress}
                >
                    <MergeCenterDisplay
                        droppedCount={droppedItems.length}
                        totalCount={badgeList.length}
                        isComplete={completed}
                    />
                </DropZone>
            </DndContext>

            {showContinue && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-4');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}

            {overlayOpen && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.merge.longHelp') || 'Multiple badges can combine to create a Meta badge representing broader competency.'}</p>
                        <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                    </div>
                </div>
            )}
            <FloatingScoreBubble />
        </div>
    );
};

export default BadgeMergeTask;
