import React, {useEffect, useState} from 'react';
import { LanguageProvider } from './context/languageContext';
import HeroSection from './components/heroSection';
import TaskSection from './components/taskSection';
import EndSection from './components/endSection';
import TaskSectionHeader from './components/taskSectionHeader';
import theme from './themes/theme';
import MetadataTask from "./tasks/metadataTask";
import BadgeMergeTask from "./tasks/mergeTask";
import CardSortTask from "./tasks/cardTask";
import ScenarioTask from "./tasks/scenarioTask";
import SlidingTask from "./tasks/slidingTask";
import { isTaskCompleted } from './utils/scoreUtils';
import IntroSection from './components/introSection';
import { BackToTopButton } from './components/toTop';
import { setScoreSync } from './utils/scoreUtils';
import {logEvent} from "./utils/eventLogger";

const sectionData = [
    {
        id: 'section1',
        headerKey: 'section.heading1',
        materials: [
            { type: 'header', key: 'task.section1.introTitle' },
            { type: 'paragraph', key: 'task.section1.introP1' },
            { type: 'paragraph', key: 'task.section1.introP2' },
            { type: 'header', key: 'task.section1.hardVsSoftHeader' },
            { type: 'paragraph', key: 'task.section1.hardSoftText' }
        ]
    },
    {
        id: 'section2',
        headerKey: 'section.heading2',
        materials: [
            { type: 'header', key: 'task.section2.metadataHeader' },
            { type: 'paragraph', key: 'task.section2.metadataP1' },
            { type: 'paragraph', key: 'task.section2.metadataP2' },
            { type: 'header', key: 'task.section2.metadataInclude' },
            { type: 'paragraph', key: 'task.section2.metadataP3' },
            { type: 'paragraph', key: 'task.section2.metadataP4' },
        ]
    },
    {
        id: 'section3',
        headerKey: 'section.heading3',
        materials: [
            { type: 'header', key: 'task.section3.badgeMeaningHeader' },
            { type: 'paragraph', key: 'task.section3.badgeP1' },
            { type: 'paragraph', key: 'task.section3.badgeP2' },
            { type: 'paragraph', key: 'task.section3.badgeP3' },
            { type: 'header', key: 'task.section3.badgeCredHeader' },
            { type: 'paragraph', key: 'task.section3.badgeP4' }
        ]
    },
    {
        id: 'section4',
        headerKey: 'section.heading4',
        materials: [
            { type: 'header', key: 'task.section4.mergeStructureHeader' },
            { type: 'paragraph', key: 'task.section4.mergeP1' },
            { type: 'paragraph', key: 'task.section4.mergeP2' },
            { type: 'paragraph', key: 'task.section4.mergeP3' },
            { type: 'header', key: 'task.section4.mergeDisplayHeader' },
            { type: 'paragraph', key: 'task.section4.mergeP4' }
        ]
    },
    {
        id: 'section5',
        headerKey: 'section.heading5',
        materials: [
            { type: 'header', key: 'task.section5.slidingHeader' },
            { type: 'paragraph', key: 'task.section5.slidingP1' },
            { type: 'paragraph', key: 'task.section5.slidingP2' },
            { type: 'paragraph', key: 'task.section5.slidingP3' },
            { type: 'header', key: 'task.section5.slidingHowHeader' },
            { type: 'paragraph', key: 'task.section5.slidingP4' }
        ]
    }
];

const taskIdMap = [
    'task.card-sort',
    'task.metadata',
    'task.scenario',
    'task.merging',
    'task.swipe'
];

const App = () => {
    const [unlockedSections, setUnlockedSections] = useState([0]);
    const [finalTaskDone, setFinalTaskDone] = useState(false);

    const [sessionId] = useState(() => {
        const existing = localStorage.getItem('sessionId');
        if (existing) return existing;
        const newId = crypto.randomUUID();
        localStorage.setItem('sessionId', newId);
        return newId;
    });

    const [sessionStart] = useState(() => Date.now());
    const [liveScore, setLiveScore] = useState(0);

    useEffect(() => {
        setScoreSync(setLiveScore);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--secondary-color', theme.colors.secondary);
        root.style.setProperty('--background-color', theme.colors.background);
    }, []);

    useEffect(() => {
        const firstIncompleteIndex = taskIdMap.findIndex((id) => !isTaskCompleted(id));
        if (firstIncompleteIndex >= 0) {
            const target = document.querySelector(
                `[data-task-id="${taskIdMap[firstIncompleteIndex]}"]`
            );
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    }, []);

    const unlockSection = (index) => {
        setUnlockedSections((prev) => {
            if (!prev.includes(index + 1)) {
                logEvent("sectionUnlocked", { sectionIndex: index + 1 });
                return [...prev, index + 1];
            }
            return prev;
        });
    };

    return (
        <LanguageProvider>
            <HeroSection />
            <div id="intro-start-anchor" style={{ height: '1px' }}></div>
            <IntroSection />
            <BackToTopButton />
            <div id="task-start-anchor" style={{ height: '1px' }}></div>
            <TaskSectionHeader
                activeIndex={Math.max(...unlockedSections)}
                totalSections={sectionData.length}
            />
            {sectionData.map((section, i) => (
                <TaskSection
                    key={section.id}
                    data-task-id={taskIdMap[i]}
                    headerKey={section.headerKey}
                    sectionIndex={i}
                    materials={section.materials}
                    totalSections={sectionData.length}
                    isLocked={i > 0 && !unlockedSections.includes(i)}
                    unlockedSections={unlockedSections}
                    onUnlock={() => unlockSection(i)}
                >
                    {i === 0 ? (
                        <CardSortTask onUnlock={() => unlockSection(i)} sectionIndex={i} />
                    ) : i === 1 ? (
                        <MetadataTask onUnlock={() => unlockSection(i)} sectionIndex={i} />
                    ) : i === 2 ? (
                        <ScenarioTask onUnlock={() => unlockSection(i)} sectionIndex={i} />
                    ) : i === 3 ? (
                        <BadgeMergeTask onUnlock={() => unlockSection(i)} sectionIndex={i} />
                    ) : (
                        <SlidingTask  onUnlock={() => {
                            unlockSection(i);
                            setFinalTaskDone(true);
                        }} sectionIndex={i} />
                    )}
                </TaskSection>
            ))}
            {finalTaskDone && <EndSection />}
        </LanguageProvider>
    );
};

export default App;
