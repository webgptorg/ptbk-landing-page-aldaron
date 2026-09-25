import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';

/** New ordinary materials have the same publication, timing and access in either creation flow. */
export function createWorkshopContentDefaults(
    defaultUnlockAt: string,
    sortOrder: number,
): Pick<WorkshopContentWriteValues, 'unlockAt' | 'sortOrder' | 'isPublished' | 'isFollowUp' | 'isPaidMembersOnly'> {
    return {
        unlockAt: defaultUnlockAt,
        sortOrder,
        isPublished: true,
        isFollowUp: false,
        isPaidMembersOnly: false,
    };
}
