import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { LEGAL_PAGE_PATHS, type LegalDocumentKind } from '@/lib/legal/legalPagePaths';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

/**
 * How a legal page introduces itself in a search result
 */
type LegalPageMetadataTexts = {
    readonly title: string;
    readonly description: string;
};

/**
 * Search result wording of every legal page, in every language it is published in
 */
const LEGAL_PAGE_METADATA_TEXTS: Readonly<
    Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, LegalPageMetadataTexts>>>
> = {
    privacyPolicy: {
        cs: {
            title: 'Ochrana osobních údajů | Promptbook',
            description:
                'Jaké osobní údaje Promptbook zpracovává, proč je zpracovává, komu je předává a jak můžete uplatnit svá práva.',
        },
        en: {
            title: 'Privacy Policy | Promptbook',
            description:
                'Which personal data Promptbook processes, why it processes them, who it shares them with, and how you can exercise your rights.',
        },
    },
    termsAndConditions: {
        cs: {
            title: 'Obchodní podmínky | Promptbook',
            description:
                'Pravidla používání webu a služeb Promptbook, členství v komunitě, registrace na workshopy, platby a odstoupení od smlouvy.',
        },
        en: {
            title: 'Terms and Conditions | Promptbook',
            description:
                'The rules for using the Promptbook website and services, community membership, event registrations, payments, and withdrawal.',
        },
    },
};

/**
 * Relative importance of a legal page within the site
 *
 * Note: A legal page has to be findable, but it must never outrank a landing page.
 */
const LEGAL_PAGE_SITEMAP_PRIORITY = 0.3;

/**
 * Builds the definition of one legal page from the paths and the wording it shares with the rest of the site
 */
function createLegalPageDefinition(
    kind: LegalDocumentKind,
    language: SupportedHomepageLanguage,
): PageMetadataDefinition {
    const { title, description } = LEGAL_PAGE_METADATA_TEXTS[kind][language];

    return {
        path: LEGAL_PAGE_PATHS[kind][language],
        language,
        title,
        socialTitle: title.replace(' | Promptbook', ''),
        isSocialPreviewImageGenerated: true,
        description,
        languageAlternates: LEGAL_PAGE_PATHS[kind],
        sitemapPriority: LEGAL_PAGE_SITEMAP_PRIORITY,
        sitemapChangeFrequency: 'yearly',
    };
}

export const LEGAL_PAGE_DEFINITIONS: Readonly<
    Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, PageMetadataDefinition>>>
> = {
    privacyPolicy: {
        cs: createLegalPageDefinition('privacyPolicy', 'cs'),
        en: createLegalPageDefinition('privacyPolicy', 'en'),
    },
    termsAndConditions: {
        cs: createLegalPageDefinition('termsAndConditions', 'cs'),
        en: createLegalPageDefinition('termsAndConditions', 'en'),
    },
};

/**
 * Every legal page, flattened the way the sitemap registry lists pages
 */
export const LEGAL_PAGE_DEFINITION_LIST: readonly PageMetadataDefinition[] = [
    LEGAL_PAGE_DEFINITIONS.privacyPolicy.cs,
    LEGAL_PAGE_DEFINITIONS.privacyPolicy.en,
    LEGAL_PAGE_DEFINITIONS.termsAndConditions.cs,
    LEGAL_PAGE_DEFINITIONS.termsAndConditions.en,
];

/**
 * Ready made `Metadata` of every legal page, so a page only exports what it needs
 */
export const LEGAL_PAGE_METADATA: Readonly<
    Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, Metadata>>>
> = {
    privacyPolicy: {
        cs: createPageMetadata(LEGAL_PAGE_DEFINITIONS.privacyPolicy.cs),
        en: createPageMetadata(LEGAL_PAGE_DEFINITIONS.privacyPolicy.en),
    },
    termsAndConditions: {
        cs: createPageMetadata(LEGAL_PAGE_DEFINITIONS.termsAndConditions.cs),
        en: createPageMetadata(LEGAL_PAGE_DEFINITIONS.termsAndConditions.en),
    },
};
