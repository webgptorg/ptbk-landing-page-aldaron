import { clipRecordingDerivedTrack, serializeRecordingActivity, serializeRecordingSubtitleMetadata, serializeRecordingSubtitles } from './recordingStudioDerived';
import type { RecordingDerivedTrack, StudioRecording } from './recordingStudioTypes';

export type RecordingDerivedFile = { readonly filename: string; readonly content: string; readonly type: string;
    readonly trackId: string; readonly sourceId: string; readonly coordinate: 'original-session' | 'prepared-export' };

/** All sidecars use the same saved selection and zero as media preparation. */
export function getRecordingDerivedFiles(recording: StudioRecording, fileStem: string, isPrepared: boolean): RecordingDerivedFile[] {
    if (isPrepared && !recording.trim) return [];
    return (recording.derivedTracks ?? []).flatMap((stored) => {
        const track = isPrepared ? clipRecordingDerivedTrack(stored, recording.trim!) : stored;
        const coordinate = isPrepared ? 'prepared-export' as const : 'original-session' as const;
        const sourceIndex = recording.tracks.findIndex((source) => source.id === track.provenance.sourceId);
        const sourceNumber = sourceIndex < 0 ? 'missing' : String(sourceIndex + 1).padStart(2, '0');
        const prefix = `metadata/${isPrepared ? 'prepared' : 'original'}/${fileStem}-${sourceNumber}-${track.provenance.sourceId}-${track.kind}-${track.id}`;
        const file = (extension: string, content: string, type: string): RecordingDerivedFile => ({ filename: `${prefix}.${extension}`, content, type,
            trackId: track.id, sourceId: track.provenance.sourceId, coordinate });
        if (track.kind === 'subtitles') return [file('srt', serializeRecordingSubtitles(track, 'srt'), 'application/x-subrip; charset=utf-8'),
            file('vtt', serializeRecordingSubtitles(track, 'vtt'), 'text/vtt; charset=utf-8'),
            file('json', serializeRecordingSubtitleMetadata(track, coordinate), 'application/json; charset=utf-8')];
        return [file('json', serializeRecordingActivity(track, coordinate, 'json'), 'application/json; charset=utf-8'),
            file('csv', serializeRecordingActivity(track, coordinate, 'csv'), 'text/csv; charset=utf-8')];
    });
}

export function getRecordingDerivedManifestEntries(recording: StudioRecording, files: readonly RecordingDerivedFile[]) {
    return (recording.derivedTracks ?? []).map((track: RecordingDerivedTrack) => ({ id: track.id, kind: track.kind, provenance: track.provenance,
        originalFiles: files.filter((file) => file.trackId === track.id && file.coordinate === 'original-session').map((file) => file.filename),
        preparedFiles: files.filter((file) => file.trackId === track.id && file.coordinate === 'prepared-export').map((file) => file.filename) }));
}
