/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminUserForm } from './AdminUserForm';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { AdminUser } from '@/lib/admin/adminUserSchemas';
vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: vi.fn() }));
const user: AdminUser = { id: 'existing', username: 'links', permissions: ['shortener'], isEnabled: true, createdAt: '', updatedAt: '' };
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('administrator action editor', () => {
    it('creates an account with only the selected action', async () => {
        vi.mocked(requestAdminJson).mockResolvedValue({ user });
        render(<AdminUserForm user={null} onSaved={vi.fn()} onCreated={vi.fn()} onBusyChange={vi.fn()} />);
        fireEvent.change(screen.getByLabelText(/Uživatelské jméno/), { target: { value: 'creator' } });
        fireEvent.change(screen.getByLabelText(/^Heslo/), { target: { value: 'a-private-long-password' } });
        fireEvent.click(screen.getByLabelText('Vytvářet odkazy'));
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit administrátora' }));
        await waitFor(() => expect(requestAdminJson).toHaveBeenCalled());
        const body = JSON.parse(vi.mocked(requestAdminJson).mock.calls[0][1]!.body as string) as { permissions: string[] };
        expect(body.permissions).toEqual(['shortener:create']);
    });
    it('removes deletion from an existing full-access account without retaining the legacy grant', async () => {
        vi.mocked(requestAdminJson).mockResolvedValue({ user });
        render(<AdminUserForm user={user} onSaved={vi.fn()} onCreated={vi.fn()} onBusyChange={vi.fn()} />);
        expect((screen.getByLabelText('Mazat odkazy') as HTMLInputElement).checked).toBe(true);
        fireEvent.click(screen.getByLabelText('Mazat odkazy'));
        await waitFor(() => expect(requestAdminJson).toHaveBeenCalled(), { timeout: 4000 });
        const body = JSON.parse(vi.mocked(requestAdminJson).mock.calls[0][1]!.body as string) as { permissions: string[] };
        expect(body.permissions).toContain('shortener:create');
        expect(body.permissions).not.toContain('shortener:delete');
        expect(body.permissions).not.toContain('shortener');
    });
});
