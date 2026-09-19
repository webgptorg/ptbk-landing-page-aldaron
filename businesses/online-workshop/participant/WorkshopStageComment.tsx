'use client';

import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import type { WorkshopCommentReference } from '@/lib/workshops/workshopTypes';
import { MessageCircleQuestion } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type WorkshopStageCommentProps = {
    /**
     * The one selected question all attendees should read while the host answers it
     */
    readonly stageComment: WorkshopCommentReference | null;
};

/**
 * Presents the host's current question above the stream.
 *
 * Note: The text is the ordinary persisted comment, not a copied stage message. The stage intentionally keeps the
 * chat renderer's conservative formatting so a participant question cannot turn a raw URL into an active control.
 */
export function WorkshopStageComment({ stageComment }: WorkshopStageCommentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    if (stageComment === null) {
        return null;
    }

    return (
        <motion.aside
            key={stageComment.id}
            role="status"
            aria-live="polite"
            initial={isReducedMotionPreferred ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute left-3 right-3 top-3 z-20 rounded-2xl border border-room-accent/50 bg-room-inset/95 p-3 shadow-2xl backdrop-blur sm:left-6 sm:right-32 sm:top-5 sm:max-w-2xl sm:p-4"
        >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-room-accent">
                <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden="true" /> Otázka na stage
            </p>
            <p className="mt-2 text-sm font-semibold text-room-heading">{stageComment.authorName}</p>
            <WorkshopCommentMarkdown
                content={stageComment.body}
                className="mt-1 max-h-32 overflow-hidden whitespace-pre-wrap break-words text-sm leading-6 text-room-heading sm:max-h-40 sm:text-base"
            />
        </motion.aside>
    );
}
