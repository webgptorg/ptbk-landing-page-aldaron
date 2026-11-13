import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTwentyContactApi, getTwentyContactRecordId } from './twentyContactApi';
import { getTwentySourceCategory, readTwentySourceGroups } from './twentySourceGrouping';
import type { TwentyContactSource } from './twentyContactSource';
const parentId = '327589e9-7912-4c05-a80b-dd4d05007a91';
const personId = '84553151-ae99-4948-8907-d67783408553';
const source: TwentyContactSource = { externalId: 'web:contact:123', email: 'jana@customer.invalid', fullname: 'Jana', phone: null,
    name: 'Site contact', sourceName: 'new-website-contact', sourceType: 'website', sourceUrl: 'https://www.ptbk.io/cs', occurredAt: '2026-11-14T12:00:00Z',
    details: { message: 'Enquiry', submissionEvidence: { purpose: 'request', marketingConsent: false } } };
const list = (table: string, records: unknown[]) => Response.json({ data: { [table]: records }, pageInfo: { hasNextPage: false, endCursor: null } });
afterEach(() => vi.unstubAllGlobals());
describe('optional, additive projections after primary delivery', () => {
    it('accepts only known categories and UUIDs without breaking contact settings', () => {
        expect(readTwentySourceGroups('not-json')).toBeUndefined();
        expect(readTwentySourceGroups('{"website":"wrong"}')).toBeUndefined();
        expect(readTwentySourceGroups(JSON.stringify({ website: parentId }))).toEqual({ website: parentId });
        expect(getTwentySourceCategory('workshop-feedback')).toBe('workshop');
        expect(getTwentySourceCategory('community-membership')).toBe('community');
        expect(getTwentySourceCategory('source-group')).toBeUndefined();
        expect(getTwentySourceCategory('unknown')).toBeUndefined();
    });
    function fixture(options: { parent?: string; personStage?: string; groupingFails?: boolean } = {}) {
        let record: Record<string, unknown> | null = null;
        const person: Record<string, unknown> = { id: personId, emails: { primaryEmail: source.email }, ptbkRelationshipStage: options.personStage ?? null, ptbkLastEnquiryAt: null, name: { firstName: 'User edited', lastName: 'Keep' } };
        const patches: { table: string; body: Record<string, unknown> }[] = [];
        vi.stubGlobal('fetch', async (url: URL, request: RequestInit) => {
            const body = request.body ? JSON.parse(String(request.body)) as Record<string, unknown> : {};
            if (request.method === 'GET' && url.pathname === '/rest/contactSources') return list('contactSources', record ? [record] : []);
            if (request.method === 'GET' && url.pathname === '/rest/people') return list('people', [person]);
            if (request.method === 'GET' && url.pathname === `/rest/people/${personId}`) return Response.json({ data: { person } });
            if (request.method === 'POST' && url.pathname === '/rest/contactSources') {
                record = { ...body, nadrazenyZdrojId: options.parent ?? null };
                return Response.json({ data: { createContactSource: record } });
            }
            if (request.method === 'PATCH' && url.pathname.startsWith('/rest/contactSources/')) {
                patches.push({ table: 'contactSources', body });
                if (options.groupingFails) return Response.json({}, { status: 403 });
                Object.assign(record!, body); return Response.json({ data: { updateContactSource: record } });
            }
            if (request.method === 'PATCH' && url.pathname === `/rest/people/${personId}`) {
                patches.push({ table: 'people', body }); Object.assign(person, body); return Response.json({ data: { updatePerson: person } });
            }
            throw new Error('Unexpected test request');
        });
        return { get record() { return record; }, person, patches };
    }
    it('groups a newly committed source without changing its provenance or a person name, and replays without writes', async () => {
        const f = fixture();
        const api = createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test', sourceGroups: { website: parentId }, operationalFrom: '2026-11-13T12:00:00Z' });
        await expect(api.deliverSource(source)).resolves.toBe('linked');
        expect(f.record?.id).toBe(getTwentyContactRecordId('source', source.externalId));
        expect(f.record?.nadrazenyZdrojId).toBe(parentId);
        expect(f.person.ptbkRelationshipStage).toBe('NEW_ENQUIRY');
        expect(f.person.name).toEqual({ firstName: 'User edited', lastName: 'Keep' });
        const writes = f.patches.length;
        await api.deliverSource(source);
        expect(f.patches).toHaveLength(writes);
    });
    it('preserves an existing manual group and qualification', async () => {
        const manual = '45bd0a2c-5f74-4402-a271-af7dc6ab65c8';
        const f = fixture({ parent: manual, personStage: 'QUALIFIED' });
        await createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test', sourceGroups: { website: parentId }, operationalFrom: '2026-11-13T12:00:00Z' }).deliverSource(source);
        expect(f.record?.nadrazenyZdrojId).toBe(manual);
        expect(f.person.ptbkRelationshipStage).toBe('QUALIFIED');
        expect(f.patches.every(({ body }) => !('ptbkRelationshipStage' in body) && !('nadrazenyZdrojId' in body))).toBe(true);
    });
    it('retains primary delivery if grouping is temporarily refused', async () => {
        const f = fixture({ groupingFails: true });
        const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            await expect(createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test', sourceGroups: { website: parentId } }).deliverSource(source)).resolves.toBe('linked');
            expect(f.record?.externalId).toBe(source.externalId);
            expect(log).toHaveBeenCalled();
        } finally { log.mockRestore(); }
    });
    it.each([
        { ...source, occurredAt: '2026-05-01T12:00:00Z' },
        { ...source, sourceType: 'workshop-registration' },
        { ...source, details: { submissionEvidence: { purpose: 'promptbook-newsletter' } } },
        { ...source, details: {} },
    ])('does not turn old or unrelated participation into a new enquiry', async (input) => {
        const f = fixture();
        await createTwentyContactApi({ url: new URL('https://crm.invalid'), key: 'test', operationalFrom: '2026-11-13T12:00:00Z' }).deliverSource(input);
        expect(f.person.ptbkRelationshipStage).toBeNull();
    });
});
