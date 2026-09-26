'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminEditorClose } from '@/components/admin/AdminEditorContext';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MAXIMAL_WORKSHOP_COMMENT_LENGTH } from '@/lib/workshops/workshopConstants';
import { useState } from 'react';

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
    const requestClose = useAdminEditorClose(onCancel);
    const autosave = useAdminAutosave({ value: body, onSave: () => {
        if (!body.trim()) throw new AdminSaveValidationError('Text komentáře nesmí být prázdný.');
        return onSave(body);
    } });
    return (
        <form ref={autosave.formRef} onSubmit={(event) => event.preventDefault()} className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/40 p-3">
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
                <Button type="button" variant="ghost" size="sm" onClick={requestClose}>
                    Zavřít
                </Button>
            </div>
            <AdminAutosaveStatus {...autosave} />
        </form>
    );
}
