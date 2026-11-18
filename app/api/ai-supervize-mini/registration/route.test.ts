import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import { createAiSupervizeMiniWorkshopQuoteKey } from '@/businesses/ai-supervize-mini/workshopRegistration';
import type { InternalOneTimePayment } from '@/lib/payments/paymentCollectionPolicy';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createContactsUnreachableResponseMock,
    consumeDiscountCodeMock,
    loadActiveDiscountMock,
    getContactsTableOrNullMock,
    insertContactMock,
    loadEventsMock,
    loadWorkshopAvailabilityMock,
} = vi.hoisted(() => ({
    createContactsUnreachableResponseMock: vi.fn(),
    consumeDiscountCodeMock: vi.fn(),
    loadActiveDiscountMock: vi.fn(),
    getContactsTableOrNullMock: vi.fn(),
    insertContactMock: vi.fn(),
    loadEventsMock: vi.fn(),
    loadWorkshopAvailabilityMock: vi.fn(),
}));

vi.mock('@/lib/contacts/contactsDatabase', () => ({
    createContactsUnreachableResponse: createContactsUnreachableResponseMock,
    getContactsTableOrNull: getContactsTableOrNullMock,
    insertContact: insertContactMock,
}));

vi.mock('@/businesses/ai-supervize-mini/workshopRegistrationDatabase', () => ({
    loadAiSupervizeMiniEvents: loadEventsMock,
    loadAiSupervizeMiniWorkshopAvailabilityFromContactsTable: loadWorkshopAvailabilityMock,
}));

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    consumeDiscountCode: consumeDiscountCodeMock,
    loadActiveDiscount: loadActiveDiscountMock,
}));

import { POST } from './route';

const CONTACTS_TABLE = {};

/**
 * The terms this workshop publishes, exactly as the administration of events stores them
 */
const ONSITE_EVENT_SLUG = 'ai-supervize-mini-2026-09-04';
const ONLINE_EVENT_SLUG = 'ai-supervize-mini-2026-09-09';
const EVENTS = [
    {
        id: 'onsite-event-id',
        kind: 'workshop',
        slug: ONSITE_EVENT_SLUG,
        title: 'AI Supervize Mini · Praha',
        description: 'Prezenční workshop',
        startsAt: '2026-09-04T10:00:00+02:00',
        endsAt: '2026-09-04T16:00:00+02:00',
        isPublished: true,
        event: {
            type: 'ai-supervize-mini',
            locationKind: 'onsite',
            locationLabel: 'Praha',
            priceCzk: 12000,
            maximumParticipantCount: 10,
            externalUrl: null,
        },
    },
    {
        id: 'online-event-id',
        kind: 'workshop',
        slug: ONLINE_EVENT_SLUG,
        title: 'AI Supervize Mini · online',
        description: 'Online workshop',
        startsAt: '2026-09-09T13:00:00+02:00',
        endsAt: '2026-09-09T17:00:00+02:00',
        isPublished: true,
        event: {
            type: 'ai-supervize-mini',
            locationKind: 'online',
            locationLabel: '',
            priceCzk: 3000,
            maximumParticipantCount: 50,
            externalUrl: null,
        },
    },
] as const;
const WORKSHOP_AVAILABILITIES = [
    { eventSlug: ONSITE_EVENT_SLUG, registeredParticipantCount: 2, remainingSeatCount: 8 },
    { eventSlug: ONLINE_EVENT_SLUG, registeredParticipantCount: 4, remainingSeatCount: 46 },
] as const;

function createRegistrationRequest(overrides: Readonly<Record<string, unknown>> = {}): NextRequest {
    return new NextRequest('http://localhost/api/ai-supervize-mini/registration', {
        method: 'POST',
        body: JSON.stringify({
            ...createContactNoticeFields(),
            eventSlug: ONSITE_EVENT_SLUG,
            participantCount: 2,
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            company: 'Firma s.r.o.',
            invoiceType: 'company',
            billingDetails: 'Firma s.r.o., IČO 12345678',
            userNote: 'Chceme probrat code review.',
            discountCode: 'webinar-2026-08-20',
            ...overrides,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('AI Supervize Mini registration endpoint', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-20T12:00:00+02:00'));
        createContactsUnreachableResponseMock.mockReset();
        consumeDiscountCodeMock.mockReset();
        loadActiveDiscountMock.mockReset();
        getContactsTableOrNullMock.mockReset();
        insertContactMock.mockReset();
        loadEventsMock.mockReset();
        loadWorkshopAvailabilityMock.mockReset();
        getContactsTableOrNullMock.mockReturnValue(CONTACTS_TABLE);
        loadEventsMock.mockResolvedValue(EVENTS);
        loadWorkshopAvailabilityMock.mockResolvedValue({
            workshopAvailabilities: WORKSHOP_AVAILABILITIES,
            errorMessage: null,
        });
        insertContactMock.mockResolvedValue({ contact: { id: 1 }, errorMessage: null });
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'applied',
            activeDiscount: {
                code: 'WEBINAR_2026_08_20',
                percent: 25,
                remainingUseCount: null,
                subscriptionDiscountDurationMonths: null,
            },
            errorMessage: null,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('stores a server-calculated registration and its webinar discount in a contact', async () => {
        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as {
            workshopAvailabilities: typeof WORKSHOP_AVAILABILITIES;
            workshopPrice: { basePriceCzk: number; discountAmountCzk: number; finalPriceCzk: number };
        };

        expect(response.status).toBe(200);
        expect(loadWorkshopAvailabilityMock).toHaveBeenCalledWith(CONTACTS_TABLE, EVENTS);
        expect(consumeDiscountCodeMock).toHaveBeenCalledWith('webinar-2026-08-20', 'ai-supervize-mini-onsite');
        expect(insertContactMock).toHaveBeenCalledTimes(1);
        expect(responseBody.workshopPrice).toEqual({
            basePriceCzk: 24000,
            discountAmountCzk: 6000,
            finalPriceCzk: 18000,
        });
        expect(responseBody.workshopAvailabilities).toContainEqual({
            eventSlug: ONSITE_EVENT_SLUG,
            registeredParticipantCount: 4,
            remainingSeatCount: 6,
        });

        const storedContact = insertContactMock.mock.calls[0]![1] as { readonly userNote: string };
        const storedRegistration = JSON.parse(storedContact.userNote) as Record<string, unknown>;

        expect(storedContact).toMatchObject({
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            placeName: 'AiSupervizeMiniWorkshopRegistration',
        });
        // The stored payload keeps the field name every earlier registration was written with, so the seats already
        // taken keep being counted against the very same term.
        expect(storedRegistration).toMatchObject({
            selectedDateId: ONSITE_EVENT_SLUG,
            selectedFormat: 'Prezenčně · Praha',
            participantCount: 2,
            discountCodeUsed: 'WEBINAR_2026_08_20',
            discountPercentApplied: 25,
            unitPriceCzk: 12000,
            computedFinalPriceCzk: 18000,
            isVatPayer: false,
        });
    });

    it('refuses a registration which no longer fits into the current contact-based capacity', async () => {
        const response = await POST(createRegistrationRequest({ participantCount: 9 }));
        const responseBody = (await response.json()) as { error: string; workshopAvailabilities: unknown };

        expect(response.status).toBe(409);
        expect(responseBody.error).toBe('V tomto termínu zbývá už jen 8 míst.');
        expect(responseBody.workshopAvailabilities).toEqual(WORKSHOP_AVAILABILITIES);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it.each([0, 1, 10, 14.99])('finishes a %s CZK one-time purchase as paid without collecting money', async (amount) => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'applied', errorMessage: null, activeDiscount: {
            code: 'FIXED', percent: 100, remainingUseCount: 2, subscriptionDiscountDurationMonths: null,
            definitionVersion: 7, priceRule: { kind: 'fixed', amount, currency: 'CZK' },
        } });
        const response = await POST(createRegistrationRequest({ discountCode: 'FIXED' }));
        const result = await response.json() as { oneTimePayment: InternalOneTimePayment; workshopAvailabilities: typeof WORKSHOP_AVAILABILITIES };
        expect(response.status).toBe(200);
        expect(result.oneTimePayment).toMatchObject({ status: 'paid', provider: 'internal', amountBeforeWaiver: Math.round(amount * 100),
            waivedAmount: Math.round(amount * 100), amountDue: 0, amountPaid: 0, gateway: 'stripe', gatewayMinimumAmount: 1500 });
        const contact = insertContactMock.mock.calls[0]![1];
        expect(contact.oneTimePayment).toEqual(result.oneTimePayment);
        expect(JSON.parse(contact.userNote)).toMatchObject({ computedFinalPriceCzk: amount,
            discountSnapshot: { definitionVersion: 7, finalAmount: Math.round(amount * 100) } });
        expect(result.workshopAvailabilities[0].registeredParticipantCount).toBe(4);
    });

    it('keeps exactly 15 CZK on the existing payment flow and ignores a forged client payment', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'applied', errorMessage: null, activeDiscount: {
            code: 'FIXED', percent: 100, remainingUseCount: null, subscriptionDiscountDurationMonths: null,
            priceRule: { kind: 'fixed', amount: 15, currency: 'CZK' },
        } });
        const response = await POST(createRegistrationRequest({ oneTimePayment: { status: 'paid', amountPaid: 1500 } }));
        expect((await response.json() as { oneTimePayment: InternalOneTimePayment | null }).oneTimePayment).toBeNull();
        expect(insertContactMock.mock.calls[0]![1]).not.toHaveProperty('oneTimePayment');
    });

    it('rejects a stale free quote before consuming a use or storing a payable registration', async () => {
        const quotedPrice = createAiSupervizeMiniWorkshopQuoteKey(EVENTS[0], 2, { code: 'FREE', percent: 100,
            remainingUseCount: 1, subscriptionDiscountDurationMonths: null });
        loadActiveDiscountMock.mockResolvedValue({ activeDiscount: null, errorMessage: null });
        const response = await POST(createRegistrationRequest({ quotedPrice }));
        expect(response.status).toBe(409);
        expect(consumeDiscountCodeMock).not.toHaveBeenCalled();
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('rejects a rule change during atomic consumption instead of completing a different offer', async () => {
        const discount = { code: 'FREE', percent: 100, remainingUseCount: 1, subscriptionDiscountDurationMonths: null };
        const quotedPrice = createAiSupervizeMiniWorkshopQuoteKey(EVENTS[0], 2, discount);
        loadActiveDiscountMock.mockResolvedValue({ activeDiscount: discount, errorMessage: null });
        const response = await POST(createRegistrationRequest({ quotedPrice }));
        expect(response.status).toBe(409);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not mark a waiting-list entry as a completed free purchase', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'applied', errorMessage: null, activeDiscount: {
            code: 'FREE', percent: 100, remainingUseCount: null, subscriptionDiscountDurationMonths: null,
        } });
        loadWorkshopAvailabilityMock.mockResolvedValue({ errorMessage: null,
            workshopAvailabilities: [{ ...WORKSHOP_AVAILABILITIES[0], remainingSeatCount: 0 }] });
        const response = await POST(createRegistrationRequest());
        expect(await response.json()).toMatchObject({ isWaitlisted: true, oneTimePayment: null });
        expect(insertContactMock.mock.calls[0]![1]).not.toHaveProperty('oneTimePayment');
    });

    it('does not report a successful purchase when the atomic contact/receipt write fails', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'applied', errorMessage: null, activeDiscount: {
            code: 'FREE', percent: 100, remainingUseCount: null, subscriptionDiscountDurationMonths: null,
        } });
        insertContactMock.mockResolvedValue({ contact: null, errorMessage: 'Receipt persistence failed' });
        const response = await POST(createRegistrationRequest());
        expect(response.status).toBe(500);
        expect(await response.json()).not.toHaveProperty('oneTimePayment');
    });

    it('stores a full term as a waitlist registration instead of refusing it', async () => {
        const fullWorkshopAvailabilities = [
            { eventSlug: ONSITE_EVENT_SLUG, registeredParticipantCount: 10, remainingSeatCount: 0 },
            { eventSlug: ONLINE_EVENT_SLUG, registeredParticipantCount: 4, remainingSeatCount: 46 },
        ] as const;
        loadWorkshopAvailabilityMock.mockResolvedValue({
            workshopAvailabilities: fullWorkshopAvailabilities,
            errorMessage: null,
        });

        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as {
            isWaitlisted: boolean;
            workshopAvailabilities: typeof fullWorkshopAvailabilities;
        };

        expect(response.status).toBe(200);
        expect(insertContactMock).toHaveBeenCalledWith(CONTACTS_TABLE, expect.objectContaining({ isWaitlisted: true }));
        expect(responseBody.isWaitlisted).toBe(true);
        expect(responseBody.workshopAvailabilities).toContainEqual({
            eventSlug: ONSITE_EVENT_SLUG,
            registeredParticipantCount: 10,
            remainingSeatCount: 0,
        });
    });

    it('does not store a registration when its submitted discount cannot be verified', async () => {
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'unusable',
            activeDiscount: null,
            errorMessage: 'Database not configured',
        });

        const response = await POST(createRegistrationRequest());

        expect(response.status).toBe(503);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not store a registration when a limited discount has no uses left', async () => {
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'exhausted',
            activeDiscount: null,
            errorMessage: null,
        });

        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as { error: string };

        expect(response.status).toBe(409);
        expect(responseBody.error).toContain('vyčerpán');
        expect(insertContactMock).not.toHaveBeenCalled();
    });
});
