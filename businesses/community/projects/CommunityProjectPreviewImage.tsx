'use client';

import { PublicWebPagePreviewImage } from '@/components/public-web-page-preview-image';
import { ImageOff, Sparkles } from 'lucide-react';

type CommunityProjectPreviewImageProps = {
    readonly imageUrl: string | null;
    readonly title: string;
    readonly className?: string;
};

/**
 * An OG image belongs to another site and can disappear after a project was saved. The fallback keeps every card
 * visually useful rather than leaving a broken-image icon in the community grid.
 */
export function CommunityProjectPreviewImage({ imageUrl, title, className = '' }: CommunityProjectPreviewImageProps) {
    return (
        <PublicWebPagePreviewImage
            imageUrl={imageUrl}
            alt={`Náhled projektu ${title}`}
            className={className}
            fallbackLabel="Náhled projektu není k dispozici"
            fallback={
                imageUrl === null ? (
                    <Sparkles className="h-9 w-9 text-cyan-200/80" />
                ) : (
                    <ImageOff className="h-9 w-9 text-slate-300/70" />
                )
            }
        />
    );
}
