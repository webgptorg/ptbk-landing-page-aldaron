import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import type { Metadata } from 'next';

/**
 * Definitions of the supporting pages which are not a landing page of any business
 *
 * Public supporting pages have their own cards; internal tools retain the brand fallback.
 */
export const BRANDING_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/branding',
    language: 'en',
    title: 'Promptbook brand kit',
    socialTitle: 'The Promptbook brand kit',
    isSocialPreviewImageGenerated: true,
    description: 'Promptbook logos, colors, typefaces, and approved messages for partners, press, and product teams.',
    socialPreviewImageAlt: 'Promptbook brand kit',
    keywords: ['Promptbook branding', 'logo', 'brand assets', 'press kit'],
    sitemapPriority: 0.4,
    sitemapChangeFrequency: 'yearly',
};

export const CONTACT_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/contact',
    language: 'en',
    title: 'Contact | Promptbook',
    socialTitle: 'Let’s talk about your AI',
    isSocialPreviewImageGenerated: true,
    description: 'Get in touch with the Promptbook team about AI agents for your business.',
    sitemapPriority: 0.6,
    sitemapChangeFrequency: 'yearly',
};

/**
 * Note: The privacy policy and the terms of business are published in every language of the site, so they describe
 *       themselves in `@/lib/legal/legalPageMetadata` next to their own text. Only `/privacy` and `/terms` stay here
 *       as redirects, and a redirect needs no metadata of its own.
 */
export const DATA_DELETION_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/data-deletion',
    language: 'en',
    title: 'Data Deletion Instructions | Promptbook',
    socialTitle: 'Your data. Your control.',
    isSocialPreviewImageGenerated: true,
    description:
        'How to request deletion of your personal data from Promptbook and from the third-party services it integrates with.',
    sitemapPriority: 0.3,
    sitemapChangeFrequency: 'yearly',
};

export const ADMIN_SHORTENER_PAGE_DEFINITION: PageMetadataDefinition = {
    path: ADMIN_SHORTENER_PATH,
    language: 'en',
    title: 'Link shortener | Promptbook',
    description: 'Internal tool for creating short Promptbook links with their own landing page and click tracking.',
    isIndexed: false,
};

export const THANK_YOU_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/dekujeme',
    language: 'cs',
    title: 'Děkujeme | Promptbook',
    socialTitle: 'Děkujeme. Těšíme se na setkání.',
    isSocialPreviewImageGenerated: true,
    description: 'Potvrzení rezervace strategického hovoru s týmem Promptbook.',
    isIndexed: false,
};

export const ADMIN_CONTACTS_PAGE_DEFINITION: PageMetadataDefinition = {
    path: '/admin/contacts',
    language: 'en',
    title: 'Contacts administration | Promptbook',
    description: 'Internal administration of the contacts collected by the Promptbook landing pages.',
    isIndexed: false,
};

export const BRANDING_METADATA: Metadata = createPageMetadata(BRANDING_PAGE_DEFINITION);
export const CONTACT_METADATA: Metadata = createPageMetadata(CONTACT_PAGE_DEFINITION);
export const DATA_DELETION_METADATA: Metadata = createPageMetadata(DATA_DELETION_PAGE_DEFINITION);
export const ADMIN_SHORTENER_METADATA: Metadata = createPageMetadata(ADMIN_SHORTENER_PAGE_DEFINITION);
export const THANK_YOU_METADATA: Metadata = createPageMetadata(THANK_YOU_PAGE_DEFINITION);
export const ADMIN_CONTACTS_METADATA: Metadata = createPageMetadata(ADMIN_CONTACTS_PAGE_DEFINITION);
