/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DiscountCodeForm } from './DiscountCodeForm';

afterEach(cleanup);
describe('discount-code form', () => {
    it('defaults subscription discounts to permanent and saves the selected temporary month count', async () => {
        const onSave = vi.fn().mockResolvedValue(true);

        render(
            <DiscountCodeForm
                discountCode={null}
                onSave={onSave}
                onCancelEditing={() => undefined}
            />,
        );

        expect((screen.getByRole('radio', { name: /Trvalá sleva/ }) as HTMLInputElement).checked).toBe(true);

        fireEvent.change(screen.getByLabelText('Slevový kód'), { target: { value: 'community-three-months' } });
        fireEvent.click(screen.getByRole('radio', { name: /Dočasná sleva/ }));
        fireEvent.change(screen.getByRole('spinbutton', { name: /Počet zlevněných měsíců/ }), {
            target: { value: '3' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit slevový kód' }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                code: 'community-three-months',
                subscriptionDiscountDurationMonths: 3,
            }),
        );
    });
    it('creates a formula rule for the entire ecosystem with an exact price preview', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<DiscountCodeForm discountCode={null} onSave={onSave} onCancelEditing={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Slevový kód'), { target: { value: 'CUSTOM' } });
        fireEvent.change(screen.getByLabelText('Typ slevy'), { target: { value: 'formula' } });
        expect(screen.getByText(/5.*000 Kč → 51 Kč/)).toBeDefined();
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit slevový kód' }));
        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ appliesEverywhere: true, placeIds: [], priceRule: { kind: 'formula', expression: 'price * 0.01 + 1', currency: 'CZK' } }));
    });
    it('keeps an invalid formula draft visible and refuses to save it', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<DiscountCodeForm discountCode={null} onSave={onSave} onCancelEditing={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Slevový kód'), { target: { value: 'CUSTOM' } });
        fireEvent.change(screen.getByLabelText('Typ slevy'), { target: { value: 'formula' } });
        fireEvent.change(screen.getByLabelText(/Vzorec výsledné ceny/), { target: { value: 'price.constructor()' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit slevový kód' }));
        expect(onSave).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('price.constructor()')).toBeDefined();
    });

});
