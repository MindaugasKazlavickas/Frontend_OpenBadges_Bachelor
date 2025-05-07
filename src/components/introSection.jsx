import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useLanguage } from '../context/languageContext';
import './introSection.css';

const introBlocks = [
    {
        type: 'paragraphWithHeading',
        heading: 'intro.heading',
        key: 'intro.welcome'
    },
    {
        type: 'paragraph',
        key: 'intro.goal'
    },
    {
        type: 'paragraphAndList',
        paragraphKey: 'intro.how',
        listItems: [
            'intro.list1.item1',
            'intro.list1.item2',
            'intro.list1.item3'
        ]
    },
    {
        type: 'paragraphAndList',
        paragraphKey: 'intro.points',
        listItems: [
            'intro.list2.item1',
            'intro.list2.item2',
            'intro.list2.item3'
        ]
    },
    {
        type: 'paragraphAndList',
        paragraphKey: 'intro.cta',
        listItems: [
            'intro.list3.item1',
            'intro.list3.item2',
            'intro.list3.item3'
        ]
    }
];


const IntroSection = () => {
    const { t } = useLanguage();
    const containerRef = useRef(null);
    const pathRef = useRef(null);
    const paraRefs = useRef([]);
    const [pathD, setPathD] = useState('');
    const wrapperRef = useRef(null);
    const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const buildPath = () => {
            if (!wrapperRef.current || !paraRefs.current.length) return;

            const leftX = svgSize.width*0.15;
            const rightX = svgSize.width*0.85;
            const blockHeight = window.innerHeight*0.6;
            const boxHeight = blockHeight;

            let d = '';
            paraRefs.current.forEach((_, i) => {
                const topY = i * blockHeight;
                const bottomY = topY + boxHeight;

                if (i === 0) {
                    d += `M${leftX} ${topY} `;
                }

                if (i % 2 === 0) {
                    d += `L${rightX} ${topY} L${rightX} ${bottomY} L${leftX} ${bottomY} `;
                } else {
                    d += `L${leftX} ${topY} L${leftX} ${bottomY} L${rightX} ${bottomY} `;
                }
            });

            setPathD(d);
        };

        setTimeout(buildPath, 0);
        window.addEventListener('resize', buildPath);
        return () => window.removeEventListener('resize', buildPath);
    }, [svgSize]);

    useEffect(() => {
        const updateSVGSize = () => {
            if (wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setSvgSize({ width: rect.width, height: rect.height });
            }
        };

        updateSVGSize();
        window.addEventListener('resize', updateSVGSize);
        return () => window.removeEventListener('resize', updateSVGSize);
    }, []);

    useEffect(() => {
        const updateScroll = () => {
            const path = pathRef.current;
            const wrapper = wrapperRef.current;
            if (!path || !wrapper) return;

            const total = path.getTotalLength();
            const rect = wrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const screenMid = windowHeight / 2;

            const progress = Math.min(Math.max((screenMid - rect.top)*1.13 / rect.height, 0), 1);

            path.style.strokeDasharray = total;
            path.style.strokeDashoffset = total * (1 - progress);
        };

        setTimeout(updateScroll, 50);
        window.addEventListener('scroll', updateScroll);
        window.addEventListener('resize', updateScroll);
        return () => {
            window.removeEventListener('scroll', updateScroll);
            window.removeEventListener('resize', updateScroll);
        };
    }, [pathD]);

    return (
        <div className="intro-section" ref={containerRef}>
            <div className="intro-wrapper" ref={wrapperRef}>
                <svg
                    className="zigzag-line"
                    width={svgSize.width}
                    height={svgSize.height}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >

                <path
                        ref={pathRef}
                        d={pathD}
                        stroke='#0B4DC7'
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>

                {introBlocks.map((block, index) => (
                    <div
                        key={block.key || block.paragraphKey}
                        ref={el => (paraRefs.current[index] = el)}
                        className="intro-block"
                    >
                        <div className="intro-content">
                            {block.type === 'paragraphWithHeading' ? (
                                <>
                                    <h2 className="intro-heading">{t(block.heading)}</h2>
                                    <div className="intro-paragraph">{t(block.key)}</div>
                                </>
                            ) : block.type === 'paragraph' ? (
                                <div className="intro-paragraph">{t(block.key)}</div>
                            ) : block.type === 'paragraphAndList' ? (
                                <>
                                    <h3 className="intro-paragraph">{t(block.paragraphKey)}</h3>
                                    <ul className="intro-list">
                                        {block.listItems.map((itemKey, i) => (
                                            <li key={i}>{t(itemKey)}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                            {index === introBlocks.length - 1 && (
                                <button
                                    className="hero-cta"
                                    onClick={() => {
                                        const anchor = document.getElementById('task-start-anchor');
                                        if (anchor) {
                                            anchor.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    {t('button.continue')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default IntroSection;