import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { PROMPTBOOK_SOCIAL_PREVIEW_PALETTE } from '@/lib/metadata/social-preview-palette';

export const NEW_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/new', language: 'cs', title: 'Promptbook — AI, která se stará. Nejen odpovídá.',
    description: 'Dlouhodobé AI agendy na vašem serveru. Přehledná aplikace, partnerské nasazení a kalkulačka celkových nákladů i přínosů.',
    socialTitle: 'AI, která se stará. Nejen odpovídá.',
    socialPreviewImageAlt: 'Promptbook — dlouhodobé firemní agendy pod vaší kontrolou',
    isSocialPreviewImageGenerated: true,
    // New proposition and indicative commercial terms are public for review, not the replacement homepage yet.
    isIndexed: false,
};
export const PARTNERSHIP_PAGE_DEFINITION: PageMetadataDefinition = {
    ...NEW_PAGE_DEFINITION, path: '/new/partnership',
    title: 'Partnerství s Promptbookem — vaše služba, naše technologie',
    socialTitle: 'Vaši klienti. Vaše služby. Naše technologie.',
    description: 'Nasaďte klientům dlouhodobé AI agendy. Vy jste kontaktní místo, Promptbook technologický partner. Spočítejte si příjmy i náklady.',
    socialPreviewImageAlt: 'Promptbook pro agentury, freelancery a integrátory',
};
export const NEW_METADATA = createPageMetadata(NEW_PAGE_DEFINITION);
export const PARTNERSHIP_METADATA = createPageMetadata(PARTNERSHIP_PAGE_DEFINITION);
export const NEW_PREVIEW = createSocialPreviewOptions(NEW_PAGE_DEFINITION, {
    eyebrow: 'Firemní agendy pod vaší kontrolou', artwork: 'knowledge', paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
});
export const PARTNERSHIP_PREVIEW = createSocialPreviewOptions(PARTNERSHIP_PAGE_DEFINITION, {
    eyebrow: 'Pro agentury a integrátory', artwork: 'knowledge', paletteSeed: PROMPTBOOK_SOCIAL_PREVIEW_PALETTE,
});
