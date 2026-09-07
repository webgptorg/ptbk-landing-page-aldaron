import {
    countRegisteredParticipantsByTermId,
    getRegisteredParticipantCount,
    getWorkshopRegistrationTermIds,
    isWorkshopRegistrationForTerm,
    readWorkshopRegistration,
    REGISTRATION_TERM_MOMENT_LINE_PREFIX,
    REGISTRATION_TERM_SLUG_LINE_PREFIX,
    type WorkshopRegistrationTerm,
} from '@/lib/workshops/workshopRegistrations';
import { describe, expect, it } from 'vitest';

const ONLINE_WORKSHOP_TERM: WorkshopRegistrationTerm = {
    slug: 'online-workshop-2026-08-26',
    startsAt: '2026-08-26T19:00:00+02:00',
};

const AI_SUPERVIZE_MINI_TERM: WorkshopRegistrationTerm = {
    slug: 'ai-supervize-mini-2026-09-09',
    startsAt: '2026-09-09T13:00:00+02:00',
};

/**
 * The note the online workshop registration form writes, which names its term on a line of its own
 */
function createPlainTextRegistrationNote(term: WorkshopRegistrationTerm): string {
    return [
        'Online workshop registration',
        'Workshop: Produkční kód s AI agenty',
        `${REGISTRATION_TERM_SLUG_LINE_PREFIX} ${term.slug}`,
        `${REGISTRATION_TERM_MOMENT_LINE_PREFIX} středa 26. 8. 2026 19:00`,
    ].join('\n');
}

/**
 * The note the online workshop registration form wrote before the terms had addresses of their own, which names
 * nothing but the moment its term begins at
 */
const LEGACY_MOMENT_REGISTRATION_NOTE = [
    'Online workshop registration',
    `${REGISTRATION_TERM_MOMENT_LINE_PREFIX} čtvrtek 20. 8. 2026 19:00`,
].join('\n');

const LEGACY_MOMENT_TERM: WorkshopRegistrationTerm = {
    slug: 'online-workshop-2026-08-20',
    startsAt: '2026-08-20T19:00:00+02:00',
};

describe('reading a registration out of the note of a gathered contact', () => {
    it('reads the term and the size of a registration written as JSON', () => {
        expect(
            readWorkshopRegistration(
                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 }),
            ),
        ).toEqual({ termId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 });
    });

    it('reads a registration whose JSON follows a human-readable introduction', () => {
        const contactNote = [
            'AI Supervize Mini registration',
            'Workshop date: 9. 9. 2026',
            '',
            JSON.stringify({ selectedDateId: '2026-09-09', participantCount: 2 }),
        ].join('\n');

        expect(readWorkshopRegistration(contactNote)).toEqual({ termId: '2026-09-09', participantCount: 2 });
    });

    it('reads a registration which names its term on a line of plain text as one person', () => {
        expect(readWorkshopRegistration(createPlainTextRegistrationNote(ONLINE_WORKSHOP_TERM))).toEqual({
            termId: ONLINE_WORKSHOP_TERM.slug,
            participantCount: 1,
        });
    });

    it('reads a registration which names nothing but the moment its term begins at', () => {
        expect(readWorkshopRegistration(LEGACY_MOMENT_REGISTRATION_NOTE)).toEqual({
            termId: 'čtvrtek 20. 8. 2026 19:00',
            participantCount: 1,
        });
    });

    it('prefers the address of a term over the moment it begins at', () => {
        expect(readWorkshopRegistration(createPlainTextRegistrationNote(ONLINE_WORKSHOP_TERM))?.termId).toBe(
            ONLINE_WORKSHOP_TERM.slug,
        );
    });

    it('reads no registration out of a note which is none', () => {
        expect(readWorkshopRegistration(null)).toBeNull();
        expect(readWorkshopRegistration('')).toBeNull();
        expect(readWorkshopRegistration('{not a registration}')).toBeNull();
        expect(readWorkshopRegistration('Mám zájem o další termín.')).toBeNull();
        expect(readWorkshopRegistration(JSON.stringify({ leadType: 'Interested, but cannot attend' }))).toBeNull();
    });

    it('never searches the plain text of a payload which is no registration for a term', () => {
        // A lead who cannot attend says so in their payload, so the moment named in their note reserves nothing.
        const interestNote = [
            'AI Supervize Mini interest without current attendance',
            `${REGISTRATION_TERM_MOMENT_LINE_PREFIX} čtvrtek 20. 8. 2026 19:00`,
            '',
            JSON.stringify({ workshop: 'AI Supervize Mini', leadType: 'Interested, but cannot attend' }),
        ].join('\n');

        expect(readWorkshopRegistration(interestNote)).toBeNull();
    });

    it('refuses a registration which does not say how many people it signed up', () => {
        expect(readWorkshopRegistration(JSON.stringify({ selectedDateId: ONLINE_WORKSHOP_TERM.slug }))).toBeNull();
        expect(
            readWorkshopRegistration(
                JSON.stringify({ selectedDateId: ONLINE_WORKSHOP_TERM.slug, participantCount: 0 }),
            ),
        ).toBeNull();
        expect(readWorkshopRegistration(`${REGISTRATION_TERM_SLUG_LINE_PREFIX}   `)).toBeNull();
    });
});

describe('counting the people registered for a term', () => {
    it('adds up every registration made for one term, whatever shape it was written in', () => {
        const registeredParticipantCountByTermId = countRegisteredParticipantsByTermId(
            [
                createPlainTextRegistrationNote(ONLINE_WORKSHOP_TERM),
                createPlainTextRegistrationNote(ONLINE_WORKSHOP_TERM),
                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 3 }),
                'Mám zájem o další termín.',
                null,
            ].map(readWorkshopRegistration),
        );

        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, ONLINE_WORKSHOP_TERM)).toBe(2);
        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(3);
    });

    it('still counts a registration which named its term by the day it is held on', () => {
        const registeredParticipantCountByTermId = countRegisteredParticipantsByTermId([
            readWorkshopRegistration(JSON.stringify({ selectedDateId: '2026-09-09', participantCount: 4 })),
            readWorkshopRegistration(
                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 1 }),
            ),
        ]);

        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(5);
    });

    it('still counts a registration which named its term by the moment it begins at', () => {
        const registeredParticipantCountByTermId = countRegisteredParticipantsByTermId([
            readWorkshopRegistration(LEGACY_MOMENT_REGISTRATION_NOTE),
            readWorkshopRegistration(LEGACY_MOMENT_REGISTRATION_NOTE),
            readWorkshopRegistration(createPlainTextRegistrationNote(LEGACY_MOMENT_TERM)),
        ]);

        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, LEGACY_MOMENT_TERM)).toBe(3);
        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, ONLINE_WORKSHOP_TERM)).toBe(0);
    });

    it('counts nothing for a term nobody registered for', () => {
        expect(getRegisteredParticipantCount(new Map(), ONLINE_WORKSHOP_TERM)).toBe(0);
    });

    it('names a term by its slug, its Prague day and the moment it begins at, each exactly once', () => {
        expect(getWorkshopRegistrationTermIds(AI_SUPERVIZE_MINI_TERM)).toEqual([
            AI_SUPERVIZE_MINI_TERM.slug,
            '2026-09-09',
            'středa 9. 9. 2026 13:00',
        ]);
        expect(
            getWorkshopRegistrationTermIds({ slug: '2026-09-09', startsAt: AI_SUPERVIZE_MINI_TERM.startsAt }),
        ).toEqual(['2026-09-09', 'středa 9. 9. 2026 13:00']);
    });

    it('recognizes every historical identifier of a term when selecting its registration records', () => {
        expect(
            isWorkshopRegistrationForTerm(
                { termId: ONLINE_WORKSHOP_TERM.slug, participantCount: 1 },
                ONLINE_WORKSHOP_TERM,
            ),
        ).toBe(true);
        expect(
            isWorkshopRegistrationForTerm({ termId: '2026-08-26', participantCount: 1 }, ONLINE_WORKSHOP_TERM),
        ).toBe(true);
        expect(
            isWorkshopRegistrationForTerm(
                { termId: 'středa 26. 8. 2026 19:00', participantCount: 1 },
                ONLINE_WORKSHOP_TERM,
            ),
        ).toBe(true);
        expect(
            isWorkshopRegistrationForTerm(
                { termId: 'online-workshop-2026-09-02', participantCount: 1 },
                ONLINE_WORKSHOP_TERM,
            ),
        ).toBe(false);
    });
});
