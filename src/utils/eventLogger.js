let sessionLogs = [];
let sectionIndexContext = null;

export const setCurrentSectionIndex = (index) => {
    sectionIndexContext = index;
};

export const logEvent = (type, payload = {}) => {
    const logEntry = {
        type,
        sectionIndex: sectionIndexContext,
        timestamp: new Date().toISOString(),
        ...payload,
    };
    sessionLogs.push(logEntry);
    console.log("📄 Event Logged:", logEntry); // 🔍 Debug line
};

export const getLogs = () => [...sessionLogs];
export const clearLogs = () => {
    sessionLogs = [];
    sectionIndexContext = null;
};
