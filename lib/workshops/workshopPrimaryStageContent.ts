/** The public sources a scheduled workshop can make primary on its stage. */
export const WORKSHOP_PRIMARY_STAGE_CONTENT_VALUES = ['video', 'presentation', 'repository'] as const;

export type WorkshopPrimaryStageContent = (typeof WORKSHOP_PRIMARY_STAGE_CONTENT_VALUES)[number];

export const WORKSHOP_PRIMARY_STAGE_CONTENT_OPTIONS: readonly {
    readonly value: WorkshopPrimaryStageContent;
    readonly label: string;
}[] = [
    { value: 'video', label: 'Video' },
    { value: 'presentation', label: 'Prezentace' },
    { value: 'repository', label: 'Repozitář' },
];

export const DEFAULT_WORKSHOP_PRIMARY_STAGE_CONTENT: WorkshopPrimaryStageContent = 'video';

/** Old rows and cached room responses keep the existing video-led behavior. */
export function normalizeWorkshopPrimaryStageContent(value: unknown): WorkshopPrimaryStageContent {
    return WORKSHOP_PRIMARY_STAGE_CONTENT_VALUES.includes(value as WorkshopPrimaryStageContent)
        ? (value as WorkshopPrimaryStageContent)
        : DEFAULT_WORKSHOP_PRIMARY_STAGE_CONTENT;
}

export function getWorkshopPrimaryStageContentLabel(value: WorkshopPrimaryStageContent): string {
    return WORKSHOP_PRIMARY_STAGE_CONTENT_OPTIONS.find((option) => option.value === value)?.label ?? 'Video';
}
