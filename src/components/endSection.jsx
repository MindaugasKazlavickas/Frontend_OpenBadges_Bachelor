import React, { useState } from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';

const EndSection = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const [firstName, ...rest] = name.trim().split(' ');
        const lastName = rest.join(' ') || '–';

        try {
            const response = await fetch('https://your-backend.onrender.com/issue-obf-badge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            if (response.ok) {
                setSuccessMessage(t('end.success') || '🎉 Badge sent! Check your email!');
            } else {
                setSuccessMessage(t('end.error') || '❗ Something went wrong. Try again.');
            }
        } catch (error) {
            console.error(error);
            setSuccessMessage(t('end.serverError') || '⚠️ Server error. Please try later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.secondary, color: 'black' }}>
            <h2>{t('end.congrats')}</h2>
            <p>{t('end.earned')}</p>

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
                <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
                    {isSubmitting ? (t('form.sending') || 'Issuing badge...') : (t('form.submit') || 'Claim Badge')}
                </button>
            </form>

            {successMessage && <p style={{ marginTop: '1rem' }}>{successMessage}</p>}
        </section>
    );
};

export default EndSection;
