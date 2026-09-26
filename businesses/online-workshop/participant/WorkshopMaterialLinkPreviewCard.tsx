'use client';

import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import {
    createWorkshopMaterialLinkPreviewFallback,
    fetchWorkshopMaterialLinkPreview,
    type WorkshopMaterialLinkPreview,
} from '@/businesses/online-workshop/participant/workshopMaterialPreviewClient';
import {
    useWorkshopMaterialPreviewContext,
} from '@/businesses/online-workshop/participant/WorkshopMaterialPreviewContext';
import type { WorkshopMaterialPreviewKind } from '@/lib/workshops/workshopMaterialPreviewTypes';
import { ArrowLeft, ExternalLink, QrCode } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent } from 'react';

const MATERIAL_QR_CODE_SIZE = 156;

type WorkshopMaterialLinkPreviewCardProps = {
    readonly materialId: string;
    readonly cardId: string;
    readonly kind: WorkshopMaterialPreviewKind;
    readonly href: string;
    readonly label: string;
};

function isPublicWebUrl(value: string): boolean {
    try {
        const protocol = new URL(value).protocol;
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
}

function createAccessibleOpenLabel(label: string): string {
    return `Otevřít odkaz: ${label}`;
}

function WorkshopMaterialPreviewImage({
    imageUrl,
    title,
}: {
    readonly imageUrl: string | null;
    readonly title: string;
}) {
    const [isUnavailable, setIsUnavailable] = useState(false);

    useEffect(() => setIsUnavailable(false), [imageUrl]);
    if (imageUrl === null || isUnavailable) return null;

    return (
        <div className="relative h-20 w-full shrink-0 overflow-hidden bg-room-overlay/10 sm:h-full sm:w-36">
            <img
                src={imageUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setIsUnavailable(true)}
            />
            <span className="sr-only">Náhledová ilustrace: {title}</span>
        </div>
    );
}

function getFallbackPreviewForDisplay(preview: WorkshopMaterialLinkPreview, fallback: WorkshopMaterialLinkPreview) {
    return preview.title.trim() === '' && preview.domain.trim() === '' ? fallback : preview;
}

/** A material link opens as text first; its own control swaps to the persisted QR without navigating. */
export function WorkshopMaterialLinkPreviewCard({
    materialId,
    cardId,
    kind,
    href,
    label,
}: WorkshopMaterialLinkPreviewCardProps) {
    const materialPreviewContext = useWorkshopMaterialPreviewContext();
    const isReducedMotionPreferred = useReducedMotion() === true;
    const cardReference = useRef<HTMLDivElement>(null);
    const showQrButtonReference = useRef<HTMLButtonElement>(null);
    const showPreviewButtonReference = useRef<HTMLButtonElement>(null);
    const shouldRestoreFlipButtonFocus = useRef(false);
    const [isNearViewport, setIsNearViewport] = useState(false);
    const [loadedPreview, setLoadedPreview] = useState<{
        readonly requestKey: string;
        readonly preview: WorkshopMaterialLinkPreview;
    } | null>(null);
    const [isLocallyShowingQr, setIsLocallyShowingQr] = useState(false);
    const fallbackPreview = createWorkshopMaterialLinkPreviewFallback(href, label);
    const requestKey = JSON.stringify([materialPreviewContext?.workshopSlug ?? '', materialId, kind, href]);
    const preview = loadedPreview?.requestKey === requestKey ? loadedPreview.preview : fallbackPreview;
    const displayedPreview = getFallbackPreviewForDisplay(preview, fallbackPreview);
    const isPreviewLoading = isNearViewport && isPublicWebUrl(href) && loadedPreview?.requestKey !== requestKey;
    const isShowingQr = materialPreviewContext === null
        ? isLocallyShowingQr
        : materialPreviewContext.activeQrCardId === cardId;

    useEffect(() => {
        const cardElement = cardReference.current;
        if (cardElement === null) return;
        if (typeof IntersectionObserver === 'undefined') {
            setIsNearViewport(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setIsNearViewport(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px 0px' },
        );
        observer.observe(cardElement);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isNearViewport || materialPreviewContext === null || !isPublicWebUrl(href)) return;
        let isCancelled = false;
        void fetchWorkshopMaterialLinkPreview({
            workshopSlug: materialPreviewContext.workshopSlug,
            materialId,
            kind,
            href,
            label,
        }).then((loadedMaterialPreview) => {
            if (!isCancelled) setLoadedPreview({ requestKey, preview: loadedMaterialPreview });
        });
        return () => {
            isCancelled = true;
        };
    }, [href, isNearViewport, kind, label, materialId, materialPreviewContext?.workshopSlug, requestKey]);

    useEffect(() => {
        if (!shouldRestoreFlipButtonFocus.current) return;
        shouldRestoreFlipButtonFocus.current = false;
        (isShowingQr ? showPreviewButtonReference.current : showQrButtonReference.current)?.focus({ preventScroll: true });
    }, [isShowingQr]);

    const toggleQrFace = (event: MouseEvent<HTMLButtonElement>) => {
        shouldRestoreFlipButtonFocus.current = document.activeElement === event.currentTarget;
        if (materialPreviewContext === null) {
            setIsLocallyShowingQr((currentIsShowingQr) => !currentIsShowingQr);
            return;
        }
        materialPreviewContext.setActiveQrCardId(isShowingQr ? null : cardId);
    };

    const faceChangeDuration = isReducedMotionPreferred ? 'duration-0' : 'duration-300';
    const openLinkLabel = createAccessibleOpenLabel(label);

    return (
        <div
            ref={cardReference}
            role="group"
            aria-label={`Náhled odkazu: ${label}`}
            className="h-[18rem] min-w-0 [perspective:1000px]"
        >
            <div
                className={`relative h-full w-full [transform-style:preserve-3d] transition-transform ease-out ${faceChangeDuration} ${isShowingQr ? '[transform:rotateY(180deg)]' : ''}`}
            >
                <div
                    aria-hidden={isShowingQr}
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-room-border/20 bg-room-background/70 shadow-sm [backface-visibility:hidden] sm:flex-row"
                >
                    <WorkshopMaterialPreviewImage imageUrl={displayedPreview.imageUrl} title={displayedPreview.title} />
                    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col p-3 pr-14 sm:p-4 sm:pr-14">
                        <button
                            ref={showQrButtonReference}
                            type="button"
                            aria-label={`Zobrazit QR kód: ${displayedPreview.title || label}`}
                            aria-pressed={false}
                            tabIndex={isShowingQr ? -1 : 0}
                            onClick={toggleQrFace}
                            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-room-border/20 bg-room-overlay/10 text-room-text transition hover:bg-room-overlay/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-background"
                        >
                            <QrCode className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <h4 className="line-clamp-2 break-words pr-1 text-sm font-bold leading-5 text-room-heading">
                            {displayedPreview.title || label}
                        </h4>
                        {displayedPreview.description.trim() !== '' && (
                            <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-room-muted">
                                {displayedPreview.description}
                            </p>
                        )}
                        {displayedPreview.domain !== '' && (
                            <p className="mt-auto truncate pt-3 text-xs font-medium text-room-subtle" title={displayedPreview.domain}>
                                {displayedPreview.domain}
                            </p>
                        )}
                        <a
                            href={href}
                            tabIndex={isShowingQr ? -1 : 0}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={openLinkLabel}
                            className="mt-2 inline-flex w-fit max-w-full items-center gap-1.5 rounded-md text-xs font-bold text-room-accent underline decoration-room-accent/40 underline-offset-4 hover:decoration-room-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                        >
                            <span className="truncate">Otevřít: {label}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        </a>
                    </div>
                </div>

                <div
                    aria-hidden={!isShowingQr}
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-room-border/20 bg-room-background p-3 pt-12 text-center shadow-sm [transform:rotateY(180deg)] [backface-visibility:hidden]"
                >
                    <button
                        ref={showPreviewButtonReference}
                        type="button"
                        aria-label={`Zobrazit náhled: ${displayedPreview.title || label}`}
                        aria-pressed={isShowingQr}
                        tabIndex={isShowingQr ? 0 : -1}
                        onClick={toggleQrFace}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-room-border/20 bg-room-overlay/10 text-room-text transition hover:bg-room-overlay/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-background"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {isShowingQr && (
                        <PromptbookQrCode
                            value={href}
                            size={MATERIAL_QR_CODE_SIZE}
                            className="shrink-0 overflow-hidden rounded-lg bg-white shadow-lg shadow-cyan-300/10"
                        />
                    )}
                    <p className="mt-2 max-w-full truncate text-sm font-bold text-room-heading" title={displayedPreview.title || label}>
                        {displayedPreview.title || label}
                    </p>
                    {displayedPreview.domain !== '' && (
                        <p className="max-w-full truncate text-xs text-room-muted" title={displayedPreview.domain}>
                            {displayedPreview.domain}
                        </p>
                    )}
                    <a
                        href={href}
                        tabIndex={isShowingQr ? 0 : -1}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={openLinkLabel}
                        className="mt-1 inline-flex max-w-full items-center gap-1 rounded-md text-xs font-bold text-room-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                    >
                        <span className="truncate">Otevřít: {label}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                </div>
            </div>
            <span role="status" className="sr-only" aria-live="polite">
                {isPreviewLoading ? 'Náhled odkazu se načítá.' : ''}
            </span>
        </div>
    );
}
