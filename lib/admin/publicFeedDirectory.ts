import { AI_TA_KRAJTA_RSS_FEED_URL } from '@/businesses/ai-ta-krajta/config';
import { PROMPTBOOK_COMMUNITY_PODCAST } from '@/businesses/community/communityPodcast';
import { COMMUNITIES, COMMUNITY_IDS, DEFAULT_COMMUNITY_ID, LEGACY_COMMUNITY_PATH } from '@/businesses/community/config';
import { getArticlePodcastDefinition } from '@/lib/articles/podcast';
import { createCalendarSubscriptionLinks } from '@/lib/calendar/create-calendar-links';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';

const articlePodcasts = (['promptbook', 'personal'] as const).flatMap((publication) =>
    (['cs', 'en'] as const).map((language) => getArticlePodcastDefinition(language, publication)),
);

/** A directory of published subscriptions, built from the same addresses readers receive. */
export const PUBLIC_RSS_FEEDS = [
    PROMPTBOOK_COMMUNITY_PODCAST,
    ...articlePodcasts,
    { title: 'AI ta Krajta', feedUrl: AI_TA_KRAJTA_RSS_FEED_URL },
];

export const PUBLIC_CALENDAR_FEEDS = COMMUNITY_IDS.map((id) => {
    const { calendarName, calendarPath } = COMMUNITIES[id];
    const feedUrl = createAbsoluteUrl(calendarPath);
    return {
        title: calendarName,
        feedUrl,
        googleCalendarUrl: createCalendarSubscriptionLinks(feedUrl).googleCalendarUrl,
        legacyUrl: id === DEFAULT_COMMUNITY_ID ? createAbsoluteUrl(`${LEGACY_COMMUNITY_PATH}/calendar.ics`) : undefined,
    };
});
