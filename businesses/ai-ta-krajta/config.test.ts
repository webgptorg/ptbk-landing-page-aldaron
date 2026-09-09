import {
    AI_TA_KRAJTA_PLATFORMS,
    AI_TA_KRAJTA_RSS_FEED_PLATFORM,
    AI_TA_KRAJTA_RSS_FEED_URL,
} from '@/businesses/ai-ta-krajta/config';
import { describe, expect, it } from 'vitest';

describe('AI ta Krajta listening destinations', () => {
    it('offers the publisher feed to listeners using their own podcast application', () => {
        expect(AI_TA_KRAJTA_RSS_FEED_PLATFORM).toMatchObject({
            id: 'rssFeed',
            label: 'RSS feed',
            description: 'Přidejte si pořad do vlastní podcastové aplikace',
            url: AI_TA_KRAJTA_RSS_FEED_URL,
        });
        expect(AI_TA_KRAJTA_PLATFORMS).toContain(AI_TA_KRAJTA_RSS_FEED_PLATFORM);
    });
});
