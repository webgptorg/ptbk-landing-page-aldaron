import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Legal documents the site publishes
 */
export type LegalDocumentKind = 'privacyPolicy' | 'termsAndConditions' | 'productTerms' | 'partnerTerms' | 'engineLicense';

/**
 * Site-relative path of every legal document in every language it is published in
 *
 * Note: The slugs are localized, because these are the pages a visitor searches for by their legal name.
 */
export const LEGAL_PAGE_PATHS: Readonly<
    Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, string>>>
> = {
    privacyPolicy: {
        cs: '/cs/ochrana-osobnich-udaju',
        en: '/en/privacy-policy',
    },
    termsAndConditions: {
        cs: '/cs/obchodni-podminky',
        en: '/en/terms-and-conditions',
    },
    productTerms: { cs: '/cs/podminky-produktu', en: '/en/podminky-produktu' },
    partnerTerms: { cs: '/cs/partnerske-podminky', en: '/en/partnerske-podminky' },
    engineLicense: { cs: '/cs/licence', en: '/en/licence' },
};

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
