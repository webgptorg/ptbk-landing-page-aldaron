import 'server-only';
import type { ManagedAgent } from '@/lib/agents/agentModel';
import { runManagedAgent, type AgentAttachmentInput } from '@/lib/agents/agentRuntime';
import { finishMessageChatTurn } from '@/lib/messages/messageConversationDatabase';
import { MESSAGE_RESPONSE_HEADERS } from '@/lib/messages/messageDatabase';
import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import { streamPavolSpeech } from './elevenLabsVoice';
import { VOICE_REPLY_MAX_CHARACTERS, type VoiceChatEvent } from './types';

export function splitVoicePhrase(text: string, flush = false): { phrase: string; rest: string } | null {
    let cut = 0;
    const endings = /[.!?…]["”')\]]?(?:\s|$)/g;
    let end: RegExpExecArray | null;
    while ((end = endings.exec(text))) { if (end.index >= 24) { cut = end.index + end[0].length; break; } }
    if (!cut && text.length > 220) cut = text.lastIndexOf(' ', 220);
    if (!cut && flush && text.trim()) cut = text.length;
    return cut > 0 ? { phrase: text.slice(0, cut), rest: text.slice(cut) } : null;
}
/** The existing agent owns all context. ElevenLabs receives speech text, never its Book. */
export function streamVoiceReply(request: Request, subject: { turnId: string; agent: ManagedAgent; instruction: string;
    context: string; inputs: readonly AgentAttachmentInput[]; voiceId: string }) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    request.signal.addEventListener('abort', cancel, { once: true });
    if (request.signal.aborted) cancel();
    let closed = false;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(output) {
            const emit = (event: VoiceChatEvent) => { if (!closed && !controller.signal.aborted) output.enqueue(encoder.encode(JSON.stringify(event) + '\n')); };
            let generated = '', pending = '', previous = '', phraseId = 0;
            let audioQueue = Promise.resolve(), audioFailure: Error | null = null, saved = false;
            const enqueue = (phrase: string) => {
                const text = convertMarkdownToPlainText(phrase).trim();
                if (!text) return;
                const index = phraseId++, previousText = previous;
                previous += text + ' ';
                audioQueue = audioQueue.then(async () => {
                    if (audioFailure || controller.signal.aborted) return;
                    try { await streamPavolSpeech(subject.voiceId, text, previousText, controller.signal,
                        (audio, last) => emit({ type: 'audio', audio, phrase: index, text, last })); }
                    catch (error) { audioFailure = error instanceof Error ? error : new Error('Hlasová odpověď selhala.'); }
                });
            };
            emit({ type: 'start', turnId: subject.turnId });
            try {
                const reply = await runManagedAgent(subject.agent,
                    subject.instruction + '\n\nThis is a live voice conversation. Reply naturally in the user’s language, usually in one to three short sentences. Use plain spoken text without Markdown, code blocks or spoken URLs. Stay under 1,500 characters unless the user explicitly asks for more. You remain the same AI avatar with the same Book and conversation.',
                    subject.context, controller.signal, subject.inputs, undefined, { maxOutputTokens: 3000, onText(delta) {
                        generated += delta; pending += delta;
                        if (generated.length > VOICE_REPLY_MAX_CHARACTERS) { controller.abort(); throw new Error('Hlasová odpověď překročila limit.'); }
                        emit({ type: 'text', text: delta });
                        let segment;
                        while ((segment = splitVoicePhrase(pending))) { enqueue(segment.phrase); pending = segment.rest; }
                    } });
                await finishMessageChatTurn(subject.turnId, { reply }); saved = true;
                const tail = splitVoicePhrase(pending, true); if (tail) enqueue(tail.phrase);
                await audioQueue;
                emit({ type: 'complete', reply });
                if (audioFailure) emit({ type: 'error', error: (audioFailure as Error).message });
            } catch {
                if (!saved) {
                    try { await finishMessageChatTurn(subject.turnId, generated.trim() ? { reply: generated.trim() }
                        : { error: controller.signal.aborted ? 'Hlasová odpověď byla přerušena.' : 'Hlasová odpověď selhala.' }); }
                    catch { /* The pending question remains recoverable. */ }
                }
                if (!controller.signal.aborted) emit({ type: 'error', error: 'Odpověď se přerušila. Rozpracovaný text zůstal v konverzaci.' });
            } finally {
                controller.abort(); await audioQueue; request.signal.removeEventListener('abort', cancel);
                if (!closed) { closed = true; output.close(); }
            }
        },
        cancel() { closed = true; controller.abort(); },
    });
    return new Response(stream, { headers: { ...MESSAGE_RESPONSE_HEADERS, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'X-Accel-Buffering': 'no' } });
}
