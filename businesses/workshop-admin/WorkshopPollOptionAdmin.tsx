'use client';

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT } from '@/lib/workshops/workshopConstants';
import { getWorkshopModerationCapabilities } from '@/lib/workshops/workshopModeration';
import type { WorkshopPollOptionModerationValues } from '@/lib/workshops/workshopPollOptionModeration';
import type {
    WorkshopAdminPollOption,
    WorkshopPollOptionAuthor,
    WorkshopSubmissionStatus,
} from '@/lib/workshops/workshopTypes';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type WorkshopPollOptionAdminProps = {
    readonly option: WorkshopAdminPollOption;
    readonly isProcessing: boolean;
    readonly onAdjustArtificialVotes: (optionId: string, artificialVoteAdjustment: number) => Promise<boolean>;
    readonly onModerate: (optionId: string, values: WorkshopPollOptionModerationValues) => Promise<boolean>;
    readonly onDelete: (optionId: string) => Promise<void>;
};

const POLL_OPTION_STATUS_LABELS: Readonly<Record<WorkshopSubmissionStatus, string>> = {
    pending: 'Čeká na schválení',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
};

const POLL_OPTION_STATUS_CLASS_NAMES: Readonly<Record<WorkshopSubmissionStatus, string>> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-slate-100 text-slate-500',
};

/**
 * Names the member who wrote one answer, as fully as the answer still remembers them
 */
function getWorkshopPollOptionAuthorLabel(author: WorkshopPollOptionAuthor | null): string {
    if (author === null) {
        return 'Autor není znám';
    }

    return author.fullname === null ? author.email : `${author.fullname} · ${author.email}`;
}

/**
 * One answer of a poll as its administration reads and changes it.
 *
 * Note: A prepared choice is edited together with its question in the poll editor, so only the counts belong to it
 *       here. An answer a member wrote is instead moderated here exactly as a chat message is: it is approved,
 *       rejected, reworded, or removed, and it says who wrote it.
 */
export function WorkshopPollOptionAdmin({
    option,
    isProcessing,
    onAdjustArtificialVotes,
    onModerate,
    onDelete,
}: WorkshopPollOptionAdminProps) {
    const [artificialVoteAdjustmentText, setArtificialVoteAdjustmentText] = useState('');
    const [editedLabel, setEditedLabel] = useState<string | null>(null);
    const isPollOptionEditingOffered = getWorkshopModerationCapabilities('admin').isPollOptionEditingOffered;

    const artificialVoteAdjustment = Number(artificialVoteAdjustmentText);
    const isArtificialVoteAdjustmentValid =
        artificialVoteAdjustmentText.trim() !== '' &&
        Number.isSafeInteger(artificialVoteAdjustment) &&
        artificialVoteAdjustment !== 0 &&
        Math.abs(artificialVoteAdjustment) <= MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT;

    const handleArtificialVoteAdjustment = async () => {
        if (!isArtificialVoteAdjustmentValid) {
            return;
        }

        const isAdjusted = await onAdjustArtificialVotes(option.id, artificialVoteAdjustment);
        if (isAdjusted) {
            setArtificialVoteAdjustmentText('');
        }
    };

    const handleLabelSave = async () => {
        const label = (editedLabel ?? '').trim();
        if (label === '' || label === option.label) {
            setEditedLabel(null);
            return;
        }

        const isModerated = await onModerate(option.id, { label });
        if (isModerated) {
            setEditedLabel(null);
        }
    };

    const handleDelete = () => {
        const isDeletionConfirmed = window.confirm(
            `Opravdu trvale smazat vlastní odpověď „${option.label}“? Smažou se také všechny její hlasy.`,
        );
        if (isDeletionConfirmed) {
            void onDelete(option.id);
        }
    };

    return (
        <li className="rounded-lg border border-slate-100 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 break-words font-medium text-slate-700">{option.label}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                    {option.voteCount} hlasů
                </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
                Skutečné: {option.realVoteCount} · Umělé: {option.artificialVoteCount}
            </p>

            {option.isCreatedByParticipant && (
                <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/50 p-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="min-w-0 break-words text-xs text-slate-600">
                            Napsal člen: {getWorkshopPollOptionAuthorLabel(option.author)}
                        </p>
                        <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${POLL_OPTION_STATUS_CLASS_NAMES[option.status]}`}
                        >
                            {POLL_OPTION_STATUS_LABELS[option.status]}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{formatWorkshopAdminDateTime(option.createdAt)}</p>

                    {editedLabel !== null && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Input
                                value={editedLabel}
                                onChange={(event) => setEditedLabel(event.target.value)}
                                maxLength={200}
                                className="h-8 w-full max-w-sm bg-white"
                                aria-label={`Text vlastní odpovědi ${option.label}`}
                            />
                            <Button
                                type="button"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => void handleLabelSave()}
                            >
                                Uložit text
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => setEditedLabel(null)}
                            >
                                Zrušit
                            </Button>
                        </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                        {option.status !== 'approved' && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => void onModerate(option.id, { status: 'approved' })}
                                aria-label={`Schválit vlastní odpověď ${option.label}`}
                            >
                                <Check className="mr-1.5 h-4 w-4" /> Schválit
                            </Button>
                        )}
                        {option.status !== 'rejected' && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => void onModerate(option.id, { status: 'rejected' })}
                                aria-label={`Zamítnout vlastní odpověď ${option.label}`}
                            >
                                <X className="mr-1.5 h-4 w-4" /> Zamítnout
                            </Button>
                        )}
                        {isPollOptionEditingOffered && editedLabel === null && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => setEditedLabel(option.label)}
                                aria-label={`Upravit vlastní odpověď ${option.label}`}
                            >
                                <Pencil className="mr-1.5 h-4 w-4" /> Upravit
                            </Button>
                        )}
                        {isPollOptionEditingOffered && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                onClick={handleDelete}
                                aria-label={`Smazat vlastní odpověď ${option.label}`}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" /> Smazat
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="text-xs font-medium text-violet-950">
                    Umělá změna hlasů
                    <Input
                        type="number"
                        step="1"
                        min={-MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT}
                        max={MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT}
                        value={artificialVoteAdjustmentText}
                        onChange={(event) => setArtificialVoteAdjustmentText(event.target.value)}
                        className="mt-1 h-8 w-32 bg-white"
                        placeholder="+1"
                        aria-label={`Umělá změna hlasů pro ${option.label}`}
                    />
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || !isArtificialVoteAdjustmentValid}
                    onClick={() => void handleArtificialVoteAdjustment()}
                >
                    Použít
                </Button>
            </div>
        </li>
    );
}
