'use client';

import { useRef, useEffect, useState } from 'react';
import { Check, Copy, Download, LoaderCircle } from 'lucide-react';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';

function MessageActionRow({ label, subject, href }: {
    readonly label: string;
    readonly subject: string;
    readonly href: string;
}) {
    const { copyStatus, copyText } = useCopyTextToClipboard();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);

    async function copy() {
        if (request.current) return;
        const controller = new AbortController();
        request.current = controller;
        setPending(true);
        setError(false);
        try {
            const response = await fetch(href, { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error('Download unavailable');
            await copyText(await response.text());
        } catch {
            if (!controller.signal.aborted) setError(true);
        } finally {
            if (request.current === controller) { request.current = null; setPending(false); }
        }
    }

    const failed = error || copyStatus === 'failed';
    const copied = !pending && !failed && copyStatus === 'copied';
    const copyLabel = copied ? `Zkopírováno: ${subject}` : `Kopírovat ${subject}`;
    return <div className="message-action-row" role="group" aria-label={label}>
        <span className="message-action-label">{label}</span>
        <a href={href} download className="message-action-button" aria-label={`Stáhnout ${subject}`} title={`Stáhnout ${subject}`}>
            <Download size={16} aria-hidden="true" />
        </a>
        <button type="button" className="message-action-button" onClick={() => void copy()} disabled={pending} aria-label={copyLabel} title={copyLabel}>
            {pending ? <LoaderCircle size={15} className="message-chat-loading" aria-hidden="true" /> : copied ? <Check size={16} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>
        <span className={failed ? 'message-action-error' : 'sr-only'} role="status">
            {failed ? 'Kopírování se nepodařilo. Použij stažení.' : copied ? `${label}: zkopírováno.` : ''}
        </span>
    </div>;
}

/** Download/copy both texts without putting the full context into the client bundle. */
export function MessageActions({ href }: { readonly href: string }) {
    return <div className="message-actions" aria-label="Zpráva a celý kontext">
        <MessageActionRow label="Zpráva" subject="zprávu" href={`${href}/message.md`} />
        <MessageActionRow label="Celý kontext" subject="celý kontext" href={`${href}/context.md`} />
    </div>;
}
