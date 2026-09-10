import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import {
    formatCzechWorkshopDate,
    formatCzechWorkshopDuration,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import type { WorkshopOccurrenceTiming } from '@/lib/workshops/workshopPhase';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * The one line every offered term of the online workshop adds about itself: how long it takes
 *
 * Note: A visitor choosing a term on the landing page and a participant choosing one in the room read the very same
 *       sentence about it, so a term never promises two different lengths.
 */
export function createOnlineWorkshopTermNoteText(workshop: WorkshopOccurrenceTiming): string {
    return `${formatCzechWorkshopDuration(workshop.startsAt, workshop.endsAt)} + Q&A`;
}

/**
 * What the door of one term of the online workshop says about that very term
 *
 * Note: Every term is described by the words its own administration wrote, so the waiting room says what the term a
 *       participant picked is about rather than what the event as a whole is about.
 */
export function createOnlineWorkshopConnectionDetails(workshop: WorkshopSummary): WorkshopConnectionDetails {
    return {
        title: workshop.title,
        description: workshop.description,
        dateLabel: `${formatCzechWorkshopDate(workshop.startsAt)} · ${formatCzechWorkshopTime(workshop.startsAt)}`,
        durationLabel: formatCzechWorkshopDuration(workshop.startsAt, workshop.endsAt),
    };
}
