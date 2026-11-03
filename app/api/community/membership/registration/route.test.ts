import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createContactsUnreachableResponseMock,
    consumeDiscountCodeMock,
    getContactsTableOrNullMock,
    insertContactMock,
} = vi.hoisted(() => ({
    createContactsUnreachableResponseMock: vi.fn(),
    consumeDiscountCodeMock: vi.fn(),
    getContactsTableOrNullMock: vi.fn(),
    insertContactMock: vi.fn(),
}));

vi.mock('@/lib/contacts/contactsDatabase', () => ({
    createContactsUnreachableResponse: createContactsUnreachableResponseMock,
    getContactsTableOrNull: getContactsTableOrNullMock,
    insertContact: insertContactMock,
}));

vi.mock('@/lib/discounts/discountCodeDatabase', () => ({
    consumeDiscountCode: consumeDiscountCodeMock,
}));

import { POST } from './route';

const CONTACTS_TABLE = {};

function createRegistrationRequest(overrides: Readonly<Record<string, unknown>> = {}): NextRequest {
    return new NextRequest('http://localhost/api/community/membership/registration', {
        method: 'POST',
        body: JSON.stringify({
            ...createContactNoticeFields(),
            planId: 'premium',
            billingPeriod: 'yearly',
            fullname: 'Pavol Hejný',
            email: 'pavol@example.com',
            discountCode: 'community-10',
            termsAccepted: true,
            // A forged browser-side amount is deliberately ignored by the server.
            finalBillingPriceCzk: 1,
            ...overrides,
        }),
        headers: {
            'Content-Type': 'application/json',
            Referer: 'https://ptbk.io/cs/komunita/clenstvi?fullname=Pavol%20Hejn%C3%BD',
        },
    });
}

describe('community membership registration endpoint', () => {
    beforeEach(() => {
        createContactsUnreachableResponseMock.mockReset();
        consumeDiscountCodeMock.mockReset();
        getContactsTableOrNullMock.mockReset();
        insertContactMock.mockReset();

        getContactsTableOrNullMock.mockReturnValue(CONTACTS_TABLE);
        insertContactMock.mockResolvedValue({ contact: { id: 42 }, errorMessage: null });
        consumeDiscountCodeMock.mockResolvedValue({
            status: 'applied',
            activeDiscount: {
                code: 'COMMUNITY_10',
                percent: 10,
                remainingUseCount: 3,
                subscriptionDiscountDurationMonths: null,
            },
            errorMessage: null,
        });
    });

    it('consumes the shared community discount and stores the server-calculated guaranteed price', async () => {
        const response = await POST(createRegistrationRequest());
        const responseBody = (await response.json()) as {
            planId: string;
            billingPeriod: string;
            price: { finalBillingPriceCzk: number; finalMonthlyEquivalentCzk: number };
            trialDayCount: number;
        };

        expect(response.status).toBe(200);
        expect(consumeDiscountCodeMock).toHaveBeenCalledWith('community-10', 'community-membership');
        expect(responseBody).toMatchObject({
            planId: 'premium',
            billingPeriod: 'yearly',
            price: { finalBillingPriceCzk: 8_100, finalMonthlyEquivalentCzk: 675 },
            trialDayCount: 7,
        });

        const storedContact = insertContactMock.mock.calls[0]![1] as {
            readonly fullname: string;
            readonly email: string;
            readonly placeName: string;
            readonly userNote: string;
        };
        const storedRegistration = JSON.parse(storedContact.userNote) as Record<string, unknown>;

        expect(storedContact).toMatchObject({
            fullname: 'Pavol Hejný',
            email: 'pavol@example.com',
            placeName: 'CommunityMembershipRegistration',
        });
        expect(storedRegistration).toMatchObject({
            planId: 'premium',
            billingPeriod: 'yearly',
            agreedBillingPriceCzk: 8_100,
            agreedMonthlyEquivalentCzk: 675,
            discountCodeUsed: 'COMMUNITY_10',
            trialDayCount: 7,
            termsAccepted: true,
        });
    });

    it('refuses an unchecked agreement before consuming a code', async () => {
        const response = await POST(createRegistrationRequest({ termsAccepted: false }));

        expect(response.status).toBe(400);
        expect(consumeDiscountCodeMock).not.toHaveBeenCalled();
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not register a trial when a limited code has been exhausted', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'exhausted', activeDiscount: null, errorMessage: null });

        const response = await POST(createRegistrationRequest());

        expect(response.status).toBe(409);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('does not silently replace an entered inactive discount with the full price', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'unusable', activeDiscount: null, errorMessage: null });

        const response = await POST(createRegistrationRequest());

        expect(response.status).toBe(409);
        expect(insertContactMock).not.toHaveBeenCalled();
    });

    it('allows a registration without a discount code', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'unusable', activeDiscount: null, errorMessage: null });

        const response = await POST(createRegistrationRequest({ discountCode: '' }));
        const responseBody = (await response.json()) as { price: { finalBillingPriceCzk: number } };

        expect(response.status).toBe(200);
        expect(responseBody.price.finalBillingPriceCzk).toBe(9_000);
        expect(insertContactMock).toHaveBeenCalledOnce();
    });

    it('registers the current 199 Kč monthly membership without a trial', async () => {
        consumeDiscountCodeMock.mockResolvedValue({ status: 'unusable', activeDiscount: null, errorMessage: null });

        const response = await POST(
            createRegistrationRequest({ planId: 'membership', billingPeriod: 'monthly', discountCode: '' }),
        );
        const responseBody = (await response.json()) as {
            planId: string;
            billingPeriod: string;
            price: { finalBillingPriceCzk: number; finalMonthlyEquivalentCzk: number };
            trialDayCount: number | null;
        };

        expect(response.status).toBe(200);
        expect(responseBody).toMatchObject({
            planId: 'membership',
            billingPeriod: 'monthly',
            price: { finalBillingPriceCzk: 199, finalMonthlyEquivalentCzk: 199 },
            trialDayCount: null,
        });

        const storedContact = insertContactMock.mock.calls[0]![1] as { readonly userNote: string };
        expect(JSON.parse(storedContact.userNote)).toMatchObject({
            status: 'payment-requested',
            planId: 'membership',
            billingPeriod: 'monthly',
            trialDayCount: null,
            agreedBillingPriceCzk: 199,
        });
    });

    it('refuses yearly billing for the current monthly membership before consuming a code', async () => {
        const response = await POST(createRegistrationRequest({ planId: 'membership', billingPeriod: 'yearly' }));

        expect(response.status).toBe(400);
        expect(consumeDiscountCodeMock).not.toHaveBeenCalled();
        expect(insertContactMock).not.toHaveBeenCalled();
    });
});
