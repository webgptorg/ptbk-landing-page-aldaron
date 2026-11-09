import { afterEach, describe, expect, it, vi } from 'vitest';
import { readContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';
import { syncPromptbookBillingContact } from './billingContacts';

const { upsert, update } = vi.hoisted(() => ({ upsert: vi.fn(), update: vi.fn() }));
vi.mock('@/lib/contacts/contactsDatabase', () => ({ getContactsTableOrNull: () => ({ upsert, update }) }));

const order = {
    id: 'b8214bb6-35aa-4393-9171-4ed6d09303e6',
    plan: 'business',
    email: 'billing@example.com',
    country: 'CZ',
    company_id: '12345679',
    company_name: 'Příklad s.r.o.',
    vat_id: null,
    billing_address: { line1: 'Ulice 42', city: 'Praha', postal_code: '110 00', country: 'CZ' },
    created_at: '2026-11-09T11:00:00Z',
    first_paid_at: '2026-11-09T11:01:00Z',
    phone: null,
    onboarding_note: null,
    is_test: false,
} as const;

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('Promptbook paid order contact sync', () => {
    it('ignores test and zero-payment orders', async () => {
        await syncPromptbookBillingContact({ ...order, is_test: true });
        await syncPromptbookBillingContact({ ...order, first_paid_at: null });
        expect(upsert).not.toHaveBeenCalled();
    });

    it('records one source per order without granting marketing consent', async () => {
        vi.stubEnv('PROMPTBOOK_TWENTY_API_KEY', '');
        upsert.mockResolvedValue({ error: null });
        await syncPromptbookBillingContact(order);
        expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
            email: order.email,
            promptbookBillingOrderId: order.id,
            isWaitlisted: false,
            submissionEvidence: expect.objectContaining({
                purpose: 'order',
                receivedAt: order.created_at,
                consentText: null,
                marketingConsent: false,
            }),
        }), { onConflict: 'promptbookBillingOrderId', ignoreDuplicates: true });

        const evidence = upsert.mock.calls[0][0].submissionEvidence;
        expect(readContactSubmissionEvidence({
            noticeVersion: evidence.version, noticeLanguage: evidence.language, marketingConsent: false,
        }, evidence.source)).toBeNull();
    });

    it('reuses an existing contact and makes Twenty retries converge on the same company and purchase', async () => {
        vi.stubEnv('PROMPTBOOK_TWENTY_API_KEY', 'test-key');
        upsert.mockResolvedValue({ error: null });
        const records = new Set<string>();
        const existingPersonId = '8f339dc9-b64b-49b3-8230-6d0a827fd173';
        const writes: { method: string; path: string; body: Record<string, unknown> }[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: URL, options: RequestInit) => {
            expect(url.origin).toBe('https://crm.ptbk.io');
            if (url.pathname === '/rest/people') {
                return Response.json({ data: { people: [{
                    id: existingPersonId, emails: { primaryEmail: order.email }, companyId: 'existing-company',
                }] } });
            }
            if (options.method === 'POST' || options.method === 'PATCH') {
                const body = JSON.parse(String(options.body)) as Record<string, unknown>;
                writes.push({ method: options.method, path: url.pathname, body });
                records.add(`${url.pathname}/${body.id}`);
                return Response.json({});
            }
            return new Response(null, { status: records.has(url.pathname) ? 200 : 404 });
        }));

        await syncPromptbookBillingContact(order);
        await syncPromptbookBillingContact(order);

        expect(writes.map(({ path }) => path)).toEqual(['/rest/companies', '/rest/opportunities']);
        expect(writes[1].body).toMatchObject({
            id: order.id,
            stage: 'CUSTOMER',
            companyId: writes[0].body.id,
            pointOfContactId: existingPersonId,
        });

        const updateWhere = vi.fn().mockResolvedValue({ error: null });
        update.mockReturnValue({ eq: updateWhere });
        await syncPromptbookBillingContact({ ...order, phone: '+420 987 654 321', onboarding_note: 'Pilotní poznámka' }, {
            isOnboardingUpdate: true,
        });
        await syncPromptbookBillingContact(order, { isOnboardingUpdate: true });
        expect(updateWhere).toHaveBeenCalledWith('promptbookBillingOrderId', order.id);
        expect(writes[2]).toMatchObject({ method: 'POST', path: '/rest/notes' });
        expect(writes[3].body).toMatchObject({ noteId: writes[2].body.id, targetOpportunityId: order.id });
        expect(writes[4]).toMatchObject({ method: 'PATCH', path: `/rest/notes/${writes[2].body.id}`, body: { bodyV2: null } });
    });
});
