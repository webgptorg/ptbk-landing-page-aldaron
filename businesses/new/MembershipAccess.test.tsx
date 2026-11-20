/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, it, vi } from 'vitest';
import { sendJson } from '@/lib/api/requestJson';
import { MembershipAccess } from './MembershipAccess';

vi.mock('@/lib/api/requestJson', () => ({ sendJson: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('uses the Promptbook session for both steps and preserves the member return location', async () => {
    window.history.replaceState(null, '', '/cs/pricing/predplatne?signin=1#licence');
    vi.mocked(sendJson).mockResolvedValueOnce({ isCodeSent: true }).mockResolvedValueOnce({ isVerified: true });
    const verified = vi.fn();
    render(<MembershipAccess initiallyOpen onVerified={verified} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Přihlášení k Promptbooku');
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'member@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poslat přihlašovací odkaz' }));
    fireEvent.change(await screen.findByLabelText('Kód z e-mailu'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ověřit kód' }));
    expect(await screen.findByText('E-mail jsme ověřili.')).toBeVisible();
    expect(verified).toHaveBeenCalledOnce();
    expect(vi.mocked(sendJson).mock.calls).toEqual([
        ['/api/promptbook-billing/access', 'POST', { email: 'member@example.test', action: 'send', returnTo: '/cs/pricing/predplatne?signin=1#licence' }],
        ['/api/promptbook-billing/access', 'POST', { email: 'member@example.test', action: 'verify', code: '123456' }],
    ]);
});
