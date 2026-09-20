import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { GITHUB_COMMIT_SHA_PATTERN } from '@/lib/github/githubCommitSha';
import { findWorkshopRepositoryCommitByDate, resolveWorkshopRepositoryCommit } from '@/lib/workshops/fetchWorkshopRepositoryCommitRange';
import { workshopRepositoryWriteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const COMMIT_LOOKUP_SCHEMA = z.object({
    repository: workshopRepositoryWriteSchema,
    lookup: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('id'), commitId: z.string().trim().regex(GITHUB_COMMIT_SHA_PATTERN) }),
        z.object({ kind: z.literal('date'), boundary: z.enum(['start', 'end']), date: z.string().datetime() }),
    ]),
});

/** A preview of unsaved project settings; this endpoint never changes a workshop. */
export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse !== null) return unauthorizedResponse;
    const parsed = COMMIT_LOOKUP_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) return NextResponse.json({ error: 'Ověřte repozitář, větve, ID commitu a datum.' }, { status: 400 });
    const { repository, lookup } = parsed.data;
    try {
        const commit = lookup.kind === 'id'
            ? await resolveWorkshopRepositoryCommit(repository, lookup.commitId)
            : await findWorkshopRepositoryCommitByDate(repository, lookup.boundary, lookup.date);
        return NextResponse.json({ commit }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Commit se nepodařilo načíst.' }, { status: 422 });
    }
}
