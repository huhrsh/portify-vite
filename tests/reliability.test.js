import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWebUrl, contactHref } from '../src/profileLinks.js';
import { getPublicSections, getSectionOrder, STANDARD_SECTIONS } from '../src/profileSections.js';
import { updateRecord, updatePoint, addPoint, removePoint } from '../src/editorData.js';
import { renderProfile } from '../server/render.js';

test('pasted URLs and legacy domain-only links normalize without double schemes', () => {
    assert.equal(normalizeWebUrl(' https://github.com/alex/work '), 'https://github.com/alex/work');
    assert.equal(normalizeWebUrl('github.com/alex/work'), 'https://github.com/alex/work');
    assert.equal(normalizeWebUrl('//example.com/demo'), 'https://example.com/demo');
    assert.equal(normalizeWebUrl('http://example.com'), 'http://example.com/');
    for (const input of ['', null, 'javascript:alert(1)', 'data:text/html,abc', 'file:///secret', 'https://', 'bad url', 'https://user:password@example.com']) {
        assert.equal(normalizeWebUrl(input), '', String(input));
    }
});

test('contact links are case-insensitive and preserve email/phone actions', () => {
    assert.equal(contactHref({ label: ' email ', value: ' alex@example.com ' }), 'mailto:alex@example.com');
    assert.equal(contactHref({ label: 'Phone', value: '+91 (123) 456-7890' }), 'tel:+911234567890');
    assert.equal(contactHref({ label: 'GitHub', value: 'github.com/alex' }), 'https://github.com/alex');
    assert.equal(contactHref({ label: 'Email', value: 'not-an-email' }), '');
    assert.equal(contactHref({ label: 'Website', value: 'javascript:alert(1)' }), '');
});

test('editor field, image and bullet operations leave saved records untouched', () => {
    const points = Object.freeze(['Original', 'Keep']);
    const original = Object.freeze({ projectTitle: 'Original title', image: 'original.png', points });
    const records = Object.freeze([original]);
    const edited = updateRecord(records, 0, { projectTitle: 'Draft title', image: 'new.png' });
    const editedPoints = updatePoint(records, 0, 'points', 0, 'Draft point');
    assert.equal(edited[0].projectTitle, 'Draft title');
    assert.deepEqual(editedPoints[0].points, ['Draft point', 'Keep']);
    assert.deepEqual(addPoint(records, 0, 'points')[0].points, ['Original', 'Keep', '']);
    assert.deepEqual(removePoint(records, 0, 'points', 0)[0].points, ['Keep']);
    assert.deepEqual(records, [{ projectTitle: 'Original title', image: 'original.png', points: ['Original', 'Keep'] }]);
    assert.notEqual(edited[0], original);
    assert.notEqual(editedPoints[0].points, points);
});

test('navigation preserves mixed ordering, appends new custom sections and drops deleted/duplicate IDs', () => {
    const user = {
        selectedSections: { projects: true, skills: true },
        navOrder: ['skills', 'old-custom', 'projects', 'skills', 'deleted'],
        customSections: [{ id: 'old-custom', title: 'Writing' }, { id: 'new-custom', title: 'Art' }],
    };
    assert.deepEqual(getPublicSections(user).map(section => section.id), ['skills', 'old-custom', 'projects', 'new-custom']);
    assert.deepEqual(getSectionOrder({ ...user, customSections: [] }), ['skills', 'projects', ...STANDARD_SECTIONS.filter(id => !['skills', 'projects'].includes(id))]);
    assert.deepEqual(getPublicSections({ customSections: [{ id: 'only', title: 'Work' }] }), [{ id: 'only', label: 'Work', to: 'custom/only' }]);
    assert.deepEqual(getPublicSections({ selectedSections: { skills: true }, sectionOrder: ['skills', 'education'] }).map(section => section.id), ['skills']);
});

test('server and client navigation use the same saved mixed order', () => {
    const user = { username: 'alex', name: 'Alex', selectedSections: { skills: true, projects: true }, navOrder: ['skills', 'writing', 'projects'], customSections: [{ id: 'writing', title: 'Writing & art' }] };
    const html = renderProfile('<html><head></head><body><div id="root"></div></body></html>', user, '/alex', 'https://example.com');
    assert.ok(html.indexOf('/alex/skills') < html.indexOf('/alex/custom/writing'));
    assert.ok(html.indexOf('/alex/custom/writing') < html.indexOf('/alex/projects'));
    assert.match(html, /Writing &amp; art/);
});
