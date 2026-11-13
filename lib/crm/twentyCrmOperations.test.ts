import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gzipSync } from 'node:zlib';
const mocks = vi.hoisted(() => ({ request: vi.fn(), list: vi.fn(), upload: vi.fn(), download: vi.fn() }));
vi.mock('./twentyContactApi', () => ({ createTwentyContactApi: () => ({ request: mocks.request, listRecords: mocks.list }) }));
vi.mock('@/lib/storage/objectStorage', () => ({ putStoredObject: mocks.upload, getObjectStorage: () => ({ download: mocks.download }) }));
import { backupTwentyCrm, canApplyTwentyCrmPatch, CRM_OPERATION_FIELDS, CRM_OPERATION_VERSION, ensureTwentyCrmOperationalFields, inspectTwentyCrm, loadTwentyCrmBackup, planTwentyCrmEnrichment, readHistoricalMetaContext, verifyTwentyCrmPreservation } from './twentyCrmOperations';
const settings = { url: new URL('https://crm.invalid'), key: 'test' };
const key = 'private/crm-operations/3f7fe7df-1c9c-4d47-b054-ce746d49d565.json.gz';
const objects = () => ['person', 'company', 'opportunity', 'ptbkPurchase'].map((nameSingular) => ({ id: nameSingular, nameSingular, namePlural: `${nameSingular}s`, labelPlural: nameSingular, fields: [] as { id: string; name: string; type: string }[] }));
function backup(metadata = objects(), overrides = {}) {
    const bytes = gzipSync(Buffer.from(JSON.stringify({ version: CRM_OPERATION_VERSION, createdAt: new Date().toISOString(), metadata, records: { people: [], companies: [], contactSources: [] }, unavailable: {}, ...overrides })));
    mocks.download.mockResolvedValue({ data: new Blob([bytes]), error: null });
}
describe('non-destructive CRM operations', () => {
    beforeEach(() => { vi.clearAllMocks(); mocks.list.mockResolvedValue([]); });
    it('rejects keys outside the private backup namespace before storage access', async () => {
        await expect(loadTwentyCrmBackup('messages/customer.json.gz')).rejects.toThrow('crm_invalid_backup_key');
        expect(mocks.download).not.toHaveBeenCalled();
    });
    it('does not mutate on inspection and reports refused optional objects', async () => {
        mocks.request.mockResolvedValue({ data: objects() });
        mocks.list.mockImplementation(async (table) => {
            if (table === 'opportunities') throw Object.assign(new Error('denied'), { status: 403 });
            return table === 'contactSources' ? [{ id: 'event', sourceType: 'website', details: '{"message":"private"}' }] : [];
        });
        const result = await inspectTwentyCrm(settings);
        expect(result.unavailable).toEqual({ opportunities: 403 });
        expect(result.sourceDetailKeys.website).toEqual(['message']);
        expect(JSON.stringify(result)).not.toContain('"message":"private"');
        expect(mocks.request.mock.calls.every(([, method]) => method === 'GET')).toBe(true);
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it('persists an immutable backup and verifies actual stored bytes', async () => {
        mocks.request.mockResolvedValue({ data: objects() });
        mocks.list.mockResolvedValue([{ id: 'keep', original: 'unchanged' }]);
        mocks.upload.mockImplementation(async (_key, bytes) => mocks.download.mockResolvedValue({ data: new Blob([bytes]), error: null }));
        const result = await backupTwentyCrm(settings);
        expect(result.verified).toBe(true);
        expect(result.key).toMatch(/^private\/crm-operations\/[a-f0-9-]{36}\.json\.gz$/);
        expect(result.counts.people).toBe(1);
        expect(mocks.upload).toHaveBeenCalledTimes(1);
    });
    it('refuses to continue when required record backup is unavailable', async () => {
        mocks.request.mockResolvedValue({ data: objects() });
        mocks.list.mockImplementation(async (table) => { if (table === 'people') throw Object.assign(new Error('denied'), { status: 403 }); return []; });
        await expect(backupTwentyCrm(settings)).rejects.toThrow('crm_required_backup_permission');
        expect(mocks.upload).not.toHaveBeenCalled();
    });
    it('validates all existing types before writing any new field', async () => {
        const metadata = objects();
        metadata[1].fields.push({ id: 'existing', name: 'ptbkRoles', type: 'TEXT' });
        backup(); mocks.request.mockResolvedValue({ data: metadata });
        await expect(ensureTwentyCrmOperationalFields(settings, key)).rejects.toThrow('crm_existing_field_type_mismatch');
        expect(mocks.request.mock.calls.every(([, method]) => method === 'GET')).toBe(true);
    });
    it('adds only missing fields, preserves existing definitions and has a zero-write replay', async () => {
        const metadata = objects(); backup();
        const existing = { id: 'existing', name: 'ptbkAgenda', type: 'TEXT', label: 'User chosen label' };
        metadata[0].fields.push(existing);
        mocks.request.mockImplementation(async (_path, method, body) => {
            if (method === 'GET') return { data: metadata };
            return { id: `field-${body.name}`, ...body };
        });
        vi.useFakeTimers();
        try {
            const first = ensureTwentyCrmOperationalFields(settings, key);
            await vi.runAllTimersAsync();
            const result = await first;
            expect(result.created).toHaveLength(CRM_OPERATION_FIELDS.length - 1);
            expect(result.recordWrites).toBe(0);
            expect(metadata[0].fields.find((f) => f.name === 'ptbkAgenda')).toBe(existing);
            mocks.request.mockClear();
            expect((await ensureTwentyCrmOperationalFields(settings, key)).created).toEqual([]);
            expect(mocks.request.mock.calls.every(([, method]) => method === 'GET')).toBe(true);
        } finally { vi.useRealTimers(); }
    });
    it('requires a recent verified backup even for additive schema setup', async () => {
        backup(objects(), { createdAt: '2026-01-01T00:00:00Z' });
        await expect(ensureTwentyCrmOperationalFields(settings, key)).rejects.toThrow('crm_fresh_backup_required');
        expect(mocks.request).not.toHaveBeenCalled();
    });
    it('extracts only explicit historical questionnaire fields with dates, without creating a current enquiry', () => {
        const details = { field_data: [
            { name: 's_čím_potřebujete_u_ai_nejvíce_pomoci?', values: ['automatizace_rutiny'] },
            { name: 'jak_velký_je_váš_tým?', values: ['11-50'] },
            { name: 'jaká_je_vaše_role_ve_firmě?', values: ['zakladatel/ceo'] },
        ], message: 'An unrelated private message must not become a qualification field' };
        expect(readHistoricalMetaContext(details)).toEqual({ need: 'automatizace_rutiny', teamSize: '11-50', role: 'zakladatel/ceo' });
        const original = { id: 'person', name: { firstName: 'User name' }, ptbkAgenda: 'Current confirmed agenda' };
        const plan = planTwentyCrmEnrichment({ people: [original], contactSources: [{ id: 'source', personId: 'person', externalId: 'meta:original', sourceType: 'meta-lead', occurredAt: '2026-05-02T12:00:00Z', details: JSON.stringify(details) }] }, {});
        expect(plan).toHaveLength(1);
        expect(plan[0].fields).toMatchObject({ ptbkHistoricalNeed: 'automatizace_rutiny', ptbkHistoricalAt: '2026-05-02T12:00:00Z', ptbkHistoricalEvidence: 'meta:original' });
        expect(plan[0].fields).not.toHaveProperty('ptbkRelationshipStage');
        expect(plan[0].fields).not.toHaveProperty('ptbkAgenda');
        expect(original.ptbkAgenda).toBe('Current confirmed agenda');
    });
    it('preserves manual groups and historical blocks and refuses a concurrent edit to the target field', () => {
        const plan = planTwentyCrmEnrichment({ people: [{ id: 'person', ptbkHistoricalNeed: 'Keep manual note' }],
            contactSources: [{ id: 'source', sourceType: 'website', nadrazenyZdrojId: 'manual' }], companies: [] }, { website: 'configured' });
        expect(plan).toEqual([]);
        const patch = { table: 'people', singular: 'person', record: { id: 'person', ptbkHistoricalNeed: null }, fields: { ptbkHistoricalNeed: 'old questionnaire' } };
        expect(canApplyTwentyCrmPatch({ id: 'person', ptbkHistoricalNeed: null }, patch)).toBe(true);
        expect(canApplyTwentyCrmPatch({ id: 'person', ptbkHistoricalNeed: 'Human just edited' }, patch)).toBe(false);
    });
    it('fills a newly recognized historical role only from the same recorded source and date', () => {
        const at = '2026-05-02T12:00:00Z';
        const source = { id: 'source', personId: 'person', externalId: 'meta:original', sourceType: 'meta-ads', occurredAt: at,
            details: JSON.stringify({ formAnswers: { aiNeed: 'routine', teamSize: '11-50', companyRole: 'founder' } }) };
        const person = { id: 'person', ptbkHistoricalNeed: 'Keep edited historical text', ptbkHistoricalTeamSize: '11-50',
            ptbkHistoricalAt: at, ptbkHistoricalEvidence: 'meta:original', ptbkHistoricalRole: null };
        expect(planTwentyCrmEnrichment({ people: [person], contactSources: [source] }, {}).map((patch) => patch.fields))
            .toEqual([{ ptbkHistoricalRole: 'founder' }]);
        expect(planTwentyCrmEnrichment({ people: [{ ...person, ptbkHistoricalEvidence: 'other:source' }], contactSources: [source] }, {})).toEqual([]);
        expect(planTwentyCrmEnrichment({ people: [{ ...person, ptbkHistoricalAt: '2026-05-03T12:00:00Z' }], contactSources: [source] }, {})).toEqual([]);
    });
    it('verifies original data while allowing additive fields and the approved previously-empty source parent', () => {
        const before = { version: CRM_OPERATION_VERSION, createdAt: '2026-11-13T10:00:00Z', metadata: [{ id: 'person', nameSingular: 'person', namePlural: 'people', labelPlural: 'People',
            fields: [{ id: 'person-name', name: 'name', label: 'Name', type: 'TEXT' }] }], unavailable: {}, records: {
            people: [{ id: 'person', name: 'Original name' }], contactSources: [{ id: 'source', sourceType: 'website', nadrazenyZdrojId: null }],
        } };
        const after = { ...before, records: { people: [{ id: 'person', name: 'Original name', ptbkHistoricalNeed: 'Added evidence' }],
            contactSources: [{ id: 'source', sourceType: 'website', nadrazenyZdrojId: 'web-group' }, { id: 'web-group', sourceType: 'source-group', nadrazenyZdrojId: null }],
        } };
        expect(verifyTwentyCrmPreservation(before, after, { website: 'web-group' })).toMatchObject({ verified: true, preservedRecords: 2, approvedParentFills: 1 });
        expect(verifyTwentyCrmPreservation(before, { ...after, records: { ...after.records, people: [{ id: 'person', name: 'Overwritten' }] } }, { website: 'web-group' }))
            .toMatchObject({ verified: false, changedFields: { 'people.name': 1 } });
        expect(verifyTwentyCrmPreservation(before, { ...after, records: { ...after.records, people: [] } }, { website: 'web-group' }))
            .toMatchObject({ verified: false, missingRecords: { people: 1 } });
        expect(verifyTwentyCrmPreservation(before, after, { website: 'different-group' }).verified).toBe(false);
        expect(verifyTwentyCrmPreservation(before, { ...after, metadata: [{ ...before.metadata[0], fields: [{ ...before.metadata[0].fields[0], type: 'NUMBER' }] }] }, { website: 'web-group' }).verified).toBe(false);
    });
});
