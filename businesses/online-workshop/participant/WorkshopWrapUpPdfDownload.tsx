'use client';

import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { createWorkshopWrapUpPdfBlob } from '@/lib/exports/workshopWrapUpPdf';
import {
    createWorkshopWrapUpDocument,
    createWorkshopWrapUpPdfFileName,
} from '@/lib/workshops/workshopWrapUpDocument';
import type { WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Download, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type WorkshopWrapUpPdfDownloadProps = {
    readonly workshop: Pick<
        WorkshopDetails,
        'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'presentationUrl'
    >;

    /** The same participant-visible materials rendered in the room below the stage. */
    readonly contentBlocks: readonly WorkshopContentBlock[];
};

/**
 * Lets an attendee take the information already visible in a completed room away as one printable document.
 *
 * Note: This owns only the browser interaction. The document factory decides its contents and the shared download
 * helper starts the file download, so this button cannot introduce a second material source or download path.
 */
export function WorkshopWrapUpPdfDownload({ workshop, contentBlocks }: WorkshopWrapUpPdfDownloadProps) {
    const [isDownloadInProgress, setIsDownloadInProgress] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const downloadWorkshopWrapUp = async () => {
        setIsDownloadInProgress(true);
        setErrorMessage(null);

        try {
            const document = createWorkshopWrapUpDocument({ workshop, contentBlocks });
            const blob = await createWorkshopWrapUpPdfBlob(document);

            downloadBlobFile({ fileName: createWorkshopWrapUpPdfFileName(workshop.slug), blob });
        } catch {
            setErrorMessage('Shrnutí se nepodařilo stáhnout. Zkuste to prosím znovu.');
        } finally {
            setIsDownloadInProgress(false);
        }
    };

    return (
        <div className="mt-5">
            <button
                type="button"
                onClick={() => void downloadWorkshopWrapUp()}
                disabled={isDownloadInProgress}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-cyan-300/10 px-5 py-2.5 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-300/10 transition hover:border-cyan-100 hover:bg-cyan-300/20 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081a24]"
            >
                {isDownloadInProgress ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {isDownloadInProgress ? 'Připravuji PDF…' : 'Stáhnout shrnutí workshopu (PDF)'}
            </button>
            {errorMessage !== null && (
                <p role="alert" className="mt-2 text-sm text-rose-200">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
