/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_AUTOSAVE_DELAY_MILLISECONDS } from '@/lib/admin/AdminSaveQueue';
import type { ReactNode } from 'react';

vi.mock('@/businesses/workshop-admin/WorkshopContentEditor', () => ({
    WorkshopContentEditor: () => <div>Material editor</div>,
}));
vi.mock('@/businesses/workshop-admin/WorkshopQuickLinkMaterialEditor', () => ({
    WorkshopQuickLinkMaterialEditor: () => null,
}));
vi.mock('@/components/admin/AdminEditorButton', () => ({
    AdminEditorButton: ({ children, label }: {
        readonly children: ReactNode | ((closeEditor: () => void) => ReactNode);
        readonly label: string;
    }) => (
        <div><button type="button">{label}</button>{typeof children === 'function' ? children(() => undefined) : children}</div>
    ),
}));
vi.mock('@/components/admin/AdminEditorDialog', () => ({
    AdminEditorDialog: ({ children, isOpen }: { readonly children: ReactNode; readonly isOpen: boolean }) => isOpen ? <div>{children}</div> : null,
}));

import { WorkshopContentAdmin } from './WorkshopContentAdmin';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';

const WORKSHOP_ID = '5a7eb2ad-2583-4e98-9640-50bc773b5fde';
const UNLOCK_AT = '2026-09-26T10:00:00.000Z';
const FIRST_ID = '1a3277c7-4853-41b2-bf0f-73bd0a092b82';
const SECOND_ID = '32328e68-10a5-4a22-bd56-503e3ef3a58a';

function createMaterial(id: string, title: string, sortOrder: number): WorkshopContentBlock {
    return {
        id,
        title,
        bodyMarkdown: `${title} body`,
        unlockAt: UNLOCK_AT,
        sortOrder,
        isPublished: true,
        isFollowUp: false,
        isPaidMembersOnly: false,
        linkClickCount: 0,
        createdAt: UNLOCK_AT,
        updatedAt: UNLOCK_AT,
    };
}

const CONTENT_BLOCKS = [createMaterial(FIRST_ID, 'First', 0), createMaterial(SECOND_ID, 'Second', 10)];

function renderContentAdmin(
    onReorder: ReturnType<typeof vi.fn>,
    contentBlocks: readonly WorkshopContentBlock[] = CONTENT_BLOCKS,
) {
    return render(
        <WorkshopContentAdmin
            workshopId={WORKSHOP_ID}
            defaultUnlockAt={UNLOCK_AT}
            contentBlocks={contentBlocks}
            onCreate={vi.fn().mockResolvedValue(true)}
            onCreateQuickLink={vi.fn()}
            onUpdate={vi.fn().mockResolvedValue(true)}
            onDelete={vi.fn().mockResolvedValue(undefined)}
            onReorder={onReorder}
        />,
    );
}

function getMaterialTitles(): string[] {
    return screen.getAllByRole('article').map((article) => within(article).getByRole('heading', { level: 3 }).textContent ?? '');
}

async function settleAutosave(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ADMIN_AUTOSAVE_DELAY_MILLISECONDS + 50));
}

describe('workshop material ordering', () => {
    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('moves a material with the keyboard control and keeps a stale background snapshot from restoring its old order', async () => {
        const onReorder = vi.fn().mockResolvedValue({ contentIds: [SECOND_ID, FIRST_ID], wasReconciled: false });
        const view = renderContentAdmin(onReorder);

        fireEvent.click(screen.getByRole('button', { name: 'Přesunout materiál First dolů' }));
        expect(getMaterialTitles()).toEqual(['Second', 'First']);
        expect(screen.getAllByRole('status').some((status) => status.textContent?.includes('Čeká na uložení'))).toBe(true);

        view.rerender(
            <WorkshopContentAdmin
                workshopId={WORKSHOP_ID}
                defaultUnlockAt={UNLOCK_AT}
                contentBlocks={CONTENT_BLOCKS}
                onCreate={vi.fn().mockResolvedValue(true)}
                onCreateQuickLink={vi.fn()}
                onUpdate={vi.fn().mockResolvedValue(true)}
                onDelete={vi.fn().mockResolvedValue(undefined)}
                onReorder={onReorder}
            />,
        );
        expect(getMaterialTitles()).toEqual(['Second', 'First']);

        await settleAutosave();
        expect(onReorder).toHaveBeenCalledOnce();
        expect(onReorder).toHaveBeenCalledWith([SECOND_ID, FIRST_ID]);
        expect(screen.getAllByRole('status').map((status) => status.textContent)).toContain('Uloženo');
    });

    it('coalesces rapid keyboard moves and does not save an unchanged position', async () => {
        const onReorder = vi.fn().mockResolvedValue({ contentIds: [SECOND_ID, FIRST_ID], wasReconciled: false });
        renderContentAdmin(onReorder);

        fireEvent.click(screen.getByRole('button', { name: 'Přesunout materiál First nahoru' }));
        expect(onReorder).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Přesunout materiál First dolů' }));
        fireEvent.click(screen.getByRole('button', { name: 'Přesunout materiál First dolů' }));
        expect(getMaterialTitles()).toEqual(['Second', 'First']);

        await settleAutosave();
        expect(onReorder).toHaveBeenCalledOnce();
        expect(onReorder).toHaveBeenCalledWith([SECOND_ID, FIRST_ID]);
    });

    it('keeps a failed order dirty and exposes the shared retry action', async () => {
        const onReorder = vi.fn()
            .mockRejectedValueOnce(new Error('Temporary order failure'))
            .mockResolvedValueOnce({ contentIds: [SECOND_ID, FIRST_ID], wasReconciled: false });
        renderContentAdmin(onReorder);

        fireEvent.click(screen.getByRole('button', { name: 'Přesunout materiál First dolů' }));
        await settleAutosave();
        expect(screen.getByRole('alert').textContent).toContain('Temporary order failure');
        expect(getMaterialTitles()).toEqual(['Second', 'First']);

        fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(onReorder).toHaveBeenCalledTimes(2);
        expect(screen.getAllByRole('status').map((status) => status.textContent)).toContain('Uloženo');
    });
});
