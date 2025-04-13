import React, { useEffect, useRef } from 'react';
import theme from '../themes/theme';
import { useLanguage } from '../context/languageContext';

const TaskSection = ({
                         headerKey,
                         sectionIndex,
                         totalSections,
                         isLocked,
                         onUnlock,
                         children,
                     }) => {
    const ref = useRef(null);

    const { t } = useLanguage();

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
            {sectionIndex === 0 && (
                <div id="task-header-anchor" style={{ height: '1px' }}></div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {children}

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
