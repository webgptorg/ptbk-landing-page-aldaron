import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import {
    COMMUNITY_MEMBERSHIP_PATH,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
} from './communityMembershipConfig';
import { formatCommunityMembershipPrice } from './communityMembershipPrice';

const CURRENT_PAID_MEMBERSHIP_PRICE_LABEL = formatCommunityMembershipPrice(
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
);

export const COMMUNITY_MEMBERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    path: COMMUNITY_MEMBERSHIP_PATH,
    language: 'cs',
    title: `AI webináře a záznamy | ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně`,
    socialTitle: `Živě zdarma. Záznamy za ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně.`,
    description:
        `Živě se připojíte zdarma. Členství za ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně odemkne záznamy, archiv, materiály a přednostní dotazy.`,
    socialDescription:
        `Živé AI webináře jsou zdarma. Za ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně získáte záznamy, archiv, materiály a přednostní dotazy.`,
    socialPreviewImageAlt: `Členství v komunitě Vývojáři: záznamy a materiály za ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně.`,
    isSocialPreviewImageGenerated: true,
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'monthly',
};

export const COMMUNITY_MEMBERSHIP_METADATA: Metadata = {
    ...createPageMetadata(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION),
    // Personalized links may include an e-mail address. Even same-origin referrers therefore expose only the origin.
    referrer: 'origin',
};

export const COMMUNITY_MEMBERSHIP_SOCIAL_PREVIEW_OPTIONS = createSocialPreviewOptions(
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
    {
        eyebrow: 'Vývojáři',
        artwork: 'community',
        paletteSeed: {
            backgroundStart: '#061923',
            backgroundEnd: '#12384a',
            accent: '#7aebff',
            accentSoft: '#a78bfa',
        },
    },
);
