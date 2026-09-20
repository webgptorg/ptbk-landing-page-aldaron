'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MAXIMAL_WORKSHOP_COMMENT_LENGTH } from '@/lib/workshops/workshopConstants';
import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopCommentEditorProps = {
    readonly label: string;
    readonly initialBody: string;
    readonly onCancel: () => void;

    /**
     * Saves the corrected text, the editor stays open with the draft when it does not reach the database
     */
    readonly onSave: (body: string) => Promise<boolean>;
};

/**
 * Corrects the text of a message which is already in the chat, for example to fix a typo or add information
 *
 * Note: The draft lives only here and is never taken from the props again, so that the admin panel reloading itself
 *       every few seconds never overwrites what the admin is currently writing.
 */
export function WorkshopCommentEditor({ label, initialBody, onCancel, onSave }: WorkshopCommentEditorProps) {
    const [body, setBody] = useState(initialBody);
    const autosave = useAdminAutosave({ value: body, onSave: () => body.trim() ? onSave(body) : Promise.resolve(false) });
    const isSaving = autosave.isSaving;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!body.trim()) {
            return;
        }

        await autosave.saveNow();
    };

    return (
        <form ref={autosave.formRef} onSubmit={handleSubmit} className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/40 p-3">
            <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                aria-label={label}
                className="min-h-28 bg-white"
                maxLength={MAXIMAL_WORKSHOP_COMMENT_LENGTH}
                autoFocus
                required
            />
            <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={() => void runAfterAdminSaves(onCancel)}>
                    Zavřít
                </Button>
                <Button type="submit" size="sm" disabled={isSaving || !body.trim()}>
                    <Save className="mr-1.5 h-4 w-4" /> {isSaving ? 'Ukládám…' : 'Uložit text'}
                </Button>
            </div>
            <AdminAutosaveStatus {...autosave} />
        </form>
    );
}
