import React, {useEffect, useRef, useState} from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';
import './endSection.css';
import { resetScore } from '../utils/scoreUtils';
import { logEvent, getLogs } from '../utils/eventLogger';
import { getLiveScore } from '../utils/scoreUtils';

const BADGE_CLAIM_KEY = 'userClaimedBadge';

const EndSection = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [badgeClaimed, setBadgeClaimed] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdRef = useRef(null);
    const FADE_DURATION = 600;

    useEffect(() => {
        const claimed = localStorage.getItem(BADGE_CLAIM_KEY);
        if (claimed === 'true') {
            setBadgeClaimed(true);
        }
    }, []);

    const submitFinalLogs = async () => {
        const sessionId = localStorage.getItem('sessionId');
        const logs = getLogs();
        const score = getLiveScore();

        const breakdown = logs.reduce(
            (acc, log) => {
                if (log.type === 'scoreAdjusted') {
                    if (log.outcome === 'correct') acc.correct += 1;
                    if (log.outcome === 'incorrect') acc.incorrect += 1;
                }
                return acc;
            },
            { correct: 0, incorrect: 0 }
        );

        const payload = {
            sessionId,
            finalScore: score,
            scoreBreakdown: breakdown,
            logs,
            badgeClaimedAt: new Date().toISOString(),
        };

        try {
            await fetch('https://frontend-openbadges-bachelor.onrender.com/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            console.log('[LOGS] Submitted successfully.');
        } catch (e) {
            console.error('[LOGS] Submission failed:', e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const [firstName, ...rest] = name.trim().split(' ');
        const lastName = rest.join(' ') || '–';
        const confirmedScore = localStorage.getItem("confirmedScore");
        const userSettings = JSON.parse(localStorage.getItem("userSettings") || "{}");
        const language = userSettings.language || "en";

        try {
            const response = await fetch('https://frontend-openbadges-bachelor.onrender.com/issue-obf-badge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, score: confirmedScore, language }),
            });

            if (response.ok) {
                localStorage.setItem(BADGE_CLAIM_KEY, 'true');
                logEvent('badgeClaimed');
                submitFinalLogs();
                setBadgeClaimed(true);
                setSuccessMessage(t('end.success') || 'Badge sent! Check your email!');
            } else if (response.status === 409) {
                console.log("Status:", response.status);
                    logEvent('badgeAlreadyIssued');
                    submitFinalLogs();
                    setSuccessMessage(t('end.alreadyIssued') || 'A badge has already been issued to this email.');
                    setBadgeClaimed(true);
                } else {
                    setSuccessMessage(t('end.error') || 'Something went wrong. Try again.');
                }
        } catch (error) {
            console.error(error);
            setSuccessMessage(t('end.serverError') || 'Server error. Please try later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const startHold = () => {
        if (holdRef.current) return;
        let progress = 0;
        setIsHolding(true);
        holdRef.current = setInterval(() => {
            progress += 2;
            setHoldProgress(progress);
            if (progress >= 100) {
                clearInterval(holdRef.current);
                holdRef.current = null;
                setTimeout(() => setHoldProgress(0), 300);

                resetScore();

                const overlay = document.createElement("div");
                overlay.className = "reset-overlay";
                document.body.appendChild(overlay);

                setTimeout(() => {
                    overlay.style.opacity = "1";

                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });

                        setTimeout(() => {
                            overlay.remove();
                            window.location.reload();
                        }, FADE_DURATION + 200);
                    }, FADE_DURATION);
                }, 10);
            }
        }, 30);
    };

    const cancelHold = () => {
        clearInterval(holdRef.current);
        holdRef.current = null;
        setIsHolding(false);
        setHoldProgress(0);
    };

    return (
        <section id="EndSection" style={{ padding: '4rem 2rem', backgroundColor: theme.colors.primary, color: 'black' }}>
            <h2>{t('end.congrats')}</h2>
            <p>{t('end.earned')}</p>

            {badgeClaimed ? (
                <p style={{ marginTop: '2rem', fontWeight: 'bold' }}>{t('end.claimed') || 'Badge claimed.'}</p>
            ) : (
                <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                    <input
                        type="text"
                        placeholder={t('form.namePlaceholder') || 'Your Name'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                    />
                    <input
                        type="email"
                        placeholder={t('form.emailPlaceholder') || 'Your Email'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                    />

                    <p style={{ fontStyle: 'italic', fontsize: 16, top: '1rem', bottom: '1rem', maxWidth: 600, margin: 'auto'}}>
                        {t('end.aboutreset') || 'Replaying will reset your progress. You can only claim your badge once.'}
                    </p>

                    <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}
                    className="submitter">
                        {isSubmitting ? (t('form.sending') || 'Issuing badge...') : (t('form.submit') || 'Claim Badge')}
                    </button>
                </form>
            )}

            {successMessage && (
                <>
                    <p style={{ marginTop: '1rem' }}>{successMessage}</p>
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdjwODfBgJKukGRSUFombwMYLBRkVpEf7JD7nF2lGqzQfuC2w/viewform?usp=dialog"
                        className="survey-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('end.survey') || 'Take our short feedback survey'}
                    </a>
                </>
            )}

            <div style={{ marginTop: '3rem' }}>
                <p style={{ fontStyle: 'italic', fontsize: 16, top: '1rem', bottom: '1rem', maxWidth: 600, margin: 'auto', marginBottom: '1rem' }}>
                    {t('end.warning') || 'Replaying will reset your progress. You can only claim your badge once.'}
                </p>
                <button
                    className="play-again-btn"
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                >
                    <div className="hold-progress" style={{ width: `${holdProgress}%` }} />
                    {t('end.playagain') || 'Play Again'}
                </button>
            </div>
        </section>
    );
};

export default EndSection;
