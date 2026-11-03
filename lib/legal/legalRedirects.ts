import { getLegalPagePath, type LegalDocumentKind } from './legalPagePaths';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

const ALIASES: Record<string, LegalDocumentKind> = {
    'ochrana-osobnich-udaju': 'privacyPolicy', 'privacy-policy': 'privacyPolicy', soukromi: 'privacyPolicy', privacy: 'privacyPolicy',
    'obchodni-podminky': 'termsAndConditions', 'terms-and-conditions': 'termsAndConditions', podminky: 'termsAndConditions', terms: 'termsAndConditions',
    'podminky-produktu': 'productTerms', 'product-terms': 'productTerms', 'partnerske-podminky': 'partnerTerms', 'partner-terms': 'partnerTerms', licence: 'engineLicense', 'engine-license': 'engineLicense',
};
export function getLegacyLegalRedirect(pathname: string, fallback: SupportedHomepageLanguage = 'cs'): string | null {
    const match = /^\/(?:(cs|en)\/)?([^/]+)\/?$/.exec(pathname);
    if (!match || !Object.hasOwn(ALIASES, match[2])) return null;
    return getLegalPagePath(ALIASES[match[2]], match[1] as SupportedHomepageLanguage || fallback);
}
