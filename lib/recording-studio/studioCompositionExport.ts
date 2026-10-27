import { AudioSample, AudioSampleSink, AudioSampleSource, CanvasSource, Input, BlobSource, ALL_FORMATS, Output, StreamTarget, VideoSampleSink, WebMOutputFormat, canEncodeAudio, canEncodeVideo, type VideoSample } from 'mediabunny';
import { bufferRecordingPreparedDownload } from './recordingStudioExport';
import { withRecordingTemporaryFile } from './recordingStudioTemporaryFile';
import { createStudioRangeInput, readStudioLocalRangeSource } from './studioMediaSource';
import { drawStudioComposition, getStudioCompositionLayers, type StudioCompositionFrame } from './studioComposition';
import { getStudioClipAt, placeStudioClips, placeStudioScenes, validateStudioProject } from './studioProjectTimeline';
import type { StudioAsset, StudioPlacedClip, StudioProject } from './studioProjectTypes';

const FPS = 30, SAMPLE_RATE = 48_000;

export function chooseStudioCompositionDestination(project: StudioProject): Promise<FileSystemFileHandle | null> {
    const picker = (window as Window & { showSaveFilePicker?: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
    return picker ? picker.call(window, { suggestedName: `${project.title.replace(/[\\/:*?"<>|]/g, '-')}-kompozice.webm`, types: [{ description: 'WebM video', accept: { 'video/webm': ['.webm'] } }] }) : Promise.resolve(null);
}

/** Deterministic decoded frames + one audio source, streamed to a temporary local file. Never uploads. */
export async function renderStudioComposition(project: StudioProject, assets: readonly StudioAsset[], signal: AbortSignal,
    onProgress: (progress: number) => void, consume: (file: File) => Promise<void>, height = 1080): Promise<void> {
    validateStudioProject(project);
    const duration = project.selection.endSeconds - project.selection.startSeconds;
    if (duration <= 0 || !project.scenes.length) throw new Error('Nejdříve vyberte rozsah a kompozici.');
    if (!await canEncodeVideo('vp8', { width: height * 16 / 9, height }) || !await canEncodeAudio('opus', { sampleRate: SAMPLE_RATE, numberOfChannels: 2 }))
        throw new Error('Tento prohlížeč nepodporuje místní export WebM (VP8/Opus). Otevřete studio v aktuálním Chrome nebo Edge.');
    await withRecordingTemporaryFile(async ({ writable, readFile }) => {
        const canvas = document.createElement('canvas'); canvas.width = height * 16 / 9; canvas.height = height;
        const context = canvas.getContext('2d')!;
        const output = new Output({ format: new WebMOutputFormat(), target: new StreamTarget(writable) });
        const videoSource = new CanvasSource(canvas, { codec: 'vp8', bitrate: 6_000_000 });
        const audioSource = new AudioSampleSource({ codec: 'opus', bitrate: 128_000 });
        output.addVideoTrack(videoSource, { frameRate: FPS }); output.addAudioTrack(audioSource);
        const abort = () => { void output.cancel().catch(() => undefined); };
        signal.addEventListener('abort', abort, { once: true });
        const open = async (clip: StudioPlacedClip) => {
            const asset = assets.find((item) => item.id === clip.assetId);
            if (!asset) throw new Error('Zdroj kompozice chybí. Původní střih zůstal zachovaný.');
            if (asset.original.kind === 'https') throw new Error('Místní export potřebuje původní soubor uložený v tomto prohlížeči nebo připojený z disku.');
            const input = createStudioRangeInput(await readStudioLocalRangeSource(asset), signal);
            return { input, asset };
        };
        const decoders = new Map<string, { clipId: string; input: Input; samples: AsyncGenerator<VideoSample | null, void, unknown> }>();
        const audioInputs = new Set<Input>();
        try {
            signal.throwIfAborted(); await output.start();
            const renderVideo = async () => {
                const framesCount = Math.ceil(duration * FPS);
                for (let index = 0; index < framesCount; index++) {
                    signal.throwIfAborted();
                    const seconds = project.selection.startSeconds + index / FPS;
                    const frames = new Map<string, StudioCompositionFrame>();
                    const samples: VideoSample[] = [];
                    try {
                        const required = new Set(getStudioCompositionLayers(project, seconds).filter((layer) => layer.opacity > 0).map((layer) => layer.trackId));
                        for (const [id, decoder] of Array.from(decoders)) {
                            if (!required.has(id)) { await decoder.samples.return(); decoder.input.dispose(); decoders.delete(id); }
                        }
                        for (const track of project.tracks.filter((item) => required.has(item.id))) {
                            const clip = getStudioClipAt(project, track.id, seconds);
                            let decoder = decoders.get(track.id);
                            if (decoder && decoder.clipId !== clip?.id) { await decoder.samples.return(); decoder.input.dispose(); decoders.delete(track.id); decoder = undefined; }
                            if (!clip) continue;
                            if (!decoder) {
                                const { input, asset } = await open(clip);
                                const video = await input.getPrimaryVideoTrack();
                                if (!video || !await video.canDecode()) { input.dispose(); throw new Error(`Obraz stopy „${track.label}“ nelze dekódovat.`); }
                                const timestamps = function* () { for (let frame = index; frame < framesCount; frame++) {
                                    const time = project.selection.startSeconds + frame / FPS;
                                    if (time >= clip.projectEndSeconds) break;
                                    yield asset.bounds.firstTimestampSeconds + clip.sourceStartSeconds + time - clip.projectStartSeconds;
                                } };
                                decoder = { clipId: clip.id, input, samples: new VideoSampleSink(video).samplesAtTimestamps(timestamps()) };
                                decoders.set(track.id, decoder);
                            }
                            const sample = (await decoder.samples.next()).value;
                            if (sample) { samples.push(sample); frames.set(track.id, { image: sample.toCanvasImageSource(), width: sample.displayWidth, height: sample.displayHeight }); }
                        }
                        drawStudioComposition(context, canvas.width, canvas.height, project, seconds, frames);
                        await videoSource.add(index / FPS, Math.min(1 / FPS, duration - index / FPS));
                    } finally { samples.forEach((sample) => sample.close()); }
                    onProgress((index + 1) / framesCount);
                    if (index % 15 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
                }
                videoSource.close();
            };
            const renderAudio = async () => {
                let written = 0;
                const endFrame = Math.round(duration * SAMPLE_RATE);
                const write = async (data: Float32Array, first: number) => {
                    const sample = new AudioSample({ data, format: 'f32-planar', numberOfChannels: 2, sampleRate: SAMPLE_RATE, timestamp: first / SAMPLE_RATE });
                    try { await audioSource.add(sample); } finally { sample.close(); }
                    written = first + data.length / 2;
                };
                const silenceTo = async (until: number) => {
                    while (written < until) { signal.throwIfAborted(); await write(new Float32Array(Math.min(2048, until - written) * 2), written); }
                };
                for (const scene of placeStudioScenes(project).sort((a, b) => a.startSeconds - b.startSeconds)) {
                    for (const clip of placeStudioClips(project).filter((item) => item.trackId === scene.audioTrackId).sort((a, b) => a.projectStartSeconds - b.projectStartSeconds)) {
                        const start = Math.max(scene.startSeconds, clip.projectStartSeconds, project.selection.startSeconds);
                        const end = Math.min(scene.endSeconds, clip.projectEndSeconds, project.selection.endSeconds);
                        if (end <= start) continue;
                        signal.throwIfAborted();
                        const { input, asset } = await open(clip); audioInputs.add(input);
                        try {
                            const audio = await input.getPrimaryAudioTrack();
                            if (!audio) continue;
                            if (!await audio.canDecode()) throw new Error('Zvuk kompozice nelze dekódovat.');
                            const origin = asset.bounds.firstTimestampSeconds + clip.sourceStartSeconds - clip.projectStartSeconds;
                            for await (const sample of new AudioSampleSink(audio).samples(origin + start, origin + end)) {
                                try {
                                    signal.throwIfAborted();
                                    const sampleStart = sample.timestamp - origin;
                                    const first = Math.max(written, Math.round((Math.max(start, sampleStart) - project.selection.startSeconds) * SAMPLE_RATE));
                                    const last = Math.min(endFrame, Math.round((Math.min(end, sampleStart + sample.duration) - project.selection.startSeconds) * SAMPLE_RATE));
                                    if (last <= first) continue;
                                    await silenceTo(first);
                                    const source = sample.toAudioBuffer();
                                    const frames = last - first, data = new Float32Array(frames * 2);
                                    for (let channel = 0; channel < 2; channel++) {
                                        const plane = source.getChannelData(Math.min(channel, source.numberOfChannels - 1));
                                        for (let frame = 0; frame < frames; frame++) {
                                            const offset = (project.selection.startSeconds + (first + frame) / SAMPLE_RATE - sampleStart) * source.sampleRate;
                                            const left = Math.max(0, Math.min(plane.length - 1, Math.floor(offset))), fraction = Math.max(0, offset - left);
                                            data[channel * frames + frame] = plane[left] + (plane[Math.min(plane.length - 1, left + 1)] - plane[left]) * fraction;
                                        }
                                    }
                                    await write(data, first);
                                } finally { sample.close(); }
                            }
                        } finally { input.dispose(); audioInputs.delete(input); }
                    }
                }
                await silenceTo(endFrame); audioSource.close();
            };
            // Each producer respects encoder/muxer backpressure; their encoded queues can drain together.
            const results = await Promise.allSettled([renderVideo().catch(async (error) => { await output.cancel().catch(() => undefined); throw error; }), renderAudio().catch(async (error) => { await output.cancel().catch(() => undefined); throw error; })]);
            for (const result of results) if (result.status === 'rejected') throw result.reason;
            signal.throwIfAborted(); await output.finalize();
            const file = await readFile();
            const verification = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
            try {
                const video = await verification.getPrimaryVideoTrack(), audio = await verification.getPrimaryAudioTrack();
                if (!video || !audio || Math.abs(await video.computeDuration() - duration) > 0.06 || Math.abs(await audio.computeDuration() - duration) > 0.06) throw new Error('Výstup nemá očekávanou délku obrazu a zvuku. Export není dokončený.');
            } finally { verification.dispose(); }
            signal.throwIfAborted(); await consume(file);
        } finally {
            signal.removeEventListener('abort', abort);
            for (const decoder of Array.from(decoders.values())) { await decoder.samples.return().catch(() => undefined); decoder.input.dispose(); }
            audioInputs.forEach((input) => input.dispose()); await output.cancel().catch(() => undefined);
        }
    });
}

export async function saveStudioComposition(file: File, project: StudioProject, destination: FileSystemFileHandle | null, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    if (destination) {
        const writable = await destination.createWritable();
        try { await file.stream().pipeTo(writable, { signal }); }
        catch (error) { await writable.abort().catch(() => undefined); throw error; }
    } else {
        const blob = await bufferRecordingPreparedDownload(file, signal);
        const url = URL.createObjectURL(blob), anchor = document.createElement('a');
        anchor.href = url; anchor.download = `${project.title.replace(/[\\/:*?"<>|]/g, '-')}-kompozice.webm`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
}
