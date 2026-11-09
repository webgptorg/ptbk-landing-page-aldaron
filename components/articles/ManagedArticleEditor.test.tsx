/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ADMIN_AUTOSAVE_DELAY_MILLISECONDS } from '@/lib/admin/AdminSaveQueue';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { ManagedArticle } from '@/lib/articles/managedArticles';
import { ManagedArticleEditor } from './ManagedArticleEditor';

vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: vi.fn() }));

const time = '2026-11-09T20:30:00.000Z';
const article: ManagedArticle = {
    id: '11111111-1111-4111-8111-111111111111', revision: '11111111-1111-4111-8111-111111111112',
    language: 'cs', slug: 'clanek', title: 'Článek', perex: 'Perex', markdown: 'Text článku', authorId: 'pavol-hejny',
    placements: [], canonicalDestination: null, publishedAt: null, createdAt: time, updatedAt: time, assets: {},
};
const secondRevision = '11111111-1111-4111-8111-111111111113';
const request = vi.mocked(requestAdminJson);

beforeEach(() => { vi.useFakeTimers(); request.mockReset(); });
afterEach(async () => { cleanup(); await settleAdminSavesForTest(); vi.useRealTimers(); });

it('only publishes on explicit submit and uses the revision from the preceding content save', async () => {
    request.mockResolvedValueOnce({ article: { ...article, title: 'Nový název', revision: secondRevision } });
    const placements = [{ destination: 'promptbook-blog', visibility: 'public' }, { destination: 'promptbook', visibility: 'public' }];
    request.mockResolvedValueOnce({ article: { ...article, title: 'Nový název', placements, canonicalDestination: 'promptbook', publishedAt: time } });
    render(<ManagedArticleEditor article={article} mediaConfigured={false} onSaved={vi.fn()} onBusy={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Komunita Promptbook'));
    fireEvent.click(screen.getByLabelText('Blog Promptbooku'));
    fireEvent.change(screen.getByLabelText('Název'), { target: { value: 'Nový název' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(ADMIN_AUTOSAVE_DELAY_MILLISECONDS); });
    expect(request).toHaveBeenCalledOnce();
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toMatchObject({
        expectedRevision: article.revision, article: { title: 'Nový název', placements: [], canonicalDestination: null },
    });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Publikovat článek' })); });
    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(request.mock.calls[1]?.[1]?.body))).toMatchObject({
        expectedRevision: secondRevision, article: { title: 'Nový název', placements, canonicalDestination: 'promptbook' },
    });
});

it('publishes mixed access with a public canonical and explains the public copy', async () => {
    const placements = [
        { destination: 'personal-blog', visibility: 'public' },
        { destination: 'vyvojari', visibility: 'paid' },
    ];
    request.mockResolvedValueOnce({ article: { ...article, placements, canonicalDestination: 'personal-blog', publishedAt: time } });
    render(<ManagedArticleEditor article={article} mediaConfigured={false} onSaved={vi.fn()} onBusy={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Komunita Vývojáři'));
    fireEvent.change(screen.getByLabelText('Přístup · Komunita Vývojáři'), { target: { value: 'paid' } });
    fireEvent.click(screen.getByLabelText('Osobní blog'));
    expect(screen.getByLabelText('Hlavní umístění · Komunita Vývojáři')).toHaveProperty('disabled', true);
    expect(screen.getByLabelText('Hlavní umístění · Osobní blog')).toHaveProperty('checked', true);
    expect(screen.getByText(/zpřístupní celý článek i jeho audio a PDF všem/)).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Publikovat článek' })); });
    expect(request).toHaveBeenCalledOnce();
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toMatchObject({
        article: { placements, canonicalDestination: 'personal-blog' },
    });
});
