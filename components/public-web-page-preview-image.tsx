'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type PublicWebPagePreviewImageProps = {
    readonly imageUrl: string | null;
    readonly alt: string;
    readonly fallback: ReactNode;
    readonly fallbackLabel: string;
    readonly className?: string;
};

/**
 * An Open Graph image belongs to another site and can disappear after its card was made. This shared image boundary
 * keeps every public-page preview useful instead of leaving a broken-image icon in whichever surface uses it.
 */
export function PublicWebPagePreviewImage({
    imageUrl,
    alt,
    fallback,
    fallbackLabel,
    className = '',
}: PublicWebPagePreviewImageProps) {
    const [isImageAvailable, setIsImageAvailable] = useState(imageUrl !== null);

    useEffect(() => {
        setIsImageAvailable(imageUrl !== null);
    }, [imageUrl]);

    if (imageUrl !== null && isImageAvailable) {
        return (
            <img
                src={imageUrl}
                alt={alt}
                className={`h-full w-full object-cover ${className}`}
                onError={() => setIsImageAvailable(false)}
            />
        );
    }

    return (
        <div
            role="img"
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400/20 via-slate-900 to-violet-500/20 ${className}`}
            aria-label={fallbackLabel}
        >
            {fallback}
        </div>
    );
}
