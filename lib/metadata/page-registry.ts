import { AI_SUPERVIZE_MINI_PAGE_DEFINITION } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { AI_SUPERVIZE_PAGE_DEFINITION } from '@/businesses/ai-supervize/aiSupervizeMetadata';
import {
    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
    AI_TA_KRAJTA_PAGE_DEFINITION,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { COMMUNITY_MEMBERSHIP_PAGE_DEFINITION } from '@/businesses/community/membership/communityMembershipMetadata';
import { FOR_AGRO_PAGE_DEFINITION } from '@/businesses/for-agro/forAgroMetadata';
import { FOR_INDUSTRY_PAGE_DEFINITION } from '@/businesses/for-industry/forIndustryMetadata';
import { HACKATHON_FACTORY_PAGE_DEFINITION } from '@/businesses/hackathon-factory/hackathonFactoryMetadata';
import { HOMEPAGE_PAGE_DEFINITIONS } from '@/businesses/homepage/homepageMetadata';
import { ONLINE_WORKSHOP_PAGE_DEFINITION } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { PAVOL_PAGE_DEFINITIONS } from '@/businesses/pavol/pavolMetadata';
import { CITIES_CS_PAGE_DEFINITION } from '@/businesses/pro-mesta/citiesCsMetadata';
import { LEGAL_PAGE_DEFINITION_LIST } from '@/lib/legal/legalPageMetadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import {
    BRANDING_PAGE_DEFINITION,
    CONTACT_PAGE_DEFINITION,
    DATA_DELETION_PAGE_DEFINITION,
} from '@/lib/metadata/site-page-definitions';

/**
 * Every page which is meant to be found, in the order of importance
 *
 * Note: Pages which redirect elsewhere are missing on purpose, and so are internal pages such as the administration -
 *       those are marked as not indexed and would be filtered out anyway.
 */
const PAGE_METADATA_DEFINITIONS: readonly PageMetadataDefinition[] = [
    HOMEPAGE_PAGE_DEFINITIONS.cs,
    HOMEPAGE_PAGE_DEFINITIONS.en,
    CITIES_CS_PAGE_DEFINITION,
    FOR_AGRO_PAGE_DEFINITION,
    FOR_INDUSTRY_PAGE_DEFINITION,
    AI_SUPERVIZE_PAGE_DEFINITION,
    AI_SUPERVIZE_MINI_PAGE_DEFINITION,
    ONLINE_WORKSHOP_PAGE_DEFINITION,
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
    HACKATHON_FACTORY_PAGE_DEFINITION,
    AI_TA_KRAJTA_PAGE_DEFINITION,
    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
    PAVOL_PAGE_DEFINITIONS.cs,
    PAVOL_PAGE_DEFINITIONS.en,
    CONTACT_PAGE_DEFINITION,
    BRANDING_PAGE_DEFINITION,
    ...LEGAL_PAGE_DEFINITION_LIST,
    DATA_DELETION_PAGE_DEFINITION,
];

/**
 * Pages which search engines are allowed to list, which is exactly what belongs into the sitemap
 */
export const INDEXED_PAGE_METADATA_DEFINITIONS: readonly PageMetadataDefinition[] = PAGE_METADATA_DEFINITIONS.filter(
    (definition) => definition.isIndexed !== false,
);
