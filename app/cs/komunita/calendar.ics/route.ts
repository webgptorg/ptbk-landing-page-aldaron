import { createCommunityCalendarResponse } from '@/businesses/community/communityCalendar';
import { DEFAULT_COMMUNITY_ID } from '@/businesses/community/config';

export const dynamic = 'force-dynamic';

/** Existing calendar subscriptions continue reading the Developers feed at their original URL. */
export function GET(): Promise<Response> {
    return createCommunityCalendarResponse(DEFAULT_COMMUNITY_ID);
}
