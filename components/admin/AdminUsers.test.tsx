/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AdminUsers } from './AdminUsers';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import type { AdminUser } from '@/lib/admin/adminUserSchemas';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: mocks.request }));
const USER: AdminUser = { id: '11111111-1111-4111-8111-111111111111', username: 'links', permissions: ['shortener'],
    isEnabled: true, createdAt: '2026-10-28T12:00:00Z', updatedAt: '2026-10-28T12:00:00Z' };

beforeEach(() => { mocks.request.mockReset(); mocks.request.mockResolvedValue({ user: USER }); });
afterEach(async () => { cleanup(); await settleAdminSavesForTest(); });

it('creates only after explicit submit and retains the draft after a failed request', async () => {
    mocks.request.mockRejectedValueOnce(new Error('Účet se nepodařilo vytvořit.'));
    render(<AdminUsers initialUsers={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nový administrátor' }));
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/Uživatelské jméno/), { target: { value: 'links' } });
    fireEvent.change(screen.getByLabelText(/^Heslo/), { target: { value: 'long-private-password' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Zkracovač odkazů' }));
    expect(mocks.request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Vytvořit administrátora' }));
    await screen.findByText('Účet se nepodařilo vytvořit.');
    expect(screen.getByLabelText(/Uživatelské jméno/)).toHaveProperty('value', 'links');
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Vytvořit administrátora' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: /links/ })).toBeTruthy();
});

it('autosaves section edits but changes passwords only after explicit submission', async () => {
    render(<AdminUsers initialUsers={[USER]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Upravit' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Kontakty a leady' }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1), { timeout: 4000 });
    expect((JSON.parse(mocks.request.mock.calls[0][1].body) as { readonly permissions: readonly string[] }).permissions).toEqual(['shortener', 'contacts']);
    fireEvent.change(screen.getByLabelText('Nové heslo'), { target: { value: 'another-private-password' } });
    expect(mocks.request).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Změnit heslo' }));
    await screen.findByText(/Heslo bylo změněno/);
    expect(JSON.parse(mocks.request.mock.calls[1][1].body)).toEqual({ password: 'another-private-password' });
    expect(screen.getByLabelText('Nové heslo')).toHaveProperty('value', '');
});
