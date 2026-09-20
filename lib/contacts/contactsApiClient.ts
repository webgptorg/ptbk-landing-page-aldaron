import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import type { Contact, ContactChanges, ContactDraft } from './Contact';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';

const CONTACTS_API_PATH = '/api/contacts';

type ContactMutationMethod = 'POST' | 'PATCH' | 'DELETE';

/**
 * Build the url of the contacts api with the optional additional parameters
 *
 * Note: The session of the administration is a cookie, so the address of the api carries no credentials at all
 */
function buildContactsApiUrl(additionalParameters: Readonly<Record<string, string>> = {}): string {
    return appendSearchParameters(CONTACTS_API_PATH, additionalParameters);
}

/**
 * Turn a failed response into an error with the message from the api
 */
async function assertResponseIsOk(response: Response): Promise<void> {
    if (response.ok) {
        return;
    }

    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error || `Contacts api responded with the status ${response.status}`);
}

/**
 * Send one mutation to the contacts api and read its JSON response
 */
async function sendContactsApiMutation<ResponsePayload>(
    method: ContactMutationMethod,
    contactValues: unknown,
): Promise<ResponsePayload> {
    return protectAdminMutation(async () => {
        const response = await fetch(buildContactsApiUrl(), {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactValues),
        });
        await assertResponseIsOk(response);
        return (await response.json()) as ResponsePayload;
    });
}

/**
 * Load every contact from the database
 *
 * Note: All contacts are loaded at once so the browser can filter, sort and paginate the table while exports include every contact
 */
export async function fetchContacts(): Promise<Array<AdminJoinedContact>> {
    const response = await fetch(buildContactsApiUrl({ showAll: 'true' }));
    await assertResponseIsOk(response);

    const payload = (await response.json()) as { contacts?: Array<AdminJoinedContact> | null };
    return payload.contacts || [];
}

/**
 * Add one manually filled in contact
 */
export async function createContact(contactDraft: ContactDraft): Promise<Contact> {
    return sendContactsApiMutation<Contact>('POST', contactDraft);
}

/**
 * Save the fields of one contact which we maintain ourselves
 */
export async function updateContact(contactId: number, contactChanges: ContactChanges): Promise<Contact> {
    return sendContactsApiMutation<Contact>('PATCH', { id: contactId, ...contactChanges });
}

/**
 * Remove exactly one contact from the dashboard and the database
 */
export async function deleteContact(contactId: number): Promise<void> {
    await sendContactsApiMutation('DELETE', { id: contactId });
}
