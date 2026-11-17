import { VoicePlaybackQueue } from './VoicePlaybackQueue';
import { readStreamLines } from '@/lib/agents/readStreamEvents';
import type { VoiceChatEvent, VoicePlayback } from './types';

export type VoiceStatus = 'off' | 'connecting' | 'listening' | 'thinking' | 'speaking';
type Options = { endpoint: string; conversationId: string; language: string;
    onStatus: (status: VoiceStatus) => void; onPartial: (text: string) => void; onError: (error: string) => void;
    onUtterance: (text: string, voiceSession: string) => Promise<void>; onInterrupt: () => void;
    onPlayback: (turnId: string, playback: VoicePlayback) => void };

/** A microphone session over the existing chat, without a second agent or history. */
export class BrowserVoiceChat {
    private context: AudioContext | null = null;
    private microphone: MediaStream | null = null;
    private capture: AudioWorkletNode | null = null;
    private input: MediaStreamAudioSourceNode | null = null;
    private socket: WebSocket | null = null;
    private socketReady = false;
    private timer?: ReturnType<typeof setTimeout>;
    private timeout?: ReturnType<typeof setTimeout>;
    private stopped = false;
    private startController = new AbortController();
    private playback: VoicePlaybackQueue | null = null;
    private turnId = '';
    private reporting: Promise<void> = Promise.resolve();
    private token = '';
    private answering = false;
    private utterances: string[] = [];
    private muted = false;
    private status: VoiceStatus = 'off';
    private readonly owner = crypto.randomUUID();
    private channel: BroadcastChannel | null = null;
    constructor(private options: Options) {}
    get sessionToken() { return this.token; }
    get active() { return !this.stopped && this.status !== 'off'; }
    private setStatus(status: VoiceStatus) { this.status = status; this.options.onStatus(status); }
    async start() {
        this.setStatus('connecting');
        try {
            if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.AudioContext || !window.AudioWorkletNode)
                throw new Error('Tento prohlížeč nepodporuje hlasový chat. Použij aktuální Chrome nebo Safari přes HTTPS.');
            this.context = new AudioContext(); await this.context.resume();
            const microphone = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
            if (this.stopped) { microphone.getTracks().forEach(track => track.stop()); return; }
            this.microphone = microphone;
            for (const track of microphone.getAudioTracks()) track.onended = () => this.fail('Mikrofon se odpojil. Spusť hlasový chat znovu.');
            await this.context.audioWorklet.addModule('/chat-voice-worklet.js');
            if (this.stopped) return;
            const response = await fetch(this.options.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'voice-start', conversationId: this.options.conversationId }), signal: this.startController.signal });
            const data = await response.json() as { token?: string; voiceSession?: string; modelId?: string; maxSeconds?: number; error?: string };
            if (!response.ok || !data.token || !data.voiceSession) throw new Error(data.error || 'Hlasový chat se nepodařilo připojit.');
            if (this.stopped) return;
            this.token = data.voiceSession;
            // Automatic language detection also lets Czech speech work on the English personal domain.
            const query = new URLSearchParams({ token: data.token, model_id: data.modelId ?? 'scribe_v2_realtime',
                audio_format: 'pcm_16000', commit_strategy: 'vad', vad_silence_threshold_secs: '.8' });
            this.socket = new WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/realtime?' + query);
            this.socket.onmessage = event => this.receiveTranscript(event.data);
            this.socket.onerror = () => this.fail('Živý přepis se odpojil. Můžeš pokračovat textem.');
            this.socket.onclose = () => { if (!this.stopped) this.fail('Hlasové spojení bylo ukončeno. Můžeš ho spustit znovu.'); };
            this.input = this.context.createMediaStreamSource(microphone);
            this.capture = new AudioWorkletNode(this.context, 'chat-voice-capture', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
            this.capture.port.onmessage = event => {
                if (this.stopped || !this.socketReady || this.socket?.readyState !== WebSocket.OPEN) return;
                if (this.socket.bufferedAmount > 256_000) { this.fail('Připojení je pro hlasový chat příliš pomalé.'); return; }
                const bytes = new Uint8Array(event.data as ArrayBuffer);
                let binary = ''; for (const byte of Array.from(bytes)) binary += String.fromCharCode(byte);
                this.socket.send(JSON.stringify({ message_type: 'input_audio_chunk', audio_base_64: btoa(binary), sample_rate: 16000 }));
            };
            this.input.connect(this.capture); this.capture.connect(this.context.destination);
            this.timeout = setTimeout(() => this.fail('Hlasové připojení neodpovídá. Zkus to znovu.'), 20_000);
            this.timer = setTimeout(() => this.fail('Desetiminutový hovor skončil. Můžeš navázat ve stejné konverzaci.'), Math.min(data.maxSeconds ?? 600, 600) * 1000);
            window.addEventListener('pagehide', this.onPageHide);
            window.addEventListener('pavol-chat-voice-start', this.onOtherStart);
            window.dispatchEvent(new CustomEvent('pavol-chat-voice-start', { detail: this.owner }));
            if (typeof BroadcastChannel !== 'undefined') {
                this.channel = new BroadcastChannel('pavol-chat-voice');
                this.channel.onmessage = () => this.stop(); this.channel.postMessage(this.owner);
            }
        } catch (error) {
            if (!this.stopped) this.fail(error instanceof DOMException && error.name === 'NotAllowedError'
                ? 'Povol mikrofon pro tento web a spusť hlasový chat znovu.' : error instanceof Error ? error.message : 'Hlasový chat se nepodařilo spustit.');
        }
    }
    private onPageHide = () => this.stop();
    private onOtherStart = (event: Event) => { if ((event as CustomEvent).detail !== this.owner) this.stop(); };
    private receiveTranscript(raw: string) {
        try {
            const event = JSON.parse(raw) as { message_type?: string; text?: string };
            if (event.message_type === 'session_started') { clearTimeout(this.timeout); this.socketReady = true; this.setStatus('listening'); return; }
            if (this.muted || this.stopped) return;
            if (event.message_type === 'partial_transcript') {
                const text = event.text ?? ''; this.options.onPartial(text); if (text.trim()) this.interrupt();
            } else if (event.message_type === 'committed_transcript' && event.text?.trim()) {
                this.interrupt(); this.options.onPartial(''); this.utterances.push(event.text.trim()); void this.sendUtterances();
            } else if (event.message_type?.includes('error') || ['quota_exceeded', 'rate_limited', 'auth_error', 'throttled', 'unaccepted_terms', 'resource_exhausted', 'session_time_limit_exceeded', 'insufficient_audio_activity'].includes(event.message_type ?? '')) {
                this.fail(event.message_type?.includes('quota') ? 'Došly kredity ElevenLabs. Můžeš pokračovat textem.'
                    : 'ElevenLabs ukončilo přepis. Zkontrolujte kredity a oprávnění, nebo pokračuj textem.');
            }
        } catch { this.fail('Přepis nevrátil čitelnou odpověď.'); }
    }
    private async sendUtterances() {
        if (this.answering || this.stopped) return;
        this.answering = true;
        try {
            while (this.utterances.length && !this.stopped) {
                const text = this.utterances.splice(0).join(' '); await this.reporting;
                if (this.stopped) break;
                this.setStatus('thinking'); await this.options.onUtterance(text, this.token);
            }
        } catch { this.fail('Otázku se nepodařilo odeslat. Můžeš pokračovat textem.'); }
        finally { this.answering = false; if (!this.stopped && !this.playback?.playing) this.setStatus('listening'); }
    }
    beginTurn() { if (!this.stopped) this.setStatus('thinking'); }
    mute(value: boolean) {
        this.muted = value; this.microphone?.getAudioTracks().forEach(track => { track.enabled = !value; });
        if (value) this.options.onPartial('');
    }
    interrupt() {
        if (!this.turnId && !this.playback && this.status !== 'thinking') return;
        this.options.onInterrupt(); this.reportPlayback('interrupted'); if (!this.stopped) this.setStatus('listening');
    }
    private reportPlayback(status: VoicePlayback['status']) {
        const queue = this.playback, turnId = this.turnId, spokenText = queue?.spokenText ?? '';
        queue?.stop(); this.playback = null; this.turnId = '';
        if (!turnId) return;
        const playback = { status, spokenText }; this.options.onPlayback(turnId, playback);
        // This acknowledgement never generates speech and is never a paid retry.
        this.reporting = this.reporting.then(async () => {
            try {
                const response = await fetch(this.options.endpoint, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'voice-playback', conversationId: this.options.conversationId, voiceSession: this.token, turnId, ...playback }) });
                if (!response.ok) throw new Error();
            } catch { this.options.onError('Stav přehrávání zůstal v tomto prohlížeči; na server se ho nepodařilo uložit.'); }
        });
    }
    async readReply(response: Response, signal: AbortSignal, onText: (text: string, turnId: string) => void): Promise<{ reply: string; turnId: string; voice: VoicePlayback }> {
        if (signal.aborted || this.stopped) throw new DOMException('Aborted', 'AbortError');
        if (!this.context || !response.body) throw new Error('Chybí hlasové spojení.');
        this.playback = new VoicePlaybackQueue(this.context, speaking => {
            if (!this.stopped) this.setStatus(speaking ? 'speaking' : this.answering ? 'thinking' : 'listening');
        });
        let generated = '', reply = '', id = '', failed = '';
        const queue = this.playback, abort = () => this.reportPlayback('interrupted');
        signal.addEventListener('abort', abort, { once: true });
        try {
            for await (const line of readStreamLines(response.body, signal)) {
                if (!line) continue;
                const event = JSON.parse(line) as VoiceChatEvent;
                if (event.type === 'start') { id = event.turnId; this.turnId = id; }
                else if (event.type === 'text') { generated += event.text; onText(generated, id); }
                else if (event.type === 'audio') queue.add(event);
                else if (event.type === 'complete') reply = event.reply;
                else if (event.type === 'error') failed = event.error;
            }
            if (!reply && !signal.aborted) failed ||= 'Hlasová odpověď nebyla dokončena.';
            await queue.drain(signal);
            if (!signal.aborted && this.turnId === id) this.reportPlayback(failed ? 'failed' : 'completed');
            if (failed) this.fail(failed);
            if (!reply && !generated) throw new Error(failed || 'Hlasová odpověď neobsahuje text.');
            return { reply: reply || generated, turnId: id, voice: { status: signal.aborted ? 'interrupted' : failed ? 'failed' : 'completed', spokenText: queue.spokenText } };
        } catch (error) {
            if (this.turnId === id) this.reportPlayback(signal.aborted ? 'interrupted' : 'failed');
            if (!signal.aborted) this.fail('Hlasové spojení se přerušilo. Můžeš pokračovat textem.');
            if (generated) return { reply: generated, turnId: id, voice: { status: signal.aborted ? 'interrupted' : 'failed', spokenText: queue.spokenText } };
            throw error;
        } finally { signal.removeEventListener('abort', abort); }
    }
    private fail(error: string) { this.options.onError(error); this.stop(); }
    stop() {
        if (this.stopped) return;
        this.stopped = true; this.utterances = []; clearTimeout(this.timer); clearTimeout(this.timeout); this.startController.abort();
        this.interrupt(); this.socketReady = false;
        if (this.socket) { this.socket.onclose = null; this.socket.close(); }
        this.capture?.disconnect(); this.input?.disconnect();
        this.microphone?.getTracks().forEach(track => { track.onended = null; track.stop(); });
        void this.context?.close().catch(() => undefined);
        window.removeEventListener('pagehide', this.onPageHide); window.removeEventListener('pavol-chat-voice-start', this.onOtherStart);
        this.channel?.close(); this.options.onPartial(''); this.setStatus('off');
    }
}
