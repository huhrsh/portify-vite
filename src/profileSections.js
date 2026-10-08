export const STANDARD_SECTIONS = ['education', 'projects', 'experience', 'certifications', 'skills', 'contacts'];

export function getSectionOrder(user) {
    const customs = Array.isArray(user?.customSections) ? user.customSections : [];
    const valid = new Set([...STANDARD_SECTIONS, ...customs.map(section => section.id)]);
    const saved = user?.navOrder?.length ? user.navOrder : user?.sectionOrder || [];
    return [...new Set([...saved, ...STANDARD_SECTIONS, ...customs.map(section => section.id)])].filter(id => valid.has(id));
}

export function getPublicSections(user) {
    const customMap = new Map((user?.customSections || []).map(section => [section.id, section]));
    return getSectionOrder(user).flatMap(id => {
        if (STANDARD_SECTIONS.includes(id)) return user?.selectedSections?.[id] ? [{ id, label: id, to: id }] : [];
        const section = customMap.get(id);
        return section ? [{ id, label: section.title || 'Custom', to: `custom/${section.id}` }] : [];
    });
}
