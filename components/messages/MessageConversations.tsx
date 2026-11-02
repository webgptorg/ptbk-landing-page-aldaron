'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyTextButton } from '@/components/shortener/CopyTextButton';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import type { MessageConversation, MessageConversationPage, MessageConversationTurnsPage, RecordedMessageChatTurn } from '@/lib/messages/messageConversationTypes';

const date = (value: string) => new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Prague' }).format(new Date(value));

/** Read-only histories never share or replace the message editor's autosaved draft. */
export function MessageConversations({ messageId, language }: { readonly messageId?: string; readonly language?: 'cs' | 'en' }) {
    const base = language ? `/api/admin/messages/personal/${language}/conversations` : `/api/admin/messages/${messageId}/conversations`;
    const [conversations, setConversations] = useState<MessageConversation[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [turns, setTurns] = useState<RecordedMessageChatTurn[]>([]);
    const [moreConversations, setMoreConversations] = useState(false);
    const [moreTurns, setMoreTurns] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const generation = useRef(0);
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const loadConversations = useCallback(async (offset = 0) => {
        const request = ++generation.current;
        setLoading(true); setError('');
        try {
            const page = await requestAdminJson<MessageConversationPage>(`${base}?offset=${offset}`);
            if (!mounted.current || request !== generation.current) return;
            setConversations((current) => offset ? [...current, ...page.conversations] : page.conversations);
            setMoreConversations(page.hasMore);
        } catch (failure) {
            if (mounted.current && request === generation.current) setError(failure instanceof Error ? failure.message : 'Konverzace se nepodařilo načíst.');
        } finally { if (mounted.current && request === generation.current) setLoading(false); }
    }, [base]);
    useEffect(() => { void loadConversations(); }, [loadConversations]);

    async function loadTurns(conversationId: string, offset = 0) {
        const request = ++generation.current;
        setLoading(true); setError(''); setSelected(conversationId);
        if (!offset) { setTurns([]); setMoreTurns(false); }
        try {
            const page = await requestAdminJson<MessageConversationTurnsPage>(`${base}?conversationId=${conversationId}&offset=${offset}`);
            if (!mounted.current || request !== generation.current) return;
            setTurns((current) => offset ? [...current, ...page.turns] : page.turns); setMoreTurns(page.hasMore);
        } catch (failure) {
            if (mounted.current && request === generation.current) setError(failure instanceof Error ? failure.message : 'Rozhovor se nepodařilo načíst.');
        } finally { if (mounted.current && request === generation.current) setLoading(false); }
    }
    const copy = [turns[0]?.introduction ? `Pavol Hejný: ${turns[0].introduction}` : '', ...turns.map((turn) =>
        `${date(turn.createdAt)}\nNávštěvník: ${turn.question}\n${turn.reply ? `Pavol Hejný: ${turn.reply}` : turn.status === 'failed' ? `Chyba: ${turn.errorMessage}` : 'Odpověď není dokončená.'}`,
    )].filter(Boolean).join('\n\n');

    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Anonymní rozhovory jsou oddělené podle otevřeného chatu. Časy jsou v časovém pásmu Prahy.</p>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void (selected ? loadTurns(selected) : loadConversations())}>Obnovit</Button>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {selected ? <>
            <div className="flex items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={() => { generation.current++; setLoading(false); setSelected(null); setTurns([]); setError(''); }}>Zpět na konverzace</Button>
                {turns.length > 0 && !moreTurns && <CopyTextButton text={copy} label="Kopírovat konverzaci" />}
            </div>
            {turns[0]?.introduction && <div className="rounded-xl bg-slate-50 p-4"><p className="mb-1 text-xs font-semibold text-slate-500">Pavol Hejný · úvod chatu</p><p className="whitespace-pre-wrap break-words text-sm">{turns[0].introduction}</p></div>}
            <ol className="space-y-5" aria-label="Zaznamenaný rozhovor">
                {turns.map((turn) => <li key={turn.id} className="space-y-3 border-b border-slate-200 pb-5">
                    <div className="rounded-xl bg-cyan-50 p-4"><p className="mb-1 text-xs font-semibold text-slate-500">Návštěvník · <time dateTime={turn.createdAt}>{date(turn.createdAt)}</time></p><p className="whitespace-pre-wrap break-words text-sm">{turn.question}</p></div>
                    {turn.reply ? <div className="rounded-xl bg-slate-50 p-4"><p className="mb-1 text-xs font-semibold text-slate-500">Pavol Hejný{turn.completedAt && <> · <time dateTime={turn.completedAt}>{date(turn.completedAt)}</time></>}</p><p className="whitespace-pre-wrap break-words text-sm">{turn.reply}</p></div>
                        : <p className="text-sm text-slate-500">{turn.status === 'failed' ? `Odpověď se nezdařila: ${turn.errorMessage}` : 'Odpověď se připravuje nebo byla přerušena. Dotaz je uložený.'}</p>}
                </li>)}
            </ol>
            {!loading && !error && turns.length === 0 && <p className="text-sm text-slate-500">V této konverzaci nejsou žádné dotazy.</p>}
            {moreTurns && <Button variant="outline" disabled={loading} onClick={() => void loadTurns(selected, turns.length)}>Načíst další část rozhovoru</Button>}
        </> : <>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {conversations.map((conversation) => <button key={conversation.conversationId} type="button" className="block w-full space-y-2 p-4 text-left hover:bg-slate-50 focus-visible:outline-cyan-600" disabled={loading} onClick={() => void loadTurns(conversation.conversationId)}>
                    <span className="block text-sm font-semibold">Anonymní konverzace · {date(conversation.startedAt)}</span>
                    <span className="block whitespace-pre-wrap break-words text-sm text-slate-700">{conversation.preview}</span>
                    <span className="block text-xs text-slate-500">Dotazy: {conversation.turnCount} · Poslední aktivita: {date(conversation.lastActivityAt)}{conversation.failedCount > 0 && ` · Nezdařené odpovědi: ${conversation.failedCount}`}</span>
                </button>)}
                {!loading && !error && conversations.length === 0 && <p className="p-5 text-sm text-slate-500">Zatím žádná zaznamenaná konverzace. Nové rozhovory se tu objeví po první odeslané otázce.</p>}
            </div>
            {moreConversations && <Button variant="outline" disabled={loading} onClick={() => void loadConversations(conversations.length)}>Načíst další konverzace</Button>}
        </>}
        {loading && <p role="status" className="text-sm text-slate-500">Načítám konverzace…</p>}
    </div>;
}
