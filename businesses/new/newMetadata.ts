import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';

export const NEW_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/new', language: 'cs', title: 'Promptbook — dřív jste AI úkolovali, teď pracuje pro vás',
    description: 'AI agendy pro firmy a agentury. Start za 19 USD na 30 dní, Business za 100 USD měsíčně za instanci. Spočítejte celý provoz i přínos.',
    socialTitle: 'Dřív jste AI úkolovali. Teď pracuje pro vás.',
    socialPreviewImageAlt: 'Promptbook — AI agendy, vlastní firemní kontext a partnerské nasazení',
    isSocialPreviewImageGenerated: true,
    // These Czech review routes do not replace the indexed homepages or constitute a checkout.
    isIndexed: false,
};
export const PARTNERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    ...NEW_PAGE_DEFINITION, path: '/new/partnership',
    title: 'Promptbook pro agentury — implementace, servis a partnerský podíl',
    socialTitle: 'Vaši klienti. Vaše služby. Naše technologie.',
    description: 'Nasaďte firmám AI agendy. Klient platí licenci Promptbooku a práci vám. Bez partnerského paušálu, s podílem 20 % z uhrazených licencí.',
    socialPreviewImageAlt: 'Promptbook pro agentury a freelancery — technologie a partnerská ekonomika',
};
export const NEW_METADATA = createPageMetadata(NEW_PAGE_DEFINITION);
export const PARTNERSHIP_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITION);
export const NEW_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITION, {
    eyebrow: 'AI agendy pro vás i vaše klienty', artwork: 'knowledge', paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
});
export const PARTNERSHIP_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITION, {
    eyebrow: 'Pro agentury a integrátory', artwork: 'knowledge', paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
});
