import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getPersonalDataConsentNote } from '@/lib/legal/personalDataConsentNotes';

export const CONTACT_NOTICE_VERSION = '2026-11-03.1';
export type ContactPurpose = 'request' | 'pdf' | 'registration' | 'promptbook-newsletter' | 'podcast-newsletter';
const SOURCES: Readonly<Record<string, ContactPurpose>> = {
    'newsletter-footer': 'promptbook-newsletter',
    AiTaKrajtaEmailSubscription: 'podcast-newsletter',
    'new-website-contact': 'request',
    'new-calculator-pdf': 'pdf',
    'PavolPersonalPage-cs': 'request',
    'PavolPersonalPage-en': 'request',
    AiTaKrajtaSpoluprace: 'request',
    OnlineWorkshopRegistration: 'registration',
    AiSupervizeMiniWorkshopInterest: 'request',
    AiSupervizeMiniWorkshopRegistration: 'registration',
    CommunityMembershipRegistration: 'registration',
    'qualification-popup': 'request',
    ForIndustryPage: 'request', ForAgroPage: 'request', ProMestaPage: 'request',
    AiSupervizePage: 'request', HackathonFactoryPage: 'request', HomePage: 'request', NotFound: 'request',
};
export function getContactPurpose(source: string): ContactPurpose | null {
    return Object.hasOwn(SOURCES, source) ? SOURCES[source] : null;
}
export function isNewsletterPurpose(purpose: ContactPurpose) {
    return purpose === 'promptbook-newsletter' || purpose === 'podcast-newsletter';
}
export function getNewsletterConsentText(purpose: 'promptbook-newsletter' | 'podcast-newsletter', language: SupportedHomepageLanguage) {
    const topic = purpose === 'podcast-newsletter' ? 'AI ta Krajta' : 'Promptbook';
    return language === 'cs'
        ? `Souhlasím, aby mi AI Web s.r.o. zasílala e-mailem novinky a nabídky ${topic}. Souhlas mohu kdykoli odvolat odhlášením v e-mailu nebo na privacy@ptbk.io.`
        : `I agree to receive ${topic} news and offers by email from AI Web s.r.o. I can withdraw consent at any time through the unsubscribe link or privacy@ptbk.io.`;
}
export function getServicePurposeText(language: SupportedHomepageLanguage) {
    return language === 'cs'
        ? 'Údaje použijeme k vyřízení tohoto požadavku a související komunikaci. Odeslání formuláře Vás nepřihlašuje k newsletteru.'
        : 'We use your details to fulfil this request and communicate about it. Submitting this form does not subscribe you to a newsletter.';
}
export type ContactSubmissionEvidence = {
    version: typeof CONTACT_NOTICE_VERSION;
    receivedAt: string;
    controller: 'AI Web s.r.o.';
    purpose: ContactPurpose;
    source: string;
    language: SupportedHomepageLanguage;
    noticeText: string;
    consentText: string | null;
    marketingConsent: boolean;
    emailVerified: false;
};
/** Browser values are assertions, not proof of email ownership. Canonical wording and time come from the server. */
export function readContactSubmissionEvidence(body: Record<string, unknown>, source: string, now = new Date()): ContactSubmissionEvidence | null {
    const purpose = getContactPurpose(source);
    if (!purpose || body.noticeVersion !== CONTACT_NOTICE_VERSION || (body.noticeLanguage !== 'cs' && body.noticeLanguage !== 'en')) return null;
    if (typeof body.marketingConsent !== 'boolean') return null;
    const newsletter = isNewsletterPurpose(purpose);
    if (body.marketingConsent !== newsletter) return null;
    const language = body.noticeLanguage;
    const note = getPersonalDataConsentNote(language, 'formal');
    return {
        version: CONTACT_NOTICE_VERSION, receivedAt: now.toISOString(), controller: 'AI Web s.r.o.',
        purpose, source, language, noticeText: `${note.prefix}${note.privacyPolicyLinkText}.`,
        consentText: newsletter ? getNewsletterConsentText(purpose as 'promptbook-newsletter' | 'podcast-newsletter', language) : null,
        marketingConsent: newsletter, emailVerified: false,
    };
}
/** Metadata for the notice actually rendered by the current form; never infers newsletter consent. */
export function createContactNoticeFields(language: SupportedHomepageLanguage = 'cs', marketingConsent = false) {
    return { noticeVersion: CONTACT_NOTICE_VERSION, noticeLanguage: language, marketingConsent };
}
