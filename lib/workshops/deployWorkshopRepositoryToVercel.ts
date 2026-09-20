import { createHash } from 'node:crypto';
import { z } from 'zod';
import { formatGithubRepositoryName, type GithubRepository } from '@/lib/github/githubRepository';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';
import { requestVercel, VercelApiError } from '@/lib/vercel/vercelApi';
import { WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA, type WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

const VERCEL_PROJECT_SCHEMA = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    link: z.object({
        type: z.literal('github'),
        org: z.string(),
        repo: z.string(),
        productionBranch: z.string().min(1),
    }).nullish(),
});
const VERCEL_DEPLOYMENT_SCHEMA = z.object({
    id: WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA.shape.id,
    readyState: WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA.shape.state,
    alias: z.array(z.string()).default([]),
    aliasAssigned: z.boolean().default(false),
    aliasError: z.object({ code: z.string() }).nullish(),
    inspectorUrl: z.string().nullish(),
});
const VERCEL_CREATED_DEPLOYMENT_SCHEMA = VERCEL_DEPLOYMENT_SCHEMA.pick({ id: true });
const VERCEL_PROJECT_NAME_PREFIX = 'workshop-';
const VERCEL_PROJECT_NAME_READABLE_LENGTH = 65;
const VERCEL_PROJECT_NAME_HASH_LENGTH = 12;

/** One project per repository in the configured account, including retries and other workshop terms. */
function createVercelProjectName(repository: GithubRepository): string {
    const repositoryName = formatGithubRepositoryName(repository).toLowerCase();
    const readableName = repositoryName.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-')
        .slice(0, VERCEL_PROJECT_NAME_READABLE_LENGTH).replace(/-+$/, '');
    const hash = createHash('sha256').update(repositoryName).digest('hex').slice(0, VERCEL_PROJECT_NAME_HASH_LENGTH);
    return `${VERCEL_PROJECT_NAME_PREFIX}${readableName}-${hash}`;
}

async function findOrCreateVercelProject(repository: GithubRepository) {
    const name = createVercelProjectName(repository);
    const path = `/v9/projects/${encodeURIComponent(name)}`;
    try {
        return await requestVercel(path, VERCEL_PROJECT_SCHEMA);
    } catch (error) {
        if (!(error instanceof VercelApiError) || error.status !== 404) throw error;
    }

    try {
        return await requestVercel('/v11/projects', VERCEL_PROJECT_SCHEMA, {
            name,
            gitRepository: { type: 'github', repo: formatGithubRepositoryName(repository) },
            // Participants receive the production alias; previews keep Vercel's standard protection.
            ssoProtection: { deploymentType: 'prod_deployment_urls_and_all_previews' },
        });
    } catch (error) {
        // Another request can finish creating the same project between our lookup and creation.
        if (!(error instanceof VercelApiError) || error.status !== 409) throw error;
        return requestVercel(path, VERCEL_PROJECT_SCHEMA);
    }
}

/** Import the original repository, keeping future Git pushes connected to this same Vercel project. */
export async function deployWorkshopRepositoryToVercel(repository: GithubRepository): Promise<WorkshopVercelDeployment> {
    const project = await findOrCreateVercelProject(repository);
    const link = project.link;
    if (link == null || link.org.toLowerCase() !== repository.owner.toLowerCase()
        || link.repo.toLowerCase() !== repository.name.toLowerCase()) {
        throw new VercelApiError('Stejnojmenný projekt ve Vercelu není připojen k tomuto repozitáři.', 409);
    }

    const deployment = await requestVercel('/v13/deployments?skipAutoDetectionConfirmation=1', VERCEL_CREATED_DEPLOYMENT_SCHEMA, {
        name: project.name,
        project: project.id,
        target: 'production',
        gitSource: { type: 'github', org: link.org, repo: link.repo, ref: link.productionBranch },
        // Empty settings let Vercel detect the repository's framework and build configuration.
        projectSettings: {},
    });
    return getWorkshopVercelDeployment(deployment.id);
}

function readVercelInspectorUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    const url = normalizePublicWebPageUrl(value);
    return url !== null && new URL(url).origin === 'https://vercel.com' ? url : null;
}

/** Wait for the assigned production alias, never a temporary build URL or a guessed project hostname. */
export async function getWorkshopVercelDeployment(deploymentId: string): Promise<WorkshopVercelDeployment> {
    const deployment = await requestVercel(`/v13/deployments/${encodeURIComponent(deploymentId)}`, VERCEL_DEPLOYMENT_SCHEMA);
    const state = deployment.aliasError == null ? deployment.readyState : 'ERROR';
    const deploymentUrls = state === 'READY' && deployment.aliasAssigned
        ? deployment.alias.map((alias) => normalizePublicWebPageUrl(`https://${alias}`)).filter((url) => url !== null)
        : [];

    return {
        id: deployment.id,
        state,
        deploymentUrl: deploymentUrls[0] ?? null,
        inspectorUrl: readVercelInspectorUrl(deployment.inspectorUrl),
    };
}
