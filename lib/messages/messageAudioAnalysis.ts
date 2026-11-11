export type MessageAudioAnalysis = {
    status: 'signal-detected' | 'silent' | 'unavailable';
    decodedSeconds: number;
    peak: number;
    reason?: string;
};

/** Stream samples until signal is found. Only a complete scan can establish digital silence. */
export async function analyzeMessageAudio(file: File): Promise<MessageAudioAnalysis> {
    const { ALL_FORMATS, AudioSampleSink, BlobSource, Input } = await import('mediabunny');
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    try {
        const track = await input.getPrimaryAudioTrack();
        if (!track || !(await track.canDecode())) {
            return { status: 'unavailable', decodedSeconds: 0, peak: 0, reason: 'Browser cannot decode this audio for signal analysis.' };
        }
        const analysis: MessageAudioAnalysis = { status: 'unavailable', decodedSeconds: 0, peak: 0 };
        for await (const sample of new AudioSampleSink(track).samples()) {
            try {
                analysis.decodedSeconds += sample.duration;
                for (let channel = 0; channel < sample.numberOfChannels; channel++) {
                    const values = new Float32Array(sample.numberOfFrames);
                    sample.copyTo(values, { planeIndex: channel, format: 'f32-planar' });
                    for (let index = 0; index < values.length; index++) {
                        if (!Number.isFinite(values[index])) throw new Error('Decoder returned a non-finite audio sample.');
                        analysis.peak = Math.max(analysis.peak, Math.abs(values[index]));
                    }
                }
                // Approximately -120 dBFS. This detects a signal, never the presence of speech.
                if (analysis.peak > 0.000001) return { ...analysis, status: 'signal-detected' };
            } finally { sample.close(); }
        }
        return { ...analysis, status: analysis.decodedSeconds > 0 ? 'silent' : 'unavailable' };
    } catch (error) {
        // Unsupported local decoding must not prevent the existing encoded-audio upload.
        return { status: 'unavailable', decodedSeconds: 0, peak: 0, reason: error instanceof Error ? error.message : String(error) };
    } finally { input.dispose(); }
}
