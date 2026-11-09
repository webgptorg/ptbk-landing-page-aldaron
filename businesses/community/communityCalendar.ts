import { COMMUNITIES, type CommunityId } from '@/businesses/community/config';
import { createIcalendarContent } from '@/lib/calendar/create-calendar-links';
import { createPublicEventCalendarEventOrNull } from '@/lib/events/eventCalendar';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';

/** Each subscription follows the same current publication assignments as the corresponding room. */
export async function createCommunityCalendarResponse(communityId: CommunityId): Promise<Response> {
    const { calendarFileName, calendarName } = COMMUNITIES[communityId];
    const workshops = await loadPublishedWorkshopSummaries(communityId);
    const calendarEvents = workshops.flatMap((workshop) => {
        const calendarEvent = createPublicEventCalendarEventOrNull(workshop);
        return calendarEvent === null ? [] : [calendarEvent];
    });

    return new Response(createIcalendarContent(calendarEvents, calendarName), {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `inline; filename="${calendarFileName}"`,
            'Cache-Control': 'no-store',
        },
    });
}
