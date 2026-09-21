import { afterEach, describe, expect, it, vi } from 'vitest';
import { getVercelBuildLogExcerpt, sanitizeVercelDiagnostic } from '@/lib/vercel/vercelDeploymentDiagnostics';
import { WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH, WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH } from '@/lib/workshops/workshopVercelDeployment';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Vercel diagnostic projection', () => {
    it('redacts credentials before truncation and strips terminal escapes without removing useful error context', () => {
        vi.stubEnv('VERCEL_TOKEN', 'configured-vercel-token');
        vi.stubEnv('VERCEL_TEAM_ID', 'team_private');
        const result = sanitizeVercelDiagnostic([
            '\u001b[31mType error: src/index.ts:12\u001b[0m',
            'configured-vercel-token team_private',
            'Authorization: Bearer auth-secret',
            'API_KEY="quoted secret value" PASSWORD=unquoted-secret',
            'postgres://database-user:database-password@database.example/db',
            'https://example.com/?token=query-secret',
        ].join('\n'));
        expect(result).toContain('Type error: src/index.ts:12');
        expect(result).toContain('postgres://[skryto]@database.example/db');
        for (const secret of ['configured-vercel-token', 'team_private', 'auth-secret', 'quoted secret value', 'unquoted-secret', 'database-password', 'query-secret', '\u001b']) {
            expect(result).not.toContain(secret);
        }
        expect(sanitizeVercelDiagnostic('configured-vercel-token', 10)).toBe('[skryto]');
        expect(sanitizeVercelDiagnostic('x'.repeat(WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH + 10))?.length).toBe(WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH);
        expect(sanitizeVercelDiagnostic(' \u001b[0m ')).toBeNull();
    });

    it('keeps only the last log lines and preserves the final error even inside a long event', async () => {
        vi.stubEnv('VERCEL_TOKEN', 'configured-vercel-token');
        const lines = Array.from({ length: 50 }, (_, index) => `line-${index}: ${'x'.repeat(300)}`);
        const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify([
            { type: 'stderr', text: [...lines, 'Final error: Missing required environment variable API_KEY'].join('\n') },
        ])));
        vi.stubGlobal('fetch', fetchMock);
        const result = await getVercelBuildLogExcerpt('dpl_example');
        expect(result).toContain('Final error: Missing required environment variable API_KEY');
        expect(result).not.toContain('line-0:');
        expect(result!.length).toBeLessThanOrEqual(WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH);
        expect(result!.split('\n').length).toBeLessThanOrEqual(30);
    });
});
