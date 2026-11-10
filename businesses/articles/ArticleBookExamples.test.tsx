/** @vitest-environment jsdom */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BookEditor } from '@/components/book-editor';
import { ArticleBookExamples } from './ArticleBookExamples';
import { renderArticleDocument } from './articleDocument';

vi.mock('@/components/book-editor', () => ({
    BookEditor: vi.fn(({ value }: { value: string }) => <div data-book-component="BookEditor">{value}</div>),
}));

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.mocked(BookEditor).mockClear();
});

it('loads the shared BookEditor in read-only light mode and keeps the original annotated text', () => {
    const source = 'AGENT Pomocník\nGOAL Read <tag> & assist.';
    const document = renderArticleDocument(`\`\`\`book\n${source}\n\`\`\``, '', '', undefined, { bookExamples: true });
    const { container } = render(
        <ArticleBookExamples title="Ukázka">
            <div dangerouslySetInnerHTML={{ __html: document.html }} />
        </ArticleBookExamples>,
    );

    expect(vi.mocked(BookEditor).mock.lastCall?.[0]).toMatchObject({
        value: source, isReadonly: true, theme: 'LIGHT',
        isUploadButtonShown: false, isCameraButtonShown: false, isDownloadButtonShown: false,
        isAboutButtonShown: false, isFullscreenButtonShown: false,
    });
    expect(container.querySelector('[data-article-book] [data-book-component="BookEditor"]')?.textContent).toBe(source);
    expect(container.querySelector('pre > code')?.textContent).toBe(source);
    expect(container.querySelector('pre [data-article-word="w0"]')?.textContent).toBe('AGENT');
});

it('keeps the server-rendered source before the editor approaches the viewport', () => {
    const source = 'AGENT Pomocník';
    const document = renderArticleDocument(['~~~book', source, '~~~'].join('\n'), '', '', undefined, { bookExamples: true });
    let onIntersection: (entries: { target: Element; isIntersecting: boolean }[]) => void;
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
        readonly observe = observe;
        readonly unobserve = unobserve;
        readonly disconnect = vi.fn();
        constructor(callback: typeof onIntersection) { onIntersection = callback; }
    });
    const { container } = render(
        <ArticleBookExamples title="Ukázka">
            <div dangerouslySetInnerHTML={{ __html: document.html }} />
        </ArticleBookExamples>,
    );
    const target = container.querySelector('[data-article-book]')!;
    expect(observe).toHaveBeenCalledWith(target);
    expect(container.querySelector('pre > code')?.textContent).toBe(source);
    expect(BookEditor).not.toHaveBeenCalled();

    act(() => onIntersection([{ target, isIntersecting: true }]));
    expect(unobserve).toHaveBeenCalledWith(target);
    expect(vi.mocked(BookEditor).mock.lastCall?.[0]).toMatchObject({ value: source, isReadonly: true });
});
