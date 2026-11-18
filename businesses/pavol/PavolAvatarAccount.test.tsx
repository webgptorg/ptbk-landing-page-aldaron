/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { AvatarAccountState, AvatarAvailability } from '@/lib/pavol-avatar/presentation';

vi.mock('next/image', () => ({ default: (props: { src: string; alt: string }) => <img {...props} /> }));
vi.mock('@/components/agents/FloatingAgentChat', () => ({
    FloatingAgentChat: ({ sourceKey, endpoint, attachmentEndpoint }: { sourceKey: string; endpoint: string; attachmentEndpoint: string }) =>
        <div data-testid="account-chat" data-source={sourceKey} data-endpoint={endpoint} data-attachment-endpoint={attachmentEndpoint}>Shared chat</div>,
}));
import { PavolAvatarAccount } from './PavolAvatarAccount';

const availability: AvatarAvailability = {
    enabled: true, authEnabled: true, authMethod: 'otp', billingEnabled: true, isTest: false,
    limits: { free: 5, light: 50, full: 500 },
};
const principal = { id: '63b685c4-2698-4517-b70f-694554a71619', email: 'buyer@example.test' };
const orderId = 'a6aa01b2-aa51-4d63-86ec-9825bc421583';
const tokenId = 'cbe36f75-99da-42bb-9d25-20572972f55a';
const secret = 'pavol_ThisSecretMustOnlyAppearInTheImmediateCreateResponse';
const fetchMock = vi.fn();
let account: AvatarAccountState;
let tokens: Array<{ id: string; label: string; createdAt: string }>;

function signedIn(plan: 'free'|'light'|'full', used = 0): AvatarAccountState {
    return {
        principal, availability,
        access: { plan, limit: availability.limits[plan], used,
            periodStart: '2026-11-01T00:00:00.000Z', periodEnd: '2026-12-01T00:00:00.000Z',
            subscription: plan === 'full' ? { id: orderId, status: 'active', cancelAtPeriodEnd: false, paidThrough: '2026-12-17T00:00:00.000Z' } : null },
    };
}
function connections() {
    return { tokens, setup: { codex: 'codex mcp add pavol-avatar --url https://pavolhejny.cz/api/pavol-avatar/mcp --bearer-token-env-var PAVOL_AVATAR_TOKEN',
        claude: '{"mcpServers":{"pavol-avatar":{"type":"http"}}}', opencode: '{"mcp":{"servers":{"pavol-avatar":{"type":"remote"}}}}' },
        telegram: { available: false } };
}
function callsTo(path: string, method?: string) {
    return fetchMock.mock.calls.filter(([url, options]) => url === path && (!method || (options?.method ?? 'GET') === method));
}
beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/avatar');
    account = { principal: null, access: null, availability };
    tokens = [];
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
        const method = options?.method ?? 'GET';
        if (url === '/api/pavol-avatar/access') return Response.json(account);
        if (url === '/api/pavol-avatar/conversations' && method === 'GET') return Response.json({ conversations: [] });
        if (url === '/api/pavol-avatar/tokens' && method === 'GET') return Response.json(connections());
        if (url === '/api/pavol-avatar/tokens' && method === 'POST') {
            tokens = [{ id: tokenId, label: (JSON.parse(String(options?.body)) as { label: string }).label, createdAt: '2026-11-17T09:00:00.000Z' }];
            return Response.json({ id: tokenId, label: tokens[0].label, token: secret }, { status: 201 });
        }
        if (url === '/api/pavol-avatar/tokens' && method === 'DELETE') {
            tokens = [];
            return Response.json({ isRevoked: true });
        }
        if (url === '/api/pavol-avatar/auth' && method === 'DELETE') {
            account = { principal: null, access: null, availability };
            return Response.json({ isSignedOut: true });
        }
        throw new Error('Unexpected request: ' + method + ' ' + url);
    });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('avatar account and subscription boundaries', () => {
    it('requires verified access before checkout and does not make a purchase or enrol in marketing from the guest offer', async () => {
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        const buy = await screen.findByRole('button', { name: 'Získat Full' });
        await waitFor(() => expect(buy).toBeEnabled());
        fireEvent.click(buy);
        expect(await screen.findByText('Nejdřív ověř svůj e-mail. Pak můžeš dokončit objednávku.')).toBeVisible();
        expect(screen.getByLabelText('E-mail')).toHaveFocus();
        expect(screen.queryByRole('button', { name: 'Objednat s povinností platby' })).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(callsTo('/api/pavol-avatar/checkout')).toHaveLength(0);
        expect(callsTo('/api/pavol-avatar/auth')).toHaveLength(0);
        expect(document.body).toHaveTextContent('Nejde o přihlášení k marketingu.');
        expect(screen.queryByRole('button', { name: 'Odhlásit' })).not.toBeInTheDocument();
    });

    it('keeps the visitor signed out and shows the provider failure instead of pretending a code was sent', async () => {
        const original = fetchMock.getMockImplementation()!;
        fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
            if (url === '/api/pavol-avatar/auth' && options?.method === 'POST') {
                return Response.json({ error: 'Odeslání e-mailu se nepodařilo. Zkus to později.' }, { status: 503 });
            }
            return original(url, options);
        });
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        const send = await screen.findByRole('button', { name: 'Poslat přihlašovací kód' });
        await waitFor(() => expect(send).toBeEnabled());
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'buyer@example.test' } });
        fireEvent.click(send);
        expect(await screen.findByRole('alert')).toHaveTextContent('Odeslání e-mailu se nepodařilo.');
        expect(screen.queryByLabelText('Kód z e-mailu')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Odhlásit' })).not.toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toBeEnabled();
        const body = JSON.parse(String(callsTo('/api/pavol-avatar/auth', 'POST')[0][1].body));
        expect(body).toEqual({ email: 'buyer@example.test', returnTo: '/avatar' });
        expect(callsTo('/api/pavol-avatar/checkout')).toHaveLength(0);
    });

    it('opens verified Free access in chat without a remaining-question banner or paid connector rights', async () => {
        account = signedIn('free', 2);
        localStorage.setItem('pavol-chat:v1:pavol-cs', 'unrelated homepage history');
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        expect(await screen.findByText(principal.email)).toBeVisible();
        expect(document.body).not.toHaveTextContent('3 / 5');
        expect(screen.getByTestId('account-chat')).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Získat Full' })).not.toBeInTheDocument();
        const chat = screen.getByTestId('account-chat');
        expect(chat).toHaveAttribute('data-source', 'avatar-account-' + principal.id + '-cs');
        expect(chat).toHaveAttribute('data-endpoint', '/api/pavol-avatar/chat');
        expect(chat).toHaveAttribute('data-attachment-endpoint', '/api/pavol-avatar/attachments');
        expect(localStorage.getItem('pavol-chat:v1:pavol-cs')).toBe('unrelated homepage history');
        fireEvent.click(screen.getByRole('button', { name: 'Připojení' }));
        expect(await screen.findByText('MCP a Telegram jsou součástí Full.')).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Vytvořit přístupový token' })).not.toBeInTheDocument();
        expect(callsTo('/api/pavol-avatar/tokens', 'POST')).toHaveLength(0);
    });

    it('opens the real checkout form only after verified account access and keeps its consent product-specific', async () => {
        account = signedIn('free');
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        await screen.findByText(principal.email);
        fireEvent.click(screen.getByRole('button', { name: 'Předplatné' }));
        fireEvent.click(screen.getByRole('button', { name: 'Získat Full' }));
        expect(await screen.findByRole('heading', { name: 'Objednat Full' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Objednat s povinností platby' })).toBeDisabled();
        expect(screen.getByRole('link', { name: 'podmínkami avatara' })).toHaveAttribute('href', '/avatar/legal/terms/2026-11-17-v1');
        expect(screen.getByRole('link', { name: 'informace o soukromí' })).toHaveAttribute('href', '/avatar/legal/privacy/2026-11-17-v1');
        expect(screen.getByLabelText(/Žádám o okamžité zpřístupnění služby/)).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')).toHaveLength(3); // company, terms, immediate start; never marketing.
        expect(callsTo('/api/pavol-avatar/checkout')).toHaveLength(0);
        expect(callsTo('/api/promptbook-billing/checkout')).toHaveLength(0);
    });
    it('keeps a shared discount link through verified login and opens the prefilled checkout', async () => {
        window.history.replaceState(null, '', '/avatar?code=SHARED');
        const original = fetchMock.getMockImplementation()!;
        fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
            if (url === '/api/pavol-avatar/auth' && options?.method === 'POST') {
                const input = JSON.parse(String(options.body)) as { code?: string };
                if (input.code) { account = signedIn('free'); return Response.json({ isVerified: true }); }
                return Response.json({ method: 'otp' });
            }
            if (url === '/api/discount-codes/validate') return Response.json({ activeDiscount: { code: 'SHARED', percent: 30, remainingUseCount: null, subscriptionDiscountDurationMonths: 3 } });
            return original(url, options);
        });
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        const send = await screen.findByRole('button', { name: 'Poslat přihlašovací kód' });
        await waitFor(() => expect(send).toBeEnabled());
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: principal.email } }); fireEvent.click(send);
        fireEvent.change(await screen.findByLabelText('Kód z e-mailu'), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: 'Ověřit kód' }));
        expect(await screen.findByRole('heading', { name: 'Objednat Full' })).toBeVisible();
        expect(await screen.findByDisplayValue('SHARED')).toBeVisible();
        expect(await screen.findByText('700 Kč')).toBeVisible();
        expect(JSON.parse(String(callsTo('/api/pavol-avatar/auth', 'POST')[0][1].body))).toEqual({ email: principal.email, discountCode: 'SHARED', returnTo: '/avatar?code=SHARED' });
        expect(callsTo('/api/pavol-avatar/checkout')).toHaveLength(0);
    });
    it('does not open another purchase from a discount link for a current Full subscriber', async () => {
        window.history.replaceState(null, '', '/avatar?code=SHARED'); account = signedIn('full');
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        await screen.findByText(principal.email);
        expect(screen.queryByRole('heading', { name: 'Objednat Full' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tvůj tarif' })).toBeDisabled();
        expect(callsTo('/api/discount-codes/validate')).toHaveLength(0);
    });

    it('shows a newly created connector secret once, lists only metadata, and revokes the selected connection', async () => {
        account = signedIn('full', 17);
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        await screen.findByText(principal.email);
        fireEvent.click(screen.getByRole('button', { name: 'Připojení' }));
        fireEvent.change(await screen.findByLabelText('Název připojení'), { target: { value: 'Codex notebook' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit přístupový token' }));
        expect(await screen.findByText(secret)).toBeVisible();
        expect(await screen.findByText('Codex notebook')).toBeVisible();
        expect(JSON.parse(String(callsTo('/api/pavol-avatar/tokens', 'POST')[0][1].body))).toEqual({ label: 'Codex notebook' });
        fireEvent.click(screen.getByRole('button', { name: 'Skrýt token' }));
        expect(screen.queryByText(secret)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Předplatné' }));
        fireEvent.click(screen.getByRole('button', { name: 'Připojení' }));
        await waitFor(() => expect(callsTo('/api/pavol-avatar/tokens', 'GET').length).toBeGreaterThanOrEqual(3));
        expect(screen.queryByText(secret)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Odpojit' }));
        await waitFor(() => expect(screen.queryByText('Codex notebook')).not.toBeInTheDocument());
        expect(JSON.parse(String(callsTo('/api/pavol-avatar/tokens', 'DELETE')[0][1].body))).toEqual({ id: tokenId });
        expect(localStorage.getItem('PAVOL_AVATAR_TOKEN')).toBeNull();
        expect(screen.getByRole('link', { name: 'Stáhnout SKILL.md' })).toHaveAttribute('href', '/api/pavol-avatar/skill');
    });

    it('clears a connector secret and paid account UI on sign out without cancelling any product', async () => {
        account = signedIn('full');
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        await screen.findByText(principal.email);
        fireEvent.click(screen.getByRole('button', { name: 'Připojení' }));
        fireEvent.change(await screen.findByLabelText('Název připojení'), { target: { value: 'Temporary connection' } });
        fireEvent.click(screen.getByRole('button', { name: 'Vytvořit přístupový token' }));
        await screen.findByText(secret);
        fireEvent.click(screen.getByRole('button', { name: 'Odhlásit' }));
        await screen.findByRole('button', { name: 'Poslat přihlašovací kód' });
        expect(screen.queryByText(secret)).not.toBeInTheDocument();
        expect(screen.queryByText(principal.email)).not.toBeInTheDocument();
        expect(screen.queryByTestId('account-chat')).not.toBeInTheDocument();
        expect(callsTo('/api/pavol-avatar/auth', 'DELETE')).toHaveLength(1);
        expect(callsTo('/api/pavol-avatar/portal')).toHaveLength(0);
        expect(callsTo('/api/promptbook-billing/portal')).toHaveLength(0);
    });

    it('makes the paid allowance finite and shared and does not advertise automatic overages or unavailable voice', async () => {
        render(<PavolAvatarAccount language="cs" availability={availability} />);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Získat Full' })).toBeEnabled());
        const fullCard = screen.getByRole('button', { name: 'Získat Full' }).closest('article')!;
        expect(within(fullCard).getByRole('heading')).toHaveTextContent(/1\s?000 Kč/);
        expect(within(fullCard).getByText('500 otázek za kalendářní měsíc')).toBeVisible();
        expect(within(fullCard).getByText('MCP · Claude Code, Codex, OpenCode')).toBeVisible();
        expect(document.body).toHaveTextContent('Spotřeba je společná pro všechna připojení; další poplatky automaticky neúčtujeme.');
        expect(document.body).toHaveTextContent('Hlasový rozhovor připravujeme.');
    });
});
