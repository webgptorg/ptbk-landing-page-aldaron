import type {
    CommunityProject,
    CommunityProjectModerationStatus,
} from '@/lib/community-projects/communityProjectTypes';
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';

const ADMIN_COMMUNITY_PROJECTS_API_PATH = '/api/admin/community/projects';

async function readAdminCommunityProjectResponse<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as ResponseBody & { readonly error?: unknown };
    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Správu projektů se nepodařilo načíst.');
    }

    return body;
}

export async function fetchAdminCommunityProjects(status: WorkshopSubmissionStatus): Promise<readonly CommunityProject[]> {
    const searchParameters = new URLSearchParams({ status });
    const response = await fetch(`${ADMIN_COMMUNITY_PROJECTS_API_PATH}?${searchParameters}`, { cache: 'no-store' });
    const body = await readAdminCommunityProjectResponse<{ readonly projects: readonly CommunityProject[] }>(response);
    return body.projects;
}

export async function moderateAdminCommunityProject(
    projectId: string,
    status: CommunityProjectModerationStatus,
): Promise<void> {
    await requestAdminJson(`${ADMIN_COMMUNITY_PROJECTS_API_PATH}/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
}
