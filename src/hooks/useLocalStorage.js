import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const v = value instanceof Function ? value(storedValue) : value;
            setStoredValue(v);
            window.localStorage.setItem(key, JSON.stringify(v));
        } catch { /* silent */ }
    };

    const clearValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch { /* silent */ }
    };

    return [storedValue, setValue, clearValue];
}
