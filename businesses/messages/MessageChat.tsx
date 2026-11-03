'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, LoaderCircle, MessageSquarePlus } from 'lucide-react';
import { FloatingConversation } from '@/components/floating/FloatingConversation';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './messageChat.css';
import { MarkdownContent } from '@/components/markdown-content';
import type { MessageChatTurn } from '@/lib/messages/messageTypes';
import { useMessageChatSession } from '@/hooks/useMessageChatSession';
import { MessageExportActions } from './MessageExportActions';

const avatar = '/people/pavol-hejny-transparent-square.png';

type MessageChatProps = { readonly messageId?: string; readonly introduction?: string; readonly language?: SupportedHomepageLanguage };
export function MessageChat(props: MessageChatProps) {
    return <MessageChatSession key={props.messageId ?? `pavol-${props.language ?? 'cs'}`} {...props} />;
}

/** Browser persistence preserves the existing server recording and request deduplication. */
function MessageChatSession({ messageId, introduction = '', language = 'cs' }: MessageChatProps) {
    const cs = language === 'cs';
    const sourceKey = messageId ?? `pavol-${language}`;
    const [open, setOpen] = useState(false);
    const { session, updateSession, reset, ready, storageFailed } = useMessageChatSession(sourceKey, introduction);
    const { turns, draft } = session;
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [error, setError] = useState('');
    const input = useRef<HTMLTextAreaElement>(null);
    const historyElement = useRef<HTMLDivElement>(null);
    const inFlight = useRef<AbortController | null>(null);
    const pending = pendingQuestion !== null;

    useEffect(() => () => inFlight.current?.abort(), []);
    useEffect(() => { if (open) input.current?.focus(); }, [open]);
    useEffect(() => {
        const element = historyElement.current;
        if (open && element) element.scrollTo({ top: element.scrollHeight });
    }, [turns, pendingQuestion, open]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const question = draft.trim();
        if (!question || inFlight.current || !ready) return;
        const controller = new AbortController();
        inFlight.current = controller;
        setPendingQuestion(question);
        setError('');
        const previous: MessageChatTurn[] = [];
        let length = question.length;
        for (const turn of turns.slice(-14).reverse()) {
            if (length + turn.content.length > 16000) break;
            previous.unshift({ role: turn.role, content: turn.content });
            length += turn.content.length;
        }
        const history = [...previous, { role: 'user' as const, content: question }];
        const serializedHistory = JSON.stringify(history);
        const retry = session.retry?.history === serializedHistory ? session.retry : { history: serializedHistory, id: crypto.randomUUID() };
        const submitted = { ...session, retry };
        updateSession(submitted);
        try {
            const response = await fetch(messageId ? `/api/messages/${encodeURIComponent(messageId)}/chat` : '/api/pavol/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, conversationId: session.conversationId, requestId: retry.id }), signal: controller.signal,
            });
            const result = await response.json() as { reply?: unknown; error?: unknown; retryAsNew?: unknown };
            if (!response.ok || typeof result.reply !== 'string') {
                // Explicit server failures may be retried as a new attempt; uncertain network outcomes reuse the ID.
                if (result.retryAsNew === true || (response.status !== 409 && response.status !== 503)) updateSession({ ...submitted, retry: null });
                throw new Error(typeof result.error === 'string' ? result.error : 'Odpověď se nepodařilo načíst. Zkus to prosím znovu.');
            }
            if (controller.signal.aborted) return;
            updateSession({ ...submitted, retry: null, draft: '', turns: [...turns,
                { role: 'user', content: question, createdAt: new Date().toISOString() },
                { role: 'assistant', content: result.reply, createdAt: new Date().toISOString() }] });
        } catch (failure) {
            if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Odpověď se nepodařilo načíst.');
        } finally {
            if (inFlight.current === controller) { inFlight.current = null; setPendingQuestion(null); }
        }
    }

    return <FloatingConversation id="pavol-chat" open={open} onOpenChange={setOpen} title="Pavol Hejný"
        icon={<Image src={avatar} width={36} height={36} alt="" />}
        launcherLabel={cs ? 'Otevřít chat s Pavolem' : 'Chat with Pavol'} closeLabel={cs ? 'Zavřít chat' : 'Close chat'} panelClassName="message-chat">
            <div className="message-chat-tools"><button type="button" disabled={pending || !ready} onClick={() => { reset(); setError(''); input.current?.focus(); }}>
                <MessageSquarePlus size={15} aria-hidden="true" /> {cs ? 'Nový chat' : 'New chat'}
            </button><MessageExportActions subject={cs ? 'konverzaci' : 'conversation'} filename={cs ? 'konverzace' : 'conversation'} language={language} disabled={pending || !ready || turns.length === 0}
                loadDocument={async () => ({ kind: 'chat', title: cs ? 'Rozhovor s Pavolem Hejným' : 'Conversation with Pavol Hejný', language,
                    createdAt: turns[0]?.createdAt ?? new Date().toISOString(), sourceUrl: `${window.location.origin}${window.location.pathname}`, turns })} /></div>
            <div ref={historyElement} className="message-chat-history" role="log" aria-live="polite" aria-label={cs ? 'Rozhovor s Pavolem Hejným' : 'Conversation with Pavol Hejný'}>
                {turns.map((turn, index) => <div key={index} className={`message-chat-turn message-chat-${turn.role}`}>
                    <span className="message-chat-speaker">{turn.role === 'user' ? (cs ? 'Ty' : 'You') : 'Pavol Hejný'}</span>
                    <MarkdownContent className="message-chat-markdown" content={turn.content} />
                </div>)}
                {pendingQuestion && <>
                    <div className="message-chat-turn message-chat-user"><span className="message-chat-speaker">{cs ? 'Ty' : 'You'}</span><MarkdownContent className="message-chat-markdown" content={pendingQuestion} /></div>
                    <div className="message-chat-pending" role="status" aria-label={cs ? 'Připravuji odpověď' : 'Preparing a reply'}><LoaderCircle size={17} className="message-chat-loading" aria-hidden="true" /></div>
                </>}
            </div>
            <form onSubmit={submit} className="message-chat-form" aria-busy={pending}>
                <textarea ref={input} aria-label={cs ? 'Tvoje otázka' : 'Your question'} placeholder={cs ? 'Na co se chceš zeptat?' : 'What would you like to know?'} rows={2} maxLength={4000} value={draft} disabled={pending || !ready}
                    onChange={(event) => updateSession({ ...session, draft: event.target.value })} onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
                    }} />
                <button type="submit" disabled={pending || !draft.trim()} aria-label={pending ? cs ? 'Připravuji odpověď' : 'Preparing a reply' : cs ? 'Odeslat otázku' : 'Send question'}>
                    {pending ? <LoaderCircle size={19} className="message-chat-loading" aria-hidden="true" /> : <ArrowUp size={19} aria-hidden="true" />}
                </button>
            </form>
            {error && <p className="message-chat-error" role="alert">{error}</p>}
            {storageFailed && <p className="message-chat-error" role="status">{cs ? 'Konverzaci se nepodařilo uložit v tomto prohlížeči.' : 'This browser could not save the conversation.'}</p>}
    </FloatingConversation>;
}
