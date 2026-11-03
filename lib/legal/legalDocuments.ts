import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import type { LegalDocumentKind } from '@/lib/legal/legalPagePaths';
import { PRIVACY_POLICY_DOCUMENTS } from '@/lib/legal/privacyPolicyDocuments';
import { TERMS_AND_CONDITIONS_DOCUMENTS } from '@/lib/legal/termsAndConditionsDocuments';
import { PRODUCT_TERMS_DOCUMENTS } from '@/lib/legal/productTermsDocuments';
import { PARTNER_TERMS_DOCUMENTS } from '@/lib/legal/partnerTermsDocuments';
import { ENGINE_LICENSE_DOCUMENTS } from '@/lib/legal/engineLicenseDocuments';
import { JOINT_PRIVACY_DOCUMENTS } from './jointPrivacyDocuments';

/**
 * Every legal document the site publishes, in every language it is published in
 */
const LEGAL_DOCUMENTS: Readonly<Record<LegalDocumentKind, Readonly<Record<SupportedHomepageLanguage, LegalDocument>>>> =
    {
        privacyPolicy: PRIVACY_POLICY_DOCUMENTS,
        termsAndConditions: TERMS_AND_CONDITIONS_DOCUMENTS,
        productTerms: PRODUCT_TERMS_DOCUMENTS,
        partnerTerms: PARTNER_TERMS_DOCUMENTS,
        engineLicense: ENGINE_LICENSE_DOCUMENTS,
        jointPrivacy: JOINT_PRIVACY_DOCUMENTS,
    };

/**
 * Picks the text a legal page is going to show
 *
 * @param kind legal document to show
 * @param language language the visitor is reading
 */
export function getLegalDocument(kind: LegalDocumentKind, language: SupportedHomepageLanguage): LegalDocument {
    return LEGAL_DOCUMENTS[kind][language];
}
