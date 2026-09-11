'use client';

import type {
    WorkshopPollCreateValues,
    WorkshopPollOptionWriteValues,
    WorkshopPollUpdateValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopPollWorkshopPicker } from '@/businesses/workshop-admin/WorkshopPollWorkshopPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT } from '@/lib/workshops/workshopConstants';
import { getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopAdminPoll, WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import {
    ChevronDown,
    ChevronUp,
    CirclePlus,
    Eye,
    EyeOff,
    Lock,
    LockOpen,
    Minus,
    Pencil,
    Save,
    Send,
    Trash2,
    Vote,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

const MINIMAL_OPTION_COUNT = 2;
const MAXIMAL_OPTION_COUNT = 8;

type WorkshopPollFormValues = {
    readonly question: string;
    readonly options: readonly WorkshopPollOptionWriteValues[];
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly attachedWorkshopIds: readonly string[];
};

type WorkshopPollAdminProps = {
    readonly polls: readonly WorkshopAdminPoll[];

    /**
     * The occurrences a poll can be about, listed for the editor of every poll.
     */
    readonly attachableWorkshops: readonly WorkshopAdminSummary[];
    readonly onCreate: (values: WorkshopPollCreateValues) => Promise<boolean>;
    readonly onUpdate: (pollId: string, values: WorkshopPollUpdateValues) => Promise<boolean>;
    readonly onDelete: (pollId: string) => Promise<void>;
    readonly onAdjustArtificialVotes: (
        pollId: string,
        optionId: string,
        artificialVoteAdjustment: number,
    ) => Promise<boolean>;
};

type WorkshopPollFormProps = {
    readonly title: string;
    readonly submitLabel: string;
    readonly attachableWorkshops: readonly WorkshopAdminSummary[];
    readonly initialValues?: WorkshopPollFormValues;
    readonly onSubmit: (values: WorkshopPollFormValues) => Promise<boolean>;
    readonly onCancel?: () => void;
    readonly onSaved?: () => void;
};

const INITIAL_POLL_FORM_VALUES: WorkshopPollFormValues = {
    question: '',
    options: [{ label: '' }, { label: '' }],
    isClosed: false,
    isVisible: true,
    attachedWorkshopIds: [],
};

function createPollUpdateValues(
    poll: WorkshopAdminPoll,
    changes: Partial<Pick<WorkshopPollUpdateValues, 'isClosed' | 'isVisible'>> = {},
): WorkshopPollUpdateValues {
    return {
        question: poll.question,
        options: poll.options.map((option) => ({ id: option.id, label: option.label })),
        isClosed: changes.isClosed ?? poll.isClosed,
        isVisible: changes.isVisible ?? poll.isVisible,
        attachedWorkshopIds: poll.attachedWorkshops.map((attachedWorkshop) => attachedWorkshop.id),
    };
}

function getValidatedPollFormValues(
    question: string,
    options: readonly WorkshopPollOptionWriteValues[],
    isClosed: boolean,
    isVisible: boolean,
    attachedWorkshopIds: readonly string[],
): { readonly values: WorkshopPollFormValues | null; readonly error: string | null } {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((option) => ({
        ...(option.id === undefined ? {} : { id: option.id }),
        label: option.label.trim(),
    }));
    if (!trimmedQuestion || trimmedOptions.some((option) => !option.label)) {
        return { values: null, error: 'Napište otázku a každou možnost.' };
    }
    if (new Set(trimmedOptions.map((option) => option.label.toLowerCase())).size !== trimmedOptions.length) {
        return { values: null, error: 'Každá možnost musí být jiná.' };
    }

    return {
        values: { question: trimmedQuestion, options: trimmedOptions, isClosed, isVisible, attachedWorkshopIds },
        error: null,
    };
}

/**
 * One shared editor powers both creating and changing a poll. Existing choices keep their IDs in its local state,
 * which is what lets the server preserve votes when their text or position changes.
 */
function WorkshopPollForm({
    title,
    submitLabel,
    attachableWorkshops,
    initialValues,
    onSubmit,
    onCancel,
    onSaved,
}: WorkshopPollFormProps) {
    const initialFormValues = initialValues ?? INITIAL_POLL_FORM_VALUES;
    const [question, setQuestion] = useState(initialFormValues.question);
    const [options, setOptions] = useState<readonly WorkshopPollOptionWriteValues[]>(initialFormValues.options);
    const [isClosed, setIsClosed] = useState(initialFormValues.isClosed);
    const [isVisible, setIsVisible] = useState(initialFormValues.isVisible);
    const [attachedWorkshopIds, setAttachedWorkshopIds] = useState<readonly string[]>(
        initialFormValues.attachedWorkshopIds,
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const changeOption = (optionIndex: number, nextLabel: string) =>
        setOptions((currentOptions) =>
            currentOptions.map((currentOption, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...currentOption, label: nextLabel } : currentOption,
            ),
        );

    const removeOption = (optionIndex: number) =>
        setOptions((currentOptions) => currentOptions.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex));

    const moveOption = (optionIndex: number, offset: -1 | 1) =>
        setOptions((currentOptions) => {
            const nextOptionIndex = optionIndex + offset;
            if (nextOptionIndex < 0 || nextOptionIndex >= currentOptions.length) {
                return currentOptions;
            }

            const nextOptions = [...currentOptions];
            [nextOptions[optionIndex], nextOptions[nextOptionIndex]] = [
                nextOptions[nextOptionIndex],
                nextOptions[optionIndex],
            ];
            return nextOptions;
        });

    const resetForm = () => {
        setQuestion(INITIAL_POLL_FORM_VALUES.question);
        setOptions(INITIAL_POLL_FORM_VALUES.options);
        setIsClosed(INITIAL_POLL_FORM_VALUES.isClosed);
        setIsVisible(INITIAL_POLL_FORM_VALUES.isVisible);
        setAttachedWorkshopIds(INITIAL_POLL_FORM_VALUES.attachedWorkshopIds);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validated = getValidatedPollFormValues(question, options, isClosed, isVisible, attachedWorkshopIds);
        if (validated.values === null) {
            setFormError(validated.error);
            return;
        }

        setFormError(null);
        setIsSaving(true);
        try {
            const isSaved = await onSubmit(validated.values);
            if (isSaved) {
                if (onSaved !== undefined) {
                    onSaved();
                } else {
                    resetForm();
                }
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-cyan-300 bg-cyan-50/50 p-5">
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <label className="mt-4 block text-sm font-medium text-slate-700">
                Otázka
                <Input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    maxLength={500}
                    placeholder="Například: Kterému tématu se máme věnovat příště?"
                    className="mt-1.5 bg-white"
                />
            </label>
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Možnosti</p>
                {options.map((option, optionIndex) => (
                    <div key={option.id ?? optionIndex} className="flex items-center gap-2">
                        <Input
                            value={option.label}
                            onChange={(event) => changeOption(optionIndex, event.target.value)}
                            maxLength={200}
                            placeholder={`Možnost ${optionIndex + 1}`}
                            className="bg-white"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isSaving || optionIndex === 0}
                            onClick={() => moveOption(optionIndex, -1)}
                            aria-label={`Posunout možnost ${optionIndex + 1} výše`}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isSaving || optionIndex === options.length - 1}
                            onClick={() => moveOption(optionIndex, 1)}
                            aria-label={`Posunout možnost ${optionIndex + 1} níže`}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isSaving || options.length <= MINIMAL_OPTION_COUNT}
                            onClick={() => removeOption(optionIndex)}
                            aria-label={`Odebrat možnost ${optionIndex + 1}`}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(event) => setIsVisible(event.target.checked)}
                        className="h-4 w-4 accent-cyan-600"
                    />
                    Viditelná pro členy
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={!isClosed}
                        onChange={(event) => setIsClosed(!event.target.checked)}
                        className="h-4 w-4 accent-cyan-600"
                    />
                    Hlasování je otevřené
                </label>
            </div>
            <WorkshopPollWorkshopPicker
                workshops={attachableWorkshops}
                selectedWorkshopIds={attachedWorkshopIds}
                isDisabled={isSaving}
                onChange={setAttachedWorkshopIds}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving || options.length >= MAXIMAL_OPTION_COUNT}
                    onClick={() => setOptions((currentOptions) => [...currentOptions, { label: '' }])}
                >
                    <CirclePlus className="mr-2 h-4 w-4" /> Přidat možnost
                </Button>
                <div className="flex flex-wrap gap-2">
                    {onCancel !== undefined && (
                        <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
                            Zrušit
                        </Button>
                    )}
                    <Button type="submit" disabled={isSaving}>
                        {onSaved === undefined ? <Send className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Ukládám…' : submitLabel}
                    </Button>
                </div>
            </div>
            {formError !== null && <p className="mt-3 text-sm text-red-700">{formError}</p>}
        </form>
    );
}

/**
 * Administration of community polls. The shared dashboard supplies the authenticated API boundary, while this view
 * keeps the participant-facing aggregate and the admin-only artificial component clearly separate.
 */
export function WorkshopPollAdmin({
    polls,
    attachableWorkshops,
    onCreate,
    onUpdate,
    onDelete,
    onAdjustArtificialVotes,
}: WorkshopPollAdminProps) {
    const [editingPollId, setEditingPollId] = useState<string | null>(null);
    const [processingPollIds, setProcessingPollIds] = useState<ReadonlySet<string>>(new Set());
    const [artificialVoteAdjustments, setArtificialVoteAdjustments] = useState<Readonly<Record<string, string>>>({});

    const runPollAction = async (pollId: string, action: () => Promise<unknown>) => {
        setProcessingPollIds((currentPollIds) => new Set(currentPollIds).add(pollId));
        try {
            await action();
        } finally {
            setProcessingPollIds((currentPollIds) => {
                const nextPollIds = new Set(currentPollIds);
                nextPollIds.delete(pollId);
                return nextPollIds;
            });
        }
    };

    const handleArtificialVoteAdjustment = async (pollId: string, optionId: string) => {
        const adjustmentKey = `${pollId}:${optionId}`;
        const artificialVoteAdjustment = Number(artificialVoteAdjustments[adjustmentKey] ?? '');
        if (!Number.isSafeInteger(artificialVoteAdjustment) || artificialVoteAdjustment === 0) {
            return;
        }

        await runPollAction(pollId, async () => {
            const isAdjusted = await onAdjustArtificialVotes(pollId, optionId, artificialVoteAdjustment);
            if (isAdjusted) {
                setArtificialVoteAdjustments((currentAdjustments) => ({ ...currentAdjustments, [adjustmentKey]: '' }));
            }
        });
    };

    const handleDelete = (poll: WorkshopAdminPoll) => {
        if (
            window.confirm(
                `Opravdu trvale smazat anketu „${poll.question}“? Smažou se také všechny její skutečné i umělé hlasy.`,
            )
        ) {
            void runPollAction(poll.id, () => onDelete(poll.id));
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <Vote className="h-5 w-5 text-cyan-600" /> Ankety komunity
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        Členové vidí pouze zveřejněné ankety a jejich součty. Každou otázku, možnost, viditelnost i
                        stav hlasování můžete kdykoli změnit. Pro anketu s připravenými hlasy ji nejdřív vytvořte
                        skrytou, doplňte umělé hlasy a potom ji zveřejněte.
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {polls.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Zatím není vytvořená žádná anketa.
                    </p>
                ) : (
                    polls.map((poll) => {
                        const isProcessing = processingPollIds.has(poll.id);
                        const isEditing = editingPollId === poll.id;
                        return (
                            <div key={poll.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-950">{poll.question}</h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {getWorkshopPollVoteCount(poll)} hlasů ·{' '}
                                            {poll.isClosed ? 'Hlasování ukončeno' : 'Hlasování probíhá'} ·{' '}
                                            {poll.isVisible ? 'Viditelná pro členy' : 'Skrytá před členy'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() =>
                                                void runPollAction(poll.id, () =>
                                                    onUpdate(
                                                        poll.id,
                                                        createPollUpdateValues(poll, { isClosed: !poll.isClosed }),
                                                    ),
                                                )
                                            }
                                        >
                                            {poll.isClosed ? (
                                                <>
                                                    <LockOpen className="mr-1.5 h-4 w-4" /> Otevřít hlasování
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="mr-1.5 h-4 w-4" /> Ukončit hlasování
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() =>
                                                void runPollAction(poll.id, () =>
                                                    onUpdate(
                                                        poll.id,
                                                        createPollUpdateValues(poll, { isVisible: !poll.isVisible }),
                                                    ),
                                                )
                                            }
                                        >
                                            {poll.isVisible ? (
                                                <>
                                                    <EyeOff className="mr-1.5 h-4 w-4" /> Skrýt
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-1.5 h-4 w-4" /> Zveřejnit
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <ol className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                    {poll.options.map((option) => {
                                        const adjustmentKey = `${poll.id}:${option.id}`;
                                        const artificialVoteAdjustment = Number(artificialVoteAdjustments[adjustmentKey] ?? '');
                                        const isArtificialVoteAdjustmentValid =
                                            Number.isSafeInteger(artificialVoteAdjustment) &&
                                            artificialVoteAdjustment !== 0 &&
                                            Math.abs(artificialVoteAdjustment) <= MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT;
                                        return (
                                            <li key={option.id} className="rounded-lg border border-slate-100 bg-white p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="min-w-0 break-words font-medium text-slate-700">{option.label}</span>
                                                    <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                                                        {option.voteCount} hlasů
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Skutečné: {option.realVoteCount} · Umělé: {option.artificialVoteCount}
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-end gap-2">
                                                    <label className="text-xs font-medium text-violet-950">
                                                        Umělá změna hlasů
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            min={-MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT}
                                                            max={MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT}
                                                            value={artificialVoteAdjustments[adjustmentKey] ?? ''}
                                                            onChange={(event) =>
                                                                setArtificialVoteAdjustments((currentAdjustments) => ({
                                                                    ...currentAdjustments,
                                                                    [adjustmentKey]: event.target.value,
                                                                }))
                                                            }
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
                                                        onClick={() => void handleArtificialVoteAdjustment(poll.id, option.id)}
                                                    >
                                                        Použít
                                                    </Button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>

                                {isEditing && (
                                    <div className="mt-4">
                                        <WorkshopPollForm
                                            title="Upravit anketu"
                                            submitLabel="Uložit změny"
                                            attachableWorkshops={attachableWorkshops}
                                            initialValues={createPollUpdateValues(poll)}
                                            onSubmit={(values) => onUpdate(poll.id, values)}
                                            onCancel={() => setEditingPollId(null)}
                                            onSaved={() => setEditingPollId(null)}
                                        />
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    {!isEditing && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => setEditingPollId(poll.id)}
                                        >
                                            <Pencil className="mr-1.5 h-4 w-4" /> Upravit
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => handleDelete(poll)}
                                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                    >
                                        <Trash2 className="mr-1.5 h-4 w-4" /> Smazat
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-6">
                <WorkshopPollForm
                    title="Nová anketa"
                    submitLabel="Vytvořit anketu"
                    attachableWorkshops={attachableWorkshops}
                    onSubmit={(values) =>
                        onCreate({
                            question: values.question,
                            options: values.options.map((option) => option.label),
                            isClosed: values.isClosed,
                            isVisible: values.isVisible,
                            attachedWorkshopIds: values.attachedWorkshopIds,
                        })
                    }
                />
            </div>
        </section>
    );
}
