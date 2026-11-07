'use client';

import { BookEditor } from '@/components/book-editor';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { PROMPTBOOK_BRAND_STYLE } from '@/lib/promptbook-brand';
import type { BookEditorProps } from '@promptbook/components';
import { useRef, useState } from 'react';

export function StoryBookEditorDialog({ name, book, bookRevision, onSave, onClose }: {
    readonly name: string;
    readonly book: string;
    readonly bookRevision?: string;
    readonly onSave: (book: string, revision: string | undefined) => Promise<string | undefined>;
    readonly onClose: () => void;
}) {
    const [draft, setDraft] = useState(book);
    const revision = useRef(bookRevision);
    const opener = useRef(typeof document === 'undefined' ? null : document.activeElement);
    const isClosing = useRef(false);
    const autosave = useAdminAutosave({
        value: draft,
        onSave: async () => {
            const source = draft.trim();
            if (source.length < 15 || source.length > 8_000) {
                throw new AdminSaveValidationError('Book musí mít 15 až 8 000 znaků.');
            }
            revision.current = await onSave(source, revision.current);
            return true;
        },
    });

    async function close() {
        if (isClosing.current) return;
        isClosing.current = true;
        try {
            if (await autosave.flush()) onClose();
        } finally {
            isClosing.current = false;
        }
    }

    function discard() {
        autosave.discard();
        onClose();
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) void close(); }}>
            <DialogContent
                closeLabel="Zavřít" className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-auto bg-white p-2 pt-11 sm:p-3 sm:pt-11"
                style={PROMPTBOOK_BRAND_STYLE} aria-describedby={undefined}
                onPointerDownOutside={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => {
                    if (opener.current instanceof HTMLElement && opener.current.isConnected) {
                        event.preventDefault();
                        opener.current.focus();
                    }
                }}
            >
                <DialogTitle className="sr-only">Upravit postavu {name}</DialogTitle>
                <BookEditor value={draft as BookEditorProps['value']} onChange={setDraft} height="min(62dvh, 32rem)"
                    isUploadButtonShown={false} isCameraButtonShown={false} isDownloadButtonShown={false}
                    isAboutButtonShown={false} isFullscreenButtonShown={false} />
                <p className="sr-only" role="status">{autosave.isSaving ? 'Ukládám změny…' : autosave.isDirty ? 'Změny čekají na uložení.' : 'Změny jsou uložené.'}</p>
                {autosave.errorMessage && (
                    <div className="space-y-2 px-2 pb-2 text-sm text-red-700">
                        <p role="alert">{autosave.errorMessage}</p>
                        <div className="flex flex-wrap gap-x-4">
                            {autosave.errorKind === 'save' && (
                                <button type="button" className="underline" onClick={() => void autosave.saveNow()}>Zkusit znovu</button>
                            )}
                            <button type="button" className="underline" disabled={autosave.isSaving} onClick={discard}>Zavřít bez uložení změn</button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
