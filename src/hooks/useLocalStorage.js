import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
    const readValue = () => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    };
    const [storedValue, setStoredValue] = useState(readValue);

    useEffect(() => {
        setStoredValue(readValue());
    // The caller's fallback can be an object; reread only when its storage key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = (value) => {
        const v = value instanceof Function ? value(storedValue) : value;
        setStoredValue(v);
        try {
            window.localStorage.setItem(key, JSON.stringify(v));
        } catch { /* silent */ }
    };

    const clearValue = () => {
        setStoredValue(initialValue);
        try {
            window.localStorage.removeItem(key);
        } catch { /* silent */ }
    };

    return [storedValue, setValue, clearValue];
}
