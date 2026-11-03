'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, LoaderCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { createMessageTextExport, MESSAGE_TEXT_FORMATS, type MessageExportDocument, type MessageTextFormat } from '@/lib/messages/messageExport';
import './messageExports.css';

type ExportFormat = MessageTextFormat | 'pdf';
const labels: Record<ExportFormat, string> = { book: 'Book (.book)', md: 'Markdown (.md)', txt: 'Text (.txt)', pdf: 'PDF (.pdf)' };
export function MessageExportActions({ label, subject, filename, loadDocument, language = 'cs', disabled = false }: {
    readonly label?: string; readonly subject: string; readonly filename: string; readonly language?: 'cs' | 'en';
    readonly loadDocument: (signal: AbortSignal) => Promise<MessageExportDocument>; readonly disabled?: boolean;
}) {
    const cs = language === 'cs';
    const { copyText, copyStatus } = useCopyTextToClipboard();
    const [pending, setPending] = useState(false), [error, setError] = useState(false);
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);
    async function perform(action: 'copy' | 'download', format: ExportFormat) {
        if (request.current) return;
        const controller = new AbortController(); request.current = controller;
        setPending(true); setError(false);
        try {
            const document = await loadDocument(controller.signal);
            if (controller.signal.aborted) return;
            if (format === 'pdf') {
                const { renderMessagePdf } = await import('@/lib/messages/messageExportPdf');
                const blob = await renderMessagePdf(document);
                if (!controller.signal.aborted) downloadBlobFile({ blob, fileName: `${filename}.pdf` });
            } else {
                const text = createMessageTextExport(document, format);
                if (action === 'copy') await copyText(text);
                else downloadBlobFile({ blob: new Blob([text], { type: format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' }), fileName: `${filename}.${format}` });
            }
        } catch { if (!controller.signal.aborted) setError(true); }
        finally { if (request.current === controller) { request.current = null; setPending(false); } }
    }
    const failed = error || copyStatus === 'failed';
    return <div className="message-export-actions" role="group" aria-label={label ?? subject}>
        {label && <span className="message-export-label">{label}</span>}
        {(['download', 'copy'] as const).map((action) => {
            const title = action === 'download' ? cs ? 'Stáhnout' : 'Download' : cs ? 'Kopírovat' : 'Copy';
            const copied = action === 'copy' && copyStatus === 'copied' && !failed;
            return <DropdownMenu key={action}>
                <DropdownMenuTrigger asChild><button type="button" className="message-export-button" disabled={pending || disabled} aria-label={`${title} ${subject}`}>
                    {pending ? <LoaderCircle size={14} className="message-chat-loading" aria-hidden="true" /> : action === 'download' ? <Download size={14} aria-hidden="true" /> : copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    {title}
                </button></DropdownMenuTrigger>
                <DropdownMenuContent className="message-export-menu" align="end">
                    {[...MESSAGE_TEXT_FORMATS, ...(action === 'download' ? ['pdf' as const] : [])].map((format) => <DropdownMenuItem key={format} onSelect={() => void perform(action, format)}>{labels[format]}</DropdownMenuItem>)}
                </DropdownMenuContent>
            </DropdownMenu>;
        })}
        <span role="status" className={failed ? 'message-export-error' : 'sr-only'}>{failed ? cs ? 'Export se nepodařil. Zkus to prosím znovu.' : 'Export failed. Please try again.' : copyStatus === 'copied' ? cs ? 'Zkopírováno.' : 'Copied.' : ''}</span>
    </div>;
}
