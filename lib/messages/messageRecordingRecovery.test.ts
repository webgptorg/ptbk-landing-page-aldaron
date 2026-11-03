import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { preserveMessageRecordingsInStudio } from './messageRecordingRecovery';
import { loadRecordingPart, localRecordingFile, saveRecordingChunk, saveRecordingPart } from './messageRecordingStorage';
import { claimTestRecordingStudioAuthority } from '@/lib/recording-studio/recordingStudioTestUtilities';
import { readRecordingTrack, readStudioRecording, deleteStudioRecording } from '@/lib/recording-studio/recordingStudioStorage';
import { RECORDING_STUDIO_AUTHORITY } from '@/lib/recording-studio/recordingStudioAuthority';
import type { MessageRecordingPart } from './messageRecordingTypes';

describe('existing message audio becomes a normal Recording Studio source', () => {
    it('migrates byte-exactly and idempotently, preserves paid text and never recreates a manually deleted backup', async () => {
        const part: MessageRecordingPart = { id: randomUUID(), recordingId: randomUUID(), scope: 'new', title: 'Older meeting',
            mimeType: 'audio/webm', status: 'recording', startedAt: '2026-11-03T10:00:00.000Z', endedAt: null, chunkCount: 0, byteLength: 0, transcript: 'Paid transcript' };
        await saveRecordingPart(part);
        const bytes = ['HEADER|', 'original|', 'END'];
        for (let sequence = 0; sequence < bytes.length; sequence++) await saveRecordingChunk({ partId: part.id, sequence, bytes: new Blob([bytes[sequence]]), synced: false });
        const authority = await claimTestRecordingStudioAuthority();
        try {
            await preserveMessageRecordingsInStudio(true); await preserveMessageRecordingsInStudio(true);
            const recording = (await readStudioRecording(part.id))!;
            expect(recording.status).toBe('interrupted'); expect(recording.tracks).toHaveLength(1);
            expect(recording.tracks[0].chunkCount).toBe(3);
            expect(recording.sourceConfiguration).toBeUndefined();
            expect(await (await readRecordingTrack(recording.id, recording.tracks[0])).text()).toBe('HEADER|original|END');
            const migrated = (await loadRecordingPart(part.id))!;
            expect(migrated.transcript).toBe('Paid transcript'); expect(migrated.studioRecordingId).toBe(part.id);
            expect(await (await localRecordingFile(migrated))!.text()).toBe('HEADER|original|END');
            await deleteStudioRecording(part.id); await preserveMessageRecordingsInStudio(true);
            expect(await readStudioRecording(part.id)).toBeUndefined();
        } finally { RECORDING_STUDIO_AUTHORITY.surrender(authority); }
    });
});
