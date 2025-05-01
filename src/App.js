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

const sectionData = [
    { id: 'section1', headerKey: 'section.heading1' },
    { id: 'section2', headerKey: 'section.heading2' },
    { id: 'section3', headerKey: 'section.heading3' },
    { id: 'section4', headerKey: 'section.heading4' },
    { id: 'section5', headerKey: 'section.heading5' },
];

const App = () => {
    const [unlockedSections, setUnlockedSections] = useState([0]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--secondary-color', theme.colors.secondary);
        root.style.setProperty('--background-color', theme.colors.background);
    }, []);

    const unlockSection = (index) => {
        setUnlockedSections((prev) =>
            prev.includes(index + 1) ? prev : [...prev, index + 1]
        );
    };

    return (
        <LanguageProvider>
            <HeroSection />
            <div id="task-start-anchor" style={{ height: '1px' }}></div>
            <TaskSectionHeader
                activeIndex={Math.max(...unlockedSections)}
                totalSections={sectionData.length}
            />
            {sectionData.map((section, i) => (
                <TaskSection
                    key={section.id}
                    headerKey="task.metadata"
                    sectionIndex={i}
                    totalSections={sectionData.length}
                    isLocked={!unlockedSections.includes(i)}
                    onUnlock={() => unlockSection(i)}
                    promptKey={`task.section${i + 1}.description`}
                    longHelpKey={`task.section${i + 1}.longHelp`}
                >
                    {i === 0 ? (
                        <CardSortTask
                        onScoreUpdate={(score) => console.log('Score updated:', score)}
                        onUnlock={() => unlockSection(i)}
                        sectionIndex={i}
                    />
                    ) : i === 1 ? (
                        <MetadataTask onUnlock={() => unlockSection(i)} />
                    ) : i === 2 ? (
                        <ScenarioTask onUnlock={() => unlockSection(i)} />
                    ) : i === 3 ? (
                        <BadgeMergeTask onUnlock={() => unlockSection(i)} />
                    ) : (
                        <SlidingTask onUnlock={() => unlockSection(i)} />
                    )}
                </TaskSection>
            ))}
            {unlockedSections.includes(sectionData.length) && <EndSection />}
        </LanguageProvider>
    );
};

export default App;
