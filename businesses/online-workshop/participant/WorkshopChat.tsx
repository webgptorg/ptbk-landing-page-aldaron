'use client';

import { WorkshopChatComposer } from '@/businesses/online-workshop/participant/WorkshopChatComposer';
import type { WorkshopChatModerationHandlers } from '@/businesses/online-workshop/participant/WorkshopChatMessageModeration';
import { WorkshopChatThread } from '@/businesses/online-workshop/participant/WorkshopChatThread';
import { WORKSHOP_FADED_PANEL_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopPanelAppearance';
import type {
    WorkshopAuthorModerationValues,
    WorkshopCommentModerationValues,
    WorkshopCommentValues,
} from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { cn } from '@/lib/utils';
import { getWorkshopChatInteractivity } from '@/lib/workshops/workshopChatInteractivity';
import { buildWorkshopCommentThreads } from '@/lib/workshops/workshopCommentThreads';
import { getWorkshopModerationCapabilities } from '@/lib/workshops/workshopModeration';
import type { WorkshopComment, WorkshopCommentSort } from '@/lib/workshops/workshopTypes';
import { Clock3, Lock, MessageCircle, ShieldCheck, ThumbsUp } from 'lucide-react';
import { useMemo } from 'react';

type WorkshopChatProps = {
    readonly className?: string;
    readonly comments: readonly WorkshopComment[];
    readonly commentSort: WorkshopCommentSort;

    /**
     * Whether the chat still belongs to the participants, or only stays on the page to be read
     */
    readonly isEnabled: boolean;
    readonly isInteractionBanned: boolean;

    /**
     * Whether this participant moderates the room, see `isWorkshopParticipantModerating`
     */
    readonly isModerating: boolean;
    readonly onChangeSort: (sort: WorkshopCommentSort) => void;
    readonly onSubmitComment: (values: WorkshopCommentValues) => Promise<boolean>;
    readonly onUpvoteComment: (commentId: string) => Promise<void>;
    readonly onModerateComment: (commentId: string, values: WorkshopCommentModerationValues) => Promise<boolean>;
    readonly onConvertCommentToMaterial: (commentId: string) => Promise<boolean>;
    readonly onModerateAuthor: (participantId: string, values: WorkshopAuthorModerationValues) => Promise<boolean>;
};

export function WorkshopChat({
    className,
    comments,
    commentSort,
    isEnabled,
    isInteractionBanned,
    isModerating,
    onChangeSort,
    onSubmitComment,
    onUpvoteComment,
    onModerateComment,
    onConvertCommentToMaterial,
    onModerateAuthor,
}: WorkshopChatProps) {
    const threads = useMemo(() => buildWorkshopCommentThreads(comments, commentSort), [comments, commentSort]);
    const interactivity = getWorkshopChatInteractivity({
        isChatEnabled: isEnabled,
        isInteractionBanned,
        isModerating,
    });
    const moderationCapabilities = getWorkshopModerationCapabilities('moderator');

    // Note: Whether this chat is moderated is decided once here, so no message below has to judge it again.
    const moderation: WorkshopChatModerationHandlers | null = interactivity.isModerationOffered
        ? {
              onModerateComment,
              isCommentMaterialConversionOffered: moderationCapabilities.isCommentMaterialConversionOffered,
              onConvertCommentToMaterial,
              onModerateAuthor,
          }
        : null;

    return (
        <aside
            className={cn(
                'flex h-[min(70dvh,38rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-room-border/10 bg-room-surface shadow-2xl',
                'lg:sticky lg:top-5 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0',
                !isEnabled && WORKSHOP_FADED_PANEL_CLASS_NAME,
                className,
            )}
        >
            <header className="border-b border-room-border/10 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-room-accent" />
                    <h2 className="font-bold text-room-heading">Živý chat</h2>
                    {interactivity.isModerationOffered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-room-upcoming/10 px-2 py-0.5 text-[11px] font-semibold text-room-upcoming">
                            <ShieldCheck className="h-3 w-3" /> Moderujete tuto místnost
                        </span>
                    )}
                </div>
                <div className="mt-3 flex rounded-lg bg-room-overlay/5 p-1 text-xs">
                    <button
                        type="button"
                        onClick={() => onChangeSort('recent')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition ${commentSort === 'recent' ? 'bg-room-overlay/10 text-room-heading' : 'text-room-subtle hover:text-room-text'}`}
                    >
                        <Clock3 className="h-3.5 w-3.5" /> Nejnovější
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeSort('upvotes')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition ${commentSort === 'upvotes' ? 'bg-room-overlay/10 text-room-heading' : 'text-room-subtle hover:text-room-text'}`}
                    >
                        <ThumbsUp className="h-3.5 w-3.5" /> Nejvíce hlasů
                    </button>
                </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {threads.length === 0 ? (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                        <MessageCircle className="h-8 w-8 text-room-subtle" />
                        <p className="mt-3 text-sm text-room-subtle">Zatím je tu klid. Položte první otázku.</p>
                    </div>
                ) : (
                    threads.map((thread) => (
                        <WorkshopChatThread
                            key={thread.comment.id}
                            thread={thread}
                            interactivity={interactivity}
                            moderation={moderation}
                            onSubmitComment={onSubmitComment}
                            onUpvoteComment={onUpvoteComment}
                        />
                    ))
                )}
            </div>

            {interactivity.isWritingOffered ? (
                <WorkshopChatComposer
                    className="border-t border-room-border/10 p-4"
                    label="Nová zpráva do chatu"
                    placeholder="Napište otázku nebo komentář…"
                    onSubmit={(body) => onSubmitComment({ body, parentCommentId: null })}
                />
            ) : (
                <p className="flex items-center justify-center gap-2 border-t border-room-border/10 px-4 py-4 text-sm text-room-subtle">
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Chat je teď jen pro čtení.
                </p>
            )}
        </aside>
    );
}
