/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchAdminWorkshopQuickLinkPreviewMock } = vi.hoisted(() => ({
    fetchAdminWorkshopQuickLinkPreviewMock: vi.fn(),
}));
vi.mock('@/businesses/workshop-admin/workshopAdminApiClient', () => ({
    fetchAdminWorkshopQuickLinkPreview: fetchAdminWorkshopQuickLinkPreviewMock,
}));

import { WorkshopQuickLinkMaterialEditor } from './WorkshopQuickLinkMaterialEditor';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const DEFAULT_UNLOCK_AT = '2026-09-25T10:00:00.000Z';

function renderEditor(onCreate: ReturnType<typeof vi.fn>, onClose = vi.fn()) {
    return render(<WorkshopQuickLinkMaterialEditor
        workshopId={WORKSHOP_ID}
        defaultUnlockAt={DEFAULT_UNLOCK_AT}
        contentBlocks={[{ sortOrder: 70 } as never]}
        onCreate={onCreate}
        onSavingChange={vi.fn()}
        onClose={onClose}
    />);
}

describe('quick link material editor', () => {
    beforeEach(() => {
        fetchAdminWorkshopQuickLinkPreviewMock.mockReset();
        fetchAdminWorkshopQuickLinkPreviewMock.mockImplementation(async (_workshopId, destination) => ({
            title: destination.includes('first') ? 'First title' : 'Second title',
            state: 'ready',
            message: null,
            isExisting: false,
        }));
    });
    afterEach(cleanup);

    it('creates separate ordinary materials in order and retries only the failed item', async () => {
        const onCreate = vi.fn()
            .mockRejectedValueOnce(new Error('Temporary failure'))
            .mockResolvedValueOnce({ id: 'second-material', title: 'Second title' })
            .mockResolvedValueOnce({ id: 'first-material', title: 'First title' });
        const onClose = vi.fn();
        renderEditor(onCreate, onClose);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), {
            target: { value: 'https://example.com/first?part=1#start\n\nhttps://example.com/second' },
        });

        await waitFor(() => expect(screen.getByRole('button', { name: 'Přidat 2 materiály' }).hasAttribute('disabled')).toBe(false));
        const addButton = screen.getByRole('button', { name: 'Přidat 2 materiály' });
        fireEvent.click(addButton);
        fireEvent.click(addButton);
        await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(2));

        expect(onCreate.mock.calls[0][0]).toMatchObject({
            title: 'First title',
            bodyMarkdown: '[First title](<https://example.com/first?part=1#start>)',
            unlockAt: DEFAULT_UNLOCK_AT,
            sortOrder: 80,
            isPublished: true,
            isPaidMembersOnly: false,
            isFollowUp: false,
        });
        expect(onCreate.mock.calls[1][0]).toMatchObject({ sortOrder: 90, title: 'Second title' });
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(await screen.findByRole('button', { name: 'Přidat 1 materiál' }));
        await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(3));
        expect(onCreate.mock.calls[2][0].idempotencyKey).toBe(onCreate.mock.calls[0][0].idempotencyKey);
        expect(onCreate.mock.calls[2][0].sortOrder).toBe(80);
        expect(onCreate.mock.calls[1][0].idempotencyKey).not.toBe(onCreate.mock.calls[0][0].idempotencyKey);
        await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });

    it('ignores an old preview after the URL changes and preserves a corrected title', async () => {
        let resolveOldPreview: ((value: unknown) => void) | undefined;
        fetchAdminWorkshopQuickLinkPreviewMock.mockImplementation((_workshopId, destination) =>
            destination.includes('old')
                ? new Promise((resolve) => { resolveOldPreview = resolve; })
                : Promise.resolve({ title: 'New page title', state: 'ready', message: null, isExisting: false }),
        );
        const onCreate = vi.fn().mockResolvedValue({ id: 'created', title: 'My correction' });
        renderEditor(onCreate);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), { target: { value: 'https://example.com/old' } });
        await waitFor(() => expect(resolveOldPreview).toBeDefined());
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), { target: { value: 'https://example.com/new' } });
        await waitFor(() => expect(screen.getByDisplayValue('New page title')).toBeTruthy());
        fireEvent.change(screen.getByLabelText('Nadpis odkazu na řádku 1 (volitelná oprava)'), { target: { value: 'My correction' } });
        resolveOldPreview?.({ title: 'Old page title', state: 'ready', message: null, isExisting: false });

        expect(screen.getByDisplayValue('My correction')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Přidat 1 materiál' }));
        await waitFor(() => expect(onCreate).toHaveBeenCalledOnce());
        expect(onCreate.mock.calls[0][0].title).toBe('My correction');
        expect(onCreate.mock.calls[0][0].bodyMarkdown).toContain('https://example.com/new');
    });

    it('does not create a material when the draft is closed before confirmation', async () => {
        const onCreate = vi.fn();
        const editor = renderEditor(onCreate);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), { target: { value: 'https://example.com/first' } });
        await waitFor(() => expect(fetchAdminWorkshopQuickLinkPreviewMock).toHaveBeenCalledOnce());
        editor.unmount();

        expect(onCreate).not.toHaveBeenCalled();
    });

    it('shows invalid and duplicate lines and never previews beyond the batch limit', async () => {
        const onCreate = vi.fn();
        renderEditor(onCreate);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), {
            target: { value: 'https://example.com/first\nhttps://example.com/first\nfile:///private' },
        });
        expect(screen.getByText(/Tento odkaz je už v dávce/)).toBeTruthy();
        expect(screen.getByText(/Neplatná adresa/)).toBeTruthy();
        await waitFor(() => expect(fetchAdminWorkshopQuickLinkPreviewMock).toHaveBeenCalledOnce());
        expect(screen.getByRole('button', { name: 'Přidat 1 materiál' }).hasAttribute('disabled')).toBe(true);

        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), {
            target: { value: Array.from({ length: 13 }, (_, index) => `https://example.com/page-${index}`).join('\n') },
        });
        await waitFor(() => expect(fetchAdminWorkshopQuickLinkPreviewMock).toHaveBeenCalledTimes(13));
        expect(screen.getByText(/Mimo limit dávky/)).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Přidat 13 materiálů' }).hasAttribute('disabled')).toBe(true);
        expect(onCreate).not.toHaveBeenCalled();
    });
});
