'use client';

import type { WorkshopCreateValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import {
    createNewWorkshopDraft,
    createWorkshopCreateValues,
    createWorkshopDuplicateDraft,
} from '@/businesses/workshop-admin/workshopCreateDraft';
import { DeleteWorkshopButton } from '@/businesses/workshop-admin/DeleteWorkshopButton';
import { WorkshopEventFields } from '@/businesses/workshop-admin/WorkshopEventFields';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Copy, Plus } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';

type CreateWorkshopFormProps = {
    readonly onCreate: (values: WorkshopCreateValues) => Promise<boolean>;
    readonly onDelete?: (workshopId: string) => Promise<boolean>;
    readonly workshopToDuplicate?: WorkshopDetails | null;
    readonly existingWorkshopSlugs?: readonly string[];
};

export function CreateWorkshopForm({
    onCreate,
    onDelete,
    workshopToDuplicate = null,
    existingWorkshopSlugs = [],
}: CreateWorkshopFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState(createNewWorkshopDraft);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const isSubmittingReference = useRef(false);
    const duplicateDraft =
        workshopToDuplicate === null ? null : createWorkshopDuplicateDraft(workshopToDuplicate, existingWorkshopSlugs);

    const resetDraft = () => {
        const nextDraft = createNewWorkshopDraft();
        setDraft(nextDraft);
        setIsDuplicating(false);
    };

    const openNewWorkshop = () => {
        void runAfterAdminSaves(() => {
            const nextDraft = createNewWorkshopDraft();
            setDraft(nextDraft);
            setIsDuplicating(false);
            setIsOpen(true);
        });
    };

    const openWorkshopDuplicate = () => {
        if (duplicateDraft === null) {
            return;
        }

        void runAfterAdminSaves(() => {
            setDraft(duplicateDraft);
            setIsDuplicating(true);
            setIsOpen(true);
        });
    };

    const closeForm = () => {
        setIsOpen(false);
        resetDraft();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmittingReference.current) return;
        const values = createWorkshopCreateValues(draft);
        if (values === null) {
            return;
        }

        isSubmittingReference.current = true;
        setIsSaving(true);
        try {
            const isCreated = await onCreate(values);
            if (isCreated) {
                closeForm();
            }
        } finally {
            isSubmittingReference.current = false;
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full" onClick={openNewWorkshop}>
                    <Plus className="mr-2 h-4 w-4" /> Nový workshop
                </Button>
                {duplicateDraft !== null && (
                    <Button type="button" variant="outline" className="w-full" onClick={openWorkshopDuplicate}>
                        <Copy className="mr-2 h-4 w-4" /> Duplikovat workshop
                    </Button>
                )}
                {workshopToDuplicate?.kind === 'workshop' && onDelete !== undefined && (
                    <DeleteWorkshopButton workshop={workshopToDuplicate} onDelete={onDelete} />
                )}
            </div>
            <AdminEditorDialog isOpen={isOpen} onClose={closeForm} title={isDuplicating ? 'Kopie workshopu' : 'Nový workshop'}>
                <WorkshopDraftProtection draftValue={{ draft, isDuplicating }} />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={isSaving} className="space-y-4 border-0 p-0">
                        {isDuplicating && (
                            <p className="text-sm text-slate-500">
                                Zkontrolujte termín a URL. Kopie přebírá zveřejnění zdrojového workshopu; připojené ankety
                                zůstávají společné s původním termínem, účastníci ani historie se nepřenášejí.
                            </p>
                        )}
                        <Input
                            value={draft.title}
                            onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
                            placeholder="Název"
                            required
                        />
                        <Input
                            value={draft.slug}
                            onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, slug: event.target.value }))}
                            placeholder="slug-workshopu"
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            required
                        />
                        <label className="block text-xs font-medium text-slate-600">
                            Začátek
                            <Input
                                type="datetime-local"
                                value={draft.startsAt}
                                onChange={(event) =>
                                    setDraft((currentDraft) => ({ ...currentDraft, startsAt: event.target.value }))
                                }
                                className="mt-1"
                                required
                            />
                        </label>
                        <label className="block text-xs font-medium text-slate-600">
                            Konec
                            <Input
                                type="datetime-local"
                                value={draft.endsAt}
                                onChange={(changeEvent) =>
                                    setDraft((currentDraft) => ({ ...currentDraft, endsAt: changeEvent.target.value }))
                                }
                                className="mt-1"
                            />
                        </label>
                        <WorkshopEventFields
                            event={draft.event}
                            onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, event }))}
                        />
                    </fieldset>
                    <Button type="submit" size="sm" className="w-full" disabled={isSaving}>
                        {isSaving ? 'Vytvářím…' : isDuplicating ? 'Vytvořit kopii' : 'Vytvořit'}
                    </Button>
                </form>
            </AdminEditorDialog>
        </>
    );
}

function WorkshopDraftProtection({ draftValue }: { readonly draftValue: unknown }) {
    useAdminDraftProtection(draftValue);
    return null;
}
