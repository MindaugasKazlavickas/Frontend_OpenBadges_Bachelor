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

        try {
            const response = await fetch('https://your-render-backend-url.onrender.com/api/issueBadge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                setSuccessMessage('🎉 Badge sent! Check your email!');
            } else {
                setSuccessMessage('❗ Something went wrong. Try again.');
            }
        } catch (error) {
            console.error(error);
            setSuccessMessage('⚠️ Server error. Please try later.');
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
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                />
                <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                />
                <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
                    {isSubmitting ? 'Issuing badge...' : 'Claim Badge'}
                </button>
            </form>

            {successMessage && <p style={{ marginTop: '1rem' }}>{successMessage}</p>}
        </section>
    );
};

export default EndSection;
