import { scrapePublicWebPagePreview } from '@/lib/network/publicWebPagePreview';
import { fetchYoutubeVideoDurationSeconds } from '@/lib/youtube/fetchYoutubeVideoDuration';
import { WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { createWorkshopProjectPreviewFallback } from '@/lib/workshops/workshopProjectPreview';
import { getWorkshopRecordingDurationSeconds } from '@/lib/workshops/workshopRecordingDuration';
import type { WorkshopEventCardDetails, WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';

export type WorkshopEventCardDetailsSource = {
    readonly youtubeVideoId: string | null;
    readonly recordingStartOffsetSeconds: number;
    readonly repository: WorkshopRepository | null;
    readonly isRecordingAvailable: boolean;
};

/**
 * Resolves the public metadata of a project's deployed application when it has one.
 *
 * Note: The deployment address remains visible when its metadata cannot be read; only a project without a deployment
 *       falls back to its repository. A card never depends on another project's server being online. A project deployed in
 *       several places is previewed by the first of them, so one card costs one request however many addresses the
 *       project runs at.
 */
export async function createWorkshopProjectPreview(
    repository: WorkshopRepository | null,
): Promise<WorkshopProjectPreview | null> {
    if (repository === null) {
        return null;
    }

    const fallbackPreview = createWorkshopProjectPreviewFallback(repository);
    if (fallbackPreview.deploymentUrl === null) {
        return fallbackPreview;
    }

    try {
        const deploymentPreview = await scrapePublicWebPagePreview(fallbackPreview.deploymentUrl, {
            revalidateSeconds: WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
        });
        return {
            ...fallbackPreview,
            title: deploymentPreview.title || fallbackPreview.title,
            description: deploymentPreview.description,
            previewImageUrl: deploymentPreview.previewImageUrl,
        };
    } catch {
        return fallbackPreview;
    }
}

/**
 * Resolves the replay length without returning the video identifier a paid recording gate protects.
 */
async function loadWorkshopRecordingDurationSeconds(source: WorkshopEventCardDetailsSource): Promise<number | null> {
    if (!source.isRecordingAvailable || source.youtubeVideoId === null) {
        return null;
    }

    try {
        const totalVideoDurationSeconds = await fetchYoutubeVideoDurationSeconds({
            videoId: source.youtubeVideoId,
            revalidateSeconds: WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS,
        });
        return getWorkshopRecordingDurationSeconds(totalVideoDurationSeconds, source.recordingStartOffsetSeconds);
    } catch {
        return null;
    }
}

/**
 * Builds the safe, compact projection used by every community event mini card.
 *
 * Note: This is intentionally separate from `WorkshopDetails`: a card receives project metadata and a calculated
 *       duration, never feedback, participant identity, the gated YouTube ID, or room settings.
 */
export async function createWorkshopEventCardDetails(
    source: WorkshopEventCardDetailsSource,
): Promise<WorkshopEventCardDetails> {
    const [project, recordingDurationSeconds] = await Promise.all([
        createWorkshopProjectPreview(source.repository),
        loadWorkshopRecordingDurationSeconds(source),
    ]);

    return { project, recordingDurationSeconds };
}
