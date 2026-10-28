/**
 * @vitest-environment jsdom
 */

import { ShortcodeLinkAdmin } from '@/components/shortener/ShortcodeLinkAdmin';
import type { ShortcodeLinkClick, ShortcodeLinkSummary } from '@/lib/shortener/shortcodeLink';
import {
    fetchAdminShortcodeLinkClicks,
    fetchAdminShortcodeLinks,
} from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/url-shortener', () => ({
    UrlShortener: () => <div data-testid="url-shortener" />,
}));

vi.mock('@/lib/shortener/shortcodeLinkAdminApiClient', () => ({
    deleteAdminShortcodeLink: vi.fn(),
    fetchAdminShortcodeLinkClicks: vi.fn(),
    fetchAdminShortcodeLinks: vi.fn(),
    updateAdminShortcodeLink: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(window.location.search),
}));

const SHORTCODE_LINKS: readonly ShortcodeLinkSummary[] = [
    {
        id: 3,
        createdAt: '2026-08-24T12:00:00.000Z',
        shortcode: 'workshop-link',
        urls: ['https://example.com/workshop'],
        note: null,
        landingPage: null,
        isAdHoc: true,
        sourceApp: 'online-workshop',
        clickCount: 2,
    },
    {
        id: 1,
        createdAt: '2026-08-24T10:00:00.000Z',
        shortcode: 'manual-link',
        urls: ['https://example.com/manual'],
        note: 'campaign',
        landingPage: null,
        isAdHoc: false,
        sourceApp: 'admin-shortener',
        clickCount: 1,
    },
    {
        id: 2,
        createdAt: '2026-08-24T11:00:00.000Z',
        shortcode: 'community-link',
        urls: ['https://example.com/community'],
        note: null,
        landingPage: null,
        isAdHoc: true,
        sourceApp: 'community',
        clickCount: 0,
    },
];

const SHORTCODE_LINK_CLICKS: readonly ShortcodeLinkClick[] = [
    {
        id: 11,
        shortcodeLinkId: 1,
        navigatedAt: '2026-08-24T13:30:00.000Z',
        clickedAt: '2026-08-24T13:31:00.000Z',
        ip: '203.0.113.42',
        userAgent: 'Example browser',
        referer: 'https://example.com/newsletter',
        language: 'cs-CZ',
        platform: 'Windows',
    },
];

const fetchAdminShortcodeLinksMock = vi.mocked(fetchAdminShortcodeLinks);
const fetchAdminShortcodeLinkClicksMock = vi.mocked(fetchAdminShortcodeLinkClicks);

beforeEach(() => {
    window.history.replaceState(null, '', '/admin/shortener');
});

afterEach(() => {
    cleanup();
    fetchAdminShortcodeLinksMock.mockReset();
    fetchAdminShortcodeLinkClicksMock.mockReset();
});

describe('shortcode link administration', () => {
    it('lets a creator open the creation dialog but hides editing, deletion and private click history', async () => {
        window.history.replaceState(null, '', '/admin/shortener?clicksFor=1');
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        render(<ShortcodeLinkAdmin identity={{ id: 'creator', username: 'creator', isSuperAdmin: false, permissions: ['shortener:create'] }} />);
        await screen.findByRole('link', { name: 'manual-link' });
        expect(screen.getByRole('button', { name: 'New short link' })).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
        expect(screen.queryByRole('button', { name: /Show .*click/ })).toBeNull();
        expect(fetchAdminShortcodeLinkClicksMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'New short link' }));
        expect(await screen.findByTestId('url-shortener')).not.toBeNull();
    });

    it('keeps a viewer read-only', async () => {
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        render(<ShortcodeLinkAdmin identity={{ id: 'viewer', username: 'viewer', isSuperAdmin: false, permissions: ['shortener:view'] }} />);
        await screen.findByRole('link', { name: 'manual-link' });
        for (const name of ['New short link', 'Edit', 'Delete']) expect(screen.queryByRole('button', { name })).toBeNull();
    });

    it('filters and sorts links by their immutable creation provenance', async () => {
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        render(<ShortcodeLinkAdmin identity={{ id: 'test-admin', username: 'links', isSuperAdmin: false, permissions: ['shortener'] }} />);

        await screen.findByRole('link', { name: 'manual-link' });
        expect(screen.getByRole('cell', { name: 'Created manually' })).not.toBeNull();
        expect(screen.getAllByRole('cell', { name: 'Ad hoc' })).toHaveLength(2);
        expect(screen.getByRole('cell', { name: 'Online workshop' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Creation type'), { target: { value: 'ad-hoc' } });

        await waitFor(() => expect(screen.queryByRole('link', { name: 'manual-link' })).toBeNull());
        expect(screen.getByRole('link', { name: 'workshop-link' })).not.toBeNull();
        expect(screen.getByRole('link', { name: 'community-link' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Source application'), { target: { value: 'community' } });

        await waitFor(() => expect(screen.queryByRole('link', { name: 'workshop-link' })).toBeNull());
        expect(screen.getByRole('link', { name: 'community-link' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Creation type'), { target: { value: 'all' } });
        fireEvent.change(screen.getByLabelText('Source application'), { target: { value: 'all' } });
        fireEvent.change(screen.getByLabelText('Sort short links by'), { target: { value: 'sourceApp' } });
        fireEvent.change(screen.getByLabelText('Short-link sort direction'), { target: { value: 'ascending' } });

        await waitFor(() => {
            const shortcodeRows = Array.from(screen.getByRole('table').querySelectorAll('tbody tr')).map(
                (row) => row.textContent ?? '',
            );
            expect(shortcodeRows[0]).toContain('manual-link');
            expect(shortcodeRows[1]).toContain('community-link');
            expect(shortcodeRows[2]).toContain('workshop-link');
        });
    });

    it('opens one click history and saves the history and list filters into the URL', async () => {
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        fetchAdminShortcodeLinkClicksMock.mockResolvedValue(SHORTCODE_LINK_CLICKS);
        render(<ShortcodeLinkAdmin identity={{ id: 'test-admin', username: 'links', isSuperAdmin: false, permissions: ['shortener'] }} />);

        await screen.findByRole('button', { name: 'Show 1 click for manual-link' });
        fireEvent.click(screen.getByRole('button', { name: 'Show 1 click for manual-link' }));

        await screen.findByRole('heading', { name: 'Click history for manual-link' });
        expect(fetchAdminShortcodeLinkClicksMock).toHaveBeenCalledWith(1);
        expect(await screen.findByText('203.0.113.42')).not.toBeNull();
        expect(screen.getByText('Example browser')).not.toBeNull();

        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'manual' } });

        await waitFor(() => {
            const searchParams = new URLSearchParams(window.location.search);
            expect(searchParams.get('clicksFor')).toBe('1');
            expect(searchParams.get('search')).toBe('manual');
        });
    });

    it('restores the filters and click history from a shared URL', async () => {
        window.history.replaceState(
            null,
            '',
            '/admin/shortener?search=manual&creation=manual&sourceApp=admin-shortener&sortDirection=ascending&clicksFor=1',
        );
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        fetchAdminShortcodeLinkClicksMock.mockResolvedValue(SHORTCODE_LINK_CLICKS);

        render(<ShortcodeLinkAdmin identity={{ id: 'test-admin', username: 'links', isSuperAdmin: false, permissions: ['shortener'] }} />);

        await screen.findByRole('heading', { name: 'Click history for manual-link' });
        expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('manual');
        expect((screen.getByLabelText('Creation type') as HTMLSelectElement).value).toBe('manual');
        expect((screen.getByLabelText('Source application') as HTMLSelectElement).value).toBe('admin-shortener');
        expect((screen.getByLabelText('Short-link sort direction') as HTMLSelectElement).value).toBe('ascending');
        expect(screen.getByRole('link', { name: 'manual-link' })).not.toBeNull();
        expect(screen.queryByRole('link', { name: 'workshop-link' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'community-link' })).toBeNull();
        expect(fetchAdminShortcodeLinkClicksMock).toHaveBeenCalledWith(1);
    });
});
