/* Microphone-only capture. No recording or persistence. */
class ChatVoiceCapture extends AudioWorkletProcessor {
    constructor() {
        super(); this.samples = new Int16Array(1600); this.offset = 0; this.sum = 0; this.count = 0; this.phase = 0;
    }
    process(inputs) {
        const input = inputs[0]?.[0]; if (!input) return true;
        const ratio = sampleRate / 16000;
        for (const sample of input) {
            this.sum += sample; this.count++; this.phase++;
            if (this.phase >= ratio) {
                const value = Math.max(-1, Math.min(1, this.sum / this.count));
                this.samples[this.offset++] = Math.round(value < 0 ? value * 32768 : value * 32767);
                this.phase -= ratio; this.sum = 0; this.count = 0;
                if (this.offset === this.samples.length) {
                    this.port.postMessage(this.samples.buffer, [this.samples.buffer]);
                    this.samples = new Int16Array(1600); this.offset = 0;
                }
            }
        }
        return true;
    }
}
registerProcessor('chat-voice-capture', ChatVoiceCapture);
