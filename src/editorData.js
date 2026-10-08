export function updateRecord(records, index, patch) {
    return records.map((record, i) => i === index ? { ...record, ...patch } : record);
}

export function updatePoint(records, index, field, pointIndex, value) {
    return updateRecord(records, index, {
        [field]: (records[index][field] || []).map((point, i) => i === pointIndex ? value : point),
    });
}

export function addPoint(records, index, field) {
    return updateRecord(records, index, { [field]: [...(records[index][field] || []), ''] });
}

export function removePoint(records, index, field, pointIndex) {
    return updateRecord(records, index, { [field]: (records[index][field] || []).filter((_, i) => i !== pointIndex) });
}
