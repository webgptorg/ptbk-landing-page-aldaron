import { createCalendarFileName, type CalendarEvent } from '@/lib/calendar/create-calendar-links';
import { getFirstName } from '@/lib/getFirstName';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import {
    createWorkshopParticipantLink,
    createWorkshopSelectionPath,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';
import { getWorkshopExpectedEndsAtMilliseconds, type WorkshopOccurrenceTiming } from '@/lib/workshops/workshopPhase';

/**
 * Separator between the two sides of the meeting in the name of the event
 */
const WORKSHOP_MEETING_SEPARATOR = ' <> ';

/**
 * Everything a calendar needs to know about one occurrence of a workshop
 *
 * Note: A workshop loaded from the database satisfies this shape without carrying any participant data.
 */
export type WorkshopCalendarOccurrence = {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
};

type WorkshopCalendarEventOptions = {
    /**
     * Workshop the event is built from
     */
    readonly occurrence: WorkshopCalendarOccurrence;

    /**
     * Full name of the person who leads the workshop
     */
    readonly hostFullname: string;

    /**
     * Details of the participant the event is built for, which may still be incomplete
     */
    readonly participantIdentity: WorkshopParticipantIdentity;

    /**
     * Site-relative path of the participant room of the workshop
     */
    readonly participantPath: string;
};

/**
 * Names the event as a meeting of the participant with the host, so that both recognize it among the rest of their day
 *
 * @returns title such as `Karel <> Pavol - Produkční kód s AI agenty`, shortened whenever one of the names is missing
 */
export function createWorkshopCalendarEventTitle(
    workshopTitle: string,
    hostFullname: string,
    participantFullname: string,
): string {
    const meetingTitle = [getFirstName(participantFullname), getFirstName(hostFullname)]
        .filter((firstName) => firstName !== '')
        .join(WORKSHOP_MEETING_SEPARATOR);

    return meetingTitle === '' ? workshopTitle : `${meetingTitle} - ${workshopTitle}`;
}

/**
 * Moment a workshop is expected to end, taken from its usual length whenever its end is still left open
 *
 * Note: A calendar entry has to last for something, so an occurrence which will run until it is ended is written into
 *       the calendar of a participant with the length such a workshop usually takes.
 */
export function getWorkshopCalendarEndsAt(occurrence: WorkshopOccurrenceTiming): string {
    return occurrence.endsAt ?? new Date(getWorkshopExpectedEndsAtMilliseconds(occurrence)).toISOString();
}

/**
 * Turns a workshop into the event which a participant can put into their calendar
 *
 * Note: The event points to the participant room with the details of the participant prefilled, so that the link inside
 *       the calendar entry connects them without any typing. An incomplete identity falls back to the plain room, which
 *       still asks for the details in its connection form.
 * Note: A calendar application shows nothing but plain text, so the Markdown the description was written in is
 *       flattened rather than repeated with its marks in the middle of somebody's day.
 */
export function createWorkshopCalendarEvent({
    occurrence,
    hostFullname,
    participantIdentity,
    participantPath,
}: WorkshopCalendarEventOptions): CalendarEvent {
    const participantLink = createWorkshopParticipantLink(participantPath, participantIdentity, occurrence.slug);

    return {
        id: occurrence.slug,
        title: createWorkshopCalendarEventTitle(occurrence.title, hostFullname, participantIdentity.fullname),
        description: convertMarkdownToPlainText(occurrence.description),
        startsAt: occurrence.startsAt,
        endsAt: getWorkshopCalendarEndsAt(occurrence),
        url: createAbsoluteUrl(participantLink ?? createWorkshopSelectionPath(participantPath, occurrence.slug)),
    };
}

/**
 * Names the downloaded iCalendar file after the workshop it describes
 */
export function createWorkshopCalendarFileName(workshopSlug: string): string {
    return createCalendarFileName(workshopSlug);
}

/**
 * Whether a workshop is still ahead, which is the only time when putting it into a calendar is worth offering
 *
 * @param startsAt moment the workshop starts, as an ISO 8601 string
 * @param currentTime moment to compare against, as an ISO 8601 string - the server time keeps every participant in sync
 */
export function isWorkshopUpcoming(startsAt: string, currentTime: string): boolean {
    return Date.parse(startsAt) > Date.parse(currentTime);
}
