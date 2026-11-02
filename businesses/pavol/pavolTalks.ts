import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { pavolMediaAppearances } from './config-media';

/** Explicit attendance for external events, keyed by the same stable community-calendar slug. */
export const PAVOL_EVENT_PARTICIPATION: Readonly<Record<string, { readonly prominence?: number }>> = {};

export type PavolTalk = { readonly id: string; readonly title: string; readonly description: string; readonly href: string;
    readonly publishedAt?: string; readonly prominence?: number; readonly imageSrc?: string; readonly source: string; readonly textLanguage?: string };

export function getPavolTalks(workshops: readonly WorkshopSummary[], language: SupportedHomepageLanguage): PavolTalk[] {
    // Online workshop's published lecturer is Pavol. Other speakers' community events need explicit attendance.
    const events: PavolTalk[] = workshops.filter(workshop => workshop.isPublished && workshop.event !== null
        && (workshop.event.type === 'online-workshop' || Object.hasOwn(PAVOL_EVENT_PARTICIPATION, workshop.slug))).flatMap(workshop => {
        const event = createPublicEventCalendarEventOrNull(workshop);
        return event ? [{ id: workshop.slug, title: workshop.title, description: workshop.description, href: event.url,
            publishedAt: workshop.startsAt, source: 'Promptbook', textLanguage: 'cs',
            prominence: PAVOL_EVENT_PARTICIPATION[workshop.slug]?.prominence ?? 1 }] : [];
    });
    return [...events, ...pavolMediaAppearances[language].filter(item => item.kind === 'Přednáška' || item.kind === 'Talk').map(item => ({
        id: item.href, title: item.title, description: item.description, href: item.href, imageSrc: item.imageSrc,
        source: item.source, prominence: item.prominence, publishedAt: item.publishedAt, textLanguage: language,
    }))];
}
