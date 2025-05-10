let sessionLogs = [];
let sectionIndexContext = null;

export const logEvent = (type, payload = {}) => {
    const logEntry = {
        type,
        timestamp: new Date().toISOString(),
        ...payload,
    };
    sessionLogs.push(logEntry);
    console.log("📄 Event Logged:", logEntry);
};

export const getLogs = () => [...sessionLogs];
export const clearLogs = () => {
    sessionLogs = [];
    sectionIndexContext = null;
};
