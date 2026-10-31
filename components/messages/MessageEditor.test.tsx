/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
import { MessageEditor } from './MessageEditor';
import { TEST_MESSAGE } from '@/lib/messages/messageTestFixtures';
const agent = { id: TEST_MESSAGE.agentId, name: 'Pavol Hejný', isEnabled: true };
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('two-step message editor', () => {
    it('generates three texts only on request, keeps the draft editable and requires explicit creation', async () => {
        mocks.request.mockResolvedValueOnce({ title: 'První použití', markdown: 'Ahoj týme,\n\nDokončíme registraci.', introduction: 'Můžeme probrat první použití.' });
        const saved = vi.fn();
        render(<MessageEditor message={null} agents={[agent]} audioConfigured={false} onSaved={saved} onBusy={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Celý kontext'), { target: { value: 'The intended decision and full reasoning.' } });
        expect(mocks.request).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Vygenerovat a pokračovat' }));
        expect(await screen.findByLabelText('Titulek')).toHaveValue('První použití');
        expect(screen.getByLabelText('Prefix adresy')).toHaveValue('prvni-pouziti');
        expect(screen.getByLabelText('Úvodní zpráva chatu')).toHaveValue('Můžeme probrat první použití.');
        expect(saved).not.toHaveBeenCalled();
        expect(mocks.request).toHaveBeenCalledTimes(1);
        mocks.request.mockResolvedValueOnce({ message: TEST_MESSAGE });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit zprávu' }));
        await waitFor(() => expect(saved).toHaveBeenCalledWith(TEST_MESSAGE));
        expect(mocks.request.mock.calls[1][0]).toBe('/api/admin/messages');
        expect(mocks.request.mock.calls.some(([url]) => String(url).endsWith('/audio'))).toBe(false);
    });
    it('keeps authored text when explicit regeneration fails', async () => {
        mocks.request.mockRejectedValueOnce(new Error('Generation unavailable.'));
        render(<MessageEditor message={TEST_MESSAGE} agents={[agent]} audioConfigured={false} onSaved={() => undefined} onBusy={() => undefined} />);
        fireEvent.click(screen.getByRole('button', { name: 'Přegenerovat texty' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Generation unavailable.');
        expect(screen.getByLabelText('Krátká zpráva')).toHaveValue(TEST_MESSAGE.markdown);
    });
    it('autosaves existing text without publishing controls or automatically generating speech', async () => {
        mocks.request.mockResolvedValue({ message: { ...TEST_MESSAGE, markdown: 'Updated decision.' } });
        render(<MessageEditor message={TEST_MESSAGE} agents={[agent]} audioConfigured onSaved={() => undefined} onBusy={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Krátká zpráva'), { target: { value: 'Updated decision.' } });
        await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(mocks.request.mock.calls[0][0]).toBe(`/api/admin/messages/${TEST_MESSAGE.id}`);
        const body = JSON.parse(mocks.request.mock.calls[0][1].body) as { context: string; markdown: string };
        expect(body.context).toBe(TEST_MESSAGE.context); expect(body.markdown).toBe('Updated decision.');
        expect(screen.queryByRole('button', { name: /Publikovat/ })).toBeNull();
    });
});
