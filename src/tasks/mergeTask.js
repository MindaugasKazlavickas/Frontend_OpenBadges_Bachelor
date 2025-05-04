import React, {useEffect, useState} from 'react';
import './mergeTask.css';
import { useLanguage } from '../context/languageContext';
import badge1 from '../assets/metaBadge1.png';
import badge2 from '../assets/metaBadge2.png';
import badge3 from '../assets/metaBadge3.png';
import metaBadge from '../assets/metadata.png';
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

    const [droppedItems, setDroppedItems] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

    const badgeList = [
        { id: 'badge1', src: badge1, position: 'top' },
        { id: 'badge2', src: badge2, position: 'left' },
        { id: 'badge3', src: badge3, position: 'right' }
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
            <div className="card-task-instructions">
                <p>
                    {completed
                        ? t('task.complete') || 'Task complete!'
                        : t('task.merge.instructions')}
                </p>
            </div>

            <DndContext onDragEnd={handleDragEnd}>
                <div className="badge-merge-zone">
                    <div className="badge-cluster">
                        <div className="badge-slot">
                            {!droppedItems.includes('badge1') && (
                                <DraggableBadge id="badge1" src={badge1} />
                            )}
                        </div>
                        <div className="badge-slot">
                            {!droppedItems.includes('badge2') && (
                                <DraggableBadge id="badge2" src={badge2} />
                            )}
                        </div>
                        <div className="badge-slot">
                            {!droppedItems.includes('badge3') && (
                                <DraggableBadge id="badge3" src={badge3} />
                            )}
                        </div>
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
                </div>
            </DndContext>

            {showContinue && (
                <button className="scroll-btn" onClick={() => {
                    const next = document.getElementById('section-4');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}>
                    {t('task.card.continueButton') || 'Continue to next section'}
                </button>
            )}
            <FloatingScoreBubble />
        </div>
    );
};

export default BadgeMergeTask;
