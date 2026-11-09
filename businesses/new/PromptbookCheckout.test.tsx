// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JsonRequestError, sendJson } from '@/lib/api/requestJson';
import { validateDiscountCode } from '@/lib/discounts/discountCodeApi';
import { PromptbookCheckout } from './PromptbookCheckout';

vi.mock('@/lib/api/requestJson', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/api/requestJson')>()),
    sendJson: vi.fn(),
}));
vi.mock('@/lib/discounts/discountCodeApi', () => ({ validateDiscountCode: vi.fn() }));

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
});

const promotion = {
    code: 'UVOD',
    percent: 30,
    remainingUseCount: null,
    subscriptionDiscountDurationMonths: 3,
};
const availability = {
    enabled: true,
    slovakiaEnabled: false,
    supportedVersion: '0.115.0-2',
    supportEmail: 'jiri@ptbk.io',
    engineLicenceUrl: 'https://github.com/webgptorg/promptbook/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/LICENSE',
    isTest: false,
};

function renderCheckout(enabled = true) {
    return render(
        <PromptbookCheckout
            plan="start"
            availability={{ ...availability, enabled }}
            promotion={promotion}
            initialDiscountCode=""
            initialActiveDiscountByPlaceId={{}}
            canceled={false}
        />,
    );
}

describe('Promptbook checkout', () => {
    it('displays the exact price through the introductory period and requires reconfirmation if the quote changes', async () => {
        vi.mocked(validateDiscountCode)
            .mockResolvedValueOnce(promotion)
            .mockResolvedValueOnce({ ...promotion, percent: 20 });
        vi.mocked(sendJson).mockRejectedValueOnce(new JsonRequestError('Nabídka se změnila.', 409));
        renderCheckout();

        expect(screen.queryByRole('option', { name: 'Slovensko' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Uplatnit slevu' }));
        expect(await screen.findByText(/279,30\sKč/)).toBeTruthy();
        expect(screen.getByText(/Poté 399\sKč měsíčně/)).toBeTruthy();
        fireEvent.change(screen.getByLabelText('IČO'), { target: { value: '21012288' } });
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat k platbě' }));
        await waitFor(() =>
            expect(sendJson).toHaveBeenCalledWith(
                '/api/promptbook-billing/checkout',
                'POST',
                expect.objectContaining({
                    acceptedTerms: true,
                    country: 'CZ',
                    expectedDiscount: { percent: 30, months: 3 },
                    promoCode: 'UVOD',
                }),
            ),
        );
        fireEvent.click(await screen.findByRole('button', { name: 'Ověřit nabídku znovu' }));
        expect(await screen.findByText(/319,20\sKč/)).toBeTruthy();
        expect(sendJson).toHaveBeenCalledTimes(1);
    });

    it('withholds the billing form when the payment configuration is unavailable', () => {
        renderCheckout(false);
        expect(screen.queryByRole('button', { name: 'Pokračovat k platbě' })).toBeNull();
        expect(screen.queryByLabelText('E-mail')).toBeNull();
    });
});
