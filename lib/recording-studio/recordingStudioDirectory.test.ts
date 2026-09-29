import { afterEach, describe, expect, it, vi } from 'vitest';
import { appendDirectoryRecordingChunk, chooseRecordingDirectory, readDirectoryRecording, readDirectoryRecordingChunk, reconnectRecordingDirectory, saveDirectoryRecording } from './recordingStudioDirectory';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import { createRecordingEditRecipe } from './recordingStudioSessionTime';
import { getRecordingMediaRevision } from './recordingStudioDerived';
import { createRecordingWorkshopMetadata } from './recordingStudioWorkshop';

/** Models File System Access commit-on-close, including failures before a checkpoint is closed. */
function createDirectory() {
    const files = new Map<string, Blob>();
    const failures = new Map<string, string>();
    const aborted = vi.fn().mockResolvedValue(undefined);
    const handle = {
        name: 'take',
        getFileHandle: async (name: string) => ({
            getFile: async () => { const file = files.get(name); if (!file) throw new DOMException('missing', 'NotFoundError'); return file; },
            createWritable: async () => {
                let pending: Blob | null = null;
                return {
                    write: async (data: Blob | string) => { pending = typeof data === 'string' ? new Blob([data]) : data; },
                    close: async () => { if (failures.has(name)) throw new DOMException('write failed', failures.get(name)); files.set(name, pending!); },
                    abort: aborted,
                };
            },
        }),
    } as unknown as FileSystemDirectoryHandle;
    const base = createTestStudioRecording();
    const recording = { ...base, status: 'recording' as const, storageDestination: { kind: 'directory' as const, name: 'take' }, tracks: [base.tracks[0]] };
    return { handle, recording, files, failures, aborted };
}

describe('incrementally committed selected-directory media', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('requests only read access for recovery and write access for a capture destination', async () => {
        const picker = vi.fn().mockResolvedValue(createDirectory().handle);
        vi.stubGlobal('window', { showDirectoryPicker: picker });
        await chooseRecordingDirectory(true);
        expect(picker).toHaveBeenLastCalledWith({ mode: 'read', id: 'recording-studio' });
        await chooseRecordingDirectory();
        expect(picker).toHaveBeenLastCalledWith({ mode: 'readwrite', id: 'recording-studio' });
    });

    it('commits media before its checkpoint and reads the exact original bytes', async () => {
        const { handle, recording } = createDirectory();
        await saveDirectoryRecording(handle, recording);
        const snapshot = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 5 }] };
        await appendDirectoryRecordingChunk(handle, snapshot, snapshot.tracks[0].id, 0, new Blob(['take']));
        expect(await readDirectoryRecording(handle)).toEqual(snapshot);
        expect(await (await readDirectoryRecordingChunk(handle, snapshot.tracks[0], 0)).text()).toBe('take');
    });

    it('round-trips a shared edit recipe and segmented timing without copying or rekeying media', async () => {
        const { handle, recording, files } = createDirectory();
        const track = { ...recording.tracks[0], byteLength: 4, chunkCount: 1, segments: [
            { sourceStartSeconds: 0, sessionStartSeconds: 1, durationSeconds: 3 },
            { sourceStartSeconds: 3, sessionStartSeconds: 8, durationSeconds: 2 },
        ] };
        const stored = { ...recording, tracks: [track], trim: { startSeconds: 8, endSeconds: 9 } };
        await appendDirectoryRecordingChunk(handle, stored, track.id, 0, new Blob(['take']));
        const edited = { ...stored, editRecipe: createRecordingEditRecipe(stored) };
        await saveDirectoryRecording(handle, edited);
        expect(await readDirectoryRecording(handle)).toEqual(edited);
        expect(await (await readDirectoryRecordingChunk(handle, track, 0)).text()).toBe('take');
        expect(files.size).toBe(2);
        await saveDirectoryRecording(handle, { ...edited, tracks: [{ ...track, segments: [...track.segments].reverse() }] });
        await expect(readDirectoryRecording(handle)).rejects.toThrow('časové úseky');
    });

    it('keeps manually edited workshop metadata in a directory checkpoint and rejects malformed metadata', async () => {
        const { handle, recording, files } = createDirectory();
        const metadata = createRecordingWorkshopMetadata(recording, await getRecordingMediaRevision(recording));
        const edited = { ...recording, workshopMetadata: { ...metadata,
            activityIntervals: [{ ...metadata.activityIntervals[0]!, classification: 'automatic-coding' as const,
                origin: 'manual' as const, isReviewed: true }],
            events: [{ id: 'event-one', seconds: 2, title: 'Agent started', detail: 'Reviewed against video', type: 'agent' }],
        } };
        await saveDirectoryRecording(handle, edited);
        expect((await readDirectoryRecording(handle)).workshopMetadata).toEqual(edited.workshopMetadata);
        const malformed = { ...edited, workshopMetadata: { ...edited.workshopMetadata,
            commitAnchors: [{ id: 'anchor-one', seconds: 2, commit: { sha: 'invented' }, origin: 'manual', isReviewed: true }] } };
        files.set('recording.json', new Blob([JSON.stringify({ schemaVersion: 1, recording: malformed })]));
        await expect(readDirectoryRecording(handle)).rejects.toThrow(/platný popis/);
    });

    it('round-trips independently timed parts with their own audio setting and encoded bounds', async () => {
        const { handle, recording } = createDirectory();
        const part = { id: 'part-one', takeId: 'take-one', sessionStartSeconds: 1, durationSeconds: 2,
            byteLength: 4, chunkCount: 1, mimeType: 'video/webm', isAudioIncluded: false,
            mediaBounds: { firstTimestampSeconds: 0, availableStartTimestampSeconds: 0.04, endTimestampSeconds: 2,
                components: [{ kind: 'video' as const, firstTimestampSeconds: 0, endTimestampSeconds: 2 }] } };
        const stored = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1, parts: [part] }] };
        await saveDirectoryRecording(handle, stored);
        expect(await readDirectoryRecording(handle)).toEqual(stored);
    });

    it.each(['QuotaExceededError', 'NotAllowedError', 'UnknownError'])('retains the previous checkpoint on %s despite any optimistic quota estimate', async (name) => {
        const { handle, recording, failures, aborted } = createDirectory();
        await saveDirectoryRecording(handle, recording);
        const snapshot = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1 }] };
        failures.set('track-0-00000000.part', name);
        await expect(appendDirectoryRecordingChunk(handle, snapshot, snapshot.tracks[0].id, 0, new Blob(['take']))).rejects.toMatchObject({ name });
        expect(await readDirectoryRecording(handle)).toEqual(recording);
        expect(aborted).toHaveBeenCalledOnce();
    });

    it('does not advertise an orphan part when a disk fills between chunk and checkpoint close', async () => {
        const { handle, recording, failures, files } = createDirectory();
        await saveDirectoryRecording(handle, recording);
        failures.set('recording.json', 'QuotaExceededError');
        const snapshot = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1 }] };
        await expect(appendDirectoryRecordingChunk(handle, snapshot, snapshot.tracks[0].id, 0, new Blob(['take']))).rejects.toThrow();
        expect(await readDirectoryRecording(handle)).toEqual(recording);
        expect(await files.get('track-0-00000000.part')!.text()).toBe('take');
    });

    it('rejects denied reconnection and untrusted manifest filenames or unsafe byte counts', async () => {
        await expect(reconnectRecordingDirectory({ requestPermission: async () => 'denied' } as unknown as FileSystemDirectoryHandle)).rejects.toMatchObject({ name: 'NotAllowedError' });
        const { handle, recording, files } = createDirectory();
        for (const changes of [{ id: '../another-file' }, { byteLength: 2 ** 53 }]) {
            files.set('recording.json', new Blob([JSON.stringify({ schemaVersion: 1, recording: { ...recording, tracks: [{ ...recording.tracks[0], ...changes }] } })]));
            await expect(readDirectoryRecording(handle)).rejects.toThrow();
        }
    });
});
