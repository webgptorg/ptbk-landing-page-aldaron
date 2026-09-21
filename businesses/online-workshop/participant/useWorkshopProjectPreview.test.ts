/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkshopProjectPreview } from './useWorkshopProjectPreview';
import { createWorkshopProjectPreviewFallback } from '@/lib/workshops/workshopProjectPreview';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';

const PREVIEW_MOCKS = vi.hoisted(() => ({ fetchWorkshopProjectPreview: vi.fn() }));
vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', () => PREVIEW_MOCKS);

const REPOSITORY: WorkshopRepository = {
    owner: 'example', name: 'project', branch: 'main', deploymentUrls: ['https://app.example.com/'],
};
const PREVIEW: WorkshopProjectPreview = {
    ...createWorkshopProjectPreviewFallback(REPOSITORY),
    title: 'Deployed application', previewImageUrl: 'https://app.example.com/preview.png',
};

beforeEach(() => {
    PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockReset();
});
afterEach(cleanup);

describe('workshop deployment preview loading', () => {
    it('ignores a late preview after changing only the primary deployment', async () => {
        let finishPreviousPreview!: (value: { preview: WorkshopProjectPreview }) => void;
        PREVIEW_MOCKS.fetchWorkshopProjectPreview
            .mockImplementationOnce(() => new Promise((resolve) => { finishPreviousPreview = resolve; }))
            .mockResolvedValue({ preview: null });
        const { result, rerender } = renderHook(
            (repository: WorkshopRepository) => useWorkshopProjectPreview('workshop', repository),
            { initialProps: REPOSITORY },
        );
        const previousSignal = PREVIEW_MOCKS.fetchWorkshopProjectPreview.mock.calls[0][1] as AbortSignal;
        const newRepository = { ...REPOSITORY, deploymentUrls: ['https://new.example.com/'] };
        rerender(newRepository);
        await act(async () => finishPreviousPreview({ preview: PREVIEW }));

        expect(previousSignal.aborted).toBe(true);
        expect(result.current).toEqual(createWorkshopProjectPreviewFallback(newRepository));
        expect(PREVIEW_MOCKS.fetchWorkshopProjectPreview).toHaveBeenCalledTimes(2);
    });

    it('drops loaded metadata on a room switch and ignores a mismatched server repository', async () => {
        PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockResolvedValueOnce({ preview: PREVIEW });
        const { result, rerender } = renderHook(
            (workshopSlug: string) => useWorkshopProjectPreview(workshopSlug, REPOSITORY),
            { initialProps: 'first-workshop' },
        );
        await waitFor(() => expect(result.current.title).toBe(PREVIEW.title));

        PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockResolvedValue({ preview: { ...PREVIEW, repositoryName: 'example/other' } });
        rerender('second-workshop');
        await act(async () => {});
        expect(result.current).toEqual(createWorkshopProjectPreviewFallback(REPOSITORY));
    });

    it('keeps the application available after a failed request and skips fetching without a deployment', async () => {
        PREVIEW_MOCKS.fetchWorkshopProjectPreview.mockRejectedValue(new Error('Offline'));
        const { result, rerender } = renderHook(
            (repository: WorkshopRepository) => useWorkshopProjectPreview('workshop', repository),
            { initialProps: REPOSITORY },
        );
        await act(async () => {});
        expect(result.current).toEqual(createWorkshopProjectPreviewFallback(REPOSITORY));

        rerender({ ...REPOSITORY, deploymentUrls: [] });
        expect(result.current.title).toBe('example/project');
        expect(result.current.deploymentUrl).toBeNull();
        expect(PREVIEW_MOCKS.fetchWorkshopProjectPreview).toHaveBeenCalledTimes(1);
    });
});
