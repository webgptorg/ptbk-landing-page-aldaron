'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAudioPlayer } from '@/components/audio-player/AudioPlayerProvider';
import { findArticleWordAtTime, getArticleTimedSentences, getArticleWordSeekTimes, parseArticleWordTimings, type ArticleWordTimings } from './articleTiming';

interface TrackingDom {
    readonly words: Map<string, HTMLElement>;
    readonly starts: ReadonlyMap<string, number>;
}

function getTrackingWords(container: HTMLElement, timings: ArticleWordTimings): Map<string, HTMLElement> | null {
    const words = new Map<string, HTMLElement>();
    for (const element of Array.from(container.querySelectorAll<HTMLElement>('[data-article-word]'))) {
        if (element.dataset.articleWord) words.set(element.dataset.articleWord, element);
    }
    // IDs alone survive edits at the same position. Verify the written text as well.
    return timings.words.some((word) => words.get(word.wordId)?.textContent !== word.text) ? null : words;
}

/** The article itself stays server rendered. This boundary only decorates a real, reviewed alignment. */
export function ArticleTracking({ articleId, wordsUrl, children }: {
    readonly articleId: string;
    readonly wordsUrl?: string;
    readonly children: ReactNode;
}) {
    const { track, currentTime, isPlaying, trackingEnabled, seekTo, setTrackTrackingAvailable } = useAudioPlayer();
    const root = useRef<HTMLDivElement>(null);
    const [timings, setTimings] = useState<ArticleWordTimings | null>(null);
    const dom = useRef<TrackingDom | null>(null);
    const highlightedWords = useRef<HTMLElement[]>([]);
    const activeWord = useRef<HTMLElement | null>(null);
    const manualScrollActive = useRef(false);
    const userIntentUntil = useRef(0);
    const lastScrollAt = useRef(-Infinity);
    const active = track?.id === articleId && track.kind === 'article' && trackingEnabled;
    const sentences = useMemo(() => getArticleTimedSentences(timings?.words ?? []), [timings]);

    useEffect(() => {
        setTimings(null);
        if (!wordsUrl) return;
        const abort = new AbortController();
        void fetch(wordsUrl, { signal: abort.signal })
            .then((response) => response.ok ? response.json() : null)
            .then((value: unknown) => { if (!abort.signal.aborted) setTimings(parseArticleWordTimings(value)); })
            .catch(() => { /* Reading and playback remain available without a valid alignment. */ });
        return () => abort.abort();
    }, [wordsUrl]);

    useEffect(() => {
        const available = Boolean(root.current && timings && getTrackingWords(root.current, timings));
        setTrackTrackingAvailable(articleId, available);
        return () => setTrackTrackingAvailable(articleId, false);
    }, [articleId, track?.id, timings, setTrackTrackingAvailable]);

    useEffect(() => {
        const container = root.current;
        if (!container || !active || !timings) return;
        const words = getTrackingWords(container, timings);
        if (!words) return;
        const starts = getArticleWordSeekTimes(timings.words);
        // A stale alignment is unavailable; do not seek to unrelated or missing visual words.
        dom.current = { words, starts };
        manualScrollActive.current = false;
        userIntentUntil.current = 0;
        lastScrollAt.current = -Infinity;
        container.dataset.tracking = 'true';
        const focusableBlocks: Array<{ element: HTMLElement; tabIndex: string | null; shortcut: string | null }> = [];
        for (const element of Array.from(container.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, h4, h5, h6, pre'))) {
            if (element.querySelector('p, li, h1, h2, h3, h4, h5, h6, pre')) continue;
            const mappedWord = Array.from(element.querySelectorAll<HTMLElement>('[data-article-word]')).find((word) => starts.has(word.dataset.articleWord ?? ''));
            if (!mappedWord) continue;
            focusableBlocks.push({ element, tabIndex: element.getAttribute('tabindex'), shortcut: element.getAttribute('aria-keyshortcuts') });
            element.tabIndex = 0;
            element.setAttribute('aria-keyshortcuts', 'Enter');
            element.dataset.articleSeekWord = mappedWord.dataset.articleWord;
        }
        const getSeekTarget = (target: EventTarget | null) => target instanceof Element ? target : null;
        const onClick = (event: MouseEvent) => {
            const target = getSeekTarget(event.target);
            if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target.closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
            if (window.getSelection()?.toString()) return;
            const id = target.closest<HTMLElement>('[data-article-word]')?.dataset.articleWord;
            const start = id ? starts.get(id) : undefined;
            if (start !== undefined) seekTo(start);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            const target = getSeekTarget(event.target);
            if (!target || event.key !== 'Enter' || target.closest('a,button,input,select,textarea,[contenteditable="true"]')) return;
            const id = target.closest<HTMLElement>('[data-article-seek-word]')?.dataset.articleSeekWord;
            const start = id ? starts.get(id) : undefined;
            if (start !== undefined) { event.preventDefault(); seekTo(start); }
        };
        // Give touch/wheel/scrollbar gestures room to finish, without silently switching off the toggle.
        const markUserIntent = () => { userIntentUntil.current = performance.now() + 800; };
        const onPointerDown = (event: PointerEvent) => {
            // The native gutter is outside documentElement.clientWidth. A held drag remains intentional
            // even when it takes longer than wheel/touch momentum; ordinary content clicks do not suspend follow.
            const contentWidth = document.documentElement.clientWidth;
            if (contentWidth > 0 && window.innerWidth > contentWidth && event.clientX >= contentWidth) {
                manualScrollActive.current = true;
                markUserIntent();
            }
        };
        const onPointerMove = () => { if (manualScrollActive.current) markUserIntent(); };
        const onPointerUp = () => { if (manualScrollActive.current) { markUserIntent(); manualScrollActive.current = false; } };
        const onTouchMove = () => { manualScrollActive.current = true; markUserIntent(); };
        const markKeyboardIntent = (event: KeyboardEvent) => {
            const target = getSeekTarget(event.target);
            if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) markUserIntent();
        };
        const onScroll = () => {
            // Include touch momentum, but never mistake our own smooth scroll for a manual gesture.
            if (manualScrollActive.current || performance.now() < userIntentUntil.current) markUserIntent();
        };
        container.addEventListener('click', onClick);
        container.addEventListener('keydown', onKeyDown);
        window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        window.addEventListener('wheel', markUserIntent, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onPointerUp, { passive: true });
        window.addEventListener('touchcancel', onPointerUp, { passive: true });
        window.addEventListener('keydown', markKeyboardIntent);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            dom.current = null;
            activeWord.current?.removeAttribute('data-active-word');
            activeWord.current = null;
            highlightedWords.current.forEach((word) => word.removeAttribute('data-active-sentence'));
            highlightedWords.current = [];
            delete container.dataset.tracking;
            for (const item of focusableBlocks) {
                if (item.tabIndex === null) item.element.removeAttribute('tabindex'); else item.element.setAttribute('tabindex', item.tabIndex);
                if (item.shortcut === null) item.element.removeAttribute('aria-keyshortcuts'); else item.element.setAttribute('aria-keyshortcuts', item.shortcut);
                delete item.element.dataset.articleSeekWord;
            }
            container.removeEventListener('click', onClick);
            container.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('pointerdown', onPointerDown, true);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            window.removeEventListener('wheel', markUserIntent);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onPointerUp);
            window.removeEventListener('touchcancel', onPointerUp);
            window.removeEventListener('keydown', markKeyboardIntent);
            window.removeEventListener('scroll', onScroll);
        };
    }, [active, timings, seekTo]);

    useEffect(() => {
        const elements = dom.current;
        if (!active || !timings || !elements) return;
        const word = findArticleWordAtTime(timings.words, currentTime);
        const sentence = sentences.find((item) => item.start <= currentTime && currentTime < item.end);
        const nextWord = word ? elements.words.get(word.wordId) ?? null : null;
        if (activeWord.current !== nextWord) {
            activeWord.current?.removeAttribute('data-active-word');
            activeWord.current = nextWord;
            nextWord?.setAttribute('data-active-word', 'true');
        }
        const nextSentence = sentence?.wordIds.map((id) => elements.words.get(id)).filter((element): element is HTMLElement => Boolean(element)) ?? [];
        if (nextSentence[0] !== highlightedWords.current[0]) {
            highlightedWords.current.forEach((element) => element.removeAttribute('data-active-sentence'));
            nextSentence.forEach((element) => element.setAttribute('data-active-sentence', 'true'));
            highlightedWords.current = nextSentence;
        }
        const now = performance.now();
        if (!nextWord || !isPlaying || manualScrollActive.current || now < userIntentUntil.current || now - lastScrollAt.current < 500) return;
        // Mobile browser chrome and the persistent player both reduce the area available for reading.
        const viewport = window.visualViewport;
        const viewportTop = viewport?.offsetTop ?? 0;
        const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
        const playerTop = document.querySelector('[data-article-player]')?.getBoundingClientRect().top ?? viewportBottom;
        const top = viewportTop + 32;
        const bottom = Math.max(top + 40, Math.min(viewportBottom, playerTop) - 24);
        const height = bottom - top;
        const bounds = nextWord.getBoundingClientRect();
        if (bounds.top < top + height * .2 || bounds.bottom > top + height * .7) {
            // Throttle smooth requests so the media clock cannot restart the same animation every frame.
            lastScrollAt.current = now;
            window.scrollBy({ top: bounds.top - (top + height * .35), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
    }, [active, currentTime, isPlaying, sentences, timings]);

    return <div ref={root}>{children}</div>;
}
