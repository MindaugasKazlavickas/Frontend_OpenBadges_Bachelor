import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';
import {useLiveScore, useFloatingScore} from '../utils/scoreUtils';

const TaskSectionHeader = ({ activeIndex, totalSections }) => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const score = useLiveScore();
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const { FloatingScoreBubble } = useFloatingScore();
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

            setActiveSectionIndex(current+1);
        };

        window.addEventListener('scroll', onScroll);
        onScroll(); // initialize on load

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const dynamicHeaderKey = `section.heading${activeSectionIndex}`;
    const dynamicHeaderText = t(dynamicHeaderKey) || '';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: theme.colors.background,
                padding: '0.8rem 1rem',
                borderBottom: `2px solid ${theme.colors.primary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                visibility: visible ? 'visible' : 'hidden',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {dynamicHeaderText}
                </div>
            </div>
            <div
                style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.6rem',
                    border: `1px solid ${theme.colors.text}`,
                    borderRadius: '0.5rem',
                    minWidth: '64px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                }}
            >
                {score} {t("pts")}
            </div>
        </div>
    );
};

export default TaskSectionHeader;
