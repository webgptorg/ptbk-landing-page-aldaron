/**
 * @vitest-environment jsdom
 */

import { WorkshopRegistrationContacts } from '@/businesses/workshop-admin/WorkshopRegistrationContacts';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const EVENT_WORKSHOP: WorkshopAdminSummary = {
    id: 'workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop.',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 3,
    registeredParticipantCount: 12,
};

afterEach(cleanup);

function readRegistrationTermFromLink(link: HTMLAnchorElement): unknown {
    const linkUrl = new URL(link.href);
    const rawRegistrationTerm = linkUrl.searchParams.get('registrationTerm');

    return rawRegistrationTerm === null ? null : JSON.parse(rawRegistrationTerm);
}

const EXPORT_PATH_BY_LABEL: Readonly<Record<string, string>> = {
    CSV: '/api/contacts/export/CSV',
    vCard: '/api/contacts/export/VCARD',
    'AI context': '/api/contacts/export/BOOK',
};

describe('workshop registration contacts', () => {
    it('opens and exports the same term-filtered contacts view', () => {
        render(<WorkshopRegistrationContacts workshop={EVENT_WORKSHOP} />);

        expect(screen.getByText(/12 registrovaných/)).not.toBeNull();

        const contactsLink = screen.getByRole('link', { name: 'Otevřít kontakty' }) as HTMLAnchorElement;
        const contactsUrl = new URL(contactsLink.href);

        expect(contactsUrl.pathname).toBe('/admin/contacts');
        expect(contactsUrl.searchParams.get('contacted')).toBe('ANY');
        expect(readRegistrationTermFromLink(contactsLink)).toEqual({
            slug: EVENT_WORKSHOP.slug,
            startsAt: EVENT_WORKSHOP.startsAt,
        });

        for (const exportLabel of ['CSV', 'vCard', 'AI context']) {
            const exportLink = screen.getByRole('link', { name: exportLabel }) as HTMLAnchorElement;
            const exportUrl = new URL(exportLink.href);

            expect(exportUrl.pathname).toBe(EXPORT_PATH_BY_LABEL[exportLabel]);
            expect(exportUrl.searchParams.get('contacted')).toBe('ANY');
            expect(readRegistrationTermFromLink(exportLink)).toEqual({
                slug: EVENT_WORKSHOP.slug,
                startsAt: EVENT_WORKSHOP.startsAt,
            });
        }
    });

    it('does not offer contact records for a room which is no event term', () => {
        render(<WorkshopRegistrationContacts workshop={{ ...EVENT_WORKSHOP, event: null, registeredParticipantCount: null }} />);

        expect(screen.queryByText('Registrovaní na webu')).toBeNull();
    });
});
