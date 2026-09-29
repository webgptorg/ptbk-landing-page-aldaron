import { MAXIMAL_SUBTITLE_AUDIO_BYTES, type SubtitleCue, type SubtitleLanguage } from '@/lib/workshops/subtitles/workshopSubtitleTypes';
import { openRecordingMedia, inspectRecordingMedia } from './recordingStudioMedia';
import { readRecordingPart } from './recordingStudioStorage';
import { getRecordingMediaParts, getRecordingSessionDuration } from './recordingStudioSessionTime';
import { getRecordingDerivedSource, getRecordingMediaRevision, getRecordingPartAudioRanges, isRecordingPartAudioAvailable,
    mapRecordingPartMediaInterval, mergeRecordingIntervals, reconcileRecordingSubtitleCues, createRecordingSpeechIntervals,
    RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS, RECORDING_AUDIO_SAMPLE_RATE, RECORDING_SUBTITLE_CHUNK_SECONDS, RECORDING_VAD_SETTINGS } from './recordingStudioDerived';
import type { RecordingDerivedTrack, RecordingMediaBounds, RecordingMediaPart, RecordingSubtitleCue, RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';

type GenerationOptions = {
    readonly recording: StudioRecording;
    readonly sourceId: string;
    readonly kind: RecordingDerivedTrack['kind'];
    readonly language: SubtitleLanguage;
    readonly signal: AbortSignal;
    readonly onProgress: (message: string) => void;
    readonly transcribe: (file: File, language: SubtitleLanguage, signal: AbortSignal) => Promise<readonly SubtitleCue[]>;
};

type AudioSlice = { readonly part: RecordingMediaPart; readonly bounds: RecordingMediaBounds; readonly startSeconds: number; readonly endSeconds: number };

function getAudioSlices(part: RecordingMediaPart, bounds: RecordingMediaBounds): AudioSlice[] {
    const audio = bounds.components.find((component) => component.kind === 'audio');
    if (!audio) return [];
    const segments = part.segments ?? [{ sourceStartSeconds: 0, sessionStartSeconds: part.sessionStartSeconds, durationSeconds: part.durationSeconds }];
    return segments.flatMap((segment) => {
        const startSeconds = Math.max(audio.firstTimestampSeconds, bounds.firstTimestampSeconds + segment.sourceStartSeconds);
        const endSeconds = Math.min(audio.endTimestampSeconds, bounds.firstTimestampSeconds + segment.sourceStartSeconds + segment.durationSeconds);
        return endSeconds > startSeconds ? [{ part, bounds, startSeconds, endSeconds }] : [];
    });
}

/** One bounded PCM slice. The existing workshop server route uses this same WAV representation. */
async function convertRecordingAudioSlice(input: ReturnType<typeof openRecordingMedia>, startSeconds: number, endSeconds: number, signal: AbortSignal): Promise<ArrayBuffer> {
    const { BufferTarget, Conversion, Output, WavOutputFormat } = await import('mediabunny');
    const target = new BufferTarget();
    const output = new Output({ format: new WavOutputFormat(), target });
    const conversion = await Conversion.init({ input, output, tracks: 'primary', video: { discard: true },
        audio: { codec: 'pcm-s16', numberOfChannels: 1, sampleRate: RECORDING_AUDIO_SAMPLE_RATE, forceTranscode: true },
        trim: { start: startSeconds, end: endSeconds } });
    try {
        if (!conversion.isValid) throw new Error('Prohlížeč neumí připravit zvuk tohoto zdroje. Zkuste Chrome nebo Edge.');
        signal.throwIfAborted();
        const cancel = () => { void conversion.cancel().catch(() => undefined); };
        signal.addEventListener('abort', cancel, { once: true });
        try { await conversion.execute(); } finally { signal.removeEventListener('abort', cancel); }
        signal.throwIfAborted();
        if (!target.buffer || target.buffer.byteLength > MAXIMAL_SUBTITLE_AUDIO_BYTES) throw new Error('Zvuková část přesahuje povolený limit.');
        return target.buffer;
    } finally { await conversion.cancel().catch(() => undefined); }
}

async function decodeRecordingWav(buffer: ArrayBuffer): Promise<Float32Array> {
    const context = new AudioContext({ sampleRate: RECORDING_AUDIO_SAMPLE_RATE });
    try {
        const decoded = await context.decodeAudioData(buffer.slice(0));
        return new Float32Array(decoded.getChannelData(0));
    } finally { await context.close(); }
}

export function getRecordingUncertainAudioRanges(audio: Float32Array, chunkStartSeconds: number): RecordingTrim[] {
    const frameSize = RECORDING_AUDIO_SAMPLE_RATE / 10;
    const ranges: RecordingTrim[] = [];
    for (let index = 0; index < audio.length; index += frameSize) {
        const end = Math.min(audio.length, index + frameSize);
        let sum = 0;
        for (let sample = index; sample < end; sample += 1) sum += audio[sample]! * audio[sample]!;
        // Energy only raises uncertainty; it never establishes that speech occurred.
        if (Math.sqrt(sum / (end - index)) >= RECORDING_VAD_SETTINGS.uncertainEnergyRmsThreshold) {
            ranges.push({ startSeconds: chunkStartSeconds + index / RECORDING_AUDIO_SAMPLE_RATE,
                endSeconds: chunkStartSeconds + end / RECORDING_AUDIO_SAMPLE_RATE });
        }
    }
    return mergeRecordingIntervals(ranges, 0.11);
}

async function createVoiceDetector() {
    try {
        const { NonRealTimeVAD } = await import('@ricky0123/vad-web/dist/non-real-time-vad');
        return await NonRealTimeVAD.new({ modelURL: '/recording-studio/vad/silero_vad_legacy.onnx',
            ...RECORDING_VAD_SETTINGS, ortConfig: (runtime) => { runtime.env.wasm.wasmPaths = '/recording-studio/vad/';
                runtime.env.wasm.numThreads = 1; } });
    } catch (error) {
        throw new Error('Místní model řeči se nepodařilo načíst. Obnovte stránku a zkuste Chrome nebo Edge; uložený záznam se nemění.', { cause: error });
    }
}

export function getRecordingAudioChunkWindows(startSeconds: number, endSeconds: number): { readonly coreStart: number; readonly coreEnd: number; readonly decodeStart: number; readonly decodeEnd: number }[] {
    const windows = [];
    for (let coreStart = startSeconds; coreStart < endSeconds - 0.001; coreStart += RECORDING_SUBTITLE_CHUNK_SECONDS) {
        const coreEnd = Math.min(endSeconds, coreStart + RECORDING_SUBTITLE_CHUNK_SECONDS);
        windows.push({ coreStart, coreEnd, decodeStart: Math.max(startSeconds, coreStart - RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS),
            decodeEnd: Math.min(endSeconds, coreEnd + RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS) });
    }
    return windows;
}

function mapCueToSession(cue: SubtitleCue, slice: AudioSlice, decodeStart: number, decodeEnd: number): RecordingSubtitleCue[] {
    const startSeconds = Math.max(slice.startSeconds, decodeStart + cue.startSeconds);
    const endSeconds = Math.min(slice.endSeconds, decodeEnd, decodeStart + cue.endSeconds);
    if (endSeconds <= startSeconds) return [];
    const mapped = mapRecordingPartMediaInterval(slice.part, slice.bounds, startSeconds, endSeconds);
    return mapped.map((range) => ({ id: crypto.randomUUID(), ...range, text: cue.text, isEnabled: true, origin: 'generated' }));
}

export async function generateRecordingDerivedTrack(options: GenerationOptions): Promise<RecordingDerivedTrack> {
    const source = getRecordingDerivedSource(options.recording, options.sourceId);
    const mediaRevision = await getRecordingMediaRevision(options.recording);
    const provenance = { sourceId: source.id, sourceLabel: source.label, mediaRevision, createdAt: new Date().toISOString(),
        language: options.kind === 'subtitles' ? options.language : null,
        processor: options.kind === 'subtitles' ? 'openai-whisper-1' : 'silero-vad-legacy',
        settings: options.kind === 'subtitles' ? { chunkSeconds: RECORDING_SUBTITLE_CHUNK_SECONDS, overlapSeconds: RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS,
            sampleRate: RECORDING_AUDIO_SAMPLE_RATE } : { ...RECORDING_VAD_SETTINGS, chunkSeconds: RECORDING_SUBTITLE_CHUNK_SECONDS,
                overlapSeconds: RECORDING_AUDIO_CHUNK_OVERLAP_SECONDS, sampleRate: RECORDING_AUDIO_SAMPLE_RATE } } as const;
    const parts = getRecordingMediaParts(source);
    const subtitleCues: RecordingSubtitleCue[] = [];
    const availableRanges: RecordingTrim[] = [];
    const speechRanges: RecordingTrim[] = [];
    const uncertainRanges: RecordingTrim[] = [];
    const voiceDetector = options.kind === 'speech-activity' ? await createVoiceDetector() : null;
    let processedCount = 0;
    let unavailableCount = 0;
    for (const part of parts) {
        options.signal.throwIfAborted();
        // An older part's saved audio flag may be wrong in either direction.
        // Its actual decoder decides; measured video-only parts can be skipped.
        if (part.mediaBounds && !isRecordingPartAudioAvailable(part, source)) { unavailableCount += 1; continue; }
        let blob: Blob;
        try { blob = await readRecordingPart(options.recording.id, part, options.signal); }
        catch { options.signal.throwIfAborted(); unavailableCount += 1; continue; }
        const input = openRecordingMedia(blob);
        try {
            const audio = await input.getPrimaryAudioTrack();
            if (!audio || !(await audio.canDecode())) { unavailableCount += 1; continue; }
            let bounds: RecordingMediaBounds;
            try { bounds = await inspectRecordingMedia(input); }
            catch { options.signal.throwIfAborted(); unavailableCount += 1; continue; }
            const slices = getAudioSlices(part, bounds);
            if (slices.length === 0) { unavailableCount += 1; continue; }
            availableRanges.push(...getRecordingPartAudioRanges(part, bounds));
            for (const slice of slices) {
                for (const window of getRecordingAudioChunkWindows(slice.startSeconds, slice.endSeconds)) {
                    options.signal.throwIfAborted();
                    const buffer = await convertRecordingAudioSlice(input, window.decodeStart, window.decodeEnd, options.signal);
                    if (options.kind === 'subtitles') {
                        const cues = await options.transcribe(new File([buffer], 'recording.wav', { type: 'audio/wav' }), options.language, options.signal);
                        for (const cue of cues) {
                            // Keep a cue even when only the neighboring chunk recognizes it. The
                            // overlap can return it twice; reconciliation below removes matching
                            // suggestions without depending on either model response being complete.
                            subtitleCues.push(...mapCueToSession(cue, slice, window.decodeStart, window.decodeEnd));
                        }
                    } else if (voiceDetector) {
                        const samples = await decodeRecordingWav(buffer);
                        for await (const event of voiceDetector.run(samples, RECORDING_AUDIO_SAMPLE_RATE)) {
                            options.signal.throwIfAborted();
                            const start = Math.max(window.coreStart, window.decodeStart + event.start / 1000);
                            const end = Math.min(window.coreEnd, window.decodeStart + event.end / 1000);
                            if (end > start) speechRanges.push(...mapRecordingPartMediaInterval(part, bounds, start, end));
                        }
                        for (const range of getRecordingUncertainAudioRanges(samples, window.decodeStart)) {
                            const start = Math.max(window.coreStart, range.startSeconds);
                            const end = Math.min(window.coreEnd, range.endSeconds);
                            if (end > start) uncertainRanges.push(...mapRecordingPartMediaInterval(part, bounds, start, end));
                        }
                    }
                    processedCount += 1;
                    options.onProgress(`Zpracováno ${processedCount} zvukových částí · ${source.label}${unavailableCount ? ` · nedostupných částí: ${unavailableCount}` : ''}`);
                }
            }
        } finally { input.dispose(); }
    }
    options.signal.throwIfAborted();
    if (processedCount === 0 && options.kind === 'subtitles') {
        throw new Error('Ve vybraném zdroji se nepodařilo přečíst žádný dokončený zvuk. Zkontrolujte uložené části média.');
    }
    const finalizedProvenance = { ...provenance, settings: { ...provenance.settings, unavailablePartCount: unavailableCount } };
    if (options.kind === 'subtitles') return { id: crypto.randomUUID(), kind: 'subtitles', provenance: finalizedProvenance,
        cues: reconcileRecordingSubtitleCues(subtitleCues) };
    return { id: crypto.randomUUID(), kind: 'speech-activity', provenance: finalizedProvenance,
        intervals: createRecordingSpeechIntervals(getRecordingSessionDuration(options.recording), availableRanges, speechRanges, uncertainRanges) };
}
