import type { VoiceAudioEvent } from './types';
/** A phrase counts as spoken only after its final audio sample has played. */
export class VoicePlaybackQueue {
    private sources = new Set<AudioBufferSourceNode>();
    private tail: number;
    private completed = new Map<number, string>();
    private cancelled = false;
    private leftover: number | undefined;
    constructor(private context: AudioContext, private onSpeaking: (speaking: boolean) => void) { this.tail = context.currentTime; }
    get spokenText() { return Array.from(this.completed.entries()).sort((a, b) => a[0] - b[0]).map(([, text]) => text).join(' '); }
    get playing() { return this.sources.size > 0; }
    add(event: VoiceAudioEvent) {
        if (this.cancelled) return;
        const decoded = atob(event.audio), bytes = new Uint8Array(decoded.length + (this.leftover === undefined ? 0 : 1));
        let offset = 0;
        if (this.leftover !== undefined) { bytes[0] = this.leftover; offset = 1; }
        for (let i = 0; i < decoded.length; i++) bytes[i + offset] = decoded.charCodeAt(i);
        this.leftover = bytes.length % 2 ? bytes[bytes.length - 1] : undefined;
        const length = Math.floor(bytes.length / 2); if (!length) return;
        const buffer = this.context.createBuffer(1, length, 24000), channel = buffer.getChannelData(0), view = new DataView(bytes.buffer);
        for (let i = 0; i < length; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
        const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(this.context.destination);
        const at = Math.max(this.context.currentTime + .04, this.tail); this.tail = at + buffer.duration;
        this.sources.add(source); this.onSpeaking(true);
        source.onended = () => {
            source.disconnect(); this.sources.delete(source);
            if (!this.cancelled && event.last) this.completed.set(event.phrase, event.text);
            if (!this.sources.size) this.onSpeaking(false);
        };
        source.start(at);
    }
    stop() {
        this.cancelled = true;
        for (const source of Array.from(this.sources)) { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); }
        this.sources.clear(); this.onSpeaking(false);
    }
    async drain(signal?: AbortSignal) {
        while (this.sources.size && !this.cancelled && !signal?.aborted) await new Promise(resolve => setTimeout(resolve, 40));
    }
}
