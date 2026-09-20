'use client';

import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { WORKSHOP_COMMENT_ORIGIN_LABELS } from '@/lib/workshops/workshopCommentOrigin';

import { WorkshopCommentEditor } from '@/businesses/workshop-admin/WorkshopCommentEditor';
import { WorkshopPinnedComment } from '@/businesses/workshop-admin/WorkshopPinnedComment';
import { WorkshopStageCommentControls } from '@/businesses/workshop-admin/WorkshopStageCommentControls';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import { MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT } from '@/lib/workshops/workshopConstants';
import { getWorkshopModerationCapabilities } from '@/lib/workshops/workshopModeration';
import type {
    WorkshopAdminComment,
    WorkshopCommentReference,
    WorkshopCommentStatus,
} from '@/lib/workshops/workshopTypes';
import { BookOpenText, Check, Clock3, MessageCircle, Pencil, Pin, PinOff, Send, ThumbsUp, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type WorkshopCommentModerationProps = {
    readonly comments: readonly WorkshopAdminComment[];
    readonly commentStatus: WorkshopCommentStatus;
    readonly pinnedComment: WorkshopCommentReference | null;
    readonly stageComment?: WorkshopCommentReference | null;
    readonly onChangeCommentStatus: (commentStatus: WorkshopCommentStatus) => void;
    readonly onModerate: (commentId: string, status: Exclude<WorkshopCommentStatus, 'pending'>) => Promise<void>;
    readonly onConvertToMaterial: (commentId: string) => Promise<boolean>;
    readonly onEditBody: (commentId: string, body: string) => Promise<boolean>;
    readonly onChangePin: (commentId: string, isPinned: boolean) => Promise<boolean>;
    readonly onSetStageComment?: ((commentId: string | null) => Promise<boolean>) | null;
    readonly onAdjustArtificialUpvotes: (commentId: string, artificialUpvoteAdjustment: number) => Promise<boolean>;
    readonly isArtificialOptionsShown: boolean;
    readonly onDelete: (commentId: string) => Promise<void>;
};

const CZECH_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });
const COMMENT_STATUS_LABELS: Readonly<Record<WorkshopCommentStatus, string>> = {
    pending: 'Čekající',
    approved: 'Schválené',
    rejected: 'Zamítnuté',
};

function formatSignedNumber(value: number): string {
    return value > 0 ? `+${value}` : String(value);
}

export function WorkshopCommentModeration({
    comments,
    commentStatus,
    pinnedComment,
    stageComment = null,
    onChangeCommentStatus,
    onModerate,
    onConvertToMaterial,
    onEditBody,
    onChangePin,
    onSetStageComment = null,
    onAdjustArtificialUpvotes,
    isArtificialOptionsShown,
    onDelete,
}: WorkshopCommentModerationProps) {
    const [processingCommentIds, setProcessingCommentIds] = useState<ReadonlySet<string>>(new Set());
    const [artificialUpvoteAdjustments, setArtificialUpvoteAdjustments] = useState<Readonly<Record<string, string>>>({});
    const [editedCommentId, setEditedCommentId] = useState<string | null>(null);
    const isStageCommentControlsOffered = onSetStageComment !== null;
    const isCommentMaterialConversionOffered = getWorkshopModerationCapabilities('admin').isCommentMaterialConversionOffered;

    const runCommentAction = async <ActionResult,>(commentId: string, action: () => Promise<ActionResult>) => {
        setProcessingCommentIds((currentIds) => new Set(currentIds).add(commentId));
        try {
            return await action();
        } finally {
            setProcessingCommentIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(commentId);
                return nextIds;
            });
        }
    };

    const handleModeration = (commentId: string, status: 'approved' | 'rejected') =>
        runCommentAction(commentId, () => onModerate(commentId, status));

    const handleConvertToMaterial = (commentId: string) => runCommentAction(commentId, () => onConvertToMaterial(commentId));

    const handleEditBody = (commentId: string, body: string) =>
        runCommentAction(commentId, () => onEditBody(commentId, body));

    const handleChangePin = (commentId: string, isPinned: boolean) =>
        runCommentAction(commentId, () => onChangePin(commentId, isPinned));

    const changeStageComment = (nextStageCommentId: string | null, processingCommentId: string) => {
        if (onSetStageComment === null) {
            return;
        }

        return runCommentAction(processingCommentId, () => onSetStageComment(nextStageCommentId));
    };

    const handleArtificialUpvoteAdjustment = async (commentId: string) => {
        const artificialUpvoteAdjustment = Number(artificialUpvoteAdjustments[commentId] ?? '');
        if (!Number.isSafeInteger(artificialUpvoteAdjustment) || artificialUpvoteAdjustment === 0) {
            return;
        }

        await runCommentAction(commentId, async () => {
            const isAdjusted = await onAdjustArtificialUpvotes(commentId, artificialUpvoteAdjustment);
            if (isAdjusted) {
                setArtificialUpvoteAdjustments((currentAdjustments) => ({
                    ...currentAdjustments,
                    [commentId]: '',
                }));
            }
        });
    };

    const handleDelete = (comment: WorkshopAdminComment) => {
        const isDeletionConfirmed = window.confirm(
            `Opravdu trvale smazat komentář od ${comment.authorName}? Smažou se také všechny jeho hlasy.`,
        );
        if (isDeletionConfirmed) {
            void runAfterAdminSaves(() => { void runCommentAction(comment.id, () => onDelete(comment.id)); });
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Moderace chatu</h2>
                    <p className="mt-1 text-sm text-slate-500">Zobrazeno {comments.length} komentářů ve vybraném stavu.</p>
                </div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stav komentářů
                    <select
                        value={commentStatus}
                        onChange={(event) => { const status = event.target.value as WorkshopCommentStatus; void runAfterAdminSaves(() => onChangeCommentStatus(status)); }}
                        className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800"
                    >
                        {(Object.keys(COMMENT_STATUS_LABELS) as WorkshopCommentStatus[]).map((status) => (
                            <option key={status} value={status}>{COMMENT_STATUS_LABELS[status]}</option>
                        ))}
                    </select>
                </label>
            </div>

            <WorkshopPinnedComment
                pinnedComment={pinnedComment}
                isProcessing={pinnedComment !== null && processingCommentIds.has(pinnedComment.id)}
                onUnpin={(commentId) => void handleChangePin(commentId, false)}
            />

            {isStageCommentControlsOffered && (
                <WorkshopStageCommentControls
                    stageComment={stageComment}
                    isProcessing={stageComment !== null && processingCommentIds.has(stageComment.id)}
                    onClear={(commentId) => void changeStageComment(null, commentId)}
                />
            )}

            <div className="mt-6 space-y-3">
                {comments.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                        <MessageCircle className="mx-auto mb-2 h-6 w-6" />
                        V tomto stavu zatím nejsou žádné komentáře.
                    </div>
                )}
                {comments.map((comment) => {
                    const isProcessing = processingCommentIds.has(comment.id);
                    const isBeingEdited = editedCommentId === comment.id;
                    const artificialUpvoteAdjustment = Number(artificialUpvoteAdjustments[comment.id] ?? '');
                    const isArtificialUpvoteAdjustmentValid =
                        Number.isSafeInteger(artificialUpvoteAdjustment) && artificialUpvoteAdjustment !== 0;
                    return (
                        <article key={comment.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{comment.authorName}</p>
                                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                                        <Clock3 className="h-3 w-3" />
                                        {CZECH_DATE_FORMAT.format(new Date(comment.createdAt))}
                                        <ThumbsUp className="ml-2 h-3 w-3" />
                                        {comment.upvoteCount} zobrazeno
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                    {comment.isPinned && (
                                        <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                                            <Pin className="h-3 w-3" /> Připnuto
                                        </span>
                                    )}
                                    {stageComment?.id === comment.id && (
                                        <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
                                            <Send className="h-3 w-3" /> Na stage
                                        </span>
                                    )}
                                    {(isArtificialOptionsShown || comment.origin !== 'artificial') && (
                                        <span
                                            className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800"
                                            title={
                                                comment.agentId
                                                    ? `Agent: ${comment.agentId}\nBěh: ${comment.agentJobId}`
                                                    : undefined
                                            }
                                        >
                                            {WORKSHOP_COMMENT_ORIGIN_LABELS[comment.origin]}
                                        </span>
                                    )}
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${comment.status === 'pending' ? 'bg-amber-100 text-amber-800' : comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {COMMENT_STATUS_LABELS[comment.status]}
                                    </span>
                                </div>
                            </div>
                            {comment.parentComment !== null && (
                                <div className="mt-3 rounded-lg border-l-2 border-slate-300 bg-slate-50 px-3 py-2">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Odpověď na komentář od {comment.parentComment.authorName}
                                    </p>
                                    <WorkshopCommentMarkdown
                                        content={comment.parentComment.body}
                                        className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500"
                                    />
                                </div>
                            )}
                            {isBeingEdited && (
                                <AdminEditorDialog isOpen onClose={() => setEditedCommentId(null)} title={`Upravit komentář od ${comment.authorName}`}>
                                    <WorkshopCommentEditor key={comment.id}
                                        label={`Text komentáře od ${comment.authorName}`}
                                        initialBody={comment.body}
                                        onCancel={() => setEditedCommentId(null)}
                                        onSave={(body) => handleEditBody(comment.id, body)}
                                    />
                                </AdminEditorDialog>
                            )}
                            <WorkshopCommentMarkdown
                                content={comment.body}
                                className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700"
                            />
                            {isArtificialOptionsShown && (
                                <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
                                    <p className="text-xs text-slate-600">
                                        Skutečné hlasy: {comment.realUpvoteCount} · Umělá změna hlasů:{' '}
                                        {formatSignedNumber(comment.artificialUpvoteCount)} · Zobrazeno:{' '}
                                        {comment.upvoteCount}
                                    </p>
                                    <AdminEditorButton label="Upravit umělé hlasy" title={`Umělé hlasy komentáře od ${comment.authorName}`} buttonProps={{ size: 'sm', className: 'mt-3' }}>
                                        <div className="mt-3 flex flex-wrap items-end gap-2">
                                            <label className="text-xs font-medium text-violet-950">
                                                Umělá změna hlasů (např. +5 nebo -2)
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    min={-MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT}
                                                    max={MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT}
                                                    value={artificialUpvoteAdjustments[comment.id] ?? ''}
                                                    onChange={(event) =>
                                                        setArtificialUpvoteAdjustments((currentAdjustments) => ({
                                                            ...currentAdjustments,
                                                            [comment.id]: event.target.value,
                                                        }))
                                                    }
                                                    className="mt-1 h-9 w-44 bg-white"
                                                    placeholder="+1"
                                                />
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isProcessing || !isArtificialUpvoteAdjustmentValid}
                                                onClick={() => void handleArtificialUpvoteAdjustment(comment.id)}
                                            >
                                                Použít umělou změnu
                                            </Button>
                                        </div>
                                    </AdminEditorButton>
                                </div>
                            )}
                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    onClick={() => void runAfterAdminSaves(() => setEditedCommentId(comment.id))}
                                    aria-label={`Upravit komentář od ${comment.authorName}`}
                                >
                                    <Pencil className="mr-1.5 h-4 w-4" /> Upravit
                                </Button>
                                {isCommentMaterialConversionOffered && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void handleConvertToMaterial(comment.id)}
                                        aria-label={`Převést komentář od ${comment.authorName} na materiál`}
                                        className="border-cyan-200 text-cyan-800 hover:bg-cyan-50"
                                    >
                                        <BookOpenText className="mr-1.5 h-4 w-4" /> Převést na materiál
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    onClick={() => void handleChangePin(comment.id, !comment.isPinned)}
                                    aria-label={`${comment.isPinned ? 'Odepnout' : 'Připnout'} komentář od ${comment.authorName}`}
                                >
                                    {comment.isPinned ? (
                                        <>
                                            <PinOff className="mr-1.5 h-4 w-4" /> Odepnout
                                        </>
                                    ) : (
                                        <>
                                            <Pin className="mr-1.5 h-4 w-4" /> Připnout
                                        </>
                                    )}
                                </Button>
                                {isStageCommentControlsOffered && comment.status !== 'rejected' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void changeStageComment(comment.id, comment.id)}
                                        aria-label={`Poslat komentář od ${comment.authorName} na stage`}
                                        className="border-violet-200 text-violet-800 hover:bg-violet-50"
                                    >
                                        <Send className="mr-1.5 h-4 w-4" />
                                        {stageComment?.id === comment.id ? 'Znovu poslat na stage' : 'Poslat na stage'}
                                    </Button>
                                )}
                                {comment.status !== 'rejected' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void handleModeration(comment.id, 'rejected')}
                                    >
                                        <X className="mr-1.5 h-4 w-4" /> Zamítnout
                                    </Button>
                                )}
                                {comment.status !== 'approved' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => void handleModeration(comment.id, 'approved')}
                                    >
                                        <Check className="mr-1.5 h-4 w-4" /> Schválit
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    onClick={() => handleDelete(comment)}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                >
                                    <Trash2 className="mr-1.5 h-4 w-4" /> Smazat
                                </Button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
