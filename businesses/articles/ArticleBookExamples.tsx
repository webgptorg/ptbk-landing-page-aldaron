'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { BookEditorProps } from '@promptbook/components';
import { BookEditor } from '@/components/book-editor';

type BookExample = { readonly mount: HTMLElement; readonly source: string };

/** Enhance only authored Book fences while retaining the server-rendered source and its word IDs. */
export function ArticleBookExamples({ title, children }: { readonly title: string; readonly children: ReactNode }) {
    const article = useRef<HTMLElement>(null);
    const [activeExamples, setActiveExamples] = useState<BookExample[]>([]);

    useEffect(() => {
        const mounts = Array.from(article.current?.querySelectorAll<HTMLElement>('[data-article-book]') ?? []);
        const examplesByMount = new Map<Element, BookExample>();
        for (const mount of mounts) {
            const source = mount.previousElementSibling?.textContent;
            if (source != null) examplesByMount.set(mount, { mount, source });
        }
        if (typeof IntersectionObserver === 'undefined') {
            setActiveExamples(Array.from(examplesByMount.values()));
            return;
        }

        setActiveExamples([]);
        const observer = new IntersectionObserver((entries) => {
            const visible: BookExample[] = [];
            for (const entry of entries) {
                const example = examplesByMount.get(entry.target);
                if (!entry.isIntersecting || !example) continue;
                visible.push(example);
                examplesByMount.delete(entry.target);
                observer.unobserve(entry.target);
            }
            if (visible.length > 0) setActiveExamples((current) => [...current, ...visible]);
        }, { rootMargin: '240px' });
        examplesByMount.forEach(({ mount }) => observer.observe(mount));
        return () => {
            examplesByMount.clear();
            observer.disconnect();
        };
    }, [children]);

    return (
        <article ref={article} className="article-prose" aria-label={title}>
            {children}
            {activeExamples.map(({ mount, source }) => {
                const height = Math.min(416, Math.max(128, source.split('\n').length * 30 + 45));
                return createPortal(
                    <BookEditor
                        value={source as BookEditorProps['value']}
                        height={`${height}px`}
                        theme="LIGHT"
                        isReadonly
                        isUploadButtonShown={false}
                        isCameraButtonShown={false}
                        isDownloadButtonShown={false}
                        isAboutButtonShown={false}
                        isFullscreenButtonShown={false}
                    />,
                    mount,
                    mount.dataset.articleBook,
                );
            })}
        </article>
    );
}
