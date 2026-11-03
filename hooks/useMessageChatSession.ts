'use client';

import { useEffect, useState } from 'react';
import { messageChatStorageKey, readMessageChatSession, type MessageChatSession } from '@/lib/messages/messageChatSession';

export function useMessageChatSession(source: string, introduction: string) {
    const initial = (): MessageChatSession => ({ version: 1, conversationId: '',
        turns: introduction ? [{ role: 'assistant', content: introduction }] : [], draft: '', retry: null, attachments: [] });
    const [session, setSession] = useState<MessageChatSession>(initial);
    const [ready, setReady] = useState(false);
    const [storageFailed, setStorageFailed] = useState(false);
    useEffect(() => {
        let restored: MessageChatSession | null = null;
        try { restored = readMessageChatSession(window.localStorage, source); }
        catch { setStorageFailed(true); }
        setSession(restored ?? { ...initial(), conversationId: crypto.randomUUID() });
        setReady(true);
        // The owner is keyed by source, so one message can never overwrite another's history.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source]);
    function updateSession(next: MessageChatSession) {
        setSession(next);
        try {
            window.localStorage.setItem(messageChatStorageKey(source), JSON.stringify(next));
            setStorageFailed(false);
        } catch { setStorageFailed(true); }
    }
    function reset() { updateSession({ ...initial(), conversationId: crypto.randomUUID() }); }
    return { session, updateSession, reset, ready, storageFailed };
}
