import React, {useEffect, useRef, useState} from 'react';
import theme from '../themes/theme';
import { useLanguage } from '../context/languageContext';
import './taskSection.css';

const TaskSection = ({
                         headerKey,
                         sectionIndex,
                         totalSections,
                         isLocked,
                         onUnlock,
                         materials = [],
                         children,
                     }) => {

    const { t } = useLanguage();
    const ref = useRef(null);
    const taskRef = useRef(null);
    const [showContinue, setShowContinue] = useState(false);
    const [isTaskView, setIsTaskView] = useState(false);

    useEffect(() => {
        if (sectionIndex > 0 && isLocked) {
            const onScroll = () => {
                const sectionTop = ref.current?.getBoundingClientRect().top;
                if (sectionTop < window.innerHeight * 0.25) {
                    document.getElementById(`section-${sectionIndex - 1}`)?.scrollIntoView({
                        behavior: 'smooth',
                    });
                }
            };
            window.addEventListener('scroll', onScroll);
            return () => window.removeEventListener('scroll', onScroll);
        }
    }, [isLocked, sectionIndex]);

    const handleContinue = () => {
        const next = document.getElementById(`section-${sectionIndex + 1}`);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            const anchor = document.getElementById('button-header-anchor');
            if (!anchor) return;

            const rect = anchor.getBoundingClientRect();
            const headerHeight = 126;

            // Switch based on whether the anchor is ABOVE the visible header
            setIsTaskView(rect.top < headerHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Run on mount

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleToggleScroll = () => {
        const target = isTaskView ? ref.current : taskRef.current;
        if (!target) return;

        const headerOffset = 146;

        const targetRect = target.getBoundingClientRect();
        const isScrollingDown = targetRect.top > 0;

        if (isScrollingDown) {
            const offsetPosition = window.scrollY + targetRect.top - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        } else {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id={`section-${sectionIndex}`}
            ref={ref}
            className="task-section-container"
            style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                opacity: isLocked ? 0.4 : 1,
                pointerEvents: isLocked ? 'none' : 'auto',
            }}
        >
            {isLocked && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1))',
                        zIndex: 5,
                        pointerEvents: 'none',
                    }}
                />
            )}
            <div id="task-header-anchor" style={{ height: '90px' }}></div>
            <div style={{ minHeight:'50vh', }} className="task-section-content">
                <div className="task-section-header">{t(headerKey)}</div>

                {materials.map((item, idx) => {
                    if (item.type === 'header') {
                        return <div key={idx} className="task-section-subheader">{t(item.key)}</div>;
                    }
                    if (item.type === 'paragraph') {
                        return <p key={idx} className="task-section-paragraph">{t(item.key)}</p>;
                    }
                    return null;
                })}
                <div id="button-header-anchor" style={{ height: '1px' }}></div>
                <button className="scroll-between" onClick={handleToggleScroll}>
                    {isTaskView
                        ? t('button.backToMaterials') || 'Back to Materials'
                        : t('button.goToTask') || 'Go to Task'}
                </button>
            </div>
            <div ref={taskRef} style={{ minHeight:'80vh', position: 'relative' }}>
                {/* Removed separate back button */}

                {React.cloneElement(children, { revealContinue: () => setShowContinue(true) })}

                {showContinue && (
                    <button className="scroll-btn hero-cta cta-animate" onClick={handleContinue}>
                        {t('button.continue') || 'Continue to next section'}
                    </button>
                )}
            </div>

            {isLocked && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onUnlock();
                    }}
                    style={{
                        marginTop: '2rem',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.textDark,
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                    }}
                >
                    Unlock This Section
                </button>
            )}
        </section>
    );
};

export default TaskSection;
