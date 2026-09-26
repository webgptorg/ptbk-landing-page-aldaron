/** Creates the same shareable YouTube address used by the participant-facing video material. */
export function createWorkshopVideoMaterialUrl(videoId: string, recordingStartOffsetSeconds: number): string {
    const startTime = recordingStartOffsetSeconds > 0 ? `&t=${recordingStartOffsetSeconds}s` : '';
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}${startTime}`;
}
