'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, LoaderCircle } from 'lucide-react';
import type { MessageChatTurn } from '@/lib/messages/messageTypes';

export function MessageChat({ messageId }: { readonly messageId: string }) {
    const [turns, setTurns] = useState<MessageChatTurn[]>([]);
    const [draft, setDraft] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const inFlight = useRef<AbortController | null>(null);
    const latestReply = useRef<HTMLDivElement>(null);
    useEffect(() => () => inFlight.current?.abort(), []);
    useEffect(() => { if (turns.at(-1)?.role === 'assistant') latestReply.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [turns]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const question = draft.trim();
        if (!question || inFlight.current) return;
        const controller = new AbortController();
        inFlight.current = controller;
        setPending(true);
        setError('');
        // Retain the complete question in the input until the request succeeds, including after an error.
        const previous: MessageChatTurn[] = [];
        let length = question.length;
        for (const turn of turns.slice(-14).reverse()) {
            if (length + turn.content.length > 16000) break;
            previous.unshift(turn);
            length += turn.content.length;
        }
        const history = [...previous, { role: 'user' as const, content: question }];
        try {
            const response = await fetch(`/api/messages/${encodeURIComponent(messageId)}/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }), signal: controller.signal,
            });
            const result = await response.json() as { reply?: unknown; error?: unknown };
            if (!response.ok || typeof result.reply !== 'string') throw new Error(typeof result.error === 'string' ? result.error : 'Odpověď se nepodařilo načíst. Zkus to prosím znovu.');
            setTurns([...history, { role: 'assistant', content: result.reply }]);
            setDraft('');
        } catch (failure) {
            if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Odpověď se nepodařilo načíst.');
        } finally {
            if (inFlight.current === controller) { inFlight.current = null; setPending(false); }
        }
    }

    return <section className="message-chat" aria-labelledby="message-chat-heading">
        <h2 id="message-chat-heading">Zeptat se na souvislosti</h2>
        <div className="message-chat-history" role="log" aria-live="polite" aria-label="Rozhovor s AI nad kontextem zprávy">
            {turns.map((turn, index) => <div key={index} className={`message-chat-turn message-chat-${turn.role}`} ref={index === turns.length - 1 ? latestReply : undefined}>
                <span className="message-chat-speaker">{turn.role === 'user' ? 'Ty' : 'AI · kontext zprávy'}</span>
                <p>{turn.content}</p>
            </div>)}
        </div>
        <form onSubmit={submit} className="message-chat-form" aria-busy={pending}>
            <textarea aria-label="Otázka ke zprávě a celému kontextu" placeholder="Na co se chceš zeptat?" rows={2} maxLength={4000} value={draft} disabled={pending}
                onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
                }} />
            <button type="submit" disabled={pending || !draft.trim()} aria-label={pending ? 'AI připravuje odpověď' : 'Odeslat otázku'}>
                {pending ? <LoaderCircle size={19} className="message-chat-loading" aria-hidden="true" /> : <ArrowUp size={19} aria-hidden="true" />}
            </button>
        </form>
        {error && <p className="message-chat-error" role="alert">{error}</p>}
    </section>;
}
