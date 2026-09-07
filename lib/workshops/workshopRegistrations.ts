import { formatCzechWorkshopMoment, formatPragueCalendarDate } from '@/lib/workshops/workshopDate';

/**
 * One registration a landing page wrote into the note of the contact it gathered
 *
 * Note: This is the audience which signed up for a term rather than the audience which really came to it. The people
 *       who entered the live room are counted from the room's own participants instead.
 */
export type WorkshopRegistration = {
    /**
     * The identifier the landing page recorded the term under
     */
    readonly termId: string;

    /**
     * How many people this one registration signed up, which is more than one whenever a group registers together
     */
    readonly participantCount: number;
};

/**
 * The term one registration is counted against
 *
 * Note: Both an administered term and a published event occurrence are read as this, so a registration is counted
 *       against the very same term wherever it is counted.
 */
export type WorkshopRegistrationTerm = {
    readonly slug: string;
    readonly startsAt: string;
};

/**
 * The field a registration written as JSON names its term in
 *
 * Note: The field keeps the name every stored registration was written with, so a registration written before the
 *       terms were administered from one place is still counted against the very term it was made for.
 */
const REGISTRATION_TERM_ID_FIELD_NAME = 'selectedDateId';

/**
 * The field a registration written as JSON says its size in
 */
const REGISTRATION_PARTICIPANT_COUNT_FIELD_NAME = 'participantCount';

/**
 * How a registration written as plain text names the address of its term
 *
 * Note: The registration forms write this very line, so the line a note is read from and the line a note is written
 *       with can never drift apart.
 */
export const REGISTRATION_TERM_SLUG_LINE_PREFIX = 'Workshop URL slug:';

/**
 * How a registration written as plain text names the moment its term begins at
 */
export const REGISTRATION_TERM_MOMENT_LINE_PREFIX = 'Date:';

/**
 * How a registration written as plain text can name the term it was made for, from the most exact way down
 *
 * Note: A registration written before the terms had addresses of their own names nothing but the moment it is held at,
 *       so those registrations keep being counted against that very term.
 */
const REGISTRATION_TERM_LINE_PREFIXES: readonly string[] = [
    REGISTRATION_TERM_SLUG_LINE_PREFIX,
    REGISTRATION_TERM_MOMENT_LINE_PREFIX,
];

/**
 * A registration which does not say how many people it signed up is one person
 */
const SINGLE_PARTICIPANT_COUNT = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonObject(value: string): Record<string, unknown> | null {
    try {
        const parsedValue: unknown = JSON.parse(value);

        return isRecord(parsedValue) ? parsedValue : null;
    } catch {
        return null;
    }
}

/**
 * The JSON one registration form wrote into the note of its contact, or `null` when the note carries none
 *
 * Note: A landing page which gathers more than registrations reads this to tell its own registrations apart from
 *       everything else it gathered.
 */
export function readWorkshopRegistrationNotePayload(contactNote: string): Record<string, unknown> | null {
    const directPayload = parseJsonObject(contactNote.trim());

    if (directPayload !== null) {
        return directPayload;
    }

    // Older registrations have a human-readable introduction before the JSON payload.
    const lastJsonPayloadStart = contactNote.lastIndexOf('\n{');

    return lastJsonPayloadStart === -1 ? null : parseJsonObject(contactNote.slice(lastJsonPayloadStart + 1));
}

/**
 * The registration one already read payload describes, or `null` when it describes something else the same landing
 * page gathered, such as somebody who is interested but cannot attend
 */
export function readWorkshopRegistrationFromPayload(
    registrationPayload: Readonly<Record<string, unknown>>,
): WorkshopRegistration | null {
    const termId = registrationPayload[REGISTRATION_TERM_ID_FIELD_NAME];
    const participantCount = registrationPayload[REGISTRATION_PARTICIPANT_COUNT_FIELD_NAME];

    if (
        typeof termId !== 'string' ||
        termId.trim() === '' ||
        typeof participantCount !== 'number' ||
        !Number.isSafeInteger(participantCount) ||
        participantCount < 1
    ) {
        return null;
    }

    return { termId, participantCount };
}

/**
 * What one line of a note says after the words naming it, or `null` when the note carries no such line
 */
function readNoteLineValue(noteLines: readonly string[], noteLinePrefix: string): string | null {
    for (const noteLine of noteLines) {
        if (!noteLine.startsWith(noteLinePrefix)) {
            continue;
        }

        const noteLineValue = noteLine.slice(noteLinePrefix.length).trim();

        if (noteLineValue !== '') {
            return noteLineValue;
        }
    }

    return null;
}

function readPlainTextWorkshopRegistration(contactNote: string): WorkshopRegistration | null {
    const noteLines = contactNote.split('\n').map((noteLine) => noteLine.trim());

    for (const termLinePrefix of REGISTRATION_TERM_LINE_PREFIXES) {
        const termId = readNoteLineValue(noteLines, termLinePrefix);

        if (termId !== null) {
            return { termId, participantCount: SINGLE_PARTICIPANT_COUNT };
        }
    }

    return null;
}

/**
 * The registration one gathered contact carries, or `null` when its note is no registration of a term at all
 *
 * Note: A landing page either writes its registration as a payload or names the term on a line of its own, and both
 *       shapes are read here, so a registration is understood wherever it was written.
 * Note: A note which carries a payload says everything about itself in that payload, so a payload which is no
 *       registration - somebody interested in another term, for one - is never searched for a term in its plain text
 *       as well.
 */
export function readWorkshopRegistration(contactNote: string | null): WorkshopRegistration | null {
    if (contactNote === null) {
        return null;
    }

    const registrationPayload = readWorkshopRegistrationNotePayload(contactNote);

    return registrationPayload === null
        ? readPlainTextWorkshopRegistration(contactNote)
        : readWorkshopRegistrationFromPayload(registrationPayload);
}

/**
 * Every identifier one term has ever been registered under
 *
 * Note: Registrations written before the terms were administered from one place name their term by the day or by the
 *       exact moment it is held at, so those registrations keep being counted against that very term.
 * Note: Two terms beginning at the very same moment would therefore share the registrations written for either of them
 *       before they had addresses of their own. Nothing else can be known about such a registration, and no term
 *       published since is identified this way at all.
 */
export function getWorkshopRegistrationTermIds(term: WorkshopRegistrationTerm): readonly string[] {
    return Array.from(
        new Set([term.slug, formatPragueCalendarDate(term.startsAt), formatCzechWorkshopMoment(term.startsAt)]),
    );
}

/**
 * Whether one parsed registration belongs to this term, whichever identifier the form recorded before or after terms
 * had their own stable addresses.
 */
export function isWorkshopRegistrationForTerm(
    registration: WorkshopRegistration | null,
    term: WorkshopRegistrationTerm,
): boolean {
    return registration !== null && getWorkshopRegistrationTermIds(term).includes(registration.termId);
}

/**
 * Add up the people every term was registered for, by the identifier each registration named its term with
 *
 * @param registrations the registrations read out of the gathered notes, where a note which is no registration reads
 *                      as `null` and is simply not counted
 */
export function countRegisteredParticipantsByTermId(
    registrations: readonly (WorkshopRegistration | null)[],
): ReadonlyMap<string, number> {
    const registeredParticipantCountByTermId = new Map<string, number>();

    for (const registration of registrations) {
        if (registration === null) {
            continue;
        }

        const registeredParticipantCount = registeredParticipantCountByTermId.get(registration.termId) ?? 0;
        registeredParticipantCountByTermId.set(
            registration.termId,
            registeredParticipantCount + registration.participantCount,
        );
    }

    return registeredParticipantCountByTermId;
}

/**
 * How many people registered for one term, whichever identifier their registration named it with
 */
export function getRegisteredParticipantCount(
    registeredParticipantCountByTermId: ReadonlyMap<string, number>,
    term: WorkshopRegistrationTerm,
): number {
    return getWorkshopRegistrationTermIds(term).reduce(
        (registeredParticipantCount, termId) =>
            registeredParticipantCount + (registeredParticipantCountByTermId.get(termId) ?? 0),
        0,
    );
}
