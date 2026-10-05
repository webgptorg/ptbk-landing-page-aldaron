import type {
    RecordingMediaBounds,
    RecordingMediaPart,
    RecordingTrack,
    RecordingTrim,
    StudioRecording,
} from './recordingStudioTypes';

export const STUDIO_PATH = '/admin/studio';
export const STUDIO_RECORDING_PATH = `${STUDIO_PATH}/recording`;
export const STUDIO_EDITOR_PATH = `${STUDIO_PATH}/editor`;
export const STUDIO_PROJECT_VERSION = 1;
export const STUDIO_MAXIMUM_ACTIVE_TRACKS = 8;

export type StudioFileIdentity = {
    readonly name: string;
    readonly byteLength: number;
    readonly lastModified: number;
    /** Bounded head/tail signature used for relinking, alongside size, modification time and measured timing. */
    readonly signature: string;
};
export type StudioRecordingLocation = {
    readonly kind: 'recording';
    readonly recordingId: string;
    readonly trackId: string;
    readonly revision: string;
    readonly part: RecordingMediaPart;
};
export type StudioFileLocation = {
    readonly kind: 'file';
    readonly identity: StudioFileIdentity;
    readonly handle?: FileSystemFileHandle;
};
export type StudioAssetLocation =
    | StudioRecordingLocation
    | StudioFileLocation
    | { readonly kind: 'https'; readonly url: string }
    | { readonly kind: 's3'; readonly storageAssetId: string };

/** Identity and pinned timing are independent of where the bytes are currently read. */
export type StudioAsset = {
    readonly id: string;
    readonly label: string;
    readonly kind: 'video' | 'audio';
    readonly mimeType: string;
    readonly byteLength: number;
    readonly bounds: RecordingMediaBounds;
    readonly width: number | null;
    readonly height: number | null;
    readonly frameRate: number | null;
    readonly isAudioIncluded: boolean;
    /** Bounded content signature for explicit CDN relinking; never an authorization token. */
    readonly contentSignature?: string;
    readonly original: StudioRecordingLocation | StudioFileLocation | { readonly kind: 'https'; readonly url: string };
    readonly location: StudioAssetLocation;
};
export type StudioLogicalTrack = {
    readonly id: string;
    readonly label: string;
    readonly role: 'webcam' | 'editor' | 'application' | 'audio' | 'additional';
};
export type StudioPartGroup = {
    readonly id: string;
    readonly label: string;
    readonly projectStartSeconds: number;
    readonly durationSeconds: number;
    /** Common linked trim, in the group's original coordinates. */
    readonly sourceInSeconds: number;
    readonly sourceOutSeconds: number;
    readonly recordingId: string | null;
    readonly recordingRevision: string | null;
    readonly recordingSessionStartSeconds: number;
    readonly isInterrupted: boolean;
};
export type StudioClip = {
    readonly id: string;
    readonly groupId: string;
    readonly assetId: string;
    readonly trackId: string;
    readonly originSourceId: string | null;
    /** Immutable placement on the pinned recorder clock, retained when manual alignment changes the current offset. */
    readonly originGroupOffsetSeconds?: number;
    readonly groupOffsetSeconds: number;
    /** Relative to the immutable container origin, never prepared-export time. */
    readonly sourceInSeconds: number;
    readonly sourceOutSeconds: number;
};
export type StudioScene = {
    readonly id: string;
    readonly groupId: string;
    readonly offsetSeconds: number;
    readonly backgroundTrackId: string | null;
    readonly overlayTrackId: string | null;
    readonly audioTrackId: string | null;
    readonly mask: 'rectangle' | 'circle';
    readonly fit: 'contain' | 'cover';
    readonly overlayFit: 'contain' | 'cover';
    readonly rectangle: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
};
export type StudioProject = {
    readonly id: string;
    readonly schemaVersion: 1;
    readonly title: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly originRecordingId: string | null;
    readonly tracks: readonly StudioLogicalTrack[];
    readonly groups: readonly StudioPartGroup[];
    readonly clips: readonly StudioClip[];
    readonly scenes: readonly StudioScene[];
    readonly selection: RecordingTrim;
    /** Small immutable snapshots pin mappings/derived metadata when a recorder later appends material. */
    readonly recordingSnapshots: readonly { readonly revision: string; readonly recording: StudioRecording }[];
};
export type StudioPlacedClip = StudioClip & {
    readonly projectStartSeconds: number;
    readonly projectEndSeconds: number;
    readonly sourceStartSeconds: number;
};
export type StudioPlaybackTrack = RecordingTrack & { readonly activeClip?: StudioPlacedClip };

export function getStudioProjectPath(projectId: string): string {
    return `${STUDIO_EDITOR_PATH}/${encodeURIComponent(projectId)}`;
}
