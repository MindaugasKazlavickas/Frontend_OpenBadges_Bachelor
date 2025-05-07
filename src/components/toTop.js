import {useEffect, useState} from "react";
import './toTop.css';
import toTop from '../assets/toTop.png';

export const BackToTopButton = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 500);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return visible ? (
        <button
            className={`back-to-top ${visible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <img className="toTopImage" src={toTop} alt="Back to top" />
        </button>
    ) : null;
};