import React from 'react';
import { useLanguage } from '../context/languageContext';
import theme from '../themes/theme';

const EndSection = () => {
    const { t } = useLanguage();

    return (
        <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.secondary, color: 'black' }}>
            <h2>{t('end.congrats')}</h2>
            <p>{t('end.earned')}</p>
        </section>
    );
};

export default EndSection;
