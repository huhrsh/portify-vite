export function normalizeWebUrl(value) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text || /\s/.test(text)) return '';
    // Reject explicit non-web schemes instead of turning them into relative links.
    if (/^[a-z][a-z\d+.-]*:/i.test(text) && !/^https?:\/\//i.test(text)) return '';
    try {
        const url = new URL(text.startsWith('//') ? `https:${text}` : /^https?:\/\//i.test(text) ? text : `https://${text}`);
        if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return '';
        return url.href;
    } catch {
        return '';
    }
}

export function contactHref(contact) {
    const value = typeof contact?.value === 'string' ? contact.value.trim() : '';
    const label = contact?.label?.trim().toLowerCase();
    if (label === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : '';
    if (label === 'phone') return /^[+\d\s().-]+$/.test(value) && /\d/.test(value) ? `tel:${value.replace(/[\s().-]/g, '')}` : '';
    return normalizeWebUrl(value);
}
