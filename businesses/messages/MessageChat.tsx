'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowUp, LoaderCircle, MessageCircle, X } from 'lucide-react';
import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';
import { MarkdownContent } from '@/components/markdown-content';
import type { MessageChatTurn } from '@/lib/messages/messageTypes';

const avatar = '/people/pavol-hejny-transparent-square.png';

/** Anonymous chat keeps its existing UI; the server records each submitted question and actual answer. */
export function MessageChat({ messageId, introduction = '' }: { readonly messageId: string; readonly introduction?: string }) {
    const [open, setOpen] = useState(false);
    const [turns, setTurns] = useState<MessageChatTurn[]>(() => introduction ? [{ role: 'assistant', content: introduction }] : []);
    const [draft, setDraft] = useState('');
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [error, setError] = useState('');
    const root = useRef<HTMLDivElement>(null);
    const launcher = useRef<HTMLButtonElement>(null);
    const input = useRef<HTMLTextAreaElement>(null);
    const historyElement = useRef<HTMLDivElement>(null);
    const inFlight = useRef<AbortController | null>(null);
    const conversation = useRef<{ messageId: string; id: string } | null>(null);
    const retry = useRef<{ history: string; id: string } | null>(null);
    const { clearance } = useFixedControlClearance(root, '[data-article-player]');
    const pending = pendingQuestion !== null;

    useEffect(() => () => inFlight.current?.abort(), []);
    useEffect(() => { if (open) input.current?.focus(); }, [open]);
    useEffect(() => {
        const element = historyElement.current;
        if (open && element) element.scrollTo({ top: element.scrollHeight });
    }, [turns, pendingQuestion, open]);

    function close() {
        setOpen(false);
        launcher.current?.focus();
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        const question = draft.trim();
        if (!question || inFlight.current) return;
        const controller = new AbortController();
        inFlight.current = controller;
        setPendingQuestion(question);
        setError('');
        const previous: MessageChatTurn[] = [];
        let length = question.length;
        for (const turn of turns.slice(-14).reverse()) {
            if (length + turn.content.length > 16000) break;
            previous.unshift(turn);
            length += turn.content.length;
        }
        const history = [...previous, { role: 'user' as const, content: question }];
        if (conversation.current?.messageId !== messageId) conversation.current = { messageId, id: crypto.randomUUID() };
        const serializedHistory = JSON.stringify(history);
        if (retry.current?.history !== serializedHistory) retry.current = { history: serializedHistory, id: crypto.randomUUID() };
        try {
            const response = await fetch(`/api/messages/${encodeURIComponent(messageId)}/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, conversationId: conversation.current.id, requestId: retry.current.id }), signal: controller.signal,
            });
            const result = await response.json() as { reply?: unknown; error?: unknown; retryAsNew?: unknown };
            if (!response.ok || typeof result.reply !== 'string') {
                // Explicit server failures may be retried as a new attempt; uncertain network outcomes reuse the ID.
                if (result.retryAsNew === true || (response.status !== 409 && response.status !== 503)) retry.current = null;
                throw new Error(typeof result.error === 'string' ? result.error : 'Odpověď se nepodařilo načíst. Zkus to prosím znovu.');
            }
            retry.current = null;
            setTurns([...history, { role: 'assistant', content: result.reply }]);
            setDraft('');
        } catch (failure) {
            if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Odpověď se nepodařilo načíst.');
        } finally {
            if (inFlight.current === controller) { inFlight.current = null; setPendingQuestion(null); }
        }
    }

    return <div ref={root} className="message-chat-float" style={{ '--message-chat-clearance': `${clearance}px` } as CSSProperties}>
        {open && <section className="message-chat" role="dialog" aria-label="Chat s Pavolem Hejným" onKeyDown={(event) => {
            if (event.key === 'Escape') { event.stopPropagation(); close(); }
        }}>
            <header className="message-chat-header">
                <Image src={avatar} width={34} height={34} alt="" />
                <h2>Pavol Hejný</h2>
                <button type="button" onClick={close} aria-label="Zavřít chat"><X size={19} aria-hidden="true" /></button>
            </header>
            <div ref={historyElement} className="message-chat-history" role="log" aria-live="polite" aria-label="Rozhovor s Pavolem Hejným">
                {turns.map((turn, index) => <div key={index} className={`message-chat-turn message-chat-${turn.role}`}>
                    <span className="message-chat-speaker">{turn.role === 'user' ? 'Ty' : 'Pavol Hejný'}</span>
                    <MarkdownContent className="message-chat-markdown" content={turn.content} />
                </div>)}
                {pendingQuestion && <>
                    <div className="message-chat-turn message-chat-user"><span className="message-chat-speaker">Ty</span><MarkdownContent className="message-chat-markdown" content={pendingQuestion} /></div>
                    <div className="message-chat-pending" role="status" aria-label="Připravuji odpověď"><LoaderCircle size={17} className="message-chat-loading" aria-hidden="true" /></div>
                </>}
            </div>
            <form onSubmit={submit} className="message-chat-form" aria-busy={pending}>
                <textarea ref={input} aria-label="Otázka ke zprávě a celému kontextu" placeholder="Zeptej se mě na souvislosti…" rows={2} maxLength={4000} value={draft} disabled={pending}
                    onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
                    }} />
                <button type="submit" disabled={pending || !draft.trim()} aria-label={pending ? 'Připravuji odpověď' : 'Odeslat otázku'}>
                    {pending ? <LoaderCircle size={19} className="message-chat-loading" aria-hidden="true" /> : <ArrowUp size={19} aria-hidden="true" />}
                </button>
            </form>
            {error && <p className="message-chat-error" role="alert">{error}</p>}
        </section>}
        <button ref={launcher} type="button" className="message-chat-launcher" aria-label={open ? 'Zavřít chat s Pavolem' : 'Otevřít chat s Pavolem'} aria-expanded={open} onClick={() => open ? close() : setOpen(true)}>
            <Image src={avatar} width={36} height={36} alt="" />
            <span>Pavol Hejný</span>
            {open ? <X size={18} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
        </button>
    </div>;
}
