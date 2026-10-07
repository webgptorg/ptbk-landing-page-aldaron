import type { StudioRecordingLocation } from '../lib/recording-studio/studioProjectTypes';
export function readStudioRequest<Result>(request: IDBRequest<Result>): Promise<Result>;
export function openStudioReadDatabase(): Promise<IDBDatabase>;
export function readStudioRecordingRange(
    database: IDBDatabase,
    location: StudioRecordingLocation,
    start: number,
    end: number,
    signal?: AbortSignal,
): Promise<Blob>;
export function parseStudioByteRange(
    value: string | null,
    byteLength: number,
): { start: number; end: number; isPartial: boolean } | null;
