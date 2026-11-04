'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';
import type { ArticleLanguage } from '@/lib/articles/types';
import type { ArticleChapter } from './articleDocument';

function revealCurrentChapter(nav: HTMLElement | null) {
    const link = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !link || !window.matchMedia('(min-width: 801px)').matches) return;
    const viewport = nav.getBoundingClientRect();
    const bounds = link.getBoundingClientRect();
    if (viewport.height === 0) return;
    // Move only the outline, never the article or a parent scroll container.
    if (bounds.top < viewport.top) nav.scrollTop += bounds.top - viewport.top - 8;
    else if (bounds.bottom > viewport.bottom) nav.scrollTop += bounds.bottom - viewport.bottom + 8;
}

/** Native chapter links remain readable without JavaScript; scrolling only adds the current location. */
export function ArticleContents({ chapters, language }: {
    readonly chapters: readonly ArticleChapter[];
    readonly language: ArticleLanguage;
}) {
    const root = useRef<HTMLElement>(null);
    const navigation = useRef<HTMLElement>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const { clearance } = useFixedControlClearance(root, '[data-article-player], [data-ai-ta-krajta-mini-player]');

    useEffect(() => {
        const layout = root.current?.closest('.article-reading-layout');
        const prose = layout?.querySelector<HTMLElement>('.article-prose');
        if (!prose) return;
        const headings = chapters.flatMap((chapter) => {
            const heading = document.getElementById(chapter.id);
            return heading && prose.contains(heading) ? [heading] : [];
        });
        let frame: number | null = null;
        const updateLocation = () => {
            frame = null;
            // Keep a chapter active throughout its text, even after its heading leaves the viewport.
            const readingLine = Math.min(160, window.innerHeight * 0.2);
            let current = headings[0]?.id ?? null;
            for (const heading of headings) {
                if (heading.getBoundingClientRect().top > readingLine) break;
                current = heading.id;
            }
            setActiveId(current);
        };
        const scheduleUpdate = () => {
            if (frame === null) frame = window.requestAnimationFrame(updateLocation);
        };
        const observer = new ResizeObserver(scheduleUpdate);
        observer.observe(prose);
        updateLocation();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        window.addEventListener('hashchange', scheduleUpdate);
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            window.removeEventListener('hashchange', scheduleUpdate);
            if (frame !== null) window.cancelAnimationFrame(frame);
        };
    }, [chapters]);

    useEffect(() => {
        revealCurrentChapter(navigation.current);
    }, [activeId, clearance]);

    const cs = language === 'cs';
    return (
        <aside ref={root} className="article-contents" id="article-contents" style={{ '--article-player-clearance': `${clearance}px` } as CSSProperties}>
            <details open onToggle={() => revealCurrentChapter(navigation.current)}>
                <summary>{cs ? 'V tomto článku' : 'In this article'}</summary>
                <nav ref={navigation} aria-label={cs ? 'Kapitoly článku' : 'Article chapters'}>
                    {chapters.map((chapter, index) => (
                        <a key={chapter.id} href={`#${chapter.id}`} aria-current={activeId === chapter.id ? 'location' : undefined}>
                            <span>{(index + 1).toString().padStart(2, '0')}</span>{chapter.title}
                        </a>
                    ))}
                </nav>
            </details>
        </aside>
    );
}
