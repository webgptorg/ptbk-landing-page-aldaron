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

    it.each([
        { state: 'ready', title: 'Example article' },
        { state: 'fallback', title: 'example.com' },
    ])('passes only the original URL to creation with a $state title', async ({ state, title }) => {
        const DESTINATION = 'https://example.com/article?ref=workshop#demo';
        fetchAdminWorkshopQuickLinkPreviewMock.mockResolvedValue({
            title,
            state,
            message: state === 'fallback' ? 'Stránka neodpověděla.' : null,
            isExisting: false,
        });
        const onCreate = vi.fn().mockResolvedValue({ id: 'created', title });
        renderEditor(onCreate);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), {
            target: { value: ` \t${DESTINATION} \t\n` },
        });

        await waitFor(() => expect(screen.getByRole('button', { name: 'Přidat 1 materiál' }).hasAttribute('disabled')).toBe(false));
        fireEvent.click(screen.getByRole('button', { name: 'Přidat 1 materiál' }));
        await waitFor(() => expect(onCreate).toHaveBeenCalledOnce());

        // This callback is the generation boundary, before shared tracking/link materialization.
        expect(onCreate.mock.calls[0][0]).toMatchObject({ title, bodyMarkdown: DESTINATION });
        expect(fetchAdminWorkshopQuickLinkPreviewMock).toHaveBeenCalledExactlyOnceWith(
            WORKSHOP_ID, DESTINATION, expect.any(AbortSignal),
        );
    });

    it('creates separate ordinary materials in order and retries only the failed item', async () => {
        const FIRST_DESTINATION = 'https://Example.COM:443/first(a)/%2f?filter=[one]&part=1#start';
        const SECOND_DESTINATION = "https://example.com/second?next=%2Fguide&tag=one+two#chapter's!";
        const onCreate = vi.fn()
            .mockRejectedValueOnce(new Error('Temporary failure'))
            .mockResolvedValueOnce({ id: 'second-material', title: 'Second title' })
            .mockResolvedValueOnce({ id: 'first-material', title: 'First title' });
        const onClose = vi.fn();
        renderEditor(onCreate, onClose);
        fireEvent.change(screen.getByLabelText('Odkazy, jeden na řádek'), {
            target: { value: `  ${FIRST_DESTINATION} \n\n\t${SECOND_DESTINATION} ` },
        });

        await waitFor(() => expect(screen.getByRole('button', { name: 'Přidat 2 materiály' }).hasAttribute('disabled')).toBe(false));
        const addButton = screen.getByRole('button', { name: 'Přidat 2 materiály' });
        fireEvent.click(addButton);
        fireEvent.click(addButton);
        await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(2));

        expect(onCreate.mock.calls[0][0]).toMatchObject({
            title: 'First title',
            bodyMarkdown: FIRST_DESTINATION,
            unlockAt: DEFAULT_UNLOCK_AT,
            sortOrder: 80,
            isPublished: true,
            isPaidMembersOnly: false,
            isFollowUp: false,
        });
        expect(onCreate.mock.calls[1][0]).toMatchObject({ sortOrder: 90, title: 'Second title', bodyMarkdown: SECOND_DESTINATION });
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(await screen.findByRole('button', { name: 'Přidat 1 materiál' }));
        await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(3));
        expect(onCreate.mock.calls[2][0].idempotencyKey).toBe(onCreate.mock.calls[0][0].idempotencyKey);
        expect(onCreate.mock.calls[2][0].sortOrder).toBe(80);
        expect(onCreate.mock.calls[2][0].bodyMarkdown).toBe(FIRST_DESTINATION);
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
        expect(onCreate.mock.calls[0][0].bodyMarkdown).toBe('https://example.com/new');
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
