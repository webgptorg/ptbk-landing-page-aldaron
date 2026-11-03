import { readContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';
import {
    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
    getAiSupervizeMiniDiscountPlaceId,
} from '@/businesses/ai-supervize-mini/config';
import {
    createAiSupervizeMiniStoredWorkshopRegistration,
    createAiSupervizeMiniWorkshopAvailabilityAfterRegistration,
    createAiSupervizeMiniWorkshopPrice,
    createAiSupervizeMiniWorkshopRegistrationContactNote,
    getAiSupervizeMiniEventBySlug,
    getAiSupervizeMiniWorkshopAvailabilityByEventSlug,
    getAiSupervizeMiniWorkshopRegistrationState,
    type AiSupervizeMiniInvoiceType,
    type AiSupervizeMiniWorkshopRegistrationRequest,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import {
    loadAiSupervizeMiniEvents,
    loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable,
} from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { APP_NAME } from '@/config';
import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { MAXIMAL_CONTACT_TEXT_LENGTH } from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { consumeDiscountCode } from '@/lib/discounts/discountCodeDatabase';
import { EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE } from '@/lib/discounts/discountCodeMessages';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_REGISTRATION_ERROR_MESSAGE = 'Vyplňte prosím všechny povinné údaje správně.';
const REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE = 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.';
const AVAILABILITY_NOT_LOADED_ERROR_MESSAGE = 'Aktuální počet volných míst se nepodařilo ověřit. Zkuste to prosím znovu.';
const DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';

function readTextValue(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_CONTACT_TEXT_LENGTH ? value : null;
}

function readRequiredTextValue(value: unknown): string | null {
    const textValue = readTextValue(value);

    return textValue === null || textValue.trim() === '' ? null : textValue;
}

function readInvoiceType(value: unknown): AiSupervizeMiniInvoiceType | null {
    return value === 'company' || value === 'individual' ? value : null;
}

function readParticipantCount(value: unknown): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function readAiSupervizeMiniWorkshopRegistrationRequest(
    body: Readonly<Record<string, unknown>>,
): AiSupervizeMiniWorkshopRegistrationRequest | null {
    const eventSlug = readRequiredTextValue(body.eventSlug);
    const participantCount = readParticipantCount(body.participantCount);
    const fullname = readRequiredTextValue(body.fullname);
    const email = readRequiredTextValue(body.email);
    const company = readRequiredTextValue(body.company);
    const invoiceType = readInvoiceType(body.invoiceType);
    const billingDetails = readRequiredTextValue(body.billingDetails);
    const userNote = readTextValue(body.userNote);
    const discountCode = readTextValue(body.discountCode);

    if (
        eventSlug === null ||
        participantCount === null ||
        fullname === null ||
        email === null ||
        !isEmailAddressValid(email) ||
        company === null ||
        invoiceType === null ||
        billingDetails === null ||
        userNote === null ||
        discountCode === null
    ) {
        return null;
    }

    return {
        eventSlug,
        participantCount,
        fullname,
        email,
        company,
        invoiceType,
        billingDetails,
        userNote,
        discountCode,
    };
}

/**
 * Why a registration did not fit into the term it was written for
 *
 * Note: The seats left are counted the way Czech counts them, so a term with one seat left never says `1 míst`.
 */
function getFullWorkshopErrorMessage(remainingSeatCount: number): string {
    return remainingSeatCount === 0
        ? 'Tento termín už je obsazený.'
        : `V tomto termínu zbývá už jen ${formatCzechCountedNoun(remainingSeatCount, ['místo', 'místa', 'míst'])}.`;
}

/**
 * Store the registration only after querying the current contact records again.
 * The client-side capacity is a convenience; this server-side check is the one
 * that decides whether a registration still fits into the workshop.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);

    if (body === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const registrationRequest = readAiSupervizeMiniWorkshopRegistrationRequest(body);

    if (registrationRequest === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    // The published terms decide which registration is possible at all, so a link to a term which was withdrawn or
    // has already started is refused instead of being written against a term nobody offers anymore.
    const events = await loadAiSupervizeMiniEvents();
    const event = getAiSupervizeMiniEventBySlug(events, registrationRequest.eventSlug);

    if (event === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const maximumParticipantCount = event.event.maximumParticipantCount;
    if (maximumParticipantCount !== null && registrationRequest.participantCount > maximumParticipantCount) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const submissionEvidence = readContactSubmissionEvidence(body!, 'AiSupervizeMiniWorkshopRegistration');
    if (!submissionEvidence) return NextResponse.json({ error: 'Formulář se změnil. Obnovte stránku a odešlete jej znovu.' }, { status: 400 });

    const contactsTable = getContactsTableOrNull();

    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { workshopAvailabilities, errorMessage } = await loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable(
        contactsTable,
        events,
    );

    if (workshopAvailabilities === null) {
        console.error('Failed to load AI Supervize Mini workshop availability before registration:', errorMessage);
        return NextResponse.json({ error: AVAILABILITY_NOT_LOADED_ERROR_MESSAGE }, { status: 500 });
    }

    const workshopAvailability = getAiSupervizeMiniWorkshopAvailabilityByEventSlug(
        workshopAvailabilities,
        event.slug,
    );

    const registrationState = getAiSupervizeMiniWorkshopRegistrationState(
        workshopAvailability,
        registrationRequest.participantCount,
    );

    if (registrationState === 'unavailable') {
        return NextResponse.json({ error: AVAILABILITY_NOT_LOADED_ERROR_MESSAGE }, { status: 500 });
    }

    if (registrationState === 'does-not-fit') {
        return NextResponse.json(
            {
                error: getFullWorkshopErrorMessage(workshopAvailability?.remainingSeatCount ?? 0),
                workshopAvailabilities,
            },
            { status: 409 },
        );
    }

    const isWaitlisted = registrationState === 'waitlisted';

    // A limited code is consumed in the same database statement which checks its remaining count,
    // so concurrent registrations cannot both receive its last use.
    const discountCodeConsumption = await consumeDiscountCode(
        registrationRequest.discountCode,
        getAiSupervizeMiniDiscountPlaceId(event.event.locationKind),
    );
    if (discountCodeConsumption.errorMessage !== null) {
        console.error(
            'Failed to validate AI Supervize Mini registration discount code:',
            discountCodeConsumption.errorMessage,
        );
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE }, { status: 503 });
    }
    if (discountCodeConsumption.status === 'exhausted') {
        return NextResponse.json(
            { error: EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE, workshopAvailabilities },
            { status: 409 },
        );
    }

    const activeDiscount = discountCodeConsumption.activeDiscount;

    const storedRegistration = createAiSupervizeMiniStoredWorkshopRegistration(
        registrationRequest,
        event,
        activeDiscount,
    );
    const contactNote = createAiSupervizeMiniWorkshopRegistrationContactNote(storedRegistration);

    if (contactNote.length > MAXIMAL_CONTACT_TEXT_LENGTH) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const { contact, errorMessage: insertErrorMessage } = await insertContact(contactsTable, {
        fullname: registrationRequest.fullname,
        email: registrationRequest.email,
        userNote: contactNote,
        submissionEvidence,
        isWaitlisted,
        placeName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
        appName: APP_NAME,
        userAgent: request.headers.get('user-agent'),
        ipAddress: readClientIpAddress(request),
        url: request.headers.get('referer'),
    });

    if (contact === null) {
        console.error('Failed to write AI Supervize Mini workshop registration:', insertErrorMessage);
        return NextResponse.json({ error: REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({
        isWaitlisted,
        workshopAvailabilities: createAiSupervizeMiniWorkshopAvailabilityAfterRegistration(
            workshopAvailabilities,
            event.slug,
            registrationRequest.participantCount,
            registrationState,
        ),
        workshopPrice: createAiSupervizeMiniWorkshopPrice(
            event,
            registrationRequest.participantCount,
            activeDiscount,
        ),
    });
}
