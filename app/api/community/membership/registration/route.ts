import { readContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';
import {
    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME,
    isCommunityMembershipBillingPeriod,
    isCommunityMembershipBillingPeriodSupportedForPlan,
    isPaidCommunityMembershipPlanId,
} from '@/businesses/community/membership/communityMembershipConfig';
import {
    createCommunityMembershipRegistrationContactNote,
    createCommunityMembershipRegistrationResult,
    createStoredCommunityMembershipRegistration,
    type CommunityMembershipRegistrationRequest,
} from '@/businesses/community/membership/communityMembershipRegistration';
import { APP_NAME } from '@/config';
import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { MAXIMAL_CONTACT_TEXT_LENGTH } from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { consumeDiscountCode } from '@/lib/discounts/discountCodeDatabase';
import { EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE } from '@/lib/discounts/discountCodeMessages';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_REGISTRATION_ERROR_MESSAGE = 'Vyplňte prosím jméno, platný e-mail a potvrďte obchodní podmínky.';
const REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE = 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.';
const DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';
const DISCOUNT_CODE_NO_LONGER_ACTIVE_ERROR_MESSAGE =
    'Slevový kód už zde není aktivní. Odstraňte jej nebo použijte jiný a zkontrolujte novou cenu.';

function readRequiredText(value: unknown, maximalLength: number): string | null {
    if (typeof value !== 'string' || value.length > maximalLength) {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? null : trimmedValue;
}

function readDiscountCode(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH ? value : null;
}

function readCommunityMembershipRegistrationRequest(
    body: Readonly<Record<string, unknown>>,
): CommunityMembershipRegistrationRequest | null {
    const fullname = readRequiredText(body.fullname, MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH);
    const email = readRequiredText(body.email, MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH);
    const discountCode = readDiscountCode(body.discountCode);
    const planId = body.planId;
    const billingPeriod = body.billingPeriod;

    if (
        !isPaidCommunityMembershipPlanId(planId) ||
        !isCommunityMembershipBillingPeriod(billingPeriod) ||
        !isCommunityMembershipBillingPeriodSupportedForPlan(planId, billingPeriod) ||
        fullname === null ||
        email === null ||
        !isEmailAddressValid(email) ||
        discountCode === null ||
        body.termsAccepted !== true
    ) {
        return null;
    }

    return {
        planId,
        billingPeriod,
        fullname,
        email,
        discountCode,
        termsAccepted: true,
    };
}

export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);
    const registrationRequest = body === null ? null : readCommunityMembershipRegistrationRequest(body);
    if (registrationRequest === null) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const submissionEvidence = readContactSubmissionEvidence(body!, 'CommunityMembershipRegistration');
    if (!submissionEvidence) return NextResponse.json({ error: 'Formulář se změnil. Obnovte stránku a odešlete jej znovu.' }, { status: 400 });

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const discountCodeConsumption = await consumeDiscountCode(
        registrationRequest.discountCode,
        COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    );
    if (discountCodeConsumption.errorMessage !== null) {
        console.error(
            'Failed to validate the community membership discount code:',
            discountCodeConsumption.errorMessage,
        );
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_LOADED_ERROR_MESSAGE }, { status: 503 });
    }
    if (discountCodeConsumption.status === 'exhausted') {
        return NextResponse.json({ error: EXHAUSTED_DISCOUNT_CODE_ERROR_MESSAGE }, { status: 409 });
    }
    if (registrationRequest.discountCode.trim() !== '' && discountCodeConsumption.status !== 'applied') {
        return NextResponse.json({ error: DISCOUNT_CODE_NO_LONGER_ACTIVE_ERROR_MESSAGE }, { status: 409 });
    }

    const activeDiscount = discountCodeConsumption.activeDiscount;
    const storedRegistration = createStoredCommunityMembershipRegistration(registrationRequest, activeDiscount);
    const contactNote = createCommunityMembershipRegistrationContactNote(storedRegistration);
    if (contactNote.length > MAXIMAL_CONTACT_TEXT_LENGTH) {
        return NextResponse.json({ error: INVALID_REGISTRATION_ERROR_MESSAGE }, { status: 400 });
    }

    const { contact, errorMessage } = await insertContact(contactsTable, {
        fullname: registrationRequest.fullname,
        email: registrationRequest.email,
        userNote: contactNote,
        submissionEvidence,
        isWaitlisted: false,
        placeName: COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME,
        appName: APP_NAME,
        userAgent: request.headers.get('user-agent'),
        ipAddress: readClientIpAddress(request),
        referrer: request.headers.get('referer'),
        url: request.headers.get('referer'),
    });

    if (contact === null) {
        console.error('Failed to write the community membership registration:', errorMessage);
        return NextResponse.json({ error: REGISTRATION_NOT_WRITTEN_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json(createCommunityMembershipRegistrationResult(registrationRequest, activeDiscount));
}
