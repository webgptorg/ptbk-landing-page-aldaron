import {
    createAdminContactGroups,
    createAdminJoinedContacts,
    findAdminContactGroup,
    formatAdminContactRecords,
    formatAdminWorkshopFeedbacks,
    formatAdminWorkshopParticipations,
    getAdminContactPhoneNumbers,
    listCommunityParticipantsWithoutContacts,
    normalizeAdminContactEmail,
    type AdminWorkshopFeedback,
    type AdminWorkshopParticipation,
} from '@/lib/admin/adminContactJoin';
import type { Contact } from '@/lib/contacts/Contact';
import { serializeAdminJoinedContactsAsCsv } from '@/lib/contacts/serializeContactsAsCsv';
import { serializeAdminJoinedContactsAsVcard } from '@/lib/contacts/serializeContactsAsVcard';
import { describe, expect, it } from 'vitest';

function createContact(contactValues: Partial<Contact>): Contact {
    return {
        id: 1,
        createdAt: '2026-08-20T10:00:00.000Z',
        fullname: null,
        email: null,
        phone: null,
        userNote: null,
        isContacted: false,
        isWaitlisted: false,
        ourNote: null,
        userAgent: null,
        ipAddress: null,
        referrer: null,
        appName: null,
        placeName: null,
        url: null,
        ...contactValues,
    };
}

const WORKSHOP_PARTICIPATION: AdminWorkshopParticipation = {
    participantId: 'participant-1',
    workshopId: 'workshop-1',
    workshopKind: 'workshop',
    workshopTitle: 'Produkční kód s AI agenty',
    workshopStartsAt: '2026-08-20T17:00:00.000Z',
    workshopEndsAt: '2026-08-20T18:30:00.000Z',
    fullname: 'Jana Nováková',
    email: 'JANA+workshop@EXAMPLE.COM',
    connectedAt: '2026-08-20T16:55:00.000Z',
    lastSeenAt: '2026-08-20T18:25:00.000Z',
    activeDurationSeconds: 4_800,
    commentCount: 2,
    reactionCount: 5,
    upvoteCount: 3,
    isInteractionBanned: false,
    isTrusted: true,
};

const WORKSHOP_FEEDBACK: AdminWorkshopFeedback = {
    id: 'feedback-1',
    workshopId: WORKSHOP_PARTICIPATION.workshopId,
    workshopKind: WORKSHOP_PARTICIPATION.workshopKind,
    workshopTitle: WORKSHOP_PARTICIPATION.workshopTitle,
    workshopStartsAt: WORKSHOP_PARTICIPATION.workshopStartsAt,
    workshopEndsAt: WORKSHOP_PARTICIPATION.workshopEndsAt,
    participantId: WORKSHOP_PARTICIPATION.participantId,
    fullname: WORKSHOP_PARTICIPATION.fullname,
    email: WORKSHOP_PARTICIPATION.email,
    rating: 5,
    whatWasGood: 'Praktické ukázky.',
    whatWasBad: null,
    note: null,
    createdAt: '2026-08-20T18:31:00.000Z',
    updatedAt: '2026-08-20T18:31:00.000Z',
};

describe('admin contact joining', () => {
    it('normalizes case and plus tags only for the admin identity join', () => {
        expect(normalizeAdminContactEmail(' Example+newsletter@EXAMPLE.com ')).toBe('example@example.com');
        expect(normalizeAdminContactEmail('EXAMPLE@EXAMPLE.COM')).toBe('example@example.com');
        expect(normalizeAdminContactEmail('not an email')).toBeNull();
        expect(normalizeAdminContactEmail(null)).toBeNull();
    });

    it('groups duplicate Contact rows and workshop attendance into one person without losing the source records', () => {
        const newestContact = createContact({
            id: 11,
            email: 'jana@example.com',
            fullname: 'Jana Nováková',
            userNote: 'Chci materiály.',
        });
        const olderContact = createContact({
            id: 7,
            email: 'JANA+lead@EXAMPLE.COM',
            phone: '+420 777 000 111',
            ourNote: 'Zavolat po workshopu.',
            isContacted: true,
        });

        const groups = createAdminContactGroups([newestContact, olderContact], [WORKSHOP_PARTICIPATION], [WORKSHOP_FEEDBACK]);
        const joinedContacts = createAdminJoinedContacts(groups);
        const contactGroup = findAdminContactGroup(groups, 'JANA+other@example.com');

        expect(groups).toHaveLength(1);
        expect(joinedContacts).toHaveLength(1);
        expect(joinedContacts[0]).toMatchObject({
            id: 11,
            fullname: 'Jana Nováková',
            phone: '+420 777 000 111',
            isContacted: false,
        });
        expect(contactGroup?.contacts.map((contact) => contact.id)).toEqual([11, 7]);
        expect(contactGroup?.workshopParticipations).toEqual([WORKSHOP_PARTICIPATION]);
        expect(contactGroup?.workshopFeedbacks).toEqual([WORKSHOP_FEEDBACK]);
        expect(getAdminContactPhoneNumbers(contactGroup)).toEqual(['+420 777 000 111']);
        expect(formatAdminContactRecords(contactGroup)).toContain('Our note: Zavolat po workshopu.');
        expect(formatAdminWorkshopParticipations(contactGroup)).toContain('Produkční kód s AI agenty');
        expect(formatAdminWorkshopParticipations(contactGroup)).toContain('Participant email: JANA+workshop@EXAMPLE.COM');
        expect(formatAdminWorkshopParticipations(contactGroup)).toContain('Comments: 2');
        expect(formatAdminWorkshopParticipations(contactGroup)).toContain('Reactions: 5');
        expect(formatAdminWorkshopParticipations(contactGroup)).toContain('Comment upvotes: 3');
        expect(formatAdminWorkshopFeedbacks(contactGroup)).toContain('Rating: 5/5');
    });

    it('never groups unrelated source rows that are missing an e-mail address', () => {
        const groups = createAdminContactGroups(
            [createContact({ id: 1 }), createContact({ id: 2 })],
            [{ ...WORKSHOP_PARTICIPATION, participantId: 'participant-without-email', email: '' }],
        );

        expect(groups).toHaveLength(3);
        expect(createAdminJoinedContacts(groups).map((contact) => contact.id)).toEqual([1, 2]);
    });

    it('shows one separate directory entry per community participant without adding them to lead exports', () => {
        const promptbookParticipation = {
            ...WORKSHOP_PARTICIPATION,
            workshopKind: 'community' as const,
            workshopId: 'promptbook-room',
            workshopTitle: 'Promptbook',
        };
        const groups = createAdminContactGroups([createContact({ email: 'existing@example.com' })], [
            promptbookParticipation,
            { ...promptbookParticipation, participantId: 'repeat-session', email: 'jana@example.com' },
            {
                ...promptbookParticipation, participantId: 'developers-session', email: 'Jana+dev@example.com',
                workshopId: 'developers-room', workshopTitle: 'Vývojáři',
            },
            { ...promptbookParticipation, participantId: 'already-a-contact', email: 'existing+community@example.com' },
            { ...WORKSHOP_PARTICIPATION, participantId: 'workshop-only', email: 'workshop@example.com' },
        ]);

        expect(listCommunityParticipantsWithoutContacts(groups)).toEqual([{
            normalizedEmail: 'jana@example.com',
            fullname: 'Jana Nováková',
            email: 'JANA+workshop@EXAMPLE.COM',
            communityNames: ['Promptbook', 'Vývojáři'],
        }]);
        expect(createAdminJoinedContacts(groups).map(({ email }) => email)).toEqual(['existing@example.com']);
    });

    it('includes workshop attendance in both grouped contact export formats', () => {
        const groups = createAdminContactGroups(
            [
                createContact({
                    email: 'jana@example.com',
                    fullname: 'Jana Nováková',
                    phone: '+420 777 000 111',
                }),
            ],
            [WORKSHOP_PARTICIPATION],
            [WORKSHOP_FEEDBACK],
        );
        const joinedContacts = createAdminJoinedContacts(groups);

        const csv = serializeAdminJoinedContactsAsCsv(joinedContacts);
        const vcard = serializeAdminJoinedContactsAsVcard(joinedContacts);

        expect(csv).toContain('workshopParticipations');
        expect(csv).toContain('workshopFeedbacks');
        expect(csv).toContain('Produkční kód s AI agenty');
        expect(csv).toContain('Praktické ukázky.');
        expect(vcard).toContain('TEL;TYPE=CELL:+420 777 000 111');
        expect(vcard).toContain('Workshop participations');
        expect(vcard).toContain('Rating: 5/5');
    });
});
