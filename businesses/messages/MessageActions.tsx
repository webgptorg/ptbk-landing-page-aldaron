'use client';

import { MessageExportActions } from './MessageExportActions';
import type { MessageExportDocument } from '@/lib/messages/messageExport';

/** Context remains server-side until the reader explicitly selects an export format. */
export function MessageActions({ href }: { readonly href: string }) {
    return <div className="message-actions" aria-label="Zpráva a celý kontext">
        {(['message', 'context'] as const).map((kind) => <MessageExportActions key={kind}
            label={kind === 'message' ? 'Zpráva' : 'Celý kontext'} subject={kind === 'message' ? 'zprávu' : 'celý kontext'} filename={kind === 'message' ? 'zprava' : 'kontext'}
            loadDocument={async (signal) => {
                const response = await fetch(`${href}/${kind}.json`, { cache: 'no-store', signal });
                if (!response.ok) throw new Error('Export unavailable');
                return await response.json() as MessageExportDocument;
            }} />)}
    </div>;
}
