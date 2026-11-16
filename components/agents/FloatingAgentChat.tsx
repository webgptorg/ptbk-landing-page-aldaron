'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronRight, Copy, LoaderCircle, Maximize2, MessageSquarePlus, Minimize2, Paperclip, RotateCcw, Square } from 'lucide-react';
import { FloatingConversation } from '@/components/floating/FloatingConversation';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import '@/businesses/messages/messageChat.css';
import { MarkdownContent } from '@/components/markdown-content';
import { useMessageChatSession } from '@/hooks/useMessageChatSession';
import type { MessageChatSession } from '@/lib/messages/messageChatSession';
import { MessageExportActions } from '@/businesses/messages/MessageExportActions';
import { MessageAttachments } from '@/components/messages/MessageAttachments';
import { useMessageChatAttachments } from '@/hooks/useMessageChatAttachments';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { CHAT_ATTACHMENT_ACCEPT } from '@/lib/messages/messageAttachments';
import { CHAT_QUESTION_MAX_CHARACTERS } from '@/lib/messages/messageChatLimits';
import { selectMessageChatContext } from '@/lib/messages/messageChatContext';

export type FloatingAgentChatProps = {
    readonly sourceKey: string; readonly endpoint: string; readonly attachmentEndpoint?: string;
    readonly introduction?: string; readonly language?: SupportedHomepageLanguage;
    readonly title: string; readonly icon: ReactNode; readonly launcherLabel: string;
    readonly conversationTitle: string; readonly id?: string; readonly brandLabel?: string;
    readonly variant?: 'floating' | 'page'; readonly subtitle?: string;
    readonly suggestions?: readonly string[];
};

/** Shared chat behavior; each embed has its own server endpoint and browser conversation. */
export function FloatingAgentChat(props: FloatingAgentChatProps) {
    return <AgentChatSession key={props.sourceKey} {...props} />;
}

function ChatTurn({ turn, title, cs, introduction = false }: {
    readonly turn: MessageChatSession['turns'][number]; readonly title: string;
    readonly cs: boolean; readonly introduction?: boolean;
}) {
    const { copyText, copyStatus } = useCopyTextToClipboard();
    const user = turn.role === 'user';
    const copyLabel = cs ? user ? 'Kopírovat otázku' : 'Kopírovat odpověď' : user ? 'Copy question' : 'Copy answer';
    return <div className={`message-chat-turn message-chat-${turn.role}${introduction ? ' message-chat-introduction' : ''}`}>
        <div className="message-chat-turn-heading">
            <span className="message-chat-speaker">{user ? cs ? 'Ty' : 'You' : title}</span>
            {turn.createdAt && <time dateTime={turn.createdAt} title={new Date(turn.createdAt).toLocaleString(cs ? 'cs-CZ' : 'en-GB')}>
                {new Date(turn.createdAt).toLocaleTimeString(cs ? 'cs-CZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
            </time>}
        </div>
        <MarkdownContent className="message-chat-markdown" content={turn.content} />
        <MessageAttachments files={turn.attachments} language={cs ? 'cs' : 'en'} />
        {!introduction && <div className="message-chat-turn-actions">
            <button type="button" onClick={() => void copyText(turn.content)} aria-label={copyLabel} title={copyLabel}>
                {copyStatus === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                <span>{copyStatus === 'copied' ? cs ? 'Zkopírováno' : 'Copied' : cs ? 'Kopírovat' : 'Copy'}</span>
            </button>
            <span role="status" className={copyStatus === 'failed' ? 'message-chat-copy-error' : 'sr-only'}>
                {copyStatus === 'failed' ? cs ? 'Kopírování se nepodařilo. Text můžeš označit a zkopírovat ručně.' : 'Copy failed. You can select and copy the text manually.' : copyStatus === 'copied' ? cs ? 'Zkopírováno.' : 'Copied.' : ''}
            </span>
        </div>}
    </div>;
}

function AgentChatSession({ sourceKey, endpoint, attachmentEndpoint, introduction = '', language = 'cs',
    title, icon, launcherLabel, conversationTitle, id = sourceKey, brandLabel, variant = 'floating', subtitle, suggestions = [] }: FloatingAgentChatProps) {
    const cs = language === 'cs';
    const [open, setOpen] = useState(false);
    const visible = variant === 'page' || open;
    const { session, updateSession, reset, ready, storageFailed } = useMessageChatSession(sourceKey, introduction);
    const { turns, draft, attachments } = session;
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [requestFailed, setRequestFailed] = useState(false);
    const [slowReply, setSlowReply] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [awayFromLatest, setAwayFromLatest] = useState(false);
    const input = useRef<HTMLTextAreaElement>(null);
    const form = useRef<HTMLFormElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const contentElement = useRef<HTMLDivElement>(null);
    const composerElement = useRef<HTMLDivElement>(null);
    const historyElement = useRef<HTMLDivElement>(null);
    const historyContent = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);
    const dragDepth = useRef(0);
    const inFlight = useRef<AbortController | null>(null);
    const pending = pendingQuestion !== null;
    const hasConversation = turns.some(turn => turn.role === 'user');
    const { uploading, uploadFiles } = useMessageChatAttachments({ session, updateSession, ready, pending,
        onError: message => { setError(message); setRequestFailed(false); }, endpoint: attachmentEndpoint ?? '' });

    useEffect(() => () => inFlight.current?.abort(), []);
    useEffect(() => { if (open) input.current?.focus(); }, [open]);
    useEffect(() => {
        setSlowReply(false);
        if (!pending) return;
        const timer = setTimeout(() => setSlowReply(true), 15000);
        return () => clearTimeout(timer);
    }, [pending]);
    useLayoutEffect(() => {
        if (!visible) return;
        const resize = () => {
            const element = input.current;
            if (!element) return;
            let limit = Math.max(64, Math.min(expanded ? 420 : 200, window.innerHeight * (expanded ? .5 : .28)));
            element.style.height = '48px';
            if (variant === 'page' && contentElement.current && composerElement.current) {
                const content = contentElement.current;
                const composer = composerElement.current;
                const otherHeight = Array.from(content.children).reduce((height, child) => {
                    if (child === composer || child.classList.contains('message-chat-transcript') || child.classList.contains('message-chat-drop-target')) return height;
                    const style = window.getComputedStyle(child);
                    return height + child.getBoundingClientRect().height + parseFloat(style.marginTop || '0') + parseFloat(style.marginBottom || '0');
                }, 0);
                // Leave a readable portion of history above the editor, including on short screens.
                const available = content.clientHeight - composer.offsetHeight - otherHeight - 96 + element.offsetHeight;
                limit = Math.min(limit, Math.max(48, available));
            }
            element.style.height = `${Math.min(limit, Math.max(48, element.scrollHeight))}px`;
        };
        resize();
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
        if (variant === 'page' && contentElement.current) observer?.observe(contentElement.current);
        if (variant === 'page' && composerElement.current) observer?.observe(composerElement.current);
        window.addEventListener('resize', resize);
        return () => { observer?.disconnect(); window.removeEventListener('resize', resize); };
    }, [draft, visible, expanded, pending, variant, attachments.length, error, storageFailed, confirmReset, uploading, session.retry]);
    useEffect(() => {
        const element = historyElement.current;
        if (!visible || !element) return;
        if (followLatest.current) element.scrollTo({ top: element.scrollHeight });
        else setAwayFromLatest(true);
    }, [turns, pendingQuestion, visible]);
    useEffect(() => {
        if (!visible || !historyContent.current || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(() => {
            const element = historyElement.current;
            if (element && followLatest.current) element.scrollTo({ top: element.scrollHeight });
        });
        observer.observe(historyContent.current);
        return () => observer.disconnect();
    }, [visible]);

    function jumpToLatest() {
        followLatest.current = true;
        setAwayFromLatest(false);
        historyElement.current?.scrollTo({ top: historyElement.current.scrollHeight });
    }
    function newChat() {
        reset(); setError(''); setRequestFailed(false); setConfirmReset(false); setExpanded(false);
        jumpToLatest(); input.current?.focus();
    }
    function stopWaiting() {
        inFlight.current?.abort();
        setError(cs ? 'Čekání bylo přerušeno. Otázka i přílohy zůstaly zachované.' : 'Waiting was stopped. Your question and attachments are still here.');
        setRequestFailed(true);
    }
    async function submit(event: FormEvent) {
        event.preventDefault();
        const question = draft.trim() || (attachments.length ? cs ? 'Podívej se prosím na přiložené soubory.' : 'Please look at the attached files.' : '');
        if (!question || inFlight.current || !ready || uploading) return;
        const createdAt = new Date().toISOString();
        const controller = new AbortController();
        inFlight.current = controller;
        followLatest.current = true; setAwayFromLatest(false);
        setPendingQuestion(question); setError(''); setRequestFailed(false); setConfirmReset(false);
        const questionTurn = { role: 'user' as const, content: question, ...(attachments.length ? { attachments } : {}) };
        const history = selectMessageChatContext(turns, questionTurn);
        const serializedHistory = JSON.stringify(history);
        const retry = session.retry?.history === serializedHistory ? session.retry : { history: serializedHistory, id: crypto.randomUUID() };
        const submitted = { ...session, retry };
        updateSession(submitted);
        try {
            const response = await fetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, conversationId: session.conversationId, requestId: retry.id }), signal: controller.signal,
            });
            const result = await response.json().catch(() => null) as { reply?: unknown; error?: unknown; retryAsNew?: unknown } | null;
            if (!response.ok || typeof result?.reply !== 'string') {
                // Explicit failures can start a new attempt. Unknown network/proxy outcomes keep the request ID.
                if (result && (result.retryAsNew === true || (response.status !== 409 && response.status !== 503))) updateSession({ ...submitted, retry: null });
                throw new Error(typeof result?.error === 'string' ? result.error : cs ? 'Spojení se přerušilo nebo server neodpověděl. Zkus otázku znovu.' : 'The connection was interrupted or the server did not reply. Please try again.');
            }
            if (controller.signal.aborted) return;
            updateSession({ ...submitted, retry: null, draft: '', attachments: [], turns: [...turns,
                { ...questionTurn, createdAt },
                { role: 'assistant', content: result.reply, createdAt: new Date().toISOString() }] });
            setExpanded(false);
        } catch (failure) {
            if (!controller.signal.aborted) {
                setError(failure instanceof TypeError ? cs ? 'Spojení se přerušilo. Otázka i přílohy zůstaly zachované.' : 'The connection was interrupted. Your question and attachments are still here.'
                    : failure instanceof Error ? failure.message : cs ? 'Odpověď se nepodařilo načíst.' : 'The reply could not be loaded.');
                setRequestFailed(true);
            }
        } finally {
            if (inFlight.current === controller) { inFlight.current = null; setPendingQuestion(null); }
        }
    }

    const tools = <div className="message-chat-tools">
        <button type="button" disabled={pending || uploading || !ready} aria-label={cs ? 'Nový chat' : 'New chat'} title={cs ? 'Nový chat' : 'New chat'} onClick={() => {
            if (variant === 'page' && (hasConversation || draft.trim() || attachments.length)) setConfirmReset(true);
            else newChat();
        }}><MessageSquarePlus size={16} aria-hidden="true" /><span>{cs ? 'Nový chat' : 'New chat'}</span></button>
        <MessageExportActions subject={cs ? 'konverzaci' : 'conversation'} filename={cs ? 'konverzace' : 'conversation'} language={language} disabled={pending || !ready || turns.length === 0}
            loadDocument={async () => ({ kind: 'chat', title: conversationTitle, language, assistantName: title, brandLabel,
                createdAt: turns.find(turn => turn.createdAt)?.createdAt ?? new Date().toISOString(), sourceUrl: `${window.location.origin}${window.location.pathname}`, turns })} />
    </div>;
    const content = <div ref={contentElement} className={`message-chat-content${dragging ? ' message-chat-is-dragging' : ''}`}
        onDragEnter={event => { if (attachmentEndpoint && event.dataTransfer.types.includes('Files')) { event.preventDefault(); dragDepth.current++; if (!pending && !uploading) setDragging(true); } }}
        onDragLeave={event => { if (event.currentTarget.contains(event.relatedTarget as Node | null)) return; dragDepth.current = 0; setDragging(false); }}
        onDragOver={event => { if (attachmentEndpoint && event.dataTransfer.types.includes('Files')) event.preventDefault(); }}
        onDrop={event => { if (attachmentEndpoint && event.dataTransfer.files.length) { event.preventDefault(); dragDepth.current = 0; setDragging(false); void uploadFiles(Array.from(event.dataTransfer.files)); } }}>
        {variant !== 'page' && tools}
        {dragging && <div className="message-chat-drop-target" aria-hidden="true"><Paperclip size={28} /><strong>{cs ? 'Pusť soubory sem' : 'Drop files here'}</strong><span>{cs ? 'Obrázky, PDF nebo text · až 4 soubory po 4 MB' : 'Images, PDFs or text · up to 4 files, 4 MB each'}</span></div>}
        {confirmReset && <div className="message-chat-reset" role="group" aria-label={cs ? 'Začít nový chat?' : 'Start a new chat?'}>
            <p>{cs ? 'Začít znovu? Tato konverzace zmizí z tohoto okna. Rozepsaný text a přílohy se vyprázdní.' : 'Start fresh? This conversation will leave this window. Your draft and attached files will be cleared.'}</p>
            <div><button type="button" onClick={newChat}>{cs ? 'Začít nový chat' : 'Start new chat'}</button><button type="button" onClick={() => { setConfirmReset(false); input.current?.focus(); }}>{cs ? 'Pokračovat tady' : 'Keep this chat'}</button></div>
        </div>}
        <div className="message-chat-transcript">
            <div ref={historyElement} className="message-chat-history" role="log" aria-live="polite" aria-busy={pending} aria-label={conversationTitle} tabIndex={0}
                onScroll={event => { const el = event.currentTarget; const nearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < 64; followLatest.current = nearBottom; setAwayFromLatest(!nearBottom); }}>
                <div ref={historyContent} className="message-chat-history-content">
                    {turns.map((turn, index) => <ChatTurn key={index} turn={turn} cs={cs} title={title} introduction={index === 0 && turn.role === 'assistant' && turn.content === introduction} />)}
                    {!hasConversation && !pending && !draft.trim() && suggestions.length > 0 && <div className="message-chat-suggestions" aria-label={cs ? 'Zkus se zeptat' : 'Try a question'}>
                        <p>{cs ? 'Třeba…' : 'For example…'}</p>
                        {suggestions.map(suggestion => <button type="button" key={suggestion} disabled={!ready} onClick={() => { updateSession({ ...session, draft: suggestion }); input.current?.focus(); }}>
                            {suggestion}<ChevronRight size={16} aria-hidden="true" />
                        </button>)}
                    </div>}
                    {pendingQuestion && <>
                        <ChatTurn turn={{ role: 'user', content: pendingQuestion, attachments }} title={title} cs={cs} />
                        <div className="message-chat-pending" role="status"><LoaderCircle size={17} className="message-chat-loading" aria-hidden="true" />
                            <span>{slowReply ? cs ? 'Delší odpověď může chvíli trvat…' : 'A longer answer may take a moment…' : cs ? 'Připravuji odpověď…' : 'Preparing a reply…'}</span>
                        </div>
                    </>}
                </div>
            </div>
            {awayFromLatest && <button type="button" className="message-chat-jump" onClick={jumpToLatest}><ArrowDown size={15} aria-hidden="true" />{cs ? 'K nejnovější zprávě' : 'Latest message'}</button>}
        </div>
        <div ref={composerElement} className={`message-chat-composer${expanded ? ' message-chat-composer-expanded' : ''}`}>
            {error && <div className="message-chat-error-card" role="alert"><p>{error}</p>
                {requestFailed && <button type="button" disabled={pending || uploading || !ready} onClick={() => form.current?.requestSubmit()}><RotateCcw size={14} aria-hidden="true" />{cs ? 'Zkusit znovu' : 'Try again'}</button>}
            </div>}
            {!error && !pending && session.retry && <div className="message-chat-recovery" role="status"><span>{cs ? 'Předchozí odeslání se přerušilo. Otázka zůstala uložená.' : 'The previous request was interrupted. Your question is saved.'}</span><button type="button" onClick={() => form.current?.requestSubmit()}>{cs ? 'Zkusit znovu' : 'Try again'}</button></div>}
            {!pending && <div className="message-chat-draft-files"><MessageAttachments files={attachments} language={language}
                onRemove={uploading ? undefined : fileId => updateSession({ ...session, attachments: attachments.filter(file => file.id !== fileId) })} /></div>}
            {uploading && <p className="message-chat-uploading" role="status"><LoaderCircle size={14} className="message-chat-loading" aria-hidden="true" />{cs ? 'Nahrávám přílohu…' : 'Uploading attachment…'}</p>}
            <form ref={form} onSubmit={submit} className="message-chat-form" aria-busy={pending || uploading}>
                <textarea ref={input} aria-label={cs ? 'Tvoje otázka' : 'Your question'} aria-describedby={`${id}-composer-help`} placeholder={pending ? cs ? 'Počkej na odpověď…' : 'Waiting for the reply…' : cs ? 'Na co se chceš zeptat?' : 'What would you like to know?'} rows={2} maxLength={CHAT_QUESTION_MAX_CHARACTERS} value={pending ? '' : draft} disabled={pending || !ready}
                    onPaste={event => { const files = Array.from(event.clipboardData.files); if (attachmentEndpoint && files.length) { event.preventDefault(); void uploadFiles(files); } }}
                    onChange={event => updateSession({ ...session, draft: event.target.value })} onKeyDown={event => {
                        const touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && (!touch || event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
                    }} />
                <div className="message-chat-composer-controls">
                    <div className="message-chat-composer-options">
                        {attachmentEndpoint && <><input ref={fileInput} type="file" multiple accept={CHAT_ATTACHMENT_ACCEPT} className="sr-only" tabIndex={-1} aria-label={cs ? 'Vybrat přílohy' : 'Choose attachments'}
                            onChange={event => { void uploadFiles(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
                        <button type="button" className="message-chat-attach" disabled={pending || uploading || !ready || attachments.length >= 4} aria-label={cs ? 'Přiložit soubor' : 'Attach file'}
                            title={cs ? 'Obrázky, PDF nebo text · až 4 soubory po 4 MB' : 'Images, PDFs or text · up to 4 files, 4 MB each'} onClick={() => fileInput.current?.click()}><Paperclip size={18} aria-hidden="true" /><span>{cs ? 'Přiložit' : 'Attach'}</span></button></>}
                        {(draft.length > 200 || draft.includes('\n')) && !pending && <button type="button" className="message-chat-expand" onClick={() => { setExpanded(!expanded); input.current?.focus(); }} aria-expanded={expanded} aria-label={expanded ? cs ? 'Zmenšit pole zprávy' : 'Collapse message editor' : cs ? 'Zvětšit pole zprávy' : 'Expand message editor'} title={cs ? 'Velikost pole zprávy' : 'Message editor size'}>
                            {expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                        </button>}
                    </div>
                    {pending ? <button type="button" className="message-chat-stop" onClick={stopWaiting} aria-label={cs ? 'Zastavit čekání' : 'Stop waiting'} title={cs ? 'Zastavit čekání' : 'Stop waiting'}><Square size={15} fill="currentColor" aria-hidden="true" /></button>
                        : <button type="submit" disabled={uploading || !ready || (!draft.trim() && !attachments.length)} aria-label={cs ? 'Odeslat otázku' : 'Send question'} title={cs ? 'Odeslat otázku' : 'Send question'}><ArrowUp size={19} aria-hidden="true" /></button>}
                </div>
            </form>
            <div className="message-chat-composer-help" id={`${id}-composer-help`}><span className="message-chat-keyboard-hint">{cs ? 'Enter odešle · Shift + Enter nový řádek' : 'Enter to send · Shift + Enter for a new line'}</span><span className="message-chat-touch-hint">{cs ? 'Obrázky, PDF nebo text · až 4 × 4 MB' : 'Images, PDF or text · up to 4 × 4 MB'}</span>
                {!pending && draft.length > 0 && <span className={draft.length >= CHAT_QUESTION_MAX_CHARACTERS ? 'message-chat-limit' : ''} aria-label={cs ? 'Délka otázky' : 'Question length'}>{draft.length.toLocaleString(cs ? 'cs-CZ' : 'en-GB')} / 4 000</span>}
            </div>
            {storageFailed && <p className="message-chat-error" role="status">{cs ? 'Konverzaci se nepodařilo uložit v tomto prohlížeči. Před zavřením si ji stáhni.' : 'This browser could not save the conversation. Download it before closing.'}</p>}
        </div>
    </div>;
    if (variant === 'page') return <section id={id} className="message-chat message-chat-page" aria-label={conversationTitle}>
        <header className="message-chat-page-heading"><div className="message-chat-identity"><span className="message-chat-avatar">{icon}</span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{tools}</header>
        {content}
    </section>;
    return <FloatingConversation id={id} open={open} onOpenChange={setOpen} title={title} icon={icon}
        launcherLabel={launcherLabel} closeLabel={cs ? 'Zavřít chat' : 'Close chat'} panelClassName="message-chat">
        {content}
    </FloatingConversation>;
}
