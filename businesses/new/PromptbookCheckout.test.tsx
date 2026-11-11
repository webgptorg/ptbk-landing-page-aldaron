// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JsonRequestError, sendJson } from '@/lib/api/requestJson';
import { validateDiscountCode } from '@/lib/discounts/discountCodeApi';
import { getPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { PromptbookCheckout } from './PromptbookCheckout';

vi.mock('@/lib/api/requestJson', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/api/requestJson')>()),
    sendJson: vi.fn(),
}));
vi.mock('@/lib/discounts/discountCodeApi', () => ({ validateDiscountCode: vi.fn() }));

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    window.history.replaceState(null, '', '/');
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

function renderCheckout(enabled = true, slovakiaEnabled = false) {
    return render(
        <PromptbookCheckout
            plan="start"
            availability={{ ...availability, enabled, slovakiaEnabled }}
            promotion={promotion}
            promotionsByPlan={{ start: promotion, business: promotion }}
            initialDiscountCode=""
            initialActiveDiscountByPlaceId={{}}
            canceled={false}
        />,
    );
}

function fillBillingDetails() {
    fireEvent.change(screen.getByLabelText(/Název firmy|Jméno a příjmení/), { target: { value: 'Pavol Hejný' } });
    fireEvent.change(screen.getByLabelText('Ulice a číslo'), { target: { value: 'Testovací 1' } });
    fireEvent.change(screen.getByLabelText('Město'), { target: { value: 'Praha' } });
    fireEvent.change(screen.getByLabelText('PSČ'), { target: { value: '19016' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@example.com' } });
}

function checkoutCalls() {
    return vi.mocked(sendJson).mock.calls.filter(([url]) => url === '/api/promptbook-billing/checkout');
}

describe('Promptbook checkout', () => {
    it('defaults to business purchase with required IČO and hides consumer-only consent', () => {
        renderCheckout();
        expect((screen.getByRole('checkbox', { name: 'Nakupuji na firmu' }) as HTMLInputElement).checked).toBe(true);
        expect(screen.getByLabelText('IČO').hasAttribute('required')).toBe(true);
        expect(screen.queryByLabelText(/Chci zpřístupnit/)).toBeNull();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Nakupuji na firmu' }));
        expect(screen.getByLabelText('Jméno a příjmení')).toBeTruthy();
        expect(screen.getByLabelText(/Chci zpřístupnit/).hasAttribute('required')).toBe(true);
    });

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
        fireEvent.change(screen.getByLabelText(/IČO/), { target: { value: '21012288' } });
        fillBillingDetails();
        fireEvent.click(screen.getByRole('checkbox', { name: /Souhlasím/ }));
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
        expect(checkoutCalls()).toHaveLength(1);
    });

    it('withholds the billing form when the payment configuration is unavailable', () => {
        renderCheckout(false);
        expect(screen.queryByRole('button', { name: 'Pokračovat k platbě' })).toBeNull();
        expect(screen.queryByLabelText('E-mail')).toBeNull();
    });

    it('preserves the order fields when switching plans and validates an arbitrary code for the new plan', async () => {
        const customDiscount = { ...promotion, code: 'PARTNER20', percent: 20 };
        vi.mocked(validateDiscountCode).mockResolvedValueOnce(customDiscount).mockResolvedValueOnce(null);
        vi.mocked(sendJson).mockRejectedValue(new JsonRequestError('Testovací odmítnutí.', 502));
        renderCheckout();
        fireEvent.change(screen.getByLabelText('IČO'), { target: { value: '21012288' } });
        fillBillingDetails();
        fireEvent.change(screen.getByLabelText(/Poznámka/), { target: { value: 'Prosím o kontakt.' } });
        fireEvent.change(screen.getByLabelText(/Slevový kód/), { target: { value: 'PARTNER20' } });
        expect(await screen.findByText(/319,20\sKč/)).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /Vybrat Business/ }));
        expect(window.location.pathname).toBe('/cs/pricing/objednat/business');
        expect(screen.getByLabelText(/Název firmy|Jméno a příjmení/).getAttribute('value')).toBe('Pavol Hejný');
        expect((screen.getByLabelText(/Poznámka/) as HTMLTextAreaElement).value).toBe('Prosím o kontakt.');
        expect(screen.queryByRole('button', { name: /Vybrat Business/ })).toBeNull();
        expect(screen.getByRole('button', { name: 'Pokračovat k platbě' }).hasAttribute('disabled')).toBe(true);
        expect(await screen.findByText('Tento kód pro vybraný tarif neplatí.')).toBeTruthy();
        expect(validateDiscountCode).toHaveBeenLastCalledWith('PARTNER20', getPromptbookDiscountPlaceId('business'));

        fireEvent.change(screen.getByLabelText(/Slevový kód/), { target: { value: '' } });
        fireEvent.click(screen.getByRole('checkbox', { name: /Souhlasím/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat k platbě' }));
        await waitFor(() => expect(checkoutCalls()[0]?.[2]).toEqual(expect.objectContaining({ plan: 'business', promoCode: undefined, expectedDiscount: null })));
        fireEvent.click(await screen.findByRole('radio', { name: /Start/ }));
        expect(window.location.pathname).toBe('/cs/pricing/objednat/start');
        expect((screen.getByLabelText('E-mail') as HTMLInputElement).value).toBe('test@example.com');
    });

    it('allows a consumer to order without IČO or VAT ID and sends their billing details and note', async () => {
        vi.mocked(sendJson).mockRejectedValue(new JsonRequestError('Testovací odmítnutí.', 502));
        renderCheckout(true, true);
        fireEvent.change(screen.getByLabelText('IČO'), { target: { value: '21012288' } });
        fireEvent.change(screen.getByLabelText('DIČ'), { target: { value: 'CZ21012288' } });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Nakupuji na firmu' }));
        fillBillingDetails();
        fireEvent.change(screen.getByLabelText('Země'), { target: { value: 'SK' } });
        fireEvent.change(screen.getByLabelText(/Poznámka/), { target: { value: 'Moje objednávka' } });
        expect(screen.queryByLabelText('IČ DPH')).toBeNull();
        expect(screen.queryByLabelText('IČO')).toBeNull();
        expect(screen.queryByLabelText('DIČ')).toBeNull();
        expect(screen.queryByLabelText('Název firmy')).toBeNull();
        fireEvent.click(screen.getByRole('checkbox', { name: /Souhlasím/ }));
        fireEvent.click(screen.getByRole('checkbox', { name: /Chci zpřístupnit/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Pokračovat k platbě' }));
        await waitFor(() => expect(checkoutCalls()[0]?.[2]).toEqual(expect.objectContaining({
            country: 'SK', isBusiness: false, companyId: '', vatId: undefined, billingName: 'Pavol Hejný',
            billingAddress: { line1: 'Testovací 1', city: 'Praha', postal_code: '19016', country: 'SK' },
            note: 'Moje objednávka', acceptedTerms: true, immediateStart: true,
        })));
    });

    it('fills in registry details without overwriting a manual correction made while lookup is pending', async () => {
        let completeLookup: ((identity: unknown) => void) | undefined;
        vi.mocked(sendJson).mockImplementation(() => new Promise((resolve) => { completeLookup = resolve; }));
        renderCheckout();
        fireEvent.change(screen.getByLabelText(/IČO/), { target: { value: '21012288' } });
        await waitFor(() => expect(sendJson).toHaveBeenCalledWith('/api/promptbook-billing/identity', 'POST', {
            country: 'CZ', companyId: '21012288', vatId: undefined,
        }));
        fireEvent.change(screen.getByLabelText(/Název firmy|Jméno a příjmení/), { target: { value: 'Vlastní název' } });
        completeLookup?.({ name: 'AI Web s.r.o.', address: { line1: 'Registr 2', city: 'Praha', postal_code: '11000', country: 'CZ' } });
        await screen.findByText('Údaje načtené. Můžete je upravit.');
        expect((screen.getByLabelText(/Název firmy|Jméno a příjmení/) as HTMLInputElement).value).toBe('Vlastní název');
        expect((screen.getByLabelText('Ulice a číslo') as HTMLInputElement).value).toBe('Registr 2');
        fireEvent.change(screen.getByLabelText('Ulice a číslo'), { target: { value: 'Moje adresa 3' } });
        expect((screen.getByLabelText('Ulice a číslo') as HTMLInputElement).value).toBe('Moje adresa 3');
    });

    it('discards the previous registry response after changing the country', async () => {
        let completeLookup: ((identity: unknown) => void) | undefined;
        vi.mocked(sendJson).mockImplementation(() => new Promise((resolve) => { completeLookup = resolve; }));
        renderCheckout(true, true);
        fireEvent.change(screen.getByLabelText(/IČO/), { target: { value: '21012288' } });
        await waitFor(() => expect(sendJson).toHaveBeenCalled());
        fireEvent.change(screen.getByLabelText('Země'), { target: { value: 'SK' } });
        completeLookup?.({ name: 'Stará odpověď', address: { line1: 'Registr 2', city: 'Praha', postal_code: '11000' } });
        await waitFor(() => expect((screen.getByLabelText(/Název firmy|Jméno a příjmení/) as HTMLInputElement).value).toBe(''));
    });
});
