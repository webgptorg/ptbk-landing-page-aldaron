/** @vitest-environment jsdom */

import { AdminEditorButton } from './AdminEditorButton';
import { AdminEditorDialog } from './AdminEditorDialog';
import { WorkshopCommentEditor } from '@/businesses/workshop-admin/WorkshopCommentEditor';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(async () => {
    cleanup();
    await settleAdminSavesForTest();
});

function Editor({ onSave }: { readonly onSave: (body: string) => Promise<boolean> }) {
    return (
        <AdminEditorButton label="Edit comment" title="Comment">
            {(closeEditor) => <WorkshopCommentEditor label="Message" initialBody="Original" onSave={onSave} onCancel={closeEditor} />}
        </AdminEditorButton>
    );
}

it('keeps invalid and failed drafts in the dialog when Escape or Close is used, then restores focus after saving', async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    render(<Editor onSave={onSave} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    const opener = screen.getByRole('button', { name: 'Edit comment' });
    opener.focus();
    fireEvent.click(opener);
    const field = screen.getByRole('textbox', { name: 'Message' });
    expect(screen.getByRole('dialog', { name: 'Comment' })).not.toBeNull();

    fireEvent.change(field, { target: { value: '' } });
    fireEvent.keyDown(field, { key: 'Escape' });
    await screen.findByText(/Změny ještě nejsou uložené/);
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(field, { target: { value: 'Keep this draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('Keep this draft'));
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Keep this draft');

    onSave.mockResolvedValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
});

it('waits for an in-flight save and newer typing before closing the dialog', async () => {
    let finishSave!: (isSaved: boolean) => void;
    const pendingSave = new Promise<boolean>((resolve) => { finishSave = resolve; });
    const onSave = vi.fn().mockImplementationOnce(() => pendingSave).mockResolvedValue(true);
    render(<Editor onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit comment' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'First edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Uložit text' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Latest edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog')).not.toBeNull();
    await act(async () => finishSave(true));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onSave.mock.calls.map(([body]) => body)).toEqual(['First edit', 'Latest edit']);
});

it('keeps an explicit batch visible while its creation is running', async () => {
    const onClose = vi.fn();
    let isCreating = true;
    const dialog = render(<AdminEditorDialog isOpen title="Přidat odkazy" onClose={onClose} canClose={() => !isCreating}>
        <p>Rozpracovaná dávka</p>
    </AdminEditorDialog>);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Rozpracovaná dávka')).toBeTruthy();

    isCreating = false;
    dialog.rerender(<AdminEditorDialog isOpen title="Přidat odkazy" onClose={onClose} canClose={() => !isCreating}>
        <p>Rozpracovaná dávka</p>
    </AdminEditorDialog>);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
});
