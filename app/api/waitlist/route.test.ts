import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import { APP_NAME } from '@/config';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

// Note: Only the key with which the database is opened is mocked, so that the tests really go through the one place
//       which reaches the contacts and would notice if it stopped asking for the service role key.
vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { POST } from './route';

type ContactInsertDatabase = {
    readonly from: ReturnType<typeof vi.fn>;
    readonly insert: ReturnType<typeof vi.fn>;
};

/**
 * Build a minimal Supabase insert chain and keep the written values observable
 */
function createContactInsertDatabase(): ContactInsertDatabase {
    const single = vi.fn().mockResolvedValue({ data: { id: 37 }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));

    return { from, insert };
}

/**
 * The values which were really written into the database by the one insert of the request
 */
function getWrittenContact(database: ContactInsertDatabase): Record<string, unknown> {
    expect(database.insert).toHaveBeenCalledTimes(1);

    return database.insert.mock.calls[0][0] as Record<string, unknown>;
}

/**
 * One contact left in a public form of the site, as the browser sends it
 */
function createWaitlistRequest(
    contactSubmission: Readonly<Record<string, unknown>>,
    headers: Readonly<Record<string, string>> = {},
): NextRequest {
    return new NextRequest('http://localhost/api/waitlist', {
        method: 'POST',
        body: JSON.stringify(contactSubmission),
        headers: { 'Content-Type': 'application/json', ...headers },
    });
}

/**
 * A filled in form which is expected to be accepted, so that every test can change just the one thing it is about
 */
const VALID_CONTACT_SUBMISSION = {
    ...createContactNoticeFields('cs', true),
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    phone: '+420123456789',
    userNote: 'Interested in the workshop',
    placeName: 'newsletter-footer',
    url: 'https://example.com/cs',
    referrer: 'https://www.google.com/',
} as const;

describe('gathering a contact from a public form', () => {
    beforeEach(() => {
        createSupabaseServiceRoleClientMock.mockReset();
    });

    it('writes what the person filled in', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(createWaitlistRequest(VALID_CONTACT_SUBMISSION));

        expect(response.status).toBe(200);
        expect(database.from).toHaveBeenCalledWith('Contact');
        const { noticeVersion, noticeLanguage, marketingConsent, ...textFields } = VALID_CONTACT_SUBMISSION;
        expect(getWrittenContact(database)).toMatchObject(textFields);
        expect(getWrittenContact(database).submissionEvidence).toMatchObject({ version: noticeVersion, language: noticeLanguage, marketingConsent, emailVerified: false });
    });

    it('stores a field which was left empty as no value at all', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        await POST(createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, phone: '', userNote: '' }));

        expect(getWrittenContact(database)).toMatchObject({ phone: null, userNote: null });
    });

    // Note: The whole point of writing the contact on the server is that the browser cannot decide these fields
    it('decides itself who the visitor is and that the lead is not contacted yet', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        await POST(
            createWaitlistRequest(
                {
                    ...VALID_CONTACT_SUBMISSION,
                    isContacted: true,
                    ipAddress: '10.0.0.1',
                    userAgent: 'Forged browser',
                    appName: 'Forged app',
                    ourNote: 'Forged note',
                    createdAt: '2000-01-01T00:00:00.000Z',
                    id: 1,
                },
                { 'user-agent': 'Real browser', 'x-forwarded-for': '203.0.113.7, 70.41.3.18' },
            ),
        );

        const writtenContact = getWrittenContact(database);

        expect(writtenContact).toMatchObject({
            isContacted: false,
            ipAddress: '203.0.113.7',
            userAgent: 'Real browser',
            appName: APP_NAME,
        });
        expect(writtenContact).not.toHaveProperty('ourNote');
        expect(writtenContact).not.toHaveProperty('createdAt');
        expect(writtenContact).not.toHaveProperty('id');
    });

    it('rather stores no address at all than an address the database would refuse', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        await POST(createWaitlistRequest(VALID_CONTACT_SUBMISSION, { 'x-forwarded-for': 'unknown' }));

        expect(getWrittenContact(database)).toMatchObject({ ipAddress: null });
    });

    // Note: An e-mail address is the only thing which makes a lead worth anything, a form without one is not written
    const REFUSED_EMAIL_ADDRESSES: readonly { readonly description: string; readonly email?: unknown }[] = [
        // Note: `undefined` is left out by `JSON.stringify`, so the field really does not arrive at all
        { description: 'is missing', email: undefined },
        { description: 'is empty', email: '' },
        { description: 'is not an address', email: 'jana(at)example.com' },
        { description: 'is not a text at all', email: 42 },
    ];

    for (const { description, email } of REFUSED_EMAIL_ADDRESSES) {
        it(`refuses a form whose e-mail address ${description}`, async () => {
            const database = createContactInsertDatabase();
            createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

            const response = await POST(createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, email }));

            expect(response.status).toBe(400);
            expect(database.insert).not.toHaveBeenCalled();
        });
    }

    it('refuses a note which is longer than a contact may ever be', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, userNote: 'a'.repeat(10001) }),
        );

        expect(response.status).toBe(400);
        expect(database.insert).not.toHaveBeenCalled();
    });

    it('refuses a body which is not an object', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });

        const response = await POST(
            new NextRequest('http://localhost/api/waitlist', { method: 'POST', body: 'not json' }),
        );

        expect(response.status).toBe(400);
        expect(database.insert).not.toHaveBeenCalled();
    });

    // Note: Without the service role key the contacts are unreachable, and a lead which is not saved must be said out
    //       loud instead of being silently dropped as it used to be
    it('says that the contact was not saved when the service role key is missing', async () => {
        createSupabaseServiceRoleClientMock.mockReturnValue(null);

        const response = await POST(createWaitlistRequest(VALID_CONTACT_SUBMISSION));

        expect(response.status).toBe(503);
    });

    it('does not describe the inside of the database when the write fails', async () => {
        const single = vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'relation "Contact" does not exist' } });
        const from = vi.fn(() => ({ insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })) }));
        createSupabaseServiceRoleClientMock.mockReturnValue({ from });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const response = await POST(createWaitlistRequest(VALID_CONTACT_SUBMISSION));
        const answer = (await response.json()) as { error: string };

        expect(response.status).toBe(500);
        expect(answer.error).not.toContain('relation');
    });
    it('rejects newsletter submissions with no choice and accepts enquiries without marketing', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });
        expect((await POST(createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, marketingConsent: false }))).status).toBe(400);
        expect(database.insert).not.toHaveBeenCalled();
        expect((await POST(createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, placeName: 'new-website-contact', marketingConsent: false, submissionEvidence: { emailVerified: true } }))).status).toBe(200);
        expect(getWrittenContact(database).submissionEvidence).toMatchObject({ marketingConsent: false, emailVerified: false, consentText: null });
    });
    it('does not accept an outdated open form as evidence of current consent', async () => {
        const database = createContactInsertDatabase();
        createSupabaseServiceRoleClientMock.mockReturnValue({ from: database.from });
        expect((await POST(createWaitlistRequest({ ...VALID_CONTACT_SUBMISSION, noticeVersion: undefined }))).status).toBe(400);
        expect(database.insert).not.toHaveBeenCalled();
    });

});
