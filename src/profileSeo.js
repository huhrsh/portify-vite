export const DEFAULT_SITE_URL = 'https://the-portify.vercel.app';
export const PROFILE_SECTIONS = ['education', 'projects', 'experience', 'certifications', 'skills', 'contacts'];
export function profileSeo(user, pathname, origin = DEFAULT_SITE_URL) {
    const name = user.name || user.username;
    const section = pathname.split('/').filter(Boolean).slice(1).join('/');
    const label = section.startsWith('custom/')
        ? (user.customSections || []).find(s => `custom/${s.id}` === section)?.title
        : PROFILE_SECTIONS.includes(section) ? section : '';
    return {
        title: `${name}${label ? ` — ${label}` : ''} — ${user.profession || 'Portfolio'} | Portify`,
        description: (user.about || `${name}'s ${user.profession || 'personal'} portfolio, built with Portify.`).replace(/\s+/g, ' ').trim().slice(0, 155),
        canonical: `${origin.replace(/\/$/, '')}/${encodeURIComponent(user.username)}${section ? `/${section.split('/').map(encodeURIComponent).join('/')}` : ''}`,
    };
}
