'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAT_ATTACHMENT_MAX_BYTES, CHAT_ATTACHMENT_MAX_COUNT, messageAttachmentSchema } from '@/lib/messages/messageAttachments';
import type { MessageChatSession } from '@/lib/messages/messageChatSession';

export function useMessageChatAttachments(options: {
    endpoint: string; session: MessageChatSession; updateSession: (session: MessageChatSession) => void;
    ready: boolean; pending: boolean; onError: (message: string) => void;
}) {
    const latest = useRef(options); latest.current = options;
    const request = useRef<AbortController | null>(null);
    const [uploading, setUploading] = useState(false);
    useEffect(() => () => request.current?.abort(), []);
    async function uploadFiles(files: readonly File[]) {
        const initial = latest.current;
        if (!files.length || !initial.ready || initial.pending || request.current) return;
        if (files.length + initial.session.attachments.length > CHAT_ATTACHMENT_MAX_COUNT) { initial.onError('K jedné otázce můžeš přiložit nejvýše čtyři soubory.'); return; }
        if (files.some((file) => !file.size || file.size > CHAT_ATTACHMENT_MAX_BYTES)) { initial.onError('Každý soubor může mít nejvýše 4 MB a nesmí být prázdný.'); return; }
        const controller = new AbortController(); request.current = controller;
        setUploading(true); initial.onError('');
        try {
            for (const file of files) {
                const form = new FormData(); form.append('file', file); form.append('conversationId', initial.session.conversationId);
                const response = await fetch(initial.endpoint, { method: 'POST', body: form, signal: controller.signal });
                const result = await response.json() as { attachment?: unknown; error?: unknown };
                if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Přílohu se nepodařilo nahrát.');
                const attachment = messageAttachmentSchema.safeParse(result.attachment);
                if (!attachment.success) throw new Error('Přílohu se nepodařilo nahrát.');
                if (controller.signal.aborted || latest.current.session.conversationId !== initial.session.conversationId) return;
                const next = { ...latest.current.session, attachments: [...latest.current.session.attachments, attachment.data] };
                latest.current.updateSession(next);
                latest.current = { ...latest.current, session: next };
            }
        } catch (failure) { if (!controller.signal.aborted) latest.current.onError(failure instanceof Error ? failure.message : 'Přílohu se nepodařilo nahrát.'); }
        finally { if (request.current === controller) { request.current = null; setUploading(false); } }
    }
    return { uploading, uploadFiles };
}
