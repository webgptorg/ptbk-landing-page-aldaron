import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportRecordingArchive } from './recordingStudioExport';
import { createTestStudioRecording } from './recordingStudioTestUtilities';
import type { RecordingArchiveManifest } from './recordingStudioTypes';

const DOWNLOADS = vi.hoisted(() => ({ download: vi.fn(), read: vi.fn() }));
vi.mock('@/lib/downloadBlobFile', () => ({ downloadBlobFile: DOWNLOADS.download }));
vi.mock('./recordingStudioStorage', () => ({ readRecordingTrack: DOWNLOADS.read }));

describe('recording archive exports', () => {
    beforeEach(() => { DOWNLOADS.download.mockReset(); DOWNLOADS.read.mockReset().mockResolvedValue(new Blob(['original bytes'])); });
    it('preserves all original tracks and shared trim decisions in a real ZIP64 archive', async () => {
        const recording = createTestStudioRecording();
        await exportRecordingArchive({
            recording: { ...recording, tracks: recording.tracks.map((track) => ({ ...track, byteLength: 14, chunkCount: 1 })), trim: { startSeconds: 1, endSeconds: 4 } },
            destination: null, isTrimIncluded: false, signal: new AbortController().signal, onProgress: vi.fn(),
        });
        const reader = new ZipReader(new BlobReader(DOWNLOADS.download.mock.calls[0][0].blob));
        const entries = await reader.getEntries();
        expect(entries.map((entry) => entry.filename)).toEqual(['originals/01-camera.webm', 'originals/02-screen.webm', 'recording.json', 'README.txt']);
        for (const entry of entries.slice(0, 2)) {
            if (entry.directory) throw new Error('Expected file');
            expect(await entry.getData(new TextWriter())).toBe('original bytes');
        }
        const manifestEntry = entries[2];
        if (manifestEntry.directory) throw new Error('Expected manifest');
        const manifest = JSON.parse(await manifestEntry.getData(new TextWriter())) as RecordingArchiveManifest;
        expect(manifest.trim).toEqual({ startSeconds: 1, endSeconds: 4 });
        expect(manifest.isTrimIncluded).toBe(false);
        expect(manifest.tracks[1].startOffsetSeconds).toBe(0.002);
        await reader.close();
    });
    it('aborts a disk destination when the export is cancelled instead of closing a partial archive', async () => {
        const abort = vi.fn();
        const close = vi.fn();
        const writable = new WritableStream({ abort, close });
        const controller = new AbortController();
        controller.abort();
        await expect(exportRecordingArchive({
            recording: createTestStudioRecording(), destination: { createWritable: async () => writable } as unknown as FileSystemFileHandle,
            isTrimIncluded: false, signal: controller.signal, onProgress: vi.fn(),
        })).rejects.toThrow();
        expect(abort).toHaveBeenCalledOnce();
        expect(close).not.toHaveBeenCalled();
        expect(DOWNLOADS.download).not.toHaveBeenCalled();
    });
    it('does not begin an unbounded in-memory archive in browsers without a disk picker', async () => {
        const recording = createTestStudioRecording();
        await expect(exportRecordingArchive({
            recording: { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 300 * 1024 * 1024 }] },
            destination: null, isTrimIncluded: false, signal: new AbortController().signal, onProgress: vi.fn(),
        })).rejects.toThrow('velký ZIP');
        expect(DOWNLOADS.read).not.toHaveBeenCalled();
    });
});
