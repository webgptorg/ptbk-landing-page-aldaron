'use client';

import { WorkshopChatComposer } from '@/businesses/online-workshop/participant/WorkshopChatComposer';
import { WorkshopChatMessage } from '@/businesses/online-workshop/participant/WorkshopChatMessage';
import type { WorkshopChatModerationHandlers } from '@/businesses/online-workshop/participant/WorkshopChatMessageModeration';
import type { WorkshopCommentValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { cn } from '@/lib/utils';
import type { WorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import { isWorkshopCommentThreadPinned } from '@/lib/workshops/workshopCommentThreads';
import type { WorkshopCommentThread } from '@/lib/workshops/workshopTypes';
import { Reply } from 'lucide-react';
import { useState } from 'react';

type WorkshopChatThreadProps = {
    readonly thread: WorkshopCommentThread;
    readonly interactivity: WorkshopChatInteractivity;

    /**
     * What a moderator of the room does with the messages of this conversation, or `null` for everybody else
     */
    readonly moderation: WorkshopChatModerationHandlers | null;
    readonly onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>;
    readonly onUpvoteComment: (commentId: string) => Promise<void>;
};

/**
 * One conversation of the chat, so a message together with the answers it received
 */
export function WorkshopChatThread({
    thread,
    interactivity,
    moderation,
    onSubmitComment,
    onUpvoteComment,
}: WorkshopChatThreadProps) {
    const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
    const { comment, replies } = thread;

    // Note: Only a message the whole room sees can be answered, and an answer is never answered again.
    const isReplyOffered =
        interactivity.isWritingOffered && comment.status === 'approved' && comment.parentCommentId === null;

    const handleSubmitReply = async (body: string): Promise<boolean> => {
        const isSubmitted = await onSubmitComment({ body, parentCommentId: comment.id });
        if (isSubmitted) {
            setIsReplyFormOpen(false);
        }
        return isSubmitted;
    };

    return (
        <div
            className={cn(
                'min-w-0 rounded-xl border p-4',
                isWorkshopCommentThreadPinned(thread)
                    ? 'border-room-accent/30 bg-room-accent/[0.07]'
                    : 'border-room-border/[0.07] bg-room-overlay/[0.035]',
            )}
        >
            <WorkshopChatMessage
                comment={comment}
                interactivity={interactivity}
                moderation={moderation}
                onUpvote={onUpvoteComment}
            />

            {replies.length > 0 && (
                <div className="mt-4 space-y-4 border-l border-room-border/10 pl-4">
                    {replies.map((reply) => (
                        <WorkshopChatMessage
                            key={reply.id}
                            comment={reply}
                            interactivity={interactivity}
                            moderation={moderation}
                            onUpvote={onUpvoteComment}
                        />
                    ))}
                </div>
            )}

            {isReplyOffered &&
                (isReplyFormOpen ? (
                    <WorkshopChatComposer
                        className="mt-4 border-l border-room-border/10 pl-4"
                        label={`Odpověď na komentář od ${comment.authorName}`}
                        placeholder="Napište odpověď…"
                        isCompact
                        isAutoFocused
                        onCancel={() => setIsReplyFormOpen(false)}
                        onSubmit={handleSubmitReply}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsReplyFormOpen(true)}
                        aria-label={`Odpovědět na komentář od ${comment.authorName}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-room-border/10 px-2.5 py-1 text-xs text-room-subtle transition hover:border-room-accent/30 hover:text-room-accent"
                    >
                        <Reply className="h-3 w-3" /> Odpovědět
                    </button>
                ))}
        </div>
    );
}
