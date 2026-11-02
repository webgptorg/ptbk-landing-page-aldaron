import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getLegalPagePath, type LegalDocumentKind } from '@/lib/legal/legalPagePaths';

/**
 * Link to one legal document, shaped exactly like the links the footer already renders
 */
export type LegalLink = {
    readonly href: string;
    readonly text: string;
};

/**
 * How each legal document is called wherever it is linked to
 *
 * Note: It is the same wording as the headline of the document itself, so a visitor recognizes where they landed.
 */
const LEGAL_LINK_TEXTS: Readonly<Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, string>>>> = {
    privacyPolicy: {
        cs: 'Ochrana osobních údajů',
        en: 'Privacy Policy',
    },
    termsAndConditions: {
        cs: 'Obchodní podmínky',
        en: 'Terms and Conditions',
    },
    productTerms: { cs: 'Podmínky produktu · návrh', en: 'Product terms · draft' },
    partnerTerms: { cs: 'Partnerské podmínky · návrh', en: 'Partner terms · draft' },
    engineLicense: { cs: 'Licence enginu', en: 'Engine licence' },
};

/**
 * Order in which the legal documents are listed wherever all of them are offered at once
 */
const LEGAL_DOCUMENT_KINDS: readonly LegalDocumentKind[] = [
    'privacyPolicy', 'termsAndConditions', 'productTerms', 'partnerTerms', 'engineLicense',
];

/**
 * Builds the link to one legal document
 *
 * @param kind legal document to link to
 * @param language language the visitor is reading
 */
export function getLegalLink(kind: LegalDocumentKind, language: SupportedHomepageLanguage): LegalLink {
    return {
        href: getLegalPagePath(kind, language),
        text: LEGAL_LINK_TEXTS[kind][language],
    };
}

/**
 * Builds the links to every legal document, which is what a footer offers
 *
 * @param language language the visitor is reading
 */
export function getLegalLinks(language: SupportedHomepageLanguage): readonly LegalLink[] {
    return LEGAL_DOCUMENT_KINDS.map((kind) => getLegalLink(kind, language));
}
