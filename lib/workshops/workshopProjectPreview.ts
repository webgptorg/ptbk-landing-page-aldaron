import { formatGithubRepositoryName } from '@/lib/github/githubRepository';
import { formatWorkshopDeploymentName, getPrimaryWorkshopDeploymentUrl } from '@/lib/workshops/workshopDeployments';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';

/** Keeps the deployed application recognizable while its metadata is loading or unavailable. */
export function createWorkshopProjectPreviewFallback(repository: WorkshopRepository): WorkshopProjectPreview {
    const repositoryName = formatGithubRepositoryName(repository);
    const deploymentUrl = getPrimaryWorkshopDeploymentUrl(repository.deploymentUrls);

    return {
        title: deploymentUrl === null ? repositoryName : formatWorkshopDeploymentName(deploymentUrl),
        description: '',
        previewImageUrl: null,
        repositoryName,
        deploymentUrl,
    };
}
