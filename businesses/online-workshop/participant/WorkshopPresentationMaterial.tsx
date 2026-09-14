'use client';

import {
    WorkshopMaterialCard,
    type WorkshopMaterialCardContent,
} from '@/businesses/online-workshop/participant/WorkshopContent';

const WORKSHOP_PRESENTATION_MATERIAL_ID = 'presentation';
const WORKSHOP_PRESENTATION_TITLE = 'Prezentace';
const WORKSHOP_PRESENTATION_CALL_TO_ACTION_LABEL = 'Otevřít prezentaci';

type WorkshopPresentationMaterialProps = {
    /** A normalized public address supplied by the workshop setting. */
    readonly presentationUrl: string;
};

/**
 * Makes the one static link whose title stays stable across PDF, PowerPoint, and Markdown presentations.
 */
function createWorkshopPresentationMarkdown(presentationUrl: string): string {
    // An angle-bracket destination keeps an otherwise valid public URL with parentheses from ending the Markdown
    // link early. `normalizePublicWebPageUrl` already turns angle brackets themselves into escaped URL characters.
    return `[${WORKSHOP_PRESENTATION_TITLE}](<${presentationUrl}>)`;
}

/**
 * A workshop-level presentation in the shared material-card format.
 *
 * Note: It deliberately has no unlock date or membership flag. Those rules apply only to ordinary content blocks,
 *       while the presentation is available to every participant as soon as the room is open.
 */
export function WorkshopPresentationMaterial({ presentationUrl }: WorkshopPresentationMaterialProps) {
    const presentationMaterial: WorkshopMaterialCardContent = {
        id: WORKSHOP_PRESENTATION_MATERIAL_ID,
        title: WORKSHOP_PRESENTATION_TITLE,
        bodyMarkdown: createWorkshopPresentationMarkdown(presentationUrl),
        isFollowUp: false,
        isPaidMembersOnly: false,
    };

    return (
        <WorkshopMaterialCard
            contentBlock={presentationMaterial}
            callToActionLabel={WORKSHOP_PRESENTATION_CALL_TO_ACTION_LABEL}
            ariaLabel="Prezentace workshopu"
        />
    );
}
