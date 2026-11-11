'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import type { MessageTranscriptionReport } from '@/lib/messages/messageTranscriptionClient';

export function MessageTranscriptionDiagnostics({ reports }: { reports: readonly MessageTranscriptionReport[] }) {
    const { copyStatus, copyText } = useCopyTextToClipboard();
    const report = useMemo(() => JSON.stringify({ format: 'messages-transcription-v1', attempts: reports }, null, 2), [reports]);
    if (!reports.length) return null;
    return <details className="min-w-0 rounded-xl border border-slate-200 p-4" open={reports.at(-1)?.outcome === 'failed'}>
        <summary className="cursor-pointer text-sm font-medium">Technický report přepisu</summary>
        <div className="mt-3 space-y-3">
            <Button type="button" variant="outline" onClick={() => void copyText(report)}>
                {copyStatus === 'copied' ? 'Report zkopírován' : 'Kopírovat technický report'}
            </Button>
            {copyStatus === 'failed' && <p role="status" className="text-sm text-red-700">Kopírování selhalo. Report můžete označit a zkopírovat ručně.</p>}
            <Textarea aria-label="Surový technický report přepisu" value={report} readOnly rows={12} wrap="off" className="max-w-full font-mono text-xs" />
        </div>
    </details>;
}
