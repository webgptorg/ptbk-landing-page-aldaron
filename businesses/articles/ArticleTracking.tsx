'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAudioPlayer } from '@/components/audio-player/AudioPlayerProvider';
import { findArticleWordAtTime, getArticleTimedSentences, getArticleWordStartTimes, parseArticleWordTimings, type ArticleWordTimings } from './articleTiming';

interface TrackingDom {
    readonly words: Map<string, HTMLElement>;
    readonly starts: ReadonlyMap<string, number>;
}

/** The article itself stays server rendered. This boundary only decorates a real, reviewed alignment. */
export function ArticleTracking({ articleId, wordsUrl, children }: {
    readonly articleId: string;
    readonly wordsUrl?: string;
    readonly children: ReactNode;
}) {
    const { track, currentTime, isPlaying, trackingEnabled, seekTo } = useAudioPlayer();
    const root = useRef<HTMLDivElement>(null);
    const [timings, setTimings] = useState<ArticleWordTimings | null>(null);
    const dom = useRef<TrackingDom | null>(null);
    const highlightedWords = useRef<HTMLElement[]>([]);
    const activeWord = useRef<HTMLElement | null>(null);
    const following = useRef(true);
    const userIntentUntil = useRef(0);
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
        const container = root.current;
        if (!container || !active || !timings) return;
        const words = new Map<string, HTMLElement>();
        for (const element of Array.from(container.querySelectorAll<HTMLElement>('[data-article-word]'))) {
            if (element.dataset.articleWord) words.set(element.dataset.articleWord, element);
        }
        const starts = getArticleWordStartTimes(timings.words);
        // A stale alignment is unavailable; do not seek to unrelated or missing visual words.
        if (timings.words.some((word) => !words.has(word.wordId))) return;
        dom.current = { words, starts };
        following.current = true;
        container.dataset.tracking = 'true';
        const focusableBlocks: Array<{ element: HTMLElement; tabIndex: string | null; shortcut: string | null }> = [];
        for (const element of Array.from(container.querySelectorAll<HTMLElement>('p, li, h2, h3, h4, h5, h6, pre'))) {
            if (element.querySelector('p, li, h2, h3, h4, h5, h6, pre')) continue;
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
        const hasActiveInViewport = () => {
            if (!activeWord.current) return false;
            const bounds = activeWord.current.getBoundingClientRect();
            return bounds.bottom > 90 && bounds.top < window.innerHeight - 150;
        };
        const markUserIntent = () => { userIntentUntil.current = performance.now() + 800; };
        let draggingScrollbar = false;
        const onPointerDown = (event: PointerEvent) => {
            // The native gutter is outside documentElement.clientWidth. A held drag remains intentional
            // even when it takes longer than wheel/touch momentum; ordinary content clicks do not suspend follow.
            const contentWidth = document.documentElement.clientWidth;
            if (contentWidth > 0 && window.innerWidth > contentWidth && event.clientX >= contentWidth) {
                draggingScrollbar = true;
                markUserIntent();
            }
        };
        const onPointerMove = () => { if (draggingScrollbar) markUserIntent(); };
        const onPointerUp = () => { if (draggingScrollbar) { markUserIntent(); draggingScrollbar = false; } };
        const markKeyboardIntent = (event: KeyboardEvent) => {
            const target = getSeekTarget(event.target);
            if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) markUserIntent();
        };
        let scrollFrame = 0;
        const onScroll = () => {
            if ((!draggingScrollbar && performance.now() > userIntentUntil.current) || scrollFrame) return;
            scrollFrame = window.requestAnimationFrame(() => {
                scrollFrame = 0;
                following.current = hasActiveInViewport();
            });
        };
        container.addEventListener('click', onClick);
        container.addEventListener('keydown', onKeyDown);
        window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        window.addEventListener('wheel', markUserIntent, { passive: true });
        window.addEventListener('touchmove', markUserIntent, { passive: true });
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
            window.removeEventListener('touchmove', markUserIntent);
            window.removeEventListener('keydown', markKeyboardIntent);
            window.removeEventListener('scroll', onScroll);
            window.cancelAnimationFrame(scrollFrame);
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
        if (!nextWord || !following.current || !isPlaying || performance.now() < userIntentUntil.current) return;
        const bounds = nextWord.getBoundingClientRect();
        if (bounds.top < 110 || bounds.bottom > window.innerHeight - 180) {
            nextWord.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
    }, [active, currentTime, isPlaying, sentences, timings]);

    return <div ref={root}>{children}</div>;
}
