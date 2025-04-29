import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';

const TaskSectionHeader = ({ activeIndex, totalSections }) => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);

    const percentage = Math.floor(((activeIndex) / totalSections) * 100);

    useEffect(() => {
        const onScroll = () => {
            const anchor = document.getElementById('task-start-anchor');
            const anchorTop = anchor?.getBoundingClientRect().top;

            setVisible(anchorTop !== undefined && anchorTop <= 0);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
                borderBottom: `1px solid ${theme.colors.text}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                visibility: visible ? 'visible' : 'hidden',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t('hero.tagline')}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {t('section.part')} {activeIndex + 1}
                </div>
            </div>
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: `2px solid ${theme.colors.text}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                }}
            >{percentage}%
            </div>
        </div>
    );
};

export default TaskSectionHeader;
