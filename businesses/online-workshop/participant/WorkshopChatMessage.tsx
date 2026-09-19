'use client';

import {
    WorkshopChatMessageModeration,
    type WorkshopChatModerationHandlers,
} from '@/businesses/online-workshop/participant/WorkshopChatMessageModeration';
import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import { cn } from '@/lib/utils';
import { areWorkshopCommentLinksEnabled } from '@/lib/workshops/workshopCommentLinks';
import type { WorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { Clock3, Pin, ShieldCheck, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

type WorkshopChatMessageProps = {
    readonly className?: string;
    readonly comment: WorkshopComment;
    readonly interactivity: WorkshopChatInteractivity;

    /**
     * What a moderator of the room does with this message, or `null` for everybody else
     */
    readonly moderation: WorkshopChatModerationHandlers | null;
    readonly onUpvote: (commentId: string) => Promise<void>;
};

const CZECH_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });
const MESSAGE_MARK_CLASS_NAME = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold';

/**
 * A single message of the chat, whether it opened a thread or answered one
 */
export function WorkshopChatMessage({
    className,
    comment,
    interactivity,
    moderation,
    onUpvote,
}: WorkshopChatMessageProps) {
    const [isUpvoting, setIsUpvoting] = useState(false);

    const handleUpvote = async () => {
        setIsUpvoting(true);
        try {
            await onUpvote(comment.id);
        } finally {
            setIsUpvoting(false);
        }
    };

    return (
        <article className={cn('min-w-0', className)}>
            <div className="mb-2 flex flex-wrap items-center gap-1.5 empty:mb-0">
                {comment.isPinned && (
                    <span className={cn(MESSAGE_MARK_CLASS_NAME, 'bg-room-accent/10 text-room-accent')}>
                        <Pin className="h-3 w-3" /> Připnuto
                    </span>
                )}
                {/* Note: A message which is not in the chat yet is marked for the one who wrote it and for the
                          moderator who decides about it. Nobody else ever receives it. */}
                {comment.status === 'pending' && (
                    <span className={cn(MESSAGE_MARK_CLASS_NAME, 'bg-room-warning/10 text-room-warning')}>
                        <Clock3 className="h-3 w-3" /> Čeká na schválení
                    </span>
                )}
            </div>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 break-words text-sm font-semibold text-room-heading">
                        {comment.authorName}
                        {comment.isAuthorModerator && (
                            <span className={cn(MESSAGE_MARK_CLASS_NAME, 'bg-room-upcoming/10 text-room-upcoming')}>
                                <ShieldCheck className="h-3 w-3" /> Moderátor
                            </span>
                        )}
                    </p>
                    <time className="text-[11px] text-room-subtle" dateTime={comment.createdAt}>
                        {CZECH_TIME_FORMAT.format(new Date(comment.createdAt))}
                    </time>
                </div>
                <button
                    type="button"
                    disabled={
                        comment.status !== 'approved' ||
                        !interactivity.isUpvotingOffered ||
                        comment.isUpvotedByParticipant ||
                        isUpvoting
                    }
                    onClick={() => void handleUpvote()}
                    className={`inline-flex min-w-12 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${comment.isUpvotedByParticipant ? 'border-room-accent/30 bg-room-accent/10 text-room-accent' : 'border-room-border/10 text-room-subtle hover:border-room-accent/30 hover:text-room-accent'} disabled:cursor-default`}
                    aria-label={`Hlasovat pro komentář od ${comment.authorName}`}
                >
                    <ThumbsUp className="h-3 w-3" /> {comment.upvoteCount}
                </button>
            </div>
            <WorkshopCommentMarkdown
                content={comment.body}
                isLinksEnabled={areWorkshopCommentLinksEnabled(comment)}
                className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-room-text"
            />
            {moderation !== null && (
                <WorkshopChatMessageModeration
                    comment={comment}
                    onModerateComment={moderation.onModerateComment}
                    isCommentMaterialConversionOffered={moderation.isCommentMaterialConversionOffered}
                    onConvertCommentToMaterial={moderation.onConvertCommentToMaterial}
                    onModerateAuthor={moderation.onModerateAuthor}
                />
            )}
        </article>
    );
}
