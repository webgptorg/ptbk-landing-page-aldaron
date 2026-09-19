'use client';

import { fetchWorkshopState } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { Download, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type WorkshopWrapUpPdfDownloadProps = {
    readonly workshopSlug: string;
};

/** Refreshes the existing authenticated state before exporting, including current membership and workshop timing. */
export function WorkshopWrapUpPdfDownload({ workshopSlug }: WorkshopWrapUpPdfDownloadProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function downloadWrapUp(): Promise<void> {
        if (isDownloading) {
            return;
        }
        setIsDownloading(true);
        setErrorMessage(null);
        try {
            const [state, pdfExport] = await Promise.all([
                fetchWorkshopState(workshopSlug, 'recent'),
                import('@/lib/workshops/workshopWrapUpPdf'),
            ]);
            const definition = pdfExport.createWorkshopWrapUpPdfDefinition(state, window.location.origin);
            const blob = await pdfExport.renderWorkshopWrapUpPdf(definition);
            downloadBlobFile({ fileName: `${workshopSlug}-shrnuti.pdf`, blob });
        } catch {
            setErrorMessage(
                'PDF se nepodařilo připravit. Ověřte připojení a zkuste to znovu. Shrnutí je dostupné až po skončení workshopu.',
            );
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <div className="mt-5">
            <button
                type="button"
                onClick={() => void downloadWrapUp()}
                disabled={isDownloading}
                aria-busy={isDownloading}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
                {isDownloading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {isDownloading ? 'Připravuji PDF…' : 'Stáhnout shrnutí v PDF'}
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-400">Shrnutí, hlavní poznatky a materiály z workshopu.</p>
            {errorMessage !== null && (
                <p role="alert" className="mt-2 text-sm text-rose-200">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
