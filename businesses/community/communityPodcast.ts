import { COMMUNITIES, PROMPTBOOK_COMMUNITY_PODCAST_PATH } from '@/businesses/community/config';
import { getArticlePodcastDefinition } from '@/lib/articles/podcast';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';

export const PROMPTBOOK_COMMUNITY_PODCAST = {
    ...getArticlePodcastDefinition('cs', 'promptbook'),
    title: 'Komunita Promptbook',
    description: 'Audioverze veřejných článků komunity Promptbook.',
    websiteUrl: createAbsoluteUrl(COMMUNITIES.promptbook.path),
    feedUrl: createAbsoluteUrl(PROMPTBOOK_COMMUNITY_PODCAST_PATH),
};
