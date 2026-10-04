import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderProfile } from '../server/render.js';
import { decodeFields, queryUsers } from '../server/firestore.js';
import page from '../api/page.js';
import sitemap from '../api/sitemap.js';

const user = { username: 'alice', name: 'Alice <script>alert(1)</script>', about: 'Developer & designer', profession: 'Engineer', websiteStatus: 'active', selectedSections: { skills: true }, skills: [{ heading: 'Web', points: ['React'] }], email: 'private@example.com', totalViews: 42 };
function response() {
    return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, send(body) { this.body = body; return this; } };
}
function encode(value) {
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    if (value && typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
    return { integerValue: String(value) };
}
function row(data, id = '1') { return { document: { name: `projects/test/databases/(default)/documents/users/${id}`, fields: encode(data).mapValue.fields } }; }

test('initial HTML has unique metadata, visible section content, safe structured data and no private fields', async () => {
    const html = renderProfile(await readFile('index.html', 'utf8'), user, '/alice/skills', 'https://example.com');
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/name="description"/g) || []).length, 1);
    assert.match(html, /https:\/\/example.com\/alice\/skills/);
    assert.match(html, /<li>React<\/li>/);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /private@example.com|totalViews|<script>alert/);
    const schema = JSON.parse(html.match(/id="profile-schema">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.mainEntity.name, user.name);
    assert.equal(schema['@type'], 'ProfilePage');
});

test('Firestore decoder handles nested public fields', () => {
    assert.deepEqual(decodeFields(encode(user).mapValue.fields), user);
});

test('handlers enforce active profiles, status codes, noindex and paginated sitemap', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = 'test';
    process.env.VITE_FIREBASE_API_KEY = 'test';
    const previousFetch = globalThis.fetch;
    const previousError = console.error;
    try {
        let queries = [];
        globalThis.fetch = async (_url, options) => {
            queries.push(JSON.parse(options.body).structuredQuery);
            return { ok: true, json: async () => [row(user)] };
        };
        let res = response();
        await page({ url: '/api/page?path=/alice' }, res);
        assert.equal(res.code, 200);
        assert.equal(queries[0].where.compositeFilter.filters[1].fieldFilter.value.stringValue, 'active');
        res = response();
        await page({ url: '/api/page?path=/dashboard/general' }, res);
        assert.equal(res.headers['X-Robots-Tag'], 'noindex');
        assert.equal(res.code, 200);
        res = response();
        await page({ url: '/api/page?path=/alice/unknown' }, res);
        assert.equal(res.code, 404);
        globalThis.fetch = async () => ({ ok: true, json: async () => [row({ ...user, websiteStatus: 'inactive' })] });
        res = response();
        await page({ url: '/api/page?path=/alice' }, res);
        assert.equal(res.code, 404);
        globalThis.fetch = async () => ({ ok: true, json: async () => [] });
        res = response();
        await page({ url: '/api/page?path=/missing' }, res);
        assert.equal(res.code, 404);
        let batch = 0;
        globalThis.fetch = async (_url, options) => {
            const query = JSON.parse(options.body).structuredQuery;
            assert.equal(query.where.fieldFilter.value.stringValue, 'active');
            assert.deepEqual(query.select.fields, [{ fieldPath: 'username' }]);
            if (batch++ === 0) return { ok: true, json: async () => Array.from({ length: 500 }, (_, i) => row({ username: `user${i}` }, `${i}`)) };
            assert.equal(query.startAt.before, false);
            return { ok: true, json: async () => [row({ username: 'alice' })] };
        };
        res = response();
        await sitemap({}, res);
        assert.equal(res.code, 200);
        assert.equal((res.body.match(/<loc>/g) || []).length, 502);
        assert.doesNotMatch(res.body, /sign-in|sign-up/);
        console.error = () => {};
        globalThis.fetch = async () => ({ ok: false, status: 403 });
        res = response();
        await page({ url: '/api/page?path=/alice' }, res);
        assert.equal(res.code, 503);
        res = response();
        await sitemap({}, res);
        assert.equal(res.code, 503);
        await assert.rejects(queryUsers('username', 'alice'), /403/);
    } finally { globalThis.fetch = previousFetch; console.error = previousError; }
});
