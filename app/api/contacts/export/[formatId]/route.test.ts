import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getWorkshopDatabaseOrNullMock, getUnauthorizedResponseOrNullMock, loadAdminJoinedContactsMock } = vi.hoisted(() => ({
    getWorkshopDatabaseOrNullMock: vi.fn(),
    getUnauthorizedResponseOrNullMock: vi.fn(),
    loadAdminJoinedContactsMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({
    getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock,
}));

vi.mock('@/lib/admin/adminContactDatabase', () => ({
    loadAdminJoinedContacts: loadAdminJoinedContactsMock,
}));

vi.mock('@/lib/workshops/workshopDatabase', () => ({
    getWorkshopDatabaseOrNull: getWorkshopDatabaseOrNullMock,
}));

import { GET } from './route';

const NOVAK = {
    id: 1,
    fullname: 'Jan Novák',
    email: 'jan@example.com',
    isContacted: false,
    createdAt: '2026-07-01T10:00:00.000Z',
};

const CAPEK = {
    id: 2,
    fullname: 'Karel Čapek',
    phone: '+420123456789',
    isContacted: false,
    createdAt: '2026-07-15T10:00:00.000Z',
};

const ALREADY_ANSWERED = {
    id: 3,
    fullname: 'Božena Němcová',
    isContacted: true,
    createdAt: '2026-06-01T10:00:00.000Z',
};

const ONLINE_WORKSHOP_TERM = {
    slug: 'online-workshop-2026-08-26',
    startsAt: '2026-08-26T19:00:00+02:00',
};

/**
 * Let the database answer with the given contacts, in the order in which they are gathered
 */
function serveContacts(contacts: ReadonlyArray<Readonly<Record<string, unknown>>>): void {
    const joinedContacts = contacts.map(
        (contact) =>
            ({
                ...contact,
                contactGroup: {
                    normalizedEmail: typeof contact.email === 'string' ? contact.email.toLowerCase() : null,
                    contacts: [contact],
                    workshopParticipations: [],
                },
            }) as unknown as AdminJoinedContact,
    );

    loadAdminJoinedContactsMock.mockResolvedValue({ contacts: joinedContacts, errorMessage: null });
}

/**
 * Ask for one export exactly as the link which the dashboard opens in a new tab does
 */
function requestContactsExport(formatId: string, viewSearchParams = ''): Promise<Response> {
    const searchParams = `token=test-token${viewSearchParams === '' ? '' : `&${viewSearchParams}`}`;

    return GET(new NextRequest(`http://localhost/api/contacts/export/${formatId}?${searchParams}`), {
        params: Promise.resolve({ formatId }),
    });
}

function createWorkshopRegistrationSearchParams(): string {
    return new URLSearchParams({
        contacted: 'ANY',
        registrationTerm: JSON.stringify(ONLINE_WORKSHOP_TERM),
    }).toString();
}

describe('the export of the contacts served in a new tab', () => {
    beforeEach(() => {
        getWorkshopDatabaseOrNullMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReset();
        loadAdminJoinedContactsMock.mockReset();
        getUnauthorizedResponseOrNullMock.mockReturnValue(null);
        getWorkshopDatabaseOrNullMock.mockReturnValue({});
        serveContacts([CAPEK, NOVAK, ALREADY_ANSWERED]);
    });

    it('is refused without the admin token, which opens the dashboard itself', async () => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        );

        const response = await requestContactsExport('CSV');

        expect(response.status).toBe(401);
        expect(getWorkshopDatabaseOrNullMock).not.toHaveBeenCalled();
    });

    it('serves the CSV file of the contacts which the link asks for', async () => {
        const response = await requestContactsExport('CSV', 'search=%C4%8Dapek&contacted=ANY');
        const exportedFile = await response.text();

        expect(response.status).toBe(200);
        expect(exportedFile).toContain('Karel Čapek');
        expect(exportedFile).not.toContain('Jan Novák');
    });

    it('exports only the contact records registered for the requested event term', async () => {
        serveContacts([
            {
                ...NOVAK,
                fullname: 'Registrovaný člověk',
                isContacted: true,
                placeName: 'OnlineWorkshopRegistration',
                userNote: JSON.stringify({ selectedDateId: ONLINE_WORKSHOP_TERM.slug, participantCount: 1 }),
            },
            {
                ...CAPEK,
                fullname: 'Jiný termín',
                placeName: 'OnlineWorkshopRegistration',
                userNote: JSON.stringify({ selectedDateId: 'online-workshop-2026-09-02', participantCount: 1 }),
            },
            {
                ...ALREADY_ANSWERED,
                fullname: 'Stejná poznámka mimo registraci',
                placeName: 'Newsletter',
                userNote: JSON.stringify({ selectedDateId: ONLINE_WORKSHOP_TERM.slug, participantCount: 1 }),
            },
        ]);

        const response = await requestContactsExport('CSV', createWorkshopRegistrationSearchParams());
        const exportedFile = await response.text();

        expect(exportedFile).toContain('Registrovaný člověk');
        expect(exportedFile).not.toContain('Jiný termín');
        expect(exportedFile).not.toContain('Stejná poznámka mimo registraci');
    });

    it('serves the vCard file of the very same view', async () => {
        const response = await requestContactsExport('vcard', 'search=%C4%8Dapek&contacted=ANY');
        const exportedFile = await response.text();

        expect(response.status).toBe(200);
        expect(exportedFile).toContain('BEGIN:VCARD');
        expect(exportedFile).toContain('FN:Karel Čapek');
        expect(exportedFile).not.toContain('FN:Jan Novák');
    });

    it('serves the Book context of the very same view', async () => {
        const response = await requestContactsExport('book', 'search=%C4%8Dapek&contacted=ANY');
        const exportedFile = await response.text();

        expect(response.status).toBe(200);
        expect(exportedFile).toMatch(/^Contacts \d{4}-\d{2}-\d{2}/);
        expect(exportedFile).toContain('CONTACT Karel Čapek');
        expect(exportedFile).not.toContain('CONTACT Jan Novák');
    });

    it('sorts the exported contacts the way the link says', async () => {
        const response = await requestContactsExport('CSV', 'sortBy=fullname&sortDirection=ASCENDING');
        const exportedNames = (await response.text()).split('\r\n').slice(1, 3);

        expect(exportedNames[0]).toContain('Jan Novák');
        expect(exportedNames[1]).toContain('Karel Čapek');
    });

    // Note: A link without any parameter of the view is the default view of the dashboard, which are the leads nobody
    //       has answered yet
    it('leaves out the contacts which were already answered, exactly as the dashboard does by default', async () => {
        const exportedFile = await (await requestContactsExport('CSV')).text();

        expect(exportedFile).toContain('Jan Novák');
        expect(exportedFile).toContain('Karel Čapek');
        expect(exportedFile).not.toContain('Božena Němcová');
    });

    it('reads the contacts again on every request, so that reloading the tab is up to date', async () => {
        const firstExportedFile = await (await requestContactsExport('CSV')).text();
        expect(firstExportedFile).not.toContain('Alois Jirásek');

        serveContacts([{ ...NOVAK, id: 4, fullname: 'Alois Jirásek' }]);
        const secondExportedFile = await (await requestContactsExport('CSV')).text();

        expect(secondExportedFile).toContain('Alois Jirásek');
        expect(secondExportedFile).not.toContain('Karel Čapek');
    });

    it('is shown in the tab, kept out of every cache and saved under the name of its format', async () => {
        const response = await requestContactsExport('CSV');

        expect(response.headers.get('Content-Type')).toContain('text/plain');
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(response.headers.get('Content-Disposition')).toMatch(/^inline; filename="contacts-[\d-]+\.csv"$/);
    });

    it('keeps the Book extension when it is opened in a tab', async () => {
        const response = await requestContactsExport('BOOK');

        expect(response.headers.get('Content-Disposition')).toMatch(/^inline; filename="contacts-[\d-]+\.book"$/);
    });

    it('says that there is no such export instead of serving an empty one', async () => {
        const response = await requestContactsExport('xlsx');

        expect(response.status).toBe(404);
    });

    it('says that the contacts cannot be reached without the service role key', async () => {
        getWorkshopDatabaseOrNullMock.mockReturnValue(null);

        const response = await requestContactsExport('CSV');

        expect(response.status).toBe(503);
    });
});
