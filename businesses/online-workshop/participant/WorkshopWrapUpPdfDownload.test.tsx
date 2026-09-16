/**
 * @vitest-environment jsdom
 */

import type { WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pdfExportMocks = vi.hoisted(() => ({
    createWorkshopWrapUpPdfBlob: vi.fn(),
    downloadBlobFile: vi.fn(),
}));

vi.mock('@/lib/exports/workshopWrapUpPdf', () => ({
    createWorkshopWrapUpPdfBlob: (document: unknown) => pdfExportMocks.createWorkshopWrapUpPdfBlob(document),
}));

vi.mock('@/lib/downloadBlobFile', () => ({
    downloadBlobFile: (options: unknown) => pdfExportMocks.downloadBlobFile(options),
}));

import { WorkshopWrapUpPdfDownload } from '@/businesses/online-workshop/participant/WorkshopWrapUpPdfDownload';

const WORKSHOP: Pick<
    WorkshopDetails,
    'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'presentationUrl'
> = {
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Praktický workshop s AI agenty.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    presentationUrl: null,
};

const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'material-1',
    title: 'Podklady z workshopu',
    bodyMarkdown: '[Otevřít podklady](https://ptbk.io/material-123)',
    unlockAt: '2026-08-21T19:00:00+02:00',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: false,
    isPaidMembersOnly: false,
    createdAt: '2026-08-21T18:00:00+02:00',
    updatedAt: '2026-08-21T18:00:00+02:00',
    linkClickCount: 0,
};

beforeEach(() => {
    pdfExportMocks.createWorkshopWrapUpPdfBlob.mockReset();
    pdfExportMocks.createWorkshopWrapUpPdfBlob.mockResolvedValue(new Blob(['PDF'], { type: 'application/pdf' }));
    pdfExportMocks.downloadBlobFile.mockReset();
});

afterEach(() => {
    cleanup();
});

describe('workshop wrap-up PDF download', () => {
    it('creates and downloads a PDF from the workshop and the materials already visible to this attendee', async () => {
        render(<WorkshopWrapUpPdfDownload workshop={WORKSHOP} contentBlocks={[CONTENT_BLOCK]} />);

        fireEvent.click(screen.getByRole('button', { name: 'Stáhnout shrnutí workshopu (PDF)' }));

        await waitFor(() => expect(pdfExportMocks.createWorkshopWrapUpPdfBlob).toHaveBeenCalledOnce());
        expect(pdfExportMocks.createWorkshopWrapUpPdfBlob).toHaveBeenCalledWith(
            expect.objectContaining({
                title: WORKSHOP.title,
                summary: WORKSHOP.description,
                materials: [
                    expect.objectContaining({
                        title: CONTENT_BLOCK.title,
                        urls: ['https://ptbk.io/material-123'],
                    }),
                ],
            }),
        );
        expect(pdfExportMocks.downloadBlobFile).toHaveBeenCalledWith(
            expect.objectContaining({ fileName: 'produkcni-kod-2026-08-21-shrnuti-workshopu.pdf' }),
        );
    });

    it('keeps the button usable and explains a failed PDF render', async () => {
        pdfExportMocks.createWorkshopWrapUpPdfBlob.mockRejectedValueOnce(new Error('canvas is unavailable'));
        render(<WorkshopWrapUpPdfDownload workshop={WORKSHOP} contentBlocks={[]} />);

        const downloadButton = screen.getByRole('button', { name: 'Stáhnout shrnutí workshopu (PDF)' });
        fireEvent.click(downloadButton);

        expect((await screen.findByRole('alert')).textContent).toContain('Shrnutí se nepodařilo stáhnout');
        expect(downloadButton.hasAttribute('disabled')).toBe(false);
    });
});
