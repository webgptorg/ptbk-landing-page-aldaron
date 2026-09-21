import { MAXIMAL_SUBTITLE_AUDIO_BYTES, MAXIMAL_SUBTITLE_DURATION_SECONDS, SUBTITLE_AUDIO_CHUNK_SECONDS, SUBTITLE_CUES_SCHEMA, type SubtitleCue } from '@/lib/workshops/subtitles/workshopSubtitleTypes';

const SUBTITLE_AUDIO_SAMPLE_RATE = 16_000;

/** Decode one bounded slice at a time; no full video upload, temporary server file or native ffmpeg dependency. */
export async function generateSubtitlesFromRecording(options: {
    readonly file: File;
    readonly signal: AbortSignal;
    readonly transcribe: (file: File) => Promise<readonly SubtitleCue[]>;
    readonly onProgress: (progress: number) => void;
}): Promise<SubtitleCue[]> {
    const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Output, WavOutputFormat } = await import('mediabunny');
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(options.file) });
    let conversion: Awaited<ReturnType<typeof Conversion.init>> | null = null;
    const cancel = () => { void conversion?.cancel().catch(() => undefined); };
    options.signal.addEventListener('abort', cancel);
    try {
        options.signal.throwIfAborted();
        const track = await input.getPrimaryAudioTrack();
        if (!track || !(await track.canDecode())) throw new Error('Prohlížeč neumí přečíst zvuk nahrávky. Použijte Chrome či Edge nebo soubor WAV.');
        const start = Math.max(0, await track.getFirstTimestamp());
        const end = await track.computeDuration();
        if (!Number.isFinite(end) || end <= start || end > MAXIMAL_SUBTITLE_DURATION_SECONDS) {
            throw new Error('Nahrávka musí mít zvuk a délku nejvýše 24 hodin.');
        }
        const cues: SubtitleCue[] = [];
        for (let position = start; position < end; position += SUBTITLE_AUDIO_CHUNK_SECONDS) {
            options.signal.throwIfAborted();
            const chunkEnd = Math.min(end, position + SUBTITLE_AUDIO_CHUNK_SECONDS);
            const target = new BufferTarget();
            const output = new Output({ format: new WavOutputFormat(), target });
            conversion = await Conversion.init({ input, output, tracks: 'primary', video: { discard: true },
                audio: { codec: 'pcm-s16', numberOfChannels: 1, sampleRate: SUBTITLE_AUDIO_SAMPLE_RATE, forceTranscode: true },
                trim: { start: position, end: chunkEnd } });
            if (!conversion.isValid) throw new Error('Zvuk nahrávky nelze připravit pro přepis. Použijte soubor WAV.');
            options.signal.throwIfAborted();
            await conversion.execute();
            options.signal.throwIfAborted();
            if (!target.buffer || target.buffer.byteLength > MAXIMAL_SUBTITLE_AUDIO_BYTES) throw new Error('Zvuková část je příliš velká.');
            const chunkCues = await options.transcribe(new File([target.buffer], 'workshop.wav', { type: 'audio/wav' }));
            options.signal.throwIfAborted();
            for (const cue of chunkCues) {
                const startSeconds = position + cue.startSeconds;
                const endSeconds = Math.min(chunkEnd, position + cue.endSeconds);
                if (endSeconds > startSeconds) cues.push({ ...cue, startSeconds, endSeconds });
            }
            options.onProgress((chunkEnd - start) / (end - start));
        }
        if (!cues.length) throw new Error('V nahrávce nebyla rozpoznána řeč.');
        return SUBTITLE_CUES_SCHEMA.parse(cues);
    } finally {
        options.signal.removeEventListener('abort', cancel);
        await conversion?.cancel().catch(() => undefined);
        input.dispose();
    }
}
