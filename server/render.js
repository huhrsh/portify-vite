import { profileSeo } from '../src/profileSeo.js';
import { getPublicSections } from '../src/profileSections.js';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function stripMetadata(html) {
    return html.replace(/<title>[\s\S]*?<\/title>/gi, '')
        .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
        .replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi, '');
}
export function renderProfile(template, user, pathname, origin) {
    const seo = profileSeo(user, pathname, origin);
    const section = pathname.split('/').filter(Boolean).slice(1).join('/');
    const custom = (user.customSections || []).find(s => `custom/${s.id}` === section);
    const navigation = getPublicSections(user).map(s => `<a href="/${escapeHtml(user.username)}/${escapeHtml(s.to.split('/').map(encodeURIComponent).join('/'))}">${escapeHtml(s.label)}</a>`).join(' · ');
    // Only fields displayed by public portfolio pages are included; never serialize the user document.
    const visibleKeys = ['projectTitle', 'tagline', 'heading', 'points', 'role', 'company', 'level', 'data', 'institution', 'start', 'end', 'board', 'grade', 'degree', 'branch', 'title', 'description', 'organizer', 'issueDate', 'validity', 'name', 'label', 'value', 'body', 'cards', 'items'];
    function content(value) {
        if (Array.isArray(value)) return `<ul>${value.map(item => `<li>${content(item)}</li>`).join('')}</ul>`;
        if (value && typeof value === 'object') return visibleKeys.filter(k => value[k] != null).map(k => `<div>${content(value[k])}</div>`).join('');
        return escapeHtml(value);
    }
    const records = section === 'experience' ? user.experiences : user[section];
    const sectionContent = section ? `<section><h2>${escapeHtml(custom?.title || section)}</h2>${content(custom || (section === 'education' ? (records || []).filter(r => r.complete) : records) || [])}</section>` : '';
    const body = `<main style="max-width:900px;margin:60px auto;padding:24px;font-family:system-ui"><nav><a href="/${escapeHtml(user.username)}">${escapeHtml(user.username)}</a> · ${navigation}</nav><p>${escapeHtml(user.profession)}</p><h1>${escapeHtml(user.name || user.username)}</h1><p>${escapeHtml(user.about)}</p>${sectionContent}</main>`;
    const json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfilePage', url: seo.canonical, name: seo.title, mainEntity: { '@type': 'Person', name: user.name || user.username, ...(user.profession ? { jobTitle: user.profession } : {}), description: seo.description } }).replace(/</g, '\\u003c');
    const meta = `<title>${escapeHtml(seo.title)}</title><meta name="description" content="${escapeHtml(seo.description)}"><link rel="canonical" href="${escapeHtml(seo.canonical)}"><meta property="og:title" content="${escapeHtml(seo.title)}"><meta property="og:description" content="${escapeHtml(seo.description)}"><meta property="og:url" content="${escapeHtml(seo.canonical)}"><meta property="og:type" content="profile"><meta property="og:image" content="${escapeHtml(origin)}/abstract.png"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(seo.title)}"><meta name="twitter:description" content="${escapeHtml(seo.description)}"><script type="application/ld+json" id="profile-schema">${json}</script>`;
    const managedMeta = meta.replace(/<(meta|link|script)\b/g, '<$1 data-rh="true"');
    return stripMetadata(template).replace('</head>', `${managedMeta}</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`).replace('<noscript>You need to enable JavaScript to run this app.</noscript>', '');
}
