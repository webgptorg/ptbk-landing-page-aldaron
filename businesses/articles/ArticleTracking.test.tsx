// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleTracking } from './ArticleTracking';

const player = vi.hoisted(() => ({
    track: { id: 'article-cs', kind: 'article' },
    currentTime: 0.2,
    isPlaying: false,
    trackingEnabled: true,
    setTrackTrackingAvailable: vi.fn(),
    seekTo: vi.fn(),
}));
vi.mock('@/components/audio-player/AudioPlayerProvider', () => ({ useAudioPlayer: () => player }));

const alignment = {
    version: 1,
    words: [
        { start: 0, end: 1, text: 'AI', wordId: 'w0', sentenceId: 's0' },
        { start: 1, end: 2, text: 'agent', wordId: 'w1', sentenceId: 's0' },
        { start: 2, end: 4, text: 'píše.', wordId: 'w2', sentenceId: 's0' },
    ],
};

function Reader({ wordsUrl = '/words.json' }: { wordsUrl?: string }) {
    return <ArticleTracking articleId="article-cs" wordsUrl={wordsUrl}>
        <p data-testid="paragraph"><span data-article-word="w0">AI</span>{' '}
            <a href="#destination"><span data-article-word="w1">agent</span></a>{' '}
            <span data-article-word="w2">píše.</span></p>
    </ArticleTracking>;
}

let clock = 1_000;
let scrollBy: ReturnType<typeof vi.fn>;
let bounds: DOMRect;

async function ready() {
    await waitFor(() => expect(document.querySelector('[data-tracking="true"]')).not.toBeNull());
}

beforeEach(() => {
    player.currentTime = 0.2;
    player.isPlaying = false;
    player.trackingEnabled = true;
    player.seekTo.mockReset();
    player.setTrackTrackingAvailable.mockReset();
    clock = 1_000;
    scrollBy = vi.fn();
    bounds = { top: 250, bottom: 280, left: 0, right: 100, width: 100, height: 30, x: 0, y: 250, toJSON: () => ({}) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => alignment }));
    vi.spyOn(performance, 'now').mockImplementation(() => clock);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => bounds);
    vi.stubGlobal('scrollBy', scrollBy);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 1000, configurable: true });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.getSelection()?.removeAllRanges(); });

describe('article text tracking interactions', () => {
    it('highlights real word and sentence, then removes highlighting, focus and seeking when tracking is off', async () => {
        const view = render(<Reader />);
        await ready();
        const word = view.getByText('AI');
        const paragraph = view.getByTestId('paragraph');
        expect(word.getAttribute('data-active-word')).toBe('true');
        expect(view.getByText('píše.').getAttribute('data-active-sentence')).toBe('true');
        expect(paragraph.tabIndex).toBe(0);
        fireEvent.click(view.getByText('píše.'));
        expect(player.seekTo).toHaveBeenCalledWith(2.001);
        player.seekTo.mockClear();
        player.trackingEnabled = false;
        view.rerender(<Reader />);
        expect(word.hasAttribute('data-active-word')).toBe(false);
        expect(view.container.querySelector('[data-active-sentence]')).toBeNull();
        expect(paragraph.hasAttribute('tabindex')).toBe(false);
        fireEvent.click(view.getByText('píše.'));
        fireEvent.keyDown(paragraph, { key: 'Enter' });
        expect(player.seekTo).not.toHaveBeenCalled();
    });

    it('preserves ordinary links and selected text while providing one keyboard target per paragraph', async () => {
        const view = render(<Reader />);
        await ready();
        fireEvent.click(view.getByText('agent'));
        expect(player.seekTo).not.toHaveBeenCalled();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(view.getByText('AI'));
        selection?.addRange(range);
        fireEvent.click(view.getByText('píše.'));
        expect(player.seekTo).not.toHaveBeenCalled();
        selection?.removeAllRanges();
        fireEvent.keyDown(view.getByTestId('paragraph'), { key: 'Enter' });
        expect(player.seekTo).toHaveBeenCalledWith(0.001);
        expect(view.container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    });

    it('does not fetch or modify text when no alignment URL exists', async () => {
        const view = render(<ArticleTracking articleId="article-cs"><p><span data-article-word="w0">Čitelný text.</span></p></ArticleTracking>);
        await act(async () => {});
        expect(fetch).not.toHaveBeenCalled();
        expect(view.container.querySelector('[data-tracking]')).toBeNull();
        expect(view.getByText('Čitelný text.').hasAttribute('tabindex')).toBe(false);
    });

    it('tracks the narrated title before reaching the article body', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ version: 1, words: [
            { start: 0, end: 1, text: 'Titulek', wordId: 't0', sentenceId: 's0' },
        ] }) } as Response);
        const view = render(<ArticleTracking articleId="article-cs" wordsUrl="/words.json">
            <h1><span data-article-word="t0">Titulek</span></h1>
        </ArticleTracking>);
        await ready();
        expect(view.getByText('Titulek').getAttribute('data-active-word')).toBe('true');
        expect(view.getByRole('heading').tabIndex).toBe(0);
        expect(player.setTrackTrackingAvailable).toHaveBeenCalledWith('article-cs', true);
    });

    it('rejects a stale map even when its word IDs still exist', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ...alignment,
            words: [{ ...alignment.words[0], text: 'Changed text' }],
        }) } as Response);
        const view = render(<Reader />);
        await waitFor(() => expect(fetch).toHaveBeenCalled());
        await act(async () => {});
        expect(view.container.querySelector('[data-tracking]')).toBeNull();
        expect(player.setTrackTrackingAvailable).not.toHaveBeenCalledWith('article-cs', true);
        fireEvent.click(view.getByText('AI'));
        expect(player.seekTo).not.toHaveBeenCalled();
    });

    it('yields throughout a scrollbar drag and resumes automatically after release', async () => {
        player.isPlaying = true;
        const view = render(<Reader />);
        await ready();
        fireEvent(window, new MouseEvent('pointerdown', { clientX: 1010, bubbles: true }));
        bounds = { ...bounds, top: -200, bottom: -170 };
        fireEvent.scroll(window);
        clock += 2_000; // A held drag must not be interrupted even after the grace period.
        player.currentTime = 2.3;
        view.rerender(<Reader />);
        expect(view.getByText('píše.').getAttribute('data-active-word')).toBe('true');
        expect(scrollBy).not.toHaveBeenCalled();
        fireEvent(window, new MouseEvent('pointerup', { bubbles: true }));
        clock += 1_000;
        player.currentTime = 2.5;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'auto' });
        expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
    });

    it('waits for touch momentum to finish, then follows without a second toggle', async () => {
        player.isPlaying = true;
        const view = render(<Reader />);
        await ready();
        fireEvent.touchMove(window);
        bounds = { ...bounds, top: 700, bottom: 730 };
        clock += 2_000;
        player.currentTime = 1.2;
        view.rerender(<Reader />);
        expect(scrollBy).not.toHaveBeenCalled();
        fireEvent.touchEnd(window);
        clock += 600;
        fireEvent.scroll(window); // Inertial scroll extends the manual gesture's grace period.
        clock += 400;
        player.currentTime = 1.5;
        view.rerender(<Reader />);
        expect(scrollBy).not.toHaveBeenCalled();
        clock += 500;
        player.currentTime = 2.2;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledOnce();
    });

    it('keeps the reading position above the player in a reduced mobile viewport', async () => {
        player.isPlaying = true;
        bounds = { ...bounds, top: 420, bottom: 450 };
        vi.stubGlobal('visualViewport', { offsetTop: 20, height: 600 });
        const playerElement = document.createElement('aside');
        playerElement.dataset.articlePlayer = '';
        playerElement.getBoundingClientRect = () => ({ ...bounds, top: 500, bottom: 620 });
        document.body.append(playerElement);
        try {
            render(<Reader />);
            await ready();
            const request = scrollBy.mock.calls[0][0];
            expect(request.behavior).toBe('auto');
            const wordTopAfterScroll = bounds.top - request.top;
            expect(wordTopAfterScroll).toBeGreaterThan(52);
            expect(wordTopAfterScroll + bounds.height).toBeLessThan(500);
        } finally { playerElement.remove(); }
    });

    it('follows smoothly without restarting each frame and stops when tracking is off or paused', async () => {
        player.isPlaying = true;
        bounds = { ...bounds, top: 700, bottom: 730 };
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
        const view = render(<Reader />);
        await ready();
        expect(scrollBy).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' });
        clock += 16;
        player.currentTime = .3;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledOnce();
        clock += 600;
        player.trackingEnabled = false;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledOnce();
        player.trackingEnabled = true;
        player.isPlaying = false;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledOnce();
        player.isPlaying = true;
        view.rerender(<Reader />);
        expect(scrollBy).toHaveBeenCalledTimes(2);
    });
});
