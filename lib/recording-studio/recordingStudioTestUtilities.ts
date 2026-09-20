import type { StudioRecording } from './recordingStudioTypes';

export function createTestStudioRecording(): StudioRecording {
    return {
        id: 'test-recording', title: 'Test recording', createdAt: '2026-09-20T12:00:00.000Z', status: 'complete',
        durationSeconds: 10, trim: null, errorMessage: null,
        tracks: ['camera', 'screen'].map((kind, index) => ({
            id: `track-${index}`, kind: kind as 'camera' | 'screen', label: `${kind} ${index}`, mimeType: 'video/webm',
            byteLength: 0, chunkCount: 0, startOffsetSeconds: index * 0.002, durationSeconds: 10 - index * 0.002,
            width: 1280, height: 720, frameRate: 30, isAudioIncluded: index === 1,
        })),
    };
}
