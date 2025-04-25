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
            const response = await fetch('/api/issueBadge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                setSuccessMessage('Badge sent successfully! Check your email 📩');
            } else {
                setSuccessMessage('There was an error issuing the badge.');
            }
        } catch (error) {
            console.error(error);
            setSuccessMessage('Server error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.secondary, color: 'black' }}>
            <h2>{t('end.congrats')}</h2>
            <p>{t('end.earned')}</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                <div>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                    />
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
                    />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
                    {isSubmitting ? 'Issuing...' : 'Claim Your Badge'}
                </button>
            </form>

            {successMessage && <p style={{ marginTop: '1rem' }}>{successMessage}</p>}
        </section>
    );
};

export default EndSection;
