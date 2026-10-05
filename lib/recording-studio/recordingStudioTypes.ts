export const RECORDING_STUDIO_PATH = '/admin/recording-studio';
export const RECORDING_CHUNK_MILLISECONDS = 1_000;
export const RECORDING_VIDEO_BITS_PER_SECOND = 8_000_000;
export const RECORDING_AUDIO_BITS_PER_SECOND = 192_000;
export const RECORDING_STORAGE_RESERVE_BYTES = 64 * 1024 * 1024;
export const RECORDING_MAX_PENDING_BYTES = 64 * 1024 * 1024;
export const RECORDING_STUDIO_LOCK = 'promptbook-recording-studio';

export type RecordingSourceKind = 'camera' | 'screen' | 'microphone';
export type RecordingDisplaySurface = 'browser' | 'window' | 'monitor';
export type RecordingSourceReadiness = 'ready' | 'needs-permission' | 'disconnected' | 'temporarily-unavailable' | 'unavailable';

/** Browser-local, serializable source intent. It never contains permission or live media state. */
export type RecordingSourceConfiguration = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly cameraDeviceId: string;
    readonly cameraDeviceLabel: string | null;
    readonly microphoneDeviceId: string;
    readonly microphoneDeviceLabel: string | null;
    readonly displaySurface: RecordingDisplaySurface | null;
    readonly displaySourceLabel: string | null;
    readonly isCaptureEnabled: boolean;
    readonly isAudioEnabled: boolean;
};

export type RecordingSource = RecordingSourceConfiguration & {
    readonly stream: MediaStream;
    readonly microphoneLabel: string | null;
};

export type RecordingTrim = {
    readonly startSeconds: number;
    readonly endSeconds: number;
};

/** Rate-one mapping; holes between segments stay holes on the session clock. */
export type RecordingTimeSegment = {
    readonly sourceStartSeconds: number;
    readonly sessionStartSeconds: number;
    readonly durationSeconds: number;
};

/** One independently playable, immutable MediaRecorder run. Its ID is the storage key. */
export type RecordingMediaPart = {
    readonly id: string;
    readonly takeId: string;
    readonly sessionStartSeconds: number;
    readonly durationSeconds: number;
    readonly byteLength: number;
    readonly chunkCount: number;
    readonly mimeType: string;
    /** Legacy single-file recordings can map several separated session intervals into one file. */
    readonly segments?: readonly RecordingTimeSegment[];
    /** Capture settings belong to this file; a later take may change camera audio. */
    readonly isAudioIncluded?: boolean;
    readonly width?: number | null;
    readonly height?: number | null;
    readonly frameRate?: number | null;
    /** Decoded container bounds, measured after the recorder's final chunk was committed. */
    readonly mediaBounds?: RecordingMediaBounds;
    /** Container seek index as it was checked when this part closed; absent on parts recorded before that check. */
    readonly indexStatus?: import('./recordingStudioIndex').RecordingIndexStatus;
};

export type RecordingTake = {
    readonly id: string;
    readonly startedAt: string;
    readonly sessionStartSeconds: number;
    readonly durationSeconds: number;
    readonly sourceIds: readonly string[];
    readonly sourceConfiguration?: readonly RecordingSourceConfiguration[];
};

export type RecordingEditRecipe = {
    readonly schemaVersion: 1;
    readonly timeUnit: 'seconds';
    readonly selection: RecordingTrim;
    readonly preparedTimeZeroSessionSeconds: number;
    readonly sources: readonly { readonly sourceId: string; readonly segments: readonly RecordingTimeSegment[] }[];
};

export type RecordingMediaComponent = {
    readonly kind: 'video' | 'audio';
    readonly firstTimestampSeconds: number;
    readonly endTimestampSeconds: number;
};

export type RecordingMediaBounds = {
    readonly firstTimestampSeconds: number;
    readonly availableStartTimestampSeconds: number;
    readonly endTimestampSeconds: number;
    readonly components: readonly RecordingMediaComponent[];
};

export type RecordingTrack = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly mimeType: string;
    readonly byteLength: number;
    readonly chunkCount: number;
    readonly startOffsetSeconds: number;
    readonly durationSeconds: number;
    readonly width: number | null;
    readonly height: number | null;
    readonly frameRate: number | null;
    readonly isAudioIncluded: boolean;
    /** Missing on older takes. On camera files, the microphone which supplied embedded audio. */
    readonly audioSourceLabel?: string | null;
    readonly segments?: readonly RecordingTimeSegment[];
    /** Absent on legacy single-file recordings. Parts are never concatenated as container bytes. */
    readonly parts?: readonly RecordingMediaPart[];
};

export type RecordingDerivedProvenance = {
    readonly sourceId: string;
    readonly sourceLabel: string;
    /** SHA-256 of committed media, takes and session mappings; excludes title and trim. */
    readonly mediaRevision: string;
    readonly createdAt: string;
    readonly language: 'cs' | 'en' | 'mul' | null;
    readonly processor: string;
    readonly settings: Readonly<Record<string, string | number | boolean>>;
};

export type RecordingSubtitleCue = {
    readonly id: string;
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly text: string;
    readonly isEnabled: boolean;
    readonly origin: 'generated' | 'manual';
};

export type RecordingSpeechInterval = {
    readonly id: string;
    readonly type: 'speech' | 'silence' | 'uncertain' | 'unknown';
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly origin: 'generated' | 'manual';
    /** The detector does not expose calibrated confidence, so this is normally absent. */
    readonly confidence?: number;
};

export type RecordingDerivedTrack = {
    readonly id: string;
    readonly kind: 'subtitles';
    readonly provenance: RecordingDerivedProvenance;
    readonly cues: readonly RecordingSubtitleCue[];
} | {
    readonly id: string;
    readonly kind: 'speech-activity';
    readonly provenance: RecordingDerivedProvenance;
    readonly intervals: readonly RecordingSpeechInterval[];
};

export type RecordingWorkshopActivityInterval = RecordingTrim & {
    readonly id: string;
    readonly classification: 'active' | 'automatic-coding' | 'unclassified';
    readonly origin: 'manual' | 'speech-suggestion' | 'initial';
    readonly isReviewed: boolean;
    /** Retained after manual edits, so a suggested boundary remains traceable to its audio revision. */
    readonly suggestedFrom?: { readonly speechTrackId: string; readonly audioSourceId: string; readonly mediaRevision: string };
};

export type RecordingWorkshopEvent = {
    readonly id: string;
    readonly seconds: number;
    readonly title: string;
    readonly detail: string;
    readonly type: string;
};

export type RecordingWorkshopScene = 'editor' | 'application';
export type RecordingWorkshopSceneTransition = {
    readonly id: string;
    readonly seconds: number;
    readonly scene: RecordingWorkshopScene;
    readonly isReviewed: boolean;
};

export type RecordingWorkshopCommit = {
    readonly sha: string;
    /** A failed provider check is unknown; only an editor's explicit review marks a SHA unavailable. */
    readonly availability: 'verified' | 'unavailable' | 'unverified';
    readonly checkedAt: string;
    readonly committedAt: string | null;
    readonly message: string | null;
};

export type RecordingWorkshopCommitAnchor = {
    readonly id: string;
    readonly seconds: number;
    readonly commit: RecordingWorkshopCommit;
    readonly origin: 'manual' | 'timestamp-proposal';
    readonly isReviewed: boolean;
};

/** Original session seconds. All edits live with the browser-local recording and never alter media. */
export type RecordingWorkshopMetadata = {
    readonly schemaVersion: 1;
    readonly sourceRevision: string;
    readonly activityIntervals: readonly RecordingWorkshopActivityInterval[];
    readonly events: readonly RecordingWorkshopEvent[];
    readonly autoView: {
        readonly defaultScene: RecordingWorkshopScene;
        readonly isDefaultReviewed: boolean;
        readonly editorSourceId: string | null;
        readonly applicationSourceId: string | null;
        readonly transitions: readonly RecordingWorkshopSceneTransition[];
    };
    readonly repository: {
        readonly owner: string;
        readonly name: string;
        readonly branch: import('@/lib/github/githubRepository').GithubBranchSelection;
    } | null;
    readonly startingCommit: RecordingWorkshopCommit | null;
    readonly commitAnchors: readonly RecordingWorkshopCommitAnchor[];
    /** Explicit calibration; Git timestamps by themselves are never a recording clock. */
    readonly calibration: { readonly sessionSeconds: number; readonly wallClockAtSessionSeconds: string } | null;
};

export type StudioRecording = {
    readonly id: string;
    readonly title: string;
    readonly createdAt: string;
    readonly status: 'recording' | 'complete' | 'interrupted';
    readonly durationSeconds: number;
    readonly tracks: readonly RecordingTrack[];
    readonly takes?: readonly RecordingTake[];
    readonly trim: RecordingTrim | null;
    readonly editRecipe?: RecordingEditRecipe;
    /** Independent, non-destructive browser-local metadata revisions. */
    readonly derivedTracks?: readonly RecordingDerivedTrack[];
    readonly workshopMetadata?: RecordingWorkshopMetadata;
    readonly errorMessage: string | null;
    /** Immutable source preferences for this take; absent on older recordings. */
    readonly sourceConfiguration?: readonly RecordingSourceConfiguration[];
    /** End requested on the same capture clock; null means a crash left the tail unknown. */
    readonly captureEndSeconds?: number | null;
};

/** How one exported original relates to the container the recorder wrote. */
export type RecordingArchiveIndexState = {
    readonly status: import('./recordingStudioIndex').RecordingIndexStatus;
    /** True when the container index was written by this studio around unchanged media packets. */
    readonly isIndexRebuilt: boolean;
    readonly reason?: string;
};

export type RecordingArchiveTrack = RecordingTrack & {
    readonly originalFile: string | null;
    readonly originalParts?: readonly ({ readonly partId: string; readonly takeId: string; readonly file: string;
        readonly sessionStartSeconds: number; readonly durationSeconds: number } & Partial<RecordingArchiveIndexState>)[];
    readonly trimmedFile: string | null;
    /** Present when the export inspected the container, distinct from recorder-observed times. */
    readonly originalMedia?: RecordingMediaBounds;
    readonly preparation?: {
        readonly status: 'prepared' | 'original-and-recipe';
        readonly reason?: string;
        readonly processing?: string;
        readonly firstTimestampSeconds?: number;
        readonly endTimestampSeconds?: number;
        readonly originalContainerOriginSeconds?: number;
        readonly components?: readonly RecordingMediaComponent[];
        readonly videoFrameRate?: number | null;
        readonly preparedTimeZeroSessionSeconds: number;
    };
};

export type RecordingArchiveManifest = Pick<StudioRecording, 'id' | 'title' | 'createdAt' | 'status' | 'errorMessage' | 'durationSeconds' | 'trim' | 'captureEndSeconds' | 'sourceConfiguration' | 'takes'> & {
    readonly schemaVersion: 5;
    readonly timeUnit: 'seconds';
    readonly editRecipe: RecordingEditRecipe;
    readonly isTrimIncluded: boolean;
    readonly tracks: readonly RecordingArchiveTrack[];
    readonly derivedTracks: readonly { readonly id: string; readonly kind: RecordingDerivedTrack['kind']; readonly provenance: RecordingDerivedProvenance; readonly originalFiles: readonly string[]; readonly preparedFiles: readonly string[] }[];
    /** Only in standalone manifest downloads; ZIP stores these as independent sidecars. */
    readonly derivedTrackData?: readonly RecordingDerivedTrack[];
    readonly workshopMetadata: {
        readonly sourceRevision: string;
        readonly currentRevision: string;
        readonly isSourceRevisionStale: boolean;
        readonly originalFile: string | null;
        readonly preparedFile: string | null;
    } | null;
    /** Original session coordinates and provenance, retained even when prepared sidecars are clipped. */
    readonly workshopMetadataData?: RecordingWorkshopMetadata;
    readonly timing: string;
    readonly missingRanges: readonly { readonly trackId: string; readonly startSeconds: number; readonly endSeconds: number | null }[];
};

export type RecordingStorageEstimate = {
    readonly headroomBytes: number | null;
    readonly quotaBytes: number | null;
    readonly usageBytes: number | null;
    readonly measuredAt: number | null;
    readonly status: 'available' | 'unsupported' | 'failed';
};

export type RecordingPersistence = 'granted' | 'not-granted' | 'denied' | 'unsupported' | 'failed';
