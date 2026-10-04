import { queryUsers } from '../server/firestore.js';
import { escapeHtml } from '../server/render.js';
import { DEFAULT_SITE_URL } from '../src/profileSeo.js';
export default async function handler(req, res) {
    try {
        const origin = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
        const urls = [`${origin}/`];
        let after;
        while (true) {
            const rows = await queryUsers('websiteStatus', 'active', { usernamesOnly: true, after });
            for (const { data } of rows) if (/^[a-z0-9_-]+$/.test(data.username || '')) urls.push(`${origin}/${data.username}`);
            if (rows.length < 500) break;
            after = rows.at(-1).name;
            if (urls.length > 49000) throw new Error('Sitemap needs sharding before exceeding 50,000 URLs');
        }
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(urls)].map(url => `<url><loc>${escapeHtml(url)}</loc></url>`).join('')}</urlset>`);
    } catch (error) {
        console.error(error.message);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Retry-After', '60');
        return res.status(503).send('Sitemap temporarily unavailable');
    }
}
