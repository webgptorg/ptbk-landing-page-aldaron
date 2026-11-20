// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiKeyAdministration } from './ApiKeyAdministration';
import { AdminAccessProvider } from './AdminAccessProvider';
import type { ApiKey } from '@/lib/ecosystem-api/contract';

const fakes = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: fakes.request }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));

const token = `ptbk_${'a'.repeat(43)}`;
const key: ApiKey = { id: '4408b4d6-6005-4b77-97eb-fdd67847ee91', name: 'App integration', prefix: token.slice(0, 13), scopes: ['licenses:read'],
    createdAt: '2026-11-20T20:00:00Z', createdBy: 'key-admin', expiresAt: null, revokedAt: null, revokedBy: null };

beforeEach(() => {
    vi.resetAllMocks();
    fakes.request.mockImplementation(async (_url: string, options?: RequestInit) => options?.method === 'POST' ? { key, token }
        : { items: [key], total: 1, offset: 0, limit: 50, legacyConfigured: false });
});
afterEach(cleanup);

function show() {
    return render(<AdminAccessProvider identity={{ id: 'key-admin', username: 'key-admin', isSuperAdmin: false, permissions: ['api-keys'] }}><ApiKeyAdministration /></AdminAccessProvider>);
}

it('shows permitted navigation and reveals a newly created secret only inside the creation dialog', async () => {
    show();
    await screen.findByText('App integration');
    expect(screen.queryByRole('link', { name: /^Licence$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Předplatná a objednávky' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Vytvořit API klíč' }));
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.change(dialog.getByLabelText('Název'), { target: { value: 'App integration' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Vytvořit API klíč' }));
    expect(await screen.findByLabelText('Váš nový API klíč')).toHaveValue(token);
    const write = fakes.request.mock.calls.find((call) => call[1]?.method === 'POST');
    expect(JSON.parse(write![1].body)).toEqual({ name: 'App integration', scopes: ['licenses:read'], expiresAt: null });
    fireEvent.click(screen.getByRole('button', { name: 'Hotovo' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByDisplayValue(token)).not.toBeInTheDocument();
    expect(screen.getByText(`${key.prefix}…`)).toBeInTheDocument();
});

it('requires explicit confirmation before revoking a key', async () => {
    show();
    fireEvent.click(await screen.findByRole('button', { name: 'Zneplatnit' }));
    expect(fakes.request.mock.calls.some((call) => call[1]?.method === 'DELETE')).toBe(false);
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(/App integration/)).toBeInTheDocument();
    fireEvent.click(dialog.getByRole('button', { name: 'Zneplatnit klíč' }));
    await waitFor(() => expect(fakes.request).toHaveBeenCalledWith(`/api/admin/api-keys/${key.id}`, { method: 'DELETE' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
