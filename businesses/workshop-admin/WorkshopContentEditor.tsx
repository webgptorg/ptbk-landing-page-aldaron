'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';

import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { createWorkshopContentDefaults } from '@/lib/workshops/workshopContentDefaults';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { MousePointerClick, Trash2, Unlock } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type WorkshopContentEditorProps = {
    readonly contentBlock: WorkshopContentBlock | null;
    readonly defaultUnlockAt: string;
    readonly defaultSortOrder: number;
    readonly onSave: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onDelete?: () => Promise<void>;
};

function createContentDraft(contentBlock: WorkshopContentBlock | null, defaultUnlockAt: string, defaultSortOrder: number) {
    const defaults = createWorkshopContentDefaults(defaultUnlockAt, defaultSortOrder);
    return {
        title: contentBlock?.title ?? '', bodyMarkdown: contentBlock?.bodyMarkdown ?? '',
        unlockAt: toDateTimeLocalValue(contentBlock?.unlockAt ?? defaults.unlockAt),
        unlockAtOverride: null as string | null,
        sortOrder: contentBlock?.sortOrder ?? defaults.sortOrder,
        isPublished: contentBlock?.isPublished ?? defaults.isPublished,
        isFollowUp: contentBlock?.isFollowUp ?? defaults.isFollowUp,
        isPaidMembersOnly: contentBlock?.isPaidMembersOnly ?? defaults.isPaidMembersOnly,
    };
}

export function WorkshopContentEditor({
    contentBlock,
    defaultUnlockAt,
    defaultSortOrder,
    onSave,
    onDelete,
}: WorkshopContentEditorProps) {
    const [draft, setDraft] = useState(() => createContentDraft(contentBlock, defaultUnlockAt, defaultSortOrder));
    const { title, bodyMarkdown, unlockAt, unlockAtOverride, sortOrder, isPublished, isFollowUp, isPaidMembersOnly } = draft;
    const changeDraft = (changes: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...changes }));
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [creationErrorMessage, setCreationErrorMessage] = useState<string | null>(null);
    const [operationErrorMessage, setOperationErrorMessage] = useState<string | null>(null);
    const isCreatingReference = useRef(false);
    const isDeletingReference = useRef(false);

    const saveValues = async () => {
        const unlockAtIso = unlockAtOverride ?? fromDateTimeLocalValue(unlockAt);
        if (!unlockAtIso) throw new AdminSaveValidationError('Vyberte čas odemknutí materiálu.');
        if (!bodyMarkdown.trim()) throw new AdminSaveValidationError('Vyplňte obsah materiálu.');

        const isSaved = await onSave({
            title,
            bodyMarkdown,
            unlockAt: unlockAtIso,
            sortOrder,
            isPublished,
            isFollowUp,
            isPaidMembersOnly,
        });
        return isSaved;
    };

    const autosave = useAdminAutosave({
        value: draft,
        onSave: saveValues,
        isEnabled: contentBlock !== null,
    });
    const { acceptSavedValue } = autosave;
    useEffect(() => {
        if (contentBlock === null) return;
        const refreshedDraft = createContentDraft(contentBlock, defaultUnlockAt, defaultSortOrder);
        if (acceptSavedValue(refreshedDraft)) setDraft(refreshedDraft);
    }, [contentBlock, defaultUnlockAt, defaultSortOrder, acceptSavedValue]);
    const isSaving = isCreating || autosave.isSaving;
    const isUnlocking = isSaving && unlockAtOverride !== null;
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (contentBlock !== null || isCreatingReference.current) return;
        setCreationErrorMessage(null);
        isCreatingReference.current = true;
        setIsCreating(true);
        try {
            const isCreated = await saveValues();
            if (isCreated) {
                const resetDraft = { ...draft, title: '', bodyMarkdown: '' };
                setDraft(resetDraft);
                autosave.acceptDraftValue(resetDraft);
            }
            else setCreationErrorMessage('Materiál se nepodařilo přidat. Zkuste to znovu.');
        } catch (error) {
            setCreationErrorMessage(error instanceof Error ? error.message : 'Materiál se nepodařilo přidat. Zkuste to znovu.');
        } finally {
            isCreatingReference.current = false;
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || isDeletingReference.current || !window.confirm('Opravdu tento obsah odstranit? Účastníkům okamžitě zmizí.')) {
            return;
        }
        isDeletingReference.current = true;
        setIsDeleting(true);
        setOperationErrorMessage(null);
        try {
            if ((autosave.isDirty || autosave.isSaving) && !(await autosave.saveNow())) {
                setOperationErrorMessage('Změny materiálu se nepodařilo uložit, proto jej nemažu. Opravte chybu nebo zkuste uložení znovu.');
                return;
            }
            await onDelete();
        } catch (error) {
            setOperationErrorMessage(error instanceof Error ? error.message : 'Materiál se nepodařilo smazat. Zkuste to znovu.');
        } finally {
            isDeletingReference.current = false;
            setIsDeleting(false);
        }
    };

    const handleUnlockNow = () => {
        const unlockAtOverride = new Date().toISOString();
        changeDraft({ unlockAt: toDateTimeLocalValue(unlockAtOverride), unlockAtOverride, isPublished: true });
    };

    return (
        <form
            ref={autosave.formRef}
            onSubmit={handleSubmit}
            className={`rounded-xl border p-5 ${contentBlock === null ? 'border-dashed border-cyan-300 bg-cyan-50/40' : 'border-slate-200 bg-slate-50/70'}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MousePointerClick className="h-3.5 w-3.5" /> Kliknutí na odkazy: {contentBlock?.linkClickCount ?? 0}
                </p>
                {contentBlock !== null && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving || isDeleting}
                        onClick={handleUnlockNow}
                    >
                        <Unlock className="mr-2 h-4 w-4" /> {isUnlocking ? 'Odemkám…' : 'Odemknout hned'}
                    </Button>
                )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-slate-600">
                    Nadpis
                    <Input
                        value={title}
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        onChange={(event) => changeDraft({ title: event.target.value })}
                        className="mt-1 bg-white"
                        placeholder="Volitelný nadpis"
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Odemknout
                    <Input
                        type="datetime-local"
                        value={unlockAt}
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        onChange={(event) => changeDraft({ unlockAt: event.target.value, unlockAtOverride: null })}
                        className="mt-1 bg-white"
                        required
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Pořadí
                    <Input
                        type="number"
                        value={sortOrder}
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        onChange={(event) => changeDraft({ sortOrder: Number(event.target.value) })}
                        className="mt-1 bg-white"
                    />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        checked={isPublished}
                        onChange={(event) => changeDraft({ isPublished: event.target.checked })}
                    />{' '}
                    Publikovat
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-medium text-cyan-800">
                    <input
                        type="checkbox"
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        checked={isFollowUp}
                        onChange={(event) => changeDraft({ isFollowUp: event.target.checked })}
                    />{' '}
                    Navazující materiál
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-medium text-amber-700">
                    <input
                        type="checkbox"
                        disabled={isDeleting || (contentBlock === null && isCreating)}
                        checked={isPaidMembersOnly}
                        onChange={(event) => changeDraft({ isPaidMembersOnly: event.target.checked })}
                    />{' '}
                    Jen pro placené členy
                </label>
            </div>
            {isPaidMembersOnly && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                    Nadpis tohoto materiálu uvidí i neplatící členové jako ukázku toho, co jim členství odemkne. Obsah
                    zůstává jen placeným členům.
                </p>
            )}
            {(contentBlock === null ? creationErrorMessage : operationErrorMessage) && <p role="alert" className="mt-3 text-sm text-red-700">{contentBlock === null ? creationErrorMessage : operationErrorMessage}</p>}
            <label className="mt-4 block text-xs font-medium text-slate-600">
                Markdown
                <Textarea
                    value={bodyMarkdown}
                    disabled={isDeleting || (contentBlock === null && isCreating)}
                    onChange={(event) => changeDraft({ bodyMarkdown: event.target.value })}
                    className="mt-1 min-h-40 bg-white font-mono text-xs"
                    placeholder={'## Materiály\n\n- [Odkaz](https://...)'}
                    required
                />
            </label>
            <div className="mt-4 flex justify-end gap-2">
                {onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Mažu…' : 'Smazat'}
                    </Button>
                )}
                {contentBlock === null && <Button type="submit" size="sm" disabled={isSaving}>
                    {isSaving ? 'Přidávám…' : 'Přidat materiál'}
                </Button>}
            </div>
            {contentBlock !== null && <div className="mt-3"><AdminAutosaveStatus {...autosave} /></div>}
        </form>
    );
}
