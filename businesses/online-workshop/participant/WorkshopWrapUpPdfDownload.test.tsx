/** @vitest-environment jsdom */

import { WorkshopWrapUpPdfDownload } from '@/businesses/online-workshop/participant/WorkshopWrapUpPdfDownload';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const MOCKS = vi.hoisted(() => ({
    fetchState: vi.fn(),
    createDefinition: vi.fn(),
    renderPdf: vi.fn(),
    downloadFile: vi.fn(),
}));

vi.mock('@/businesses/online-workshop/participant/workshopParticipantApi', () => ({
    fetchWorkshopState: MOCKS.fetchState,
}));
vi.mock('@/lib/workshops/workshopWrapUpPdf', () => ({
    createWorkshopWrapUpPdfDefinition: MOCKS.createDefinition,
    renderWorkshopWrapUpPdf: MOCKS.renderPdf,
}));
vi.mock('@/lib/downloadBlobFile', () => ({ downloadBlobFile: MOCKS.downloadFile }));

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
});

describe('wrap-up download', () => {
    it('waits for fresh authenticated state, prevents duplicate clicks, and downloads an actual PDF blob', async () => {
        let resolveState: (value: unknown) => void = () => undefined;
        MOCKS.fetchState.mockReturnValue(
            new Promise((resolve) => {
                resolveState = resolve;
            }),
        );
        const state = { contentBlocks: [{ bodyMarkdown: 'CURRENT MATERIALS' }] };
        const definition = { content: ['CURRENT MATERIALS'] };
        const blob = new Blob(['%PDF-test'], { type: 'application/pdf' });
        MOCKS.createDefinition.mockReturnValue(definition);
        MOCKS.renderPdf.mockResolvedValue(blob);
        render(<WorkshopWrapUpPdfDownload workshopSlug="chosen-workshop" />);

        const button = screen.getByRole('button', { name: 'Stáhnout shrnutí v PDF' });
        fireEvent.click(button);
        fireEvent.click(button);
        expect(MOCKS.fetchState).toHaveBeenCalledExactlyOnceWith('chosen-workshop', 'recent');
        expect((button as HTMLButtonElement).disabled).toBe(true);
        expect(MOCKS.downloadFile).not.toHaveBeenCalled();
        resolveState(state);

        await waitFor(() =>
            expect(MOCKS.downloadFile).toHaveBeenCalledWith({ fileName: 'chosen-workshop-shrnuti.pdf', blob }),
        );
        expect(MOCKS.createDefinition).toHaveBeenCalledWith(state, window.location.origin);
        expect(MOCKS.renderPdf).toHaveBeenCalledWith(definition);
        expect((button as HTMLButtonElement).disabled).toBe(false);
    });

    it('does not export a cached copy when authentication fails and allows a retry', async () => {
        MOCKS.fetchState.mockRejectedValueOnce(new Error('Workshop connection required'));
        render(<WorkshopWrapUpPdfDownload workshopSlug="chosen-workshop" />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('PDF se nepodařilo připravit'));
        expect(MOCKS.downloadFile).not.toHaveBeenCalled();
        expect(MOCKS.createDefinition).not.toHaveBeenCalled();

        MOCKS.fetchState.mockResolvedValue({ contentBlocks: [] });
        MOCKS.renderPdf.mockResolvedValue(new Blob());
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(MOCKS.downloadFile).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('reports generation errors and leaves the download available for retry', async () => {
        MOCKS.fetchState.mockResolvedValue({});
        MOCKS.renderPdf.mockRejectedValue(new Error('PDF rendering failed'));
        render(<WorkshopWrapUpPdfDownload workshopSlug="chosen-workshop" />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
        expect(MOCKS.downloadFile).not.toHaveBeenCalled();
        expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false);
    });
});
