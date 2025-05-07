const STORAGE_KEY = 'userSettings';

export const loadUserSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

export const saveUserSettings = (settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("storage"));
};

export const updateUserSetting = (key, value) => {
    const current = loadUserSettings();
    const updated = { ...current, [key]: value };
    saveUserSettings(updated);
};