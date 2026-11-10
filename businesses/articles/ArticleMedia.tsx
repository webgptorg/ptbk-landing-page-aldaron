'use client';

import { X } from 'lucide-react';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ArticleLanguage } from '@/lib/articles/types';

type ImagePreview = { readonly src: string; readonly alt: string };
type VideoEmbed = { readonly mount: HTMLElement; readonly src: string; readonly title: string };

function focusVideoFrame(frame: HTMLIFrameElement | null) {
    frame?.focus({ preventScroll: true });
}

/** The article stays server-rendered. Only the preview and a requested external player need JavaScript. */
export function ArticleMedia({ language, children }: { readonly language: ArticleLanguage; readonly children: ReactNode }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const imageTrigger = useRef<HTMLAnchorElement | null>(null);
    const [preview, setPreview] = useState<ImagePreview>();
    const [videos, setVideos] = useState<VideoEmbed[]>([]);
    const cs = language === 'cs';

    function openMedia(event: MouseEvent<HTMLDivElement>) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest<HTMLAnchorElement>('a[data-article-image], a[data-article-youtube]');
        if (!link) return;
        const youtube = link.dataset.articleYoutube;
        if (youtube && link.parentElement) {
            event.preventDefault();
            const mount = link.parentElement;
            const title = mount.nextElementSibling?.textContent?.trim() || (cs ? 'Video v článku' : 'Article video');
            setVideos((current) => [...current, { mount, src: youtube, title }]);
            return;
        }
        const modal = dialog.current;
        if (!modal || modal.open || typeof modal.showModal !== 'function') return;
        event.preventDefault();
        imageTrigger.current = link;
        setPreview({ src: link.href, alt: link.querySelector('img')?.alt || link.textContent?.trim() || '' });
        modal.showModal();
    }

    return (
        <div className="article-media" onClick={openMedia}>
            {children}
            <dialog
                ref={dialog}
                className="article-image-dialog"
                aria-label={cs ? 'Náhled obrázku' : 'Image preview'}
                onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
                onClose={() => {
                    setPreview(undefined);
                    imageTrigger.current?.focus({ preventScroll: true });
                    imageTrigger.current = null;
                }}
            >
                <figure className="article-image-dialog-figure">
                    <button type="button" className="article-image-dialog-close" onClick={() => dialog.current?.close()} aria-label={cs ? 'Zavřít náhled' : 'Close preview'}>
                        <X size={24} aria-hidden="true" />
                    </button>
                    {preview && <>
                        {/* The original can come from any author-provided web host. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview.src} alt={preview.alt} />
                        {preview.alt && <figcaption aria-hidden="true">{preview.alt}</figcaption>}
                    </>}
                </figure>
            </dialog>
            {videos.map(({ mount, src, title }, index) => createPortal(
                <iframe src={src} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen ref={focusVideoFrame} />,
                mount,
                index,
            ))}
        </div>
    );
}
