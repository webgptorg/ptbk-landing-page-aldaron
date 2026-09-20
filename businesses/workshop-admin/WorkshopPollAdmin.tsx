'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import type {
    WorkshopPollCreateValues,
    WorkshopPollOptionWriteValues,
    WorkshopPollUpdateValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopPollOptionAdmin } from '@/businesses/workshop-admin/WorkshopPollOptionAdmin';
import { WorkshopPollWorkshopPicker } from '@/businesses/workshop-admin/WorkshopPollWorkshopPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorkshopPollOptionModerationValues } from '@/lib/workshops/workshopPollOptionModeration';
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
import { useRef, useState, type FormEvent } from 'react';

const MINIMAL_OPTION_COUNT = 2;
const MAXIMAL_OPTION_COUNT = 8;

type WorkshopPollDraftOption = WorkshopPollOptionWriteValues & { readonly draftId: string };

function createPollDraftOptions(options: readonly WorkshopPollOptionWriteValues[]): readonly WorkshopPollDraftOption[] {
    return options.map((option) => ({ ...option, draftId: option.id ?? crypto.randomUUID() }));
}

type WorkshopPollFormValues = {
    readonly question: string;
    readonly options: readonly WorkshopPollOptionWriteValues[];
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly isOtherOptionEnabled: boolean;
    readonly attachedWorkshopIds: readonly string[];
};

type WorkshopPollAdminProps = {
    readonly polls: readonly WorkshopAdminPoll[];

    /**
     * The occurrences a poll can be about, listed for the editor of every poll.
     */
    readonly attachableWorkshops: readonly WorkshopAdminSummary[];
    readonly onCreate: (values: WorkshopPollCreateValues) => Promise<boolean>;
    readonly onUpdate: (pollId: string, values: WorkshopPollUpdateValues) => Promise<readonly WorkshopPollOptionWriteValues[] | false>;
    readonly onDelete: (pollId: string) => Promise<void>;
    readonly onAdjustArtificialVotes: (
        pollId: string,
        optionId: string,
        artificialVoteAdjustment: number,
    ) => Promise<boolean>;
    readonly isArtificialOptionsShown: boolean;

    /**
     * Decides about one answer a member wrote, or corrects its wording
     */
    readonly onModerateOption: (
        pollId: string,
        optionId: string,
        values: WorkshopPollOptionModerationValues,
    ) => Promise<boolean>;
    readonly onDeleteOption: (pollId: string, optionId: string) => Promise<void>;
};

type WorkshopPollFormProps = {
    readonly title: string;
    readonly submitLabel: string;
    readonly attachableWorkshops: readonly WorkshopAdminSummary[];
    readonly initialValues?: WorkshopPollFormValues;
    readonly onSubmit: (values: WorkshopPollFormValues) => Promise<boolean | readonly WorkshopPollOptionWriteValues[]>;
    readonly onCancel?: () => void;
};

const INITIAL_POLL_FORM_VALUES: WorkshopPollFormValues = {
    question: '',
    options: [{ label: '' }, { label: '' }],
    isClosed: false,
    isVisible: true,
    isOtherOptionEnabled: false,
    attachedWorkshopIds: [],
};

function createPollUpdateValues(
    poll: WorkshopAdminPoll,
    changes: Partial<Pick<WorkshopPollUpdateValues, 'isClosed' | 'isVisible'>> = {},
): WorkshopPollUpdateValues {
    return {
        question: poll.question,
        options: poll.options
            .filter((option) => !option.isCreatedByParticipant)
            .map((option) => ({ id: option.id, label: option.label })),
        isClosed: changes.isClosed ?? poll.isClosed,
        isVisible: changes.isVisible ?? poll.isVisible,
        isOtherOptionEnabled: poll.isOtherOptionEnabled,
        attachedWorkshopIds: poll.attachedWorkshops.map((attachedWorkshop) => attachedWorkshop.id),
    };
}

function getValidatedPollFormValues(
    question: string,
    options: readonly WorkshopPollOptionWriteValues[],
    isClosed: boolean,
    isVisible: boolean,
    isOtherOptionEnabled: boolean,
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
        values: {
            question: trimmedQuestion,
            options: trimmedOptions,
            isClosed,
            isVisible,
            isOtherOptionEnabled,
            attachedWorkshopIds,
        },
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
}: WorkshopPollFormProps) {
    const initialFormValues = initialValues ?? INITIAL_POLL_FORM_VALUES;
    const [question, setQuestion] = useState(initialFormValues.question);
    const [options, setOptions] = useState(() => createPollDraftOptions(initialFormValues.options));
    const savedOptionIdsReference = useRef(new Map<string, string>());
    const [isClosed, setIsClosed] = useState(initialFormValues.isClosed);
    const [isVisible, setIsVisible] = useState(initialFormValues.isVisible);
    const [isOtherOptionEnabled, setIsOtherOptionEnabled] = useState(initialFormValues.isOtherOptionEnabled);
    const [attachedWorkshopIds, setAttachedWorkshopIds] = useState<readonly string[]>(
        initialFormValues.attachedWorkshopIds,
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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
        setOptions(createPollDraftOptions(INITIAL_POLL_FORM_VALUES.options));
        setIsClosed(INITIAL_POLL_FORM_VALUES.isClosed);
        setIsVisible(INITIAL_POLL_FORM_VALUES.isVisible);
        setIsOtherOptionEnabled(INITIAL_POLL_FORM_VALUES.isOtherOptionEnabled);
        setAttachedWorkshopIds(INITIAL_POLL_FORM_VALUES.attachedWorkshopIds);
    };

    const saveValues = async () => {
        const validated = getValidatedPollFormValues(
            question,
            options.map((option) => ({ ...option, id: option.id ?? savedOptionIdsReference.current.get(option.draftId) })),
            isClosed,
            isVisible,
            isOtherOptionEnabled,
            attachedWorkshopIds,
        );
        if (validated.values === null) {
            setFormError(validated.error);
            return false;
        }

        setFormError(null);
        const savedOptions = await onSubmit(validated.values);
        if (savedOptions === false) return false;
        if (savedOptions !== true) {
            // Structural controls wait during a save. IDs can be matched to the sent order while newer text stays intact.
            savedOptions.forEach((option, optionIndex) => {
                if (option.id !== undefined) savedOptionIdsReference.current.set(options[optionIndex].draftId, option.id);
            });
        }
        if (initialValues === undefined) resetForm();
        return true;
    };

    const isEditing = initialValues !== undefined;
    const autosave = useAdminAutosave({
        value: { question, options, isClosed, isVisible, isOtherOptionEnabled, attachedWorkshopIds },
        onSave: saveValues, isEnabled: isEditing,
    });
    const isSaving = isCreating || autosave.isSaving;
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isEditing) {
            await autosave.saveNow();
            return;
        }
        setIsCreating(true);
        try { await saveValues(); } finally { setIsCreating(false); }
    };

    return (
        <form ref={autosave.formRef} onSubmit={handleSubmit} className="rounded-xl border border-dashed border-cyan-300 bg-cyan-50/50 p-5">
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
                    <div key={option.draftId} className="flex items-center gap-2">
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
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
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
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={isOtherOptionEnabled}
                        onChange={(event) => setIsOtherOptionEnabled(event.target.checked)}
                        className="h-4 w-4 accent-cyan-600"
                    />
                    Povolit vlastní odpověď
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
                    onClick={() => setOptions((currentOptions) => [...currentOptions, ...createPollDraftOptions([{ label: '' }])])}
                >
                    <CirclePlus className="mr-2 h-4 w-4" /> Přidat možnost
                </Button>
                <div className="flex flex-wrap gap-2">
                    {onCancel !== undefined && (
                        <Button type="button" variant="outline" disabled={isSaving} onClick={() => void runAfterAdminSaves(onCancel)}>
                            Zavřít
                        </Button>
                    )}
                    <Button type="submit" disabled={isSaving}>
                        {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Ukládám…' : submitLabel}
                    </Button>
                </div>
            </div>
            {formError !== null && <p className="mt-3 text-sm text-red-700">{formError}</p>}
            {isEditing && <div className="mt-3"><AdminAutosaveStatus {...autosave} /></div>}
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
    isArtificialOptionsShown,
    onModerateOption,
    onDeleteOption,
}: WorkshopPollAdminProps) {
    const [editingPollId, setEditingPollId] = useState<string | null>(null);
    const [processingPollIds, setProcessingPollIds] = useState<ReadonlySet<string>>(new Set());

    /**
     * Runs one change of a poll while the whole poll says it is busy, and hands its answer back to whoever asked
     */
    const runPollAction = async <ActionResult,>(
        pollId: string,
        action: () => Promise<ActionResult>,
    ): Promise<ActionResult> => {
        setProcessingPollIds((currentPollIds) => new Set(currentPollIds).add(pollId));
        try {
            return await action();
        } finally {
            setProcessingPollIds((currentPollIds) => {
                const nextPollIds = new Set(currentPollIds);
                nextPollIds.delete(pollId);
                return nextPollIds;
            });
        }
    };

    const handleDelete = (poll: WorkshopAdminPoll) => {
        if (
            window.confirm(
                `Opravdu trvale smazat anketu „${poll.question}“? Smažou se také všechny její ${isArtificialOptionsShown ? 'skutečné i umělé ' : ''}hlasy.`,
            )
        ) {
            void runAfterAdminSaves(() => { void runPollAction(poll.id, () => onDelete(poll.id)); });
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
                        stav hlasování můžete kdykoli změnit.
                        {isArtificialOptionsShown && (
                            <> Pro anketu s připravenými hlasy ji nejdřív vytvořte skrytou, doplňte umělé hlasy a potom ji zveřejněte.</>
                        )}{' '}
                        Vlastní odpovědi členů čekají na schválení stejně jako komentáře v chatu — u každé vidíte,
                        kdo ji napsal, a můžete ji schválit, zamítnout, upravit i smazat.
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
                                            {poll.isOtherOptionEnabled ? ' · Vlastní odpovědi povoleny' : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isProcessing || isEditing}
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
                                            disabled={isProcessing || isEditing}
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
                                    {poll.options.map((option) => (
                                        <WorkshopPollOptionAdmin
                                            key={option.id}
                                            option={option}
                                            isProcessing={isProcessing}
                                            onAdjustArtificialVotes={(optionId, artificialVoteAdjustment) =>
                                                runPollAction(poll.id, () =>
                                                    onAdjustArtificialVotes(poll.id, optionId, artificialVoteAdjustment),
                                                )
                                            }
                                            isArtificialOptionsShown={isArtificialOptionsShown}
                                            onModerate={(optionId, values) =>
                                                runPollAction(poll.id, () => onModerateOption(poll.id, optionId, values))
                                            }
                                            onDelete={(optionId) =>
                                                runPollAction(poll.id, () => onDeleteOption(poll.id, optionId))
                                            }
                                        />
                                    ))}
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
                                            onClick={() => void runAfterAdminSaves(() => setEditingPollId(poll.id))}
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
                            isOtherOptionEnabled: values.isOtherOptionEnabled,
                            attachedWorkshopIds: values.attachedWorkshopIds,
                        })
                    }
                />
            </div>
        </section>
    );
}
