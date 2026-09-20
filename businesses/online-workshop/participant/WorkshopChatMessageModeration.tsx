'use client';

import { WorkshopPendingSubmissionCount } from '@/components/workshops/WorkshopPendingSubmissionCount';
import { WorkshopChatComposer } from '@/businesses/online-workshop/participant/WorkshopChatComposer';
import { WorkshopModerationAction } from '@/businesses/online-workshop/participant/WorkshopModerationAction';
import type {
    WorkshopAuthorModerationValues,
    WorkshopCommentModerationValues,
} from '@/businesses/online-workshop/participant/workshopParticipantApi';
import type { WorkshopComment } from '@/lib/workshops/workshopTypes';
import { Ban, BookOpenText, Check, Pencil, Pin, PinOff, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { useState } from 'react';

export type WorkshopChatModerationHandlers = {
    readonly onModerateComment: (commentId: string, values: WorkshopCommentModerationValues) => Promise<boolean>;
    readonly isCommentMaterialConversionOffered: boolean;
    readonly onConvertCommentToMaterial: (commentId: string) => Promise<boolean>;
    readonly onModerateAuthor: (participantId: string, values: WorkshopAuthorModerationValues) => Promise<boolean>;
};

type WorkshopChatMessageModerationProps = WorkshopChatModerationHandlers & {
    readonly comment: WorkshopComment;
};

/**
 * What a moderator of the room does with one message and with the person who wrote it
 *
 * Note: Every action of this toolbar is refused for anybody else by the routes behind it, so it is a shortcut into the
 *       moderation rather than the moderation itself.
 * Note: The messages of another moderator are moderated like any other, while their author is left to the
 *       administration, which is also the only place a moderator is appointed or dismissed.
 */
export function WorkshopChatMessageModeration({
    comment,
    onModerateComment,
    isCommentMaterialConversionOffered,
    onConvertCommentToMaterial,
    onModerateAuthor,
}: WorkshopChatMessageModerationProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { moderatedAuthor } = comment;

    const runModeration = async (moderate: () => Promise<boolean>): Promise<boolean> => {
        setIsProcessing(true);
        try {
            return await moderate();
        } finally {
            setIsProcessing(false);
        }
    };

    const moderateComment = (values: WorkshopCommentModerationValues) =>
        void runModeration(() => onModerateComment(comment.id, values));

    const convertCommentToMaterial = () => void runModeration(() => onConvertCommentToMaterial(comment.id));

    const moderateAuthor = (values: WorkshopAuthorModerationValues) => {
        if (moderatedAuthor !== null) {
            void runModeration(() => onModerateAuthor(moderatedAuthor.participantId, values));
        }
    };

    const handleEditBody = async (body: string): Promise<boolean> => {
        const isEdited = await runModeration(() => onModerateComment(comment.id, { body }));
        if (isEdited) {
            setIsEditorOpen(false);
        }
        return isEdited;
    };

    return (
        <div className="mt-3 border-t border-room-border/[0.07] pt-3">
            {moderatedAuthor !== null && (
                <WorkshopPendingSubmissionCount
                    count={moderatedAuthor.pendingSubmissionCount}
                    authorName={comment.authorName}
                    className="mb-2 block text-xs text-room-muted"
                />
            )}
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wide text-room-accent/70">
                    <ShieldCheck className="h-3 w-3" /> Moderace
                </span>
                {comment.status !== 'approved' && (
                    <WorkshopModerationAction
                        label="Schválit"
                        ariaLabel={`Schválit komentář od ${comment.authorName}`}
                        icon={Check}
                        isDisabled={isProcessing}
                        onClick={() => moderateComment({ status: 'approved' })}
                    />
                )}
                {comment.status !== 'rejected' && (
                    <WorkshopModerationAction
                        label="Zamítnout"
                        ariaLabel={`Zamítnout komentář od ${comment.authorName}`}
                        icon={X}
                        isDisabled={isProcessing}
                        onClick={() => moderateComment({ status: 'rejected' })}
                    />
                )}
                <WorkshopModerationAction
                    label={comment.isPinned ? 'Odepnout' : 'Připnout'}
                    ariaLabel={`${comment.isPinned ? 'Odepnout' : 'Připnout'} komentář od ${comment.authorName}`}
                    icon={comment.isPinned ? PinOff : Pin}
                    isDisabled={isProcessing}
                    onClick={() => moderateComment({ isPinned: !comment.isPinned })}
                />
                {!isEditorOpen && (
                    <WorkshopModerationAction
                        label="Upravit"
                        ariaLabel={`Upravit komentář od ${comment.authorName}`}
                        icon={Pencil}
                        isDisabled={isProcessing}
                        onClick={() => setIsEditorOpen(true)}
                    />
                )}
                {isCommentMaterialConversionOffered && (
                    <WorkshopModerationAction
                        label="Převést na materiál"
                        ariaLabel={`Převést komentář od ${comment.authorName} na materiál`}
                        icon={BookOpenText}
                        isDisabled={isProcessing}
                        onClick={convertCommentToMaterial}
                    />
                )}
                {moderatedAuthor !== null && !moderatedAuthor.isModerator && (
                    <>
                        <WorkshopModerationAction
                            label={moderatedAuthor.isTrusted ? 'Odebrat důvěru' : 'Důvěřovat'}
                            ariaLabel={`${moderatedAuthor.isTrusted ? 'Odebrat důvěru' : 'Důvěřovat'} účastníkovi ${comment.authorName}`}
                            icon={moderatedAuthor.isTrusted ? ShieldOff : ShieldCheck}
                            isDisabled={isProcessing}
                            onClick={() => moderateAuthor({ isTrusted: !moderatedAuthor.isTrusted })}
                        />
                        <WorkshopModerationAction
                            label={moderatedAuthor.isInteractionBanned ? 'Povolit interakce' : 'Zakázat interakce'}
                            ariaLabel={`${moderatedAuthor.isInteractionBanned ? 'Povolit' : 'Zakázat'} interakce účastníkovi ${comment.authorName}`}
                            icon={Ban}
                            isDisabled={isProcessing}
                            onClick={() =>
                                moderateAuthor({ isInteractionBanned: !moderatedAuthor.isInteractionBanned })
                            }
                        />
                    </>
                )}
            </div>

            {isEditorOpen && (
                <WorkshopChatComposer
                    className="mt-3"
                    label={`Text komentáře od ${comment.authorName}`}
                    placeholder="Upravte text zprávy…"
                    initialBody={comment.body}
                    isCompact
                    isAutoFocused
                    submitLabels={{ idle: 'Uložit text', pending: 'Ukládám…' }}
                    onCancel={() => setIsEditorOpen(false)}
                    onSubmit={handleEditBody}
                />
            )}
        </div>
    );
}
