import React, { useState } from 'react';
import './mergeTask.css';
import { useLanguage } from '../context/languageContext';
import badge1 from './metadata.png';
import badge2 from './metadata.png';
import badge3 from './metadata.png';
import metaBadge from './metadata.png';

const BadgeMergeTask = ({ onUnlock }) => {
    const { t } = useLanguage();

    const [overlayOpen, setOverlayOpen] = useState(false);
    const [droppedItems, setDroppedItems] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const handleDrop = (badgeId) => {
        if (!droppedItems.includes(badgeId)) {
            const updated = [...droppedItems, badgeId];
            setDroppedItems(updated);

            if (updated.length === 3 && !isComplete) {
                setIsComplete(true);
                if (typeof onUnlock === 'function') onUnlock();
            }
        }
    };

    const dropProgress = droppedItems.length / 3; // 0 to 1

    return (
        <div className="badge-merge-container">
            {/* Prompt */}
            <div className="task-prompt">
                <p>{t('task.merge.description') || 'Drag the competence badges to the center to create a Meta badge!'}</p>
                <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>Read More ?</button>
            </div>

            {/* Badge Layout */}
            <div className="badge-layout">
                {[{ id: 'badge1', src: badge1 }, { id: 'badge2', src: badge2 }, { id: 'badge3', src: badge3 }].map(({ id, src }) => (
                    <img
                        key={id}
                        src={src}
                        alt={`Badge ${id}`}
                        className="draggable-badge"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('badge-id', id)}
                    />
                ))}
            </div>

            {/* Drop Zone */}
            <div
                className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    const badgeId = e.dataTransfer.getData('badge-id');
                    handleDrop(badgeId);
                }}
            >
                <div className={`meta-badge-wrapper reveal-${droppedItems.length} ${isComplete ? 'complete' : ''}`}>
                <img src={metaBadge} alt="Meta Badge" className="meta-badge" />
                    <div
                        className="meta-badge-mask"
                        style={{
                            transform: `translate(-${(1 - dropProgress) * 100}%, -${(1 - dropProgress) * 100}%)`
                        }}
                    />
                </div>
            </div>

            {/* Completion Prompt */}
            {isComplete && (
                <>
                    <div className="unlock-prompt">✅ {t('task.merge.unlockedMessage') || 'Meta badge created! Continue below.'}</div>
                    <button
                        className="scroll-btn"
                        onClick={() => {
                            const next = document.getElementById('section-4'); // adjust as needed
                            if (next) next.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        {t('task.merge.continueButton') || 'Continue to next section'}
                    </button>
                </>
            )}

            {/* Read More Overlay */}
            {overlayOpen && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{t('task.merge.longHelp') || 'Multiple badges can combine to create a Meta badge representing broader competency.'}</p>
                        <button onClick={() => setOverlayOpen(false)}>{t('button.close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BadgeMergeTask;
