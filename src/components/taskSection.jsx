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
                         promptKey,
                         longHelpKey,
                         children,
                     }) => {
    const ref = useRef(null);
    const { t } = useLanguage();
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [showContinue, setShowContinue] = useState(false);

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

    const handleRevealContinue = () => setShowContinue(true);

    const handleContinue = () => {
        const next = document.getElementById(`section-${sectionIndex + 1}`);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            id={`section-${sectionIndex}`}
            ref={ref}
            style={{
                minHeight: '100vh',
                padding: '5rem 2rem',
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                position: 'relative',
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
                        borderRadius: '0px',
                    }}
                />
            )}

            {sectionIndex === 0 && <div id="task-header-anchor" style={{ height: '1px' }}></div>}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Task Prompt */}
                {promptKey && (
                    <div className="task-prompt">
                        <p>{t(promptKey)}</p>
                        <button className="read-more-btn" onClick={() => setOverlayOpen(true)}>
                            {t('button.readMore') || 'Show context'}
                        </button>
                    </div>
                )}

                {/* Children content + callback injector */}
                {React.cloneElement(children, { revealContinue: handleRevealContinue })}

                {/* Continue button */}
                {showContinue && (
                    <button className="scroll-btn hero-cta cta-animate" onClick={handleContinue}>
                        {t('button.continue') || 'Continue to next section'}
                    </button>
                )}

                {/* Read More Overlay */}
                {overlayOpen && (
                    <div className="overlay">
                        <div className="overlay-content">
                            {t(longHelpKey).split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                            <button onClick={() => setOverlayOpen(false)}>{t('button.close') || 'Close'}</button>
                        </div>
                    </div>
                )}

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
            </div>
        </section>
    );
};


export default TaskSection;
