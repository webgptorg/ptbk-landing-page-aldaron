'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, LoaderCircle, MessageSquarePlus, Paperclip } from 'lucide-react';
import { FloatingConversation } from '@/components/floating/FloatingConversation';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import './messageChat.css';
import { MarkdownContent } from '@/components/markdown-content';
import type { MessageChatTurn } from '@/lib/messages/messageTypes';
import { useMessageChatSession } from '@/hooks/useMessageChatSession';
import { MessageExportActions } from './MessageExportActions';
import { MessageAttachments } from '@/components/messages/MessageAttachments';
import { useMessageChatAttachments } from '@/hooks/useMessageChatAttachments';
import { CHAT_ATTACHMENT_ACCEPT, CHAT_ATTACHMENT_CONTEXT_MAX_BYTES, CHAT_ATTACHMENT_CONTEXT_MAX_COUNT } from '@/lib/messages/messageAttachments';

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
    const { turns, draft, attachments } = session;
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [error, setError] = useState('');
    const input = useRef<HTMLTextAreaElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const historyElement = useRef<HTMLDivElement>(null);
    const inFlight = useRef<AbortController | null>(null);
    const pending = pendingQuestion !== null;
    const { uploading, uploadFiles } = useMessageChatAttachments({ session, updateSession, ready, pending, onError: setError,
        endpoint: messageId ? `/api/messages/${encodeURIComponent(messageId)}/attachments` : '/api/pavol/chat/attachments' });

    useEffect(() => () => inFlight.current?.abort(), []);
    useEffect(() => { if (open) input.current?.focus(); }, [open]);
    useEffect(() => {
        const element = historyElement.current;
        if (open && element) element.scrollTo({ top: element.scrollHeight });
    }, [turns, pendingQuestion, open]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const question = draft.trim() || (attachments.length ? cs ? 'Podívej se prosím na přiložené soubory.' : 'Please look at the attached files.' : '');
        if (!question || inFlight.current || !ready || uploading) return;
        const createdAt = new Date().toISOString();
        const controller = new AbortController();
        inFlight.current = controller;
        setPendingQuestion(question);
        setError('');
        const previous: MessageChatTurn[] = [];
        let length = question.length, fileCount = attachments.length, fileBytes = attachments.reduce((total, file) => total + file.byteLength, 0);
        for (const turn of turns.slice(-14).reverse()) {
            const added = turn.attachments ?? [];
            const bytes = added.reduce((total, file) => total + file.byteLength, 0);
            if (length + turn.content.length > 16000 || fileCount + added.length > CHAT_ATTACHMENT_CONTEXT_MAX_COUNT || fileBytes + bytes > CHAT_ATTACHMENT_CONTEXT_MAX_BYTES) break;
            previous.unshift({ role: turn.role, content: turn.content, ...(added.length ? { attachments: added } : {}) });
            length += turn.content.length;
            fileCount += added.length; fileBytes += bytes;
        }
        const questionTurn = { role: 'user' as const, content: question, ...(attachments.length ? { attachments } : {}) };
        const history = [...previous, questionTurn];
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
            updateSession({ ...submitted, retry: null, draft: '', attachments: [], turns: [...turns,
                { ...questionTurn, createdAt },
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
            <div className="message-chat-content" onDragOver={(event) => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); }}
                onDrop={(event) => { if (event.dataTransfer.files.length) { event.preventDefault(); void uploadFiles(Array.from(event.dataTransfer.files)); } }}>
            <div className="message-chat-tools"><button type="button" disabled={pending || uploading || !ready} onClick={() => { reset(); setError(''); input.current?.focus(); }}>
                <MessageSquarePlus size={15} aria-hidden="true" /> {cs ? 'Nový chat' : 'New chat'}
            </button><MessageExportActions subject={cs ? 'konverzaci' : 'conversation'} filename={cs ? 'konverzace' : 'conversation'} language={language} disabled={pending || !ready || turns.length === 0}
                loadDocument={async () => ({ kind: 'chat', title: cs ? 'Rozhovor s Pavolem Hejným' : 'Conversation with Pavol Hejný', language,
                    createdAt: turns.find((turn) => turn.createdAt)?.createdAt ?? new Date().toISOString(), sourceUrl: `${window.location.origin}${window.location.pathname}`, turns })} /></div>
            <div ref={historyElement} className="message-chat-history" role="log" aria-live="polite" aria-label={cs ? 'Rozhovor s Pavolem Hejným' : 'Conversation with Pavol Hejný'}>
                {turns.map((turn, index) => <div key={index} className={`message-chat-turn message-chat-${turn.role}`}>
                    <span className="message-chat-speaker">{turn.role === 'user' ? (cs ? 'Ty' : 'You') : 'Pavol Hejný'}</span>
                    <MarkdownContent className="message-chat-markdown" content={turn.content} />
                    <MessageAttachments files={turn.attachments} language={language} />
                </div>)}
                {pendingQuestion && <>
                    <div className="message-chat-turn message-chat-user"><span className="message-chat-speaker">{cs ? 'Ty' : 'You'}</span><MarkdownContent className="message-chat-markdown" content={pendingQuestion} /><MessageAttachments files={attachments} language={language} /></div>
                    <div className="message-chat-pending" role="status" aria-label={cs ? 'Připravuji odpověď' : 'Preparing a reply'}><LoaderCircle size={17} className="message-chat-loading" aria-hidden="true" /></div>
                </>}
            </div>
            {!pending && <div className="message-chat-draft-files"><MessageAttachments files={attachments} language={language}
                onRemove={uploading ? undefined : (id) => updateSession({ ...session, attachments: attachments.filter((file) => file.id !== id) })} /></div>}
            {uploading && <p className="message-chat-uploading" role="status">{cs ? 'Nahrávám přílohu…' : 'Uploading attachment…'}</p>}
            <form onSubmit={submit} className="message-chat-form" aria-busy={pending || uploading}>
                <input ref={fileInput} type="file" multiple accept={CHAT_ATTACHMENT_ACCEPT} className="sr-only" tabIndex={-1} aria-label={cs ? 'Vybrat přílohy' : 'Choose attachments'}
                    onChange={(event) => { void uploadFiles(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
                <button type="button" className="message-chat-attach" disabled={pending || uploading || !ready || attachments.length >= 4} aria-label={cs ? 'Přiložit soubor' : 'Attach file'}
                    title={cs ? 'Obrázek, PDF nebo text, nejvýše 4 MB' : 'Image, PDF or text, up to 4 MB'} onClick={() => fileInput.current?.click()}><Paperclip size={19} aria-hidden="true" /></button>
                <textarea ref={input} aria-label={cs ? 'Tvoje otázka' : 'Your question'} placeholder={cs ? 'Na co se chceš zeptat?' : 'What would you like to know?'} rows={2} maxLength={4000} value={draft} disabled={pending || !ready}
                    onPaste={(event) => { const files = Array.from(event.clipboardData.files); if (files.length) { event.preventDefault(); void uploadFiles(files); } }}
                    onChange={(event) => updateSession({ ...session, draft: event.target.value })} onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
                    }} />
                <button type="submit" disabled={pending || uploading || !ready || (!draft.trim() && !attachments.length)} aria-label={pending ? cs ? 'Připravuji odpověď' : 'Preparing a reply' : cs ? 'Odeslat otázku' : 'Send question'}>
                    {pending ? <LoaderCircle size={19} className="message-chat-loading" aria-hidden="true" /> : <ArrowUp size={19} aria-hidden="true" />}
                </button>
            </form>
            {error && <p className="message-chat-error" role="alert">{error}</p>}
            {storageFailed && <p className="message-chat-error" role="status">{cs ? 'Konverzaci se nepodařilo uložit v tomto prohlížeči.' : 'This browser could not save the conversation.'}</p>}
            </div>
    </FloatingConversation>;
}
