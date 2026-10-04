function decode(value) {
    if ('stringValue' in value) return value.stringValue;
    if ('booleanValue' in value) return value.booleanValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return value.doubleValue;
    if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
    if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
    return null;
}
export function decodeFields(fields) {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));
}
export async function queryUsers(field, value, { usernamesOnly = false, after, limit = 500 } = {}) {
    const project = process.env.VITE_FIREBASE_PROJECT_ID;
    const key = process.env.VITE_FIREBASE_API_KEY;
    if (!project || !key) throw new Error('Firebase server configuration is missing');
    const structuredQuery = {
        from: [{ collectionId: 'users' }],
        where: field === 'username' ? { compositeFilter: { op: 'AND', filters: [
            { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
            { fieldFilter: { field: { fieldPath: 'websiteStatus' }, op: 'EQUAL', value: { stringValue: 'active' } } },
        ] } } : { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
        orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }],
        limit,
        ...(usernamesOnly ? { select: { fields: [{ fieldPath: 'username' }] } } : {}),
        ...(after ? { startAt: { values: [{ referenceValue: after }], before: false } } : {}),
    };
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(key)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredQuery }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Public Firestore query failed (${response.status})`);
    return (await response.json()).filter(row => row.document).map(row => ({
        name: row.document.name, data: decodeFields(row.document.fields || {}),
    }));
}
