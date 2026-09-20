import { WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA, type WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

const WORKSHOP_DEPLOYMENT_API_PATH = '/api/admin/workshops/repository/deployment';

async function requestWorkshopDeployment(url: string, options: RequestInit): Promise<WorkshopVercelDeployment> {
    const response = await fetch(url, { ...options, credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json() as { readonly deployment?: unknown; readonly error?: string };
    const parsed = WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA.safeParse(result.deployment);
    if (!response.ok || !parsed.success) {
        throw new Error(result.error ?? 'Nasazení se nepodařilo načíst. Zkuste akci znovu.');
    }
    return parsed.data;
}

export function startWorkshopRepositoryDeployment(repositoryUrl: string, signal: AbortSignal) {
    return requestWorkshopDeployment(WORKSHOP_DEPLOYMENT_API_PATH, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository: { url: repositoryUrl, deploymentUrls: [] } }),
    });
}

export function fetchWorkshopRepositoryDeployment(deploymentId: string, signal: AbortSignal) {
    const parameters = new URLSearchParams({ deploymentId });
    return requestWorkshopDeployment(`${WORKSHOP_DEPLOYMENT_API_PATH}?${parameters}`, { signal });
}
