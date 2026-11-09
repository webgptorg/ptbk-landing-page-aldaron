import { createHash } from 'node:crypto';
import {
    createPromptbookBillingContactEvidence,
    PROMPTBOOK_BILLING_CONTACT_SOURCE,
} from '@/lib/contacts/contactSubmissionPolicy';
import { getContactsTableOrNull } from '@/lib/contacts/contactsDatabase';
import type { PromptbookOrder } from './billingOrders';

const TWENTY_ORIGIN = 'https://crm.ptbk.io';
const TWENTY_TIMEOUT_MS = 5000;

type PromptbookBillingContactOrder = Pick<PromptbookOrder,
    | 'id' | 'email' | 'plan' | 'country' | 'company_id' | 'company_name' | 'vat_id' | 'billing_address'
    | 'created_at' | 'first_paid_at' | 'phone' | 'onboarding_note' | 'is_test'
>;

function billingRecordId(kind: string, key: string) {
    const bytes = createHash('sha256').update(`promptbook-billing:${kind}:${key}`).digest();
    bytes[6] = (bytes[6] & 15) | 128;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = bytes.toString('hex', 0, 16);
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

function createTwentyClient(apiKey: string) {
    return (path: string, method = 'GET', body?: object) =>
        fetch(new URL(`/rest/${path}`, TWENTY_ORIGIN), {
            method,
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
            redirect: 'error',
            cache: 'no-store',
            signal: AbortSignal.timeout(TWENTY_TIMEOUT_MS),
        });
}

type TwentyClient = ReturnType<typeof createTwentyClient>;

async function ensureTwentyRecord(twenty: TwentyClient, collection: string, id: string, data: object) {
    const path = `${collection}/${id}`;
    const existing = await twenty(path);
    if (existing.ok) return 'existing';
    if (existing.status !== 404) {
        throw new Error(`Twenty could not look up a Promptbook purchase in ${collection} (HTTP ${existing.status}).`);
    }
    const response = await twenty(collection, 'POST', { ...data, id });
    if (response.ok) return 'created';
    // A concurrent request can create this exact ID before our insert arrives.
    if ([400, 409, 422].includes(response.status)) {
        const concurrentRecord = await twenty(path);
        if (concurrentRecord.ok) return 'existing';
    }
    throw new Error(`Twenty could not record a Promptbook purchase in ${collection} (HTTP ${response.status}).`);
}

async function findTwentyPerson(twenty: TwentyClient, email: string) {
    const query = new URLSearchParams({
        filter: `emails.primaryEmail[eq]:${JSON.stringify(email)}`,
        fields: 'id,emails,company',
        depth: '0',
        limit: '2',
    });
    const response = await twenty(`people?${query}`);
    if (!response.ok) throw new Error(`Twenty could not look up a Promptbook contact (HTTP ${response.status}).`);
    const payload = (await response.json()) as {
        data?: { people?: { id: string; emails?: { primaryEmail?: string }; companyId?: string | null }[] };
    };
    if (!Array.isArray(payload.data?.people)) throw new Error('Twenty returned an invalid people response.');
    const matches = payload.data.people.filter((person) => person.emails?.primaryEmail?.toLowerCase() === email);
    if (matches.length > 1) throw new Error('Twenty has multiple records for the Promptbook contact email.');
    return matches[0];
}

async function syncTwenty(
    apiKey: string,
    order: PromptbookBillingContactOrder,
    planName: string,
    isOnboardingUpdate: boolean,
) {
    const twenty = createTwentyClient(apiKey);
    const email = order.email.trim().toLowerCase();
    const companyId = billingRecordId('company', `${order.country}:${order.company_id}`);
    await ensureTwentyRecord(twenty, 'companies', companyId, {
        name: order.company_name,
        address: {
            addressStreet1: order.billing_address.line1,
            addressCity: order.billing_address.city,
            addressPostcode: order.billing_address.postal_code,
            addressCountry: order.country,
        },
    });

    const existingPerson = await findTwentyPerson(twenty, email);
    let personId = existingPerson?.id;
    if (!personId) {
        personId = billingRecordId('person', email);
        try {
            await ensureTwentyRecord(twenty, 'people', personId, { emails: { primaryEmail: email }, companyId });
        } catch (error) {
            const concurrentPerson = await findTwentyPerson(twenty, email);
            if (!concurrentPerson) throw error;
            personId = concurrentPerson.id;
        }
    } else if (!existingPerson?.companyId) {
        const response = await twenty(`people/${personId}`, 'PATCH', { companyId });
        if (!response.ok) throw new Error(`Twenty could not link the Promptbook contact (HTTP ${response.status}).`);
    }

    await ensureTwentyRecord(twenty, 'opportunities', order.id, {
        name: `Promptbook ${planName} · ${order.company_name}`,
        stage: 'CUSTOMER',
        closeDate: order.first_paid_at,
        companyId,
        pointOfContactId: personId,
    });

    if (isOnboardingUpdate || order.phone || order.onboarding_note) {
        const noteId = billingRecordId('onboarding-note', order.id);
        const lines = [
            ...(order.phone ? [`Telefon: ${order.phone}`] : []),
            ...(order.onboarding_note?.split(/\r?\n/) ?? []),
        ];
        const note = {
            title: `Onboarding Promptbook ${planName}`,
            bodyV2: lines.length === 0 ? null : {
                blocknote: JSON.stringify(lines.map((line) => ({
                    type: 'paragraph',
                    content: line ? [{ type: 'text', text: line }] : [],
                }))),
                markdown: lines.map((line) => line.replace(/[!#&()*<>[\]\\_`~]/g, '\\$&')).join('\n\n'),
            },
        };
        let result;
        if (note.bodyV2 === null) {
            const response = await twenty(`notes/${noteId}`);
            if (response.status === 404) return;
            if (!response.ok) throw new Error(`Twenty could not read Promptbook onboarding (HTTP ${response.status}).`);
            result = 'existing';
        } else {
            result = await ensureTwentyRecord(twenty, 'notes', noteId, note);
            await ensureTwentyRecord(twenty, 'noteTargets', noteId, { noteId, targetOpportunityId: order.id });
        }
        if (isOnboardingUpdate && result === 'existing') {
            const response = await twenty(`notes/${noteId}`, 'PATCH', { bodyV2: note.bodyV2 });
            if (!response.ok) throw new Error(`Twenty could not update Promptbook onboarding (HTTP ${response.status}).`);
        }
    }
}

/** Copy the paid order after recording payment. Repeating a webhook or onboarding request reuses its records. */
export async function syncPromptbookBillingContact(
    order: PromptbookBillingContactOrder,
    { isOnboardingUpdate = false } = {},
): Promise<void> {
    if (order.is_test || !order.first_paid_at) return;

    const contacts = getContactsTableOrNull();
    if (!contacts) throw new Error('Promptbook billing contacts database is unavailable.');

    const planName = order.plan === 'start' ? 'Start' : 'Business';
    const contactDetails = { phone: order.phone ?? null, userNote: order.onboarding_note ?? null };
    const { error: insertError } = await contacts.upsert(
        {
            promptbookBillingOrderId: order.id,
            email: order.email,
            appName: 'Promptbook',
            placeName: PROMPTBOOK_BILLING_CONTACT_SOURCE,
            isContacted: false,
            isWaitlisted: false,
            ourNote: [
                `Předplatné Promptbook ${planName}`,
                `Firma: ${order.company_name}`,
                `IČO (${order.country}): ${order.company_id}`,
                ...(order.vat_id ? [`IČ DPH: ${order.vat_id}`] : []),
                `Objednávka: ${order.id}`,
            ].join('\n'),
            submissionEvidence: createPromptbookBillingContactEvidence(order.created_at),
            ...contactDetails,
        },
        { onConflict: 'promptbookBillingOrderId', ignoreDuplicates: true },
    );
    if (insertError) throw new Error(`Could not record the Promptbook billing contact (${insertError.code}).`);

    if (isOnboardingUpdate) {
        const { error } = await contacts.update(contactDetails).eq('promptbookBillingOrderId', order.id);
        if (error) throw new Error(`Could not update Promptbook billing onboarding (${error.code}).`);
    }

    const apiKey = process.env.PROMPTBOOK_TWENTY_API_KEY?.trim();
    if (apiKey) await syncTwenty(apiKey, order, planName, isOnboardingUpdate);
}
