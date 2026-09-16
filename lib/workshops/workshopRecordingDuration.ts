/**
 * The part of a workshop recording a member can actually replay after its configured start offset.
 *
 * Note: The offset removes only the waiting-room part of a replay. It never changes the underlying YouTube video or
 *       the live workshop schedule.
 */
export function getWorkshopRecordingDurationSeconds(
    totalVideoDurationSeconds: number | null,
    recordingStartOffsetSeconds: number,
): number | null {
    if (
        totalVideoDurationSeconds === null ||
        !Number.isSafeInteger(totalVideoDurationSeconds) ||
        totalVideoDurationSeconds <= 0 ||
        !Number.isSafeInteger(recordingStartOffsetSeconds) ||
        recordingStartOffsetSeconds < 0
    ) {
        return null;
    }

    const recordingDurationSeconds = totalVideoDurationSeconds - recordingStartOffsetSeconds;
    return recordingDurationSeconds > 0 ? recordingDurationSeconds : null;
}
