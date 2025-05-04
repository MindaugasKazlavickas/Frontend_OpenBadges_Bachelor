import React, { useEffect, useRef, useState } from 'react';
import ProgressRing from './progressRing';
import "./mergeCenterDisplay.css";
import badge1 from '../assets/metaBadge1.png';
import badge2 from '../assets/metaBadge2.png';
import badge3 from '../assets/metaBadge3.png';

const badgeMap = {
    badge1,
    badge2,
    badge3,
};

const MergeCenterDisplay = ({ droppedCount, totalCount, isComplete, droppedItems }) => {
    const videoRef = useRef(null);
    const [videoPlayed, setVideoPlayed] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        if (isComplete && !showVideo) {
            setFadingOut(true);

            const timeout = setTimeout(() => {
                setShowVideo(true);
                videoRef.current?.play();
            }, 600); // matches fade duration

            return () => clearTimeout(timeout);
        }
    }, [isComplete, showVideo]);

    return (
        <div className="center-display-container">
            <video preload="auto" style={{ display: 'none' }}>
                <source src="/mergeAnimation.mp4" type="video/mp4" />
            </video>
            {!showVideo  ? (
                <div
                    className={`progress-ring-wrapper ${fadingOut ? 'fade-out' : ''}`}
                    style={{ width: '100%', height: '100%' }}>
                    <ProgressRing
                        key="merge-task-ring"
                        current={droppedCount}
                        total={totalCount}
                        size={180}
                        strokeWidth={12}
                        circleColor="#e0e0e0"
                        progressColor="#4caf50"
                    />
                    {droppedItems.map((badgeId, index) => (
                        <div key={badgeId} className={`orbit-container orbit-${index}`}>
                            <img src={badgeMap[badgeId]} alt={`Orbiting ${badgeId}`} className="orbiting-badge" />
                        </div>
                    ))}
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src="/mergeAnimation.mp4"
                    autoPlay
                    muted
                    playsInline
                    className="merge-video"
                    controls={false}
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    poster="/src/assets/metadata.png" // optional
                >
                    <source src="/mergeAnimation.mp4" type="video/mp4" />

                </video>
            )}
        </div>
    );
};

export default MergeCenterDisplay;
