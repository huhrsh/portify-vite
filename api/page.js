import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { queryUsers } from '../server/firestore.js';
import { renderProfile, stripMetadata, escapeHtml } from '../server/render.js';
import { DEFAULT_SITE_URL, PROFILE_SECTIONS } from '../src/profileSeo.js';
const reserved = new Set(['dashboard', 'sign-in', 'sign-up', 'forgot-password', 'admin-dashboard', 'no-user']);
export default async function handler(req, res) {
    const origin = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
    const pathname = new URL(req.url, origin).searchParams.get('path') || '/';
    const parts = pathname.split('/').filter(Boolean);
    const template = await readFile(path.join(process.cwd(), 'dist/index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (reserved.has(parts[0])) {
        res.setHeader('X-Robots-Tag', 'noindex');
        return res.status(parts[0] === 'no-user' ? 404 : 200).send(stripMetadata(template).replace('</head>', '<meta name="robots" content="noindex"></head>'));
    }
    try {
        if (!/^[a-z0-9_-]+$/.test(parts[0] || '')) return missing();
        const [record] = await queryUsers('username', parts[0], { limit: 1 });
        const user = record?.data;
        const section = parts.slice(1).join('/');
        if (!user || user.websiteStatus !== 'active' || (section && !PROFILE_SECTIONS.includes(section) && !(user.customSections || []).some(s => `custom/${s.id}` === section))) return missing();
        return res.status(200).send(renderProfile(template, user, `/${parts.join('/')}`, origin));
    } catch (error) {
        console.error(error.message);
        res.setHeader('Retry-After', '60');
        return res.status(503).send('Profile temporarily unavailable. Please try again shortly.');
    }
    function missing() {
        res.setHeader('X-Robots-Tag', 'noindex');
        return res.status(404).send(stripMetadata(template).replace('</head>', '<meta name="robots" content="noindex"></head>').replace('<div id="root"></div>', `<div id="root"><h1>Profile not found</h1><a href="${escapeHtml(origin)}">Portify home</a></div>`));
    }
}
