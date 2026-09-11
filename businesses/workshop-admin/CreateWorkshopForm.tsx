'use client';

import type { WorkshopCreateValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import {
    createNewWorkshopDraft,
    createWorkshopCreateValues,
    createWorkshopDuplicateDraft,
} from '@/businesses/workshop-admin/workshopCreateDraft';
import { WorkshopEventFields } from '@/businesses/workshop-admin/WorkshopEventFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Copy, Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type CreateWorkshopFormProps = {
    readonly onCreate: (values: WorkshopCreateValues) => Promise<boolean>;
    readonly workshopToDuplicate?: WorkshopDetails | null;
    readonly existingWorkshopSlugs?: readonly string[];
};

export function CreateWorkshopForm({
    onCreate,
    workshopToDuplicate = null,
    existingWorkshopSlugs = [],
}: CreateWorkshopFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState(createNewWorkshopDraft);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const duplicateDraft =
        workshopToDuplicate === null ? null : createWorkshopDuplicateDraft(workshopToDuplicate, existingWorkshopSlugs);

    const resetDraft = () => {
        setDraft(createNewWorkshopDraft());
        setIsDuplicating(false);
    };

    const openNewWorkshop = () => {
        resetDraft();
        setIsOpen(true);
    };

    const openWorkshopDuplicate = () => {
        if (duplicateDraft === null) {
            return;
        }

        setDraft(duplicateDraft);
        setIsDuplicating(true);
        setIsOpen(true);
    };

    const closeForm = () => {
        setIsOpen(false);
        resetDraft();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = createWorkshopCreateValues(draft);
        if (values === null) {
            return;
        }

        setIsSaving(true);
        try {
            const isCreated = await onCreate(values);
            if (isCreated) {
                closeForm();
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full" onClick={openNewWorkshop}>
                    <Plus className="mr-2 h-4 w-4" /> Nový workshop
                </Button>
                {duplicateDraft !== null && (
                    <Button type="button" variant="outline" className="w-full" onClick={openWorkshopDuplicate}>
                        <Copy className="mr-2 h-4 w-4" /> Duplikovat workshop
                    </Button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        {isDuplicating ? 'Kopie workshopu' : 'Nový workshop'}
                    </h3>
                    {isDuplicating && (
                        <p className="mt-1 text-xs text-slate-500">
                            Zkontrolujte termín a URL. Kopie přebírá zveřejnění zdrojového workshopu; připojené ankety
                            se zkopírují, účastníci ani historie se nepřenášejí.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={closeForm}
                    className="text-slate-400 hover:text-slate-900"
                    aria-label="Zavřít"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
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
            <Button type="submit" size="sm" className="w-full" disabled={isSaving}>
                {isSaving ? 'Vytvářím…' : isDuplicating ? 'Vytvořit kopii' : 'Vytvořit'}
            </Button>
        </form>
    );
}
