import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Legal documents the site publishes
 */
export type LegalDocumentKind = 'privacyPolicy' | 'termsAndConditions' | 'productTerms' | 'partnerTerms' | 'engineLicense' | 'jointPrivacy';

/**
 * Site-relative path of every legal document in every language it is published in
 *
 * Note: The slugs are localized, because these are the pages a visitor searches for by their legal name.
 */
export const LEGAL_PAGE_PATHS: Readonly<
    Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, string>>>
> = {
    privacyPolicy: {
        cs: '/cs/legal/ochrana-osobnich-udaju',
        en: '/en/legal/privacy-policy',
    },
    termsAndConditions: {
        cs: '/cs/legal/obchodni-podminky',
        en: '/en/legal/terms-and-conditions',
    },
    productTerms: { cs: '/cs/legal/podminky-produktu', en: '/en/legal/product-terms' },
    partnerTerms: { cs: '/cs/legal/partnerske-podminky', en: '/en/legal/partner-terms' },
    engineLicense: { cs: '/cs/legal/licence', en: '/en/legal/engine-license' },
    jointPrivacy: { cs: '/cs/legal/spolecne-zpracovani', en: '/en/legal/joint-processing' },
};

export const LEGAL_DOCUMENT_KINDS = Object.keys(LEGAL_PAGE_PATHS) as LegalDocumentKind[];
export const getLegalHubPath = (language: SupportedHomepageLanguage) => `/${language}/legal`;
export const getReleasesPath = (language: SupportedHomepageLanguage) => `/${language}/releases`;
export function getLegalKindBySlug(slug: string, language: SupportedHomepageLanguage) {
    return LEGAL_DOCUMENT_KINDS.find(kind => LEGAL_PAGE_PATHS[kind][language].split('/').at(-1) === slug);
}

/**
 * Resolves where a legal document lives
 *
 * Note: The paths `/privacy` and `/terms`, which held the documents before they were published in both languages,
 *       stay alive as redirects picking the language from the `Accept-Language` header - see `redirectToLegalPage`.
 *
 * @param kind legal document to link to
 * @param language language the visitor is reading
 * @returns site-relative path of the document in that language
 */
export function getLegalPagePath(kind: LegalDocumentKind, language: SupportedHomepageLanguage): string {
    return LEGAL_PAGE_PATHS[kind][language];
}
