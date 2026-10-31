/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/image', () => ({ default: (props: { src: string; alt: string }) => <img {...props} /> }));
vi.mock('@/hooks/useFixedControlClearance', () => ({ useFixedControlClearance: () => ({ clearance: 80, height: 50 }) }));
import { MessageChat } from './MessageChat';

const fetchMock = vi.fn();
describe('floating message conversation', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        fetchMock.mockReset();
        Element.prototype.scrollTo = vi.fn();
    });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it('retains a draft when collapsed, focuses the editor and returns focus on Escape', () => {
        render(<MessageChat messageId="test-message" />);
        const launcher = screen.getByRole('button', { name: 'Otevřít chat s Pavolem' });
        expect(screen.queryByRole('dialog')).toBeNull();
        fireEvent.click(launcher);
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
        fireEvent.change(input, { target: { value: 'Proč právě V0?' } });
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(launcher).toHaveFocus();
        fireEvent.click(launcher);
        expect(screen.getByRole('textbox')).toHaveValue('Proč právě V0?');
        expect(screen.queryByText(/\bAI\b/)).toBeNull();
    });

    it('does not duplicate an in-flight question and retains its answer across collapsing', async () => {
        let resolve!: (value: Response) => void;
        fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
        render(<MessageChat messageId="test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Co má zvládnout první verze?' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(screen.getByRole('textbox')).toBeDisabled();
        expect(screen.getByRole('log')).toHaveTextContent('Co má zvládnout první verze?');
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        resolve(Response.json({ reply: 'Chci jeden dotažený průchod od instalace k prvnímu použití.' }));
        expect(await screen.findByText('Chci jeden dotažený průchod od instalace k prvnímu použití.')).toBeVisible();
        expect(screen.getByRole('textbox')).toHaveValue('');
        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body).toEqual({ messages: [{ role: 'user', content: 'Co má zvládnout první verze?' }] });
    });

    it('preserves a failed question for retry without inventing a conversation turn', async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ error: 'Zkus to za chvíli.' }, { status: 502 }));
        fetchMock.mockResolvedValueOnce(Response.json({ reply: 'Odpověď po opakování.' }));
        render(<MessageChat messageId="test-message" />);
        fireEvent.click(screen.getByRole('button', { name: 'Otevřít chat s Pavolem' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Proč?' } });
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Zkus to za chvíli.');
        expect(screen.getByRole('textbox')).toHaveValue('Proč?');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Odeslat otázku' })).toBeEnabled());
        fireEvent.click(screen.getByRole('button', { name: 'Odeslat otázku' }));
        expect(await screen.findByText('Odpověď po opakování.')).toBeVisible();
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ messages: [{ role: 'user', content: 'Proč?' }] });
    });
});
