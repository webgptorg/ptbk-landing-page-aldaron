'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_WORKSHOP_AGENT_VALUES, WORKSHOP_AGENT_WRITE_SCHEMA, type WorkshopAgentWriteValues } from '@/lib/workshops/agents/workshopAgentTypes';
import type { BookEditorProps } from '@promptbook/components';
import dynamic from 'next/dynamic';
import { useState, type FormEvent } from 'react';

let bookEditorModulePromise: Promise<typeof import('@promptbook/components')> | null = null;

function loadBookEditorModule() {
    bookEditorModulePromise ??= import('@promptbook/components');
    return bookEditorModulePromise;
}

const BOOK_EDITOR = dynamic(() => loadBookEditorModule().then((components) => components.BookEditor), {
    ssr: false,
    loading: () => <p className="p-4 text-sm text-slate-500">Načítám editor Book…</p>,
});

/**
 * Starts fetching the sizeable rich editor while the Agents section itself is opening.
 *
 * The editor remains lazy for every other administration view, but a person who has already chosen Agents should
 * not have to wait for its bundle only after choosing to create an agent.
 */
export function preloadWorkshopAgentBookEditor(): void {
    void loadBookEditorModule().catch(() => undefined);
}

type WorkshopAgentEditorProps = {
    readonly initialValues: WorkshopAgentWriteValues | null;
    readonly isListeningOffered: boolean;
    readonly isSaving: boolean;
    readonly onSave: (values: WorkshopAgentWriteValues) => Promise<boolean>;
    readonly onCancel: () => void;
};

/** The draft is separate from the polling state, so refreshes cannot overwrite an edited Book. */
export function WorkshopAgentEditor({ initialValues, isListeningOffered, isSaving, onSave, onCancel }: WorkshopAgentEditorProps) {
    const [values, setValues] = useState<WorkshopAgentWriteValues>(() => initialValues ?? { ...DEFAULT_WORKSHOP_AGENT_VALUES });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const saveValues = async () => {
        const parsed = WORKSHOP_AGENT_WRITE_SCHEMA.safeParse(values);
        if (!parsed.success) {
            setErrorMessage('Vyplňte jméno a Book. Interval odpovědí musí být 15–3 600 sekund, interval otázek 60–3 600 sekund.');
            return false;
        }
        setErrorMessage(null);
        return onSave(parsed.data);
    };
    const autosave = useAdminAutosave({ value: values, onSave: saveValues, isEnabled: initialValues !== null });
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (initialValues !== null) await autosave.saveNow();
        else await saveValues();
    };

    return (
        <form ref={autosave.formRef} onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold">{initialValues === null ? 'Nový agent' : 'Upravit agenta'}</h3>
            <p className="text-sm text-slate-500">Jméno a Book jsou společné pro všechny místnosti. Book určuje osobnost, názory, cíle a pravidla agenta.</p>
            <label className="block text-sm font-medium">
                Jméno v chatu
                <Input value={values.name} maxLength={200} required disabled={isSaving} onChange={(event) => setValues({ ...values, name: event.target.value })} className="mt-1" />
            </label>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={values.isEnabled} disabled={isSaving} onChange={(event) => setValues({ ...values, isEnabled: event.target.checked })} />
                Agent je zapnutý (ve všech místnostech)
            </label>
            <div role="group" aria-label="Zdrojový Book agenta">
                {/* The editor accepts incomplete drafts; validation belongs to Save, not each keystroke. */}
                <BOOK_EDITOR value={values.bookSource as BookEditorProps['value']} onChange={(bookSource) => setValues((current) => ({ ...current, bookSource }))}
                    height="420px" isReadonly={initialValues === null && isSaving} isUploadButtonShown={false} isCameraButtonShown={false} />
            </div>
            <fieldset disabled={initialValues === null && isSaving} className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-2 text-sm font-semibold">V této místnosti</legend>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={values.isReplyEnabled} onChange={(event) => setValues({ ...values, isReplyEnabled: event.target.checked })} />
                    Odpovídat na schválené komentáře účastníků i agentů
                </label>
                <label className="block text-sm">
                    Nejméně sekund mezi odpověďmi
                    <Input type="number" min={15} max={3600} required value={values.replyCooldownSeconds} onChange={(event) => setValues({ ...values, replyCooldownSeconds: Number(event.target.value) })} className="mt-1 max-w-40" />
                </label>
                {isListeningOffered && <>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={values.isListening} onChange={(event) => setValues({ ...values, isListening: event.target.checked })} />
                        Naslouchat živému workshopu a pokládat otázky
                    </label>
                    <label className="block text-sm">
                        Nejméně sekund mezi otázkami
                        <Input type="number" min={60} max={3600} required value={values.questionIntervalSeconds} onChange={(event) => setValues({ ...values, questionIntervalSeconds: Number(event.target.value) })} className="mt-1 max-w-40" />
                    </label>
                </>}
            </fieldset>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Ukládám…' : 'Uložit agenta'}</Button>
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => void runAfterAdminSaves(onCancel)}>Zavřít</Button>
            </div>
            {initialValues !== null && <AdminAutosaveStatus {...autosave} />}
        </form>
    );
}
