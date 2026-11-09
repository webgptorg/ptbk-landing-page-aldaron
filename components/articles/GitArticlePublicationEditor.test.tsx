/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { GitArticleSummary } from '@/lib/articles/articleAdminTypes';
import { GitArticlePublicationEditor } from './GitArticlePublicationEditor';

vi.mock('@/lib/admin/requestAdminJson', () => ({ requestAdminJson: vi.fn() }));
afterEach(cleanup);

it('cross-posts the existing source to both communities without changing its content or removing a blog', async () => {
    const article: GitArticleSummary = {
        id: 'git-article-cs', title: 'Stávající článek', slug: 'stary-clanek', authorId: 'pavol-hejny', language: 'cs',
        canonicalUrl: 'https://pavolhejny.cz/articles/stary-clanek', fixedDestinations: ['promptbook-blog', 'personal-blog'],
        publication: { communities: [], canonicalDestination: 'personal-blog' },
    };
    const publication = { communities: ['vyvojari', 'promptbook'], canonicalDestination: 'promptbook' };
    const onSaved = vi.fn();
    const request = vi.mocked(requestAdminJson).mockResolvedValue({ publication });
    render(<GitArticlePublicationEditor article={article} onSaved={onSaved} onBusy={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Komunita Vývojáři' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Komunita Promptbook' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Komunita Promptbook' }));
    expect(request).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Uložit umístění' })); });
    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0]?.[0]).toBe('/api/admin/articles/legacy/git-article-cs');
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual(publication);
    expect(onSaved).toHaveBeenCalledWith(publication);
    expect(screen.getByRole('radio', { name: 'Osobní blog' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Blog Promptbooku' })).toBeTruthy();
});
