'use client';

import { useEffect } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { WhitepaperContent } from './whitepaperContent';

function setChaptersOpen(isOpen: boolean) {
    document.querySelectorAll<HTMLDetailsElement>('.wp-chapter').forEach((chapter) => {
        chapter.open = isOpen;
    });
}

/** Native disclosures remain usable without JavaScript; this adds bulk controls and shareable open chapters. */
export function WhitepaperReaderControls({
    content,
    downloadPath,
}: {
    readonly content: WhitepaperContent['reader'];
    readonly downloadPath: string;
}) {
    useEffect(() => {
        let printOpenChapters: HTMLDetailsElement[] = [];
        function openLinkedChapter() {
            const chapter = document.getElementById(window.location.hash.slice(1));
            if (chapter instanceof HTMLDetailsElement && chapter.classList.contains('wp-chapter')) {
                chapter.open = true;
                chapter.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        }
        function openClickedChapter(event: MouseEvent) {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
            const link = event.target instanceof Element ? event.target.closest('a') : null;
            const href = link?.getAttribute('href');
            if (!href?.startsWith('#chapter-')) return;
            const chapter = document.getElementById(href.slice(1));
            if (chapter instanceof HTMLDetailsElement) {
                chapter.open = true;
                if (window.location.hash === href) chapter.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        }
        function openForPrint() {
            printOpenChapters = Array.from(document.querySelectorAll<HTMLDetailsElement>('.wp-chapter[open]'));
            setChaptersOpen(true);
        }
        function restoreAfterPrint() {
            setChaptersOpen(false);
            printOpenChapters.forEach((chapter) => {
                chapter.open = true;
            });
        }
        openLinkedChapter();
        window.addEventListener('hashchange', openLinkedChapter);
        document.addEventListener('click', openClickedChapter);
        window.addEventListener('beforeprint', openForPrint);
        window.addEventListener('afterprint', restoreAfterPrint);
        return () => {
            window.removeEventListener('hashchange', openLinkedChapter);
            document.removeEventListener('click', openClickedChapter);
            window.removeEventListener('beforeprint', openForPrint);
            window.removeEventListener('afterprint', restoreAfterPrint);
        };
    }, []);

    return (
        <div className="wp-reader-controls">
            <button type="button" onClick={() => setChaptersOpen(true)}>
                <ChevronDown size={16} />
                {content.expand}
            </button>
            <button type="button" onClick={() => setChaptersOpen(false)}>
                <ChevronUp size={16} />
                {content.collapse}
            </button>
            <a href={downloadPath} download>
                <Download size={16} />
                {content.download}
            </a>
        </div>
    );
}
