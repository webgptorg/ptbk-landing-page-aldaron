'use client';

import {
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    createAiTaKrajtaMarkGradientId,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { cn } from '@/lib/utils';
import { useId } from 'react';

/**
 * The snake of the show, drawn the way the cover artwork draws it
 *
 * Note: It is a drawing rather than the cover image, so it can sit on any background, scale to a favicon and be the
 *       thing the game in the header uncoils from.
 */
export function AiTaKrajtaMark({ className }: { readonly className?: string }) {
    const documentId = useId();

    return (
        <svg
            aria-hidden="true"
            viewBox={`0 0 ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE} ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}`}
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {AI_TA_KRAJTA_MARK_SHAPES.map((shape) => (
                    <linearGradient
                        key={shape.id}
                        id={createAiTaKrajtaMarkGradientId(documentId, shape.id)}
                        x1={shape.gradient.x1}
                        y1={shape.gradient.y1}
                        x2={shape.gradient.x2}
                        y2={shape.gradient.y2}
                        gradientUnits="userSpaceOnUse"
                    >
                        {shape.gradient.stops.map((stop) => (
                            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                        ))}
                    </linearGradient>
                ))}
            </defs>

            {AI_TA_KRAJTA_MARK_SHAPES.map((shape) => (
                <path
                    key={shape.id}
                    d={shape.pathData}
                    fill={`url(#${createAiTaKrajtaMarkGradientId(documentId, shape.id)})`}
                />
            ))}
        </svg>
    );
}
