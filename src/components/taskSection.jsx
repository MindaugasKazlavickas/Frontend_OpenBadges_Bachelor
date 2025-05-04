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
                         unlockedSections = [],
                     }) => {

    const { t } = useLanguage();
    const ref = useRef(null);
    const taskRef = useRef(null);
    const [showContinue, setShowContinue] = useState(false);
    const [isTaskView, setIsTaskView] = useState(false);
    const [showLockedOverlay, setShowLockedOverlay] = useState(false);

    useEffect(() => {
        if (sectionIndex > 0 && isLocked) {
            const onScroll = () => {
                const sectionTop = ref.current?.getBoundingClientRect().top;
                if (sectionTop < window.innerHeight * 0.25) {
                    const lastUnlockedIndex = [...Array(sectionIndex).keys()].reverse()
                        .find(i => unlockedSections.includes(i));

                    const prev = document.getElementById(`section-${lastUnlockedIndex}`);
                    if (prev) {
                        prev.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => setShowLockedOverlay(true), 500);
                    }
                }
            };
            window.addEventListener('scroll', onScroll);
            return () => window.removeEventListener('scroll', onScroll);
        }
    }, [isLocked, sectionIndex, unlockedSections]);

    const handleContinue = () => {
        const next = document.getElementById(`section-${sectionIndex + 1}`);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            const anchor = document.getElementById(`button-header-anchor-${sectionIndex}`);
            if (!anchor) return;

            const rect = anchor.getBoundingClientRect();
            const headerHeight = 106;
            setIsTaskView(rect.top < headerHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionIndex]);

    const handleToggleScroll = () => {
        const target = isTaskView ? ref.current : taskRef.current;
        if (!target) return;

        const headerOffset = 106;
        const targetRect = target.getBoundingClientRect();
        const isScrollingDown = targetRect.top > 0;

        if (isScrollingDown) {
            const offsetPosition = window.scrollY + targetRect.top - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        } else {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id={`section-${sectionIndex}`}
            ref={ref}
            className="task-section-container, task-section"
            style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                opacity: sectionIndex > 0 && isLocked && !showLockedOverlay ? 0.4 : 1,
                pointerEvents: sectionIndex > 0 && isLocked ? 'none' : 'auto',
            }}
        >
            {sectionIndex > 0 && isLocked && !showLockedOverlay && (
                <div
                    style={{
                        position: 'relative',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1))',
                        zIndex: 5,
                        pointerEvents: 'none',
                    }}
                />
            )}
            <div
                style={{
                    opacity: sectionIndex > 0 && isLocked ? 0.4 : 1,
                    pointerEvents: sectionIndex > 0 && isLocked ? 'none' : 'auto',
                }}
            >
                <div id={`task-header-anchor-${sectionIndex}`} style={{ height: '90px' }}></div>

                <div style={{ minHeight: '50vh' }} className="task-section-content">
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

                    <div id={`button-header-anchor-${sectionIndex}`} style={{ height: '1px' }}></div>
                    <button className="scroll-between" onClick={handleToggleScroll}>
                        {isTaskView
                            ? t('button.backToMaterials') || 'Back to Materials'
                            : t('button.goToTask') || 'Go to Task'}
                    </button>
                </div>

                <div ref={taskRef} style={{ minHeight: '80vh', position: 'relative' }}>
                    {React.cloneElement(children, { revealContinue: () => setShowContinue(true) })}

                    {showContinue && (
                        <button className="scroll-btn hero-cta cta-animate" onClick={handleContinue}>
                            {t('button.continue') || 'Continue'}
                        </button>
                    )}
                </div>
            </div>

            {showLockedOverlay && (
                <div className="overlay" style={{ zIndex: 100, pointerEvents: 'auto', opacity: 1}}>
                    <div className="overlay-content feedback-overlay">
                        <h3>{t('task.lockedSectionTitle') || 'Section Locked'}</h3>
                        <p>{t('task.lockedSectionMessage') || 'You need to complete the previous section before continuing.'}</p>
                        <button
                            className="scroll-between"
                            onClick={() => setShowLockedOverlay(false)}
                        >
                            {t('button.close') || 'Got it'}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TaskSection;