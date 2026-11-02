import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ORGANIZATION_LEGAL_NAME, ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';

/**
 * Address which answers everything about personal data - requests of the data subjects, questions about the policy
 */
export const PRIVACY_CONTACT_EMAIL = 'privacy@ptbk.io';

/**
 * Address which answers everything about the contract - the terms, the orders, the invoices
 */
export const LEGAL_CONTACT_EMAIL = 'legal@ptbk.io';

/**
 * How the company which stands behind the site introduces itself in each language
 */
const OPERATOR_IDENTIFICATIONS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: `${ORGANIZATION_LEGAL_NAME}, IČO ${ORGANIZATION_REGISTRATION_NUMBER}, se sídlem Rohožnická 2908, Újezd nad Lesy, 190 16 Praha 9, zapsaná u Městského soudu v Praze, oddíl C, vložka 395519`,
    en: `${ORGANIZATION_LEGAL_NAME}, company number ${ORGANIZATION_REGISTRATION_NUMBER}, registered office Rohožnická 2908, Újezd nad Lesy, 190 16 Praha 9, Czech Republic, registered with the Municipal Court in Prague, section C, file 395519`,
};

/** Project coordinator identified by its own published privacy notice, checked 2 November 2026. */
export const NEONMEDIA_IDENTIFICATION = {
    cs: 'Neonmedia s.r.o., IČO 23825944, Požárníků 162/2, Slavonín, 783 01 Olomouc, Krajský soud v Ostravě, oddíl C, vložka 101103',
    en: 'Neonmedia s.r.o., company number 23825944, Požárníků 162/2, Slavonín, 783 01 Olomouc, Czech Republic, Regional Court in Ostrava, section C, file 101103',
} as const;

/**
 * Builds the sentence fragment which identifies the company behind the site
 *
 * Note: Both legal documents have to name the very same company, so they both ask this one place.
 *
 * @param language language the document is written in
 */
export function getOperatorIdentification(language: SupportedHomepageLanguage): string {
    return OPERATOR_IDENTIFICATIONS[language];
}
