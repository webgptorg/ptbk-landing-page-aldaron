import { COMMUNITY_CALENDAR_PATH } from '@/businesses/community/config';
import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';

/**
 * What the door of the community says, wherever it is offered
 *
 * Note: The connection form of the community and the invitation which leads to it from another room are the same door,
 *       so they say the same words rather than two variations of them.
 */
const CZECH_COMMUNITY_ENTRY_LABEL = 'Vstoupit do komunity';

/**
 * Keeps Czech community copy beside the Czech route. A future English route can provide its own factory without
 * duplicating the room mechanics or tying a translation to a database row.
 */
export function createCzechCommunityConnectionDetails(community: WorkshopDetails): WorkshopConnectionDetails {
    return {
        title: community.title,
        description: community.description,
        dateLabel: 'Kdykoli online',
        durationLabel: 'Stálý přístup',
        roomLabel: 'Komunita Promptbooku',
        connectionHeading: 'Připojit se do komunity',
        connectionDescription: 'Jméno se zobrazí u vašich komentářů. E-mail ostatní členové komunity neuvidí.',
        submitLabel: CZECH_COMMUNITY_ENTRY_LABEL,
        language: 'cs',
    };
}

/**
 * How the permanent community names its own sections
 *
 * Note: Every section of the community is named exactly once here, so an invitation into the community from elsewhere
 *       promises what is waiting there under the very name it carries once a member arrives.
 */
export const CZECH_COMMUNITY_ROOM_COPY = {
    roomSubtitle: 'Komunita Promptbooku',
    materialsTitle: 'Materiály komunity',
    projectsTitle: 'Projekty komunity',
    unavailableConnectionMessage: 'Připojení ke komunitě se nepodařilo ověřit.',
} as const;

export const CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY = {
    title: 'Termíny akcí Promptbooku',
    description:
        'Vyberte si termín v kalendáři nebo v kartách. Odkaz vás vezme přímo do místnosti workshopu se stejnými údaji, u placených akcí na jejich stránku.',
    emptyMessage: 'Zatím není publikovaný žádný termín. Další sem přidáme hned po zveřejnění.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
    calendarFeedUrl: createAbsoluteUrl(COMMUNITY_CALENDAR_PATH),
} as const;

/**
 * How a room which is no community itself invites its participants into the permanent one
 *
 * Note: What waits there is named by the sections of the community room rather than by words written here, so the
 *       invitation can never promise something the community itself calls differently.
 */
export const CZECH_COMMUNITY_INVITATION_COPY = {
    eyebrow: CZECH_COMMUNITY_ROOM_COPY.roomSubtitle,
    title: 'Pokračujte s námi v komunitě',
    description:
        'Workshop jednou skončí, komunita běží pořád. Chat zůstává otevřený, ostatní členové tam sdílejí, na čem pracují, a všechny další termíny najdete na jednom místě.',
    sectionTitles: [
        CZECH_COMMUNITY_ROOM_COPY.projectsTitle,
        CZECH_COMMUNITY_ROOM_COPY.materialsTitle,
        CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY.title,
    ],
    linkLabel: CZECH_COMMUNITY_ENTRY_LABEL,
} as const;
