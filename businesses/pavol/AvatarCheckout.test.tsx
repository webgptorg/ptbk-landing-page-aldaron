// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarCheckout } from './AvatarCheckout';

const fetchMock = vi.fn();
let percent: number | null, months: number | null;
type SubmittedCheckout = { requestId: string; discountCode: string; expectedDiscount: { percent: number; months: number | null } | null };
function submissions() {
    return fetchMock.mock.calls.filter(([url]) => url === '/api/pavol-avatar/checkout').map(([, options]) => JSON.parse(options.body) as SubmittedCheckout);
}
function fillPayer() {
    for (const [label, value] of [['Your name', 'Buyer'], ['Billing name', 'Buyer'], ['Street and number', 'Street 1'], ['City', 'Praha'], ['Postal code', '11000']]) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByLabelText(/I accept the/));
    fireEvent.click(screen.getByLabelText(/I request immediate access/));
}
const pay = () => screen.getByRole('button', { name: 'Order with obligation to pay' });
async function enterCode(value = ' letní 30 ') {
    fireEvent.change(screen.getByLabelText('Discount code'), { target: { value } });
    await screen.findByText(percent === null ? 'This code is not active for this purchase.' : `Active discount: ${percent}%. Remaining uses: 1.`);
}
beforeEach(() => {
    window.history.replaceState(null, '', '/avatar'); percent = 30; months = 3;
    fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(async (url: string) => {
        if (url === '/api/discount-codes/validate') return Response.json({ activeDiscount: percent === null ? null : { code: 'LETNI_30', percent, remainingUseCount: 1, subscriptionDiscountDurationMonths: months } });
        if (url === '/api/pavol-avatar/checkout') return Response.json({ error: 'Retry this checkout' }, { status: 503 });
        throw new Error('Unexpected request ' + url);
    });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('avatar discount checkout UI', () => {
    it('prefills a shared code link, validates the avatar product and explains the limited price in English', async () => {
        window.history.replaceState(null, '', '/avatar?code=LETNI_30#registrace');
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />);
        expect(await screen.findByDisplayValue('LETNI_30')).toBeVisible();
        expect(await screen.findByText('Active discount: 30%. Remaining uses: 1.')).toBeVisible();
        expect(screen.getByText('700 Kč')).toBeVisible();
        expect(screen.getByText('Discount for the first 3 months, then 1,000 Kč per month.')).toBeVisible();
        const [, options] = fetchMock.mock.calls.find(([url]) => url === '/api/discount-codes/validate')!;
        expect(JSON.parse(options.body)).toEqual({ discountCode: 'LETNI_30', discountPlaceId: 'pavol-avatar-full' });
        expect(submissions()).toEqual([]);
    });
    it('blocks submission while checking and for an invalid code; clearing it restores the normal price', async () => {
        percent = null;
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />); fillPayer();
        expect(pay()).toBeEnabled();
        fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: 'INVALID' } });
        expect(pay()).toBeDisabled();
        await screen.findByText('This code is not active for this purchase.');
        expect(pay()).toBeDisabled(); expect(screen.getByLabelText('Discount code')).toHaveAttribute('aria-invalid', 'true');
        fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: '' } });
        expect(pay()).toBeEnabled(); expect(screen.getByText('1,000 Kč')).toBeVisible();
    });
    it('submits the normalized code and visible quote, and retains the attempt after an ambiguous failure', async () => {
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />); fillPayer(); await enterCode();
        fireEvent.click(pay()); await screen.findByRole('alert');
        expect(submissions()[0]).toMatchObject({ discountCode: 'LETNI_30', expectedDiscount: { percent: 30, months: 3 }, billingName: 'Buyer' });
        expect(submissions()[0]).not.toHaveProperty('amount');
        fireEvent.click(pay()); await waitFor(() => expect(submissions()).toHaveLength(2));
        expect(submissions()[1].requestId).toBe(submissions()[0].requestId);
    });
    it.each(['discount_changed', 'checkout_expired', 'checkout_rejected'])('rechecks terms and creates a fresh attempt after %s', async code => {
        const original = fetchMock.getMockImplementation()!;
        fetchMock.mockImplementation(async (url: string, options: RequestInit) => {
            if (url === '/api/pavol-avatar/checkout' && submissions().length === 1) {
                percent = 20;
                return Response.json({ error: 'Discount changed; review the price', code }, { status: 409 });
            }
            return original(url, options);
        });
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />); fillPayer(); await enterCode();
        fireEvent.click(pay());
        await screen.findByText('Discount changed; review the price');
        expect(pay()).toBeDisabled();
        await screen.findByText('800 Kč'); await waitFor(() => expect(pay()).toBeEnabled());
        fireEvent.click(pay()); await waitFor(() => expect(submissions()).toHaveLength(2));
        expect(submissions()[1].expectedDiscount).toEqual({ percent: 20, months: 3 });
        expect(submissions()[1].requestId).not.toBe(submissions()[0].requestId);
    });
    it.each([null, 3])('describes permanent and limited 100%% offers accurately (%s months)', async duration => {
        percent = 100; months = duration;
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />); fillPayer(); await enterCode();
        expect(screen.getByText('0 Kč')).toBeVisible();
        if (duration === null) {
            expect(screen.getByText('Permanent 100% discount. No payment card is required.')).toBeVisible();
            expect(screen.getByRole('button', { name: 'Activate Full for free' })).toBeEnabled();
        } else {
            expect(screen.getByText('Discount for the first 3 months, then 1,000 Kč per month.')).toBeVisible();
            expect(screen.queryByText(/No payment card/)).not.toBeInTheDocument(); expect(pay()).toBeEnabled();
        }
    });
    it('blocks a price below the provider minimum before creating an order', async () => {
        percent = 99;
        render(<AvatarCheckout cs={false} limit={500} onCancel={vi.fn()} />); fillPayer(); await enterCode();
        expect(await screen.findByRole('alert')).toHaveTextContent('15 Kč minimum card payment');
        expect(pay()).toBeDisabled(); expect(submissions()).toEqual([]);
    });
});
