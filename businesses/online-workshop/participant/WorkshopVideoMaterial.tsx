'use client';

import { WorkshopMaterialCard, type WorkshopMaterialCardContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopHostedRecordingPlayer } from '@/businesses/online-workshop/participant/WorkshopHostedRecordingPlayer';
import { createWorkshopVideoMaterialUrl } from '@/lib/workshops/workshopVideoMaterialUrl';

const WORKSHOP_VIDEO_MATERIAL_ID = 'workshop-video';
const WORKSHOP_VIDEO_MATERIAL_TITLE = 'Video z workshopu';

type WorkshopVideoMaterialProps = {
    /** A video ID from the member-safe workshop state; withheld recording IDs never reach this component. */
    readonly videoId?: string;
    readonly hostedRevisionId?: string;
    readonly workshopSlug?: string;
    readonly serverTime?: string;
    readonly isLive?: boolean;
    /** Applied only after the recorded end, when this live source is being opened as a replay. */
    readonly recordingStartOffsetSeconds?: number;
};

function createWorkshopVideoMarkdown(videoId: string, recordingStartOffsetSeconds: number): string {
    const watchUrl = createWorkshopVideoMaterialUrl(videoId, recordingStartOffsetSeconds);
    return `[Otevřít video z workshopu](<${watchUrl}>)`;
}

/** The video source occupies a normal special-material slot whenever another source is primary on stage. */
export function WorkshopVideoMaterial({ videoId, hostedRevisionId, workshopSlug, serverTime, isLive = false,
    recordingStartOffsetSeconds = 0 }: WorkshopVideoMaterialProps) {
    if (hostedRevisionId && workshopSlug && serverTime) {
        const contentBlock: WorkshopMaterialCardContent = {
            id: WORKSHOP_VIDEO_MATERIAL_ID, title: WORKSHOP_VIDEO_MATERIAL_TITLE,
            bodyMarkdown: '', isFollowUp: false, isPaidMembersOnly: false,
        };
        return <WorkshopMaterialCard contentBlock={contentBlock} ariaLabel="Video workshopu">
            <WorkshopHostedRecordingPlayer workshopSlug={workshopSlug} revisionId={hostedRevisionId}
                serverTime={serverTime} isLive={isLive} />
        </WorkshopMaterialCard>;
    }
    if (!videoId) return null;
    const contentBlock: WorkshopMaterialCardContent = {
        id: WORKSHOP_VIDEO_MATERIAL_ID,
        title: WORKSHOP_VIDEO_MATERIAL_TITLE,
        bodyMarkdown: createWorkshopVideoMarkdown(videoId, recordingStartOffsetSeconds),
        isFollowUp: false,
        isPaidMembersOnly: false,
    };

    return (
        <WorkshopMaterialCard
            contentBlock={contentBlock}
            callToActionLabel="Otevřít video"
            ariaLabel="Video workshopu"
            previewKind="video"
        />
    );
}
