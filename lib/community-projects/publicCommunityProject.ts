import { loadCommunityProjectById } from '@/lib/community-projects/communityProjectDatabase';
import { communityProjectIdSchema } from '@/lib/community-projects/communityProjectSchemas';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { cache } from 'react';

/** Share the page's anonymous visibility check with metadata and image requests. */
export const loadPublicCommunityProject = cache(async (projectId: string) => {
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        return null;
    }

    const database = getWorkshopDatabaseOrNull();
    if (database === null) {
        return null;
    }

    const { project } = await loadCommunityProjectById(database, projectId, null);
    return project;
});
