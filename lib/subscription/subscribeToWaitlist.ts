import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { sendJson } from '@/lib/api/requestJson';
import type { ContactSubmission } from '@/lib/contacts/Contact';

/**
 * Path of the api which writes a contact left in one of the public forms of the site
 */
const WAITLIST_API_PATH = '/api/waitlist';

type SubscribeToWaitlistOptions = {
    language?: SupportedHomepageLanguage;
    marketingConsent?: boolean;
    fullname?: string;
    email: string;
    placeName: string;
    phone?: string;
    note?: string;
};

/**
 * Read the address of the page the form was filled in on, and the page the visitor came from
 *
 * Note: Both are empty whenever there is no browser around, so that the form never fails just because of them
 */
function readSubmissionPlace(): Pick<ContactSubmission, 'url' | 'referrer'> {
    if (typeof window === 'undefined') {
        return { url: '', referrer: '' };
    }

    return { url: window.location.href, referrer: document.referrer };
}

/**
 * Subscribe an email address to the waitlist
 *
 * Note: The contact is written by `/api/waitlist` and never by the browser itself, because row level security keeps
 *       the `Contact` table closed for the public key of the database. Who the visitor is, from which address they
 *       came and when, is therefore read by the server from the request instead of being sent from here.
 *
 * @param email - The email address to subscribe to the waitlist
 * @param placeName - Name of the place where the popup is triggered (to measure effectiveness)
 * @param phone - Optional phone number
 * @param note - Optional notes (e.g., selected plan)
 */
export async function subscribeToWaitlist(options: SubscribeToWaitlistOptions): Promise<void> {
    const { fullname, email, placeName, phone, note } = options;

    const contactSubmission: ContactSubmission = {
        fullname: fullname || '',
        email,
        phone: phone || '',
        userNote: note || '',
        placeName,
        ...readSubmissionPlace(),
    };

    const language = options.language ?? (typeof document !== 'undefined' && document.documentElement.lang.startsWith('en') ? 'en' : 'cs');
    await sendJson(WAITLIST_API_PATH, 'POST', { ...contactSubmission, ...createContactNoticeFields(language, options.marketingConsent === true) });
}
