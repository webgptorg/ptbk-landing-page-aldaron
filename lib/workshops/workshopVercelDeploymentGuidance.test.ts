import { describe, expect, it } from 'vitest';
import { getWorkshopVercelDeploymentGuidance } from '@/lib/workshops/workshopVercelDeploymentGuidance';
import type { WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

const FAILED_DEPLOYMENT: WorkshopVercelDeployment = { id: 'dpl_example', state: 'ERROR', deploymentUrl: null, inspectorUrl: null };

describe('guidance based on Vercel build diagnostics', () => {
    it.each([
        ['Missing required environment variable DATABASE_URL', 'Environment Variables'],
        ['Environment variable API_KEY is not defined', 'Environment Variables'],
        ['JavaScript heap out of memory', 'nedostatek paměti'],
        ['BUILD_EXCEEDED_MAXIMUM_TIME', 'nedokončil včas'],
        ['The specified Root Directory does not exist', 'Root Directory'],
        ['No Output Directory named public found', 'Output Directory'],
        ['Type error: Type string is not assignable to number', 'chybu kompilace nebo typů'],
        ['src/room/page.tsx:12\nType error: Type string is not assignable to number', 'chybu kompilace nebo typů'],
        ['Module not found: Cannot resolve example', 'package.json'],
        ['ERR_PNPM_OUTDATED_LOCKFILE', 'lockfile'],
        ['An internal error occurred', 'Zkuste nasazení za chvíli'],
    ])('offers a relevant next step for %s', (message, expectedStep) => {
        const guidance = getWorkshopVercelDeploymentGuidance({ ...FAILED_DEPLOYMENT, failure: {
            stage: 'build', code: 'BUILD_FAILED', message: 'Command exited with 1', buildLog: message,
        } });
        expect(guidance.steps.join('\n')).toContain(expectedStep);
    });

    it('does not blame missing configuration just because a normal log line mentions environment variables', () => {
        const guidance = getWorkshopVercelDeploymentGuidance({ ...FAILED_DEPLOYMENT, failure: {
            stage: 'build', code: null, message: null, buildLog: 'Environment variables loaded\nType error: failed to compile',
        } });
        expect(guidance.steps.join('\n')).toContain('chybu kompilace nebo typů');
        expect(guidance.steps.join('\n')).not.toContain('Environment Variables');
    });
});
