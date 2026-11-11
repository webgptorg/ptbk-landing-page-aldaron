// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendJson } from '@/lib/api/requestJson';
import { CompanyNameInput } from './CompanyNameInput';

vi.mock('@/lib/api/requestJson', () => ({ sendJson: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

const company = { country: 'CZ' as const, companyId: '21012288', name: 'AI Web s.r.o.',
    address: { line1: 'Registr 2', city: 'Praha', postal_code: '11000', country: 'CZ' as const } };

function mount(onSelect = vi.fn(), searchEnabled = true) {
    function Form() {
        const [value, setValue] = useState('');
        return <CompanyNameInput value={value} disabled={false} searchEnabled={searchEnabled}
            onChange={setValue} onSelect={onSelect} />;
    }
    render(<Form />);
    const input = screen.getByLabelText('Název firmy');
    fireEvent.focus(input);
    return input;
}

describe('Company name suggestions', () => {
    it('supports keyboard selection and dismisses suggestions without requiring selection', async () => {
        vi.mocked(sendJson).mockResolvedValue({ companies: [company], hasMore: false });
        const onSelect = vi.fn();
        const input = mount(onSelect);
        fireEvent.change(input, { target: { value: 'AI Web' } });
        await screen.findByRole('option');
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(company);
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it.each([false, true])('leaves the name editable after empty results or an unavailable register (%s)', async (unavailable) => {
        if (unavailable) vi.mocked(sendJson).mockRejectedValue(new Error('Unavailable'));
        else vi.mocked(sendJson).mockResolvedValue({ companies: [], hasMore: false });
        const input = mount();
        fireEvent.change(input, { target: { value: 'Nová firma' } });
        await screen.findByText(unavailable ? /Vyhledávání není dostupné/ : /Firmu jsme nenašli/);
        expect((input as HTMLInputElement).value).toBe('Nová firma');
        expect(input.hasAttribute('disabled')).toBe(false);
    });

    it('discards a pending response after the user changes the search', async () => {
        let complete: ((value: unknown) => void) | undefined;
        vi.mocked(sendJson).mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
        const input = mount();
        fireEvent.change(input, { target: { value: 'AI Web' } });
        await waitFor(() => expect(sendJson).toHaveBeenCalled());
        fireEvent.change(input, { target: { value: 'AI' } });
        complete?.({ companies: [company], hasMore: false });
        await waitFor(() => expect(screen.queryByRole('option')).toBeNull());
        expect((input as HTMLInputElement).value).toBe('AI');
    });

    it('uses manual entry without issuing name-search requests for unsupported countries', async () => {
        const input = mount(vi.fn(), false);
        fireEvent.change(input, { target: { value: 'Slovenská firma' } });
        expect(input.getAttribute('role')).toBeNull();
        expect(sendJson).not.toHaveBeenCalled();
    });
});
