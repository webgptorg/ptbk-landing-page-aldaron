import type { CommunityDefinition } from '@/businesses/community/config';
import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';

export const CZECH_COMMUNITY_ENTRY_LABEL = 'Vstoupit do komunity';

export function createCzechCommunityConnectionDetails(
    definition: CommunityDefinition,
    community: WorkshopDetails,
): WorkshopConnectionDetails {
    return {
        title: community.title,
        description: community.description,
        isDescriptionMarkdown: true,
        dateLabel: 'Kdykoli online',
        durationLabel: 'Stálý přístup',
        roomLabel: definition.hasPaidMembership ? 'Komunita' : 'Komunita zdarma',
        connectionHeading: 'Připojit se do komunity',
        connectionDescription: 'Jméno se zobrazí u vašich komentářů. E-mail ostatní členové komunity neuvidí.',
        submitLabel: CZECH_COMMUNITY_ENTRY_LABEL,
        language: 'cs',
    };
}

export const CZECH_COMMUNITY_ROOM_COPY = {
    materialsTitle: 'Materiály komunity',
    projectsTitle: 'Projekty komunity',
    unavailableConnectionMessage: 'Připojení ke komunitě se nepodařilo ověřit.',
} as const;

export function createCzechCommunityWorkshopNavigationCopy(definition: CommunityDefinition) {
    return {
        title: 'Kalendář a workshopy',
        description: 'Termíny, podrobnosti a odkazy na jednotlivé akce.',
        emptyMessage: 'Zatím tu nejsou žádné termíny.',
        locale: 'cs-CZ',
        timeZone: 'Europe/Prague',
        calendarFeedUrl: createAbsoluteUrl(definition.calendarPath),
    } as const;
}
