import { useEffect, useState } from 'react';

export default function EditorImagePreview({ value, onRemove, label }) {
    const [fileUrl, setFileUrl] = useState('');
    useEffect(() => {
        if (!(value instanceof Blob)) { setFileUrl(''); return; }
        const url = URL.createObjectURL(value);
        setFileUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);
    const src = typeof value === 'string' ? value : fileUrl;
    if (!src) return null;
    return <div className="flex items-center gap-3">
        <img src={src} alt={`${label} preview`} className="w-28 h-20 object-cover rounded-lg border border-gray-200" />
        <button type="button" onClick={onRemove} className="text-sm text-rose-600 underline">Remove image</button>
    </div>;
}
