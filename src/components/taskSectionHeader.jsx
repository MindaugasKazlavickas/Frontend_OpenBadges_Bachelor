import React, {useEffect, useRef, useState} from 'react';
import { useLanguage } from '../context/languageContext';
import { useLiveScore } from '../utils/scoreUtils';
import "./taskSectionHeader.css"

const sectionTaskMap = ["task.card-sort", "task.metadata", "task.scenario", "task.merging", "task.swipe" ];

const TaskSectionHeader = ({ activeIndex, totalSections }) => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const score = useLiveScore();
    const [activeSectionIndex, setActiveSectionIndex] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [unlockedSections, setUnlockedSections] = useState([]);
    const dropdownRef = useRef();
    const allComplete = unlockedSections.length >= totalSections;
    const [showClaimBadge, setShowClaimBadge] = useState(false);

    const scrollToSection = (index) => {
        const target = document.getElementById(`section-${index-1}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        const onScroll = () => {
            const anchor = document.getElementById('task-start-anchor');
            const anchorTop = anchor?.getBoundingClientRect().top;
            setVisible(anchorTop !== undefined && anchorTop <= 0);

            const sections = document.querySelectorAll('.task-section');
            let current = 0;
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
                    current = index;
                }
            });
            setActiveSectionIndex(current + 1);
        };

        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem("taskCompletion");
            const parsed = stored ? JSON.parse(stored) : {};
            const unlocked = sectionTaskMap
                .map((taskKey, i) => (parsed[taskKey] ? i + 1 : null))
                .filter(Boolean);

            const furthestCompleted = Math.max(0, ...unlocked);
            const extended = new Set([...unlocked, furthestCompleted + 1]);
            setUnlockedSections([...extended].sort((a, b) => a - b));
            setShowClaimBadge(parsed["task.swipe"] === true);
        };

        window.addEventListener("storage", handleStorageChange);
        handleStorageChange();

        return () => window.removeEventListener("storage", handleStorageChange);
    }, [activeSectionIndex]);

    const dynamicHeaderKey = `section.heading${activeSectionIndex}`;
    const dynamicHeaderText = t(dynamicHeaderKey) || '';
    const isTouchRef = useRef(false);
    const showMask = !allComplete && unlockedSections.length < totalSections;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const hoverTimeoutRef = useRef(null);

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            if (window.innerWidth >= 768) {
                setDropdownOpen(false);
            }
        }, 200);
    };

    return (
        <div className={`task-header ${visible ? 'visible' : ''}`}>
            <div className="dropdown-wrapper" ref={dropdownRef}>
            <div
                className="dropdown-trigger"
                onMouseEnter={() => setDropdownOpen(true)}
                onTouchStart={() => {
                    isTouchRef.current = true;
                    setDropdownOpen(true);
                }}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="dropdown-heading"
                    onClick={() => {
                        if (isTouchRef.current) {
                            isTouchRef.current = false;
                            return;
                        }
                        setDropdownOpen(prev => !prev);
                    }}
                    ref={dropdownRef}
                >
                    {dynamicHeaderText}
                </div>

                {dropdownOpen && (
                    <div className="dropdown-container" style={{
                        minWidth: dropdownRef.current?.offsetWidth || 160,
                        width: 'auto'
                    }}>
                        {Array.from({ length: totalSections }, (_, i) => {
                            const index = i + 1;
                            const isAccessible = unlockedSections.includes(index);
                            const isActive = index === activeSectionIndex;

                            return (
                                <div
                                    key={index}
                                    className={`dropdown-entry ${!isAccessible ? 'locked' : ''} ${isActive ? 'active' : ''}`}
                                    onClick={isAccessible && index !== activeSectionIndex ? () => scrollToSection(index) : undefined}
                                >
                                    {t(`section.heading${index}`)}
                                </div>
                            );
                        })}

                        {showMask && <div className="dropdown-mask" />}

                        {showClaimBadge && (
                            <div
                                className="dropdown-entry"
                                onClick={() => {
                                    const el = document.getElementById('EndSection');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    setDropdownOpen(false);
                                }}
                            >
                                {t("end.heading") || "Claim Badge"}
                            </div>
                        )}
                    </div>
                )}
            </div>
            </div>

            <div className="score-display">
                {score} {t("pts")}
            </div>
        </div>
    );
};

export default TaskSectionHeader;
