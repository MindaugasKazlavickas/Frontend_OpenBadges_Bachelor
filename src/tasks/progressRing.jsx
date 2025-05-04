import React from 'react';
import './progressRing.css';

const ProgressRing = ({ current, total }) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = current / total;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="progress-ring-container">
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    stroke="#facc15"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="limegreen"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="progress-ring"
                />
            </svg>
        </div>
    );
};

export default ProgressRing;
