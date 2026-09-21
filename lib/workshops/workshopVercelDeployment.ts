import { z } from 'zod';

export const WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH = 2_000;
export const WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH = 6_000;

/** Only this small projection of a Vercel deployment reaches the administrator's browser. */
export const WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA = z.object({
    id: z.string().regex(/^dpl_[a-zA-Z0-9]+$/),
    state: z.enum(['INITIALIZING', 'QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELED', 'BLOCKED']),
    deploymentUrl: z.string().url().nullable(),
    inspectorUrl: z.string().url().nullable(),
    failure: z.object({
        stage: z.enum(['build', 'alias']),
        code: z.string().max(WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH).nullable(),
        message: z.string().max(WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH).nullable(),
        buildLog: z.string().max(WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH).nullable(),
    }).nullish(),
});

export type WorkshopVercelDeployment = z.infer<typeof WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA>;

export function isWorkshopVercelDeploymentFailed(deployment: WorkshopVercelDeployment): boolean {
    return deployment.state === 'ERROR' || deployment.state === 'CANCELED' || deployment.state === 'BLOCKED';
}

export const WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS = 3_000;
export const WORKSHOP_VERCEL_DEPLOYMENT_TIMEOUT_MILLISECONDS = 15 * 60_000;
