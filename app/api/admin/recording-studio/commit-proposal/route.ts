import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { fetchGithubRepositoryCommitPage } from '@/lib/github/fetchGithubRepository';
import { resolveWorkshopRepositoryBranches } from '@/lib/workshops/resolveWorkshopRepositoryBranches';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { workshopRepositoryWriteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MAXIMUM_PROPOSAL_PAGES_PER_BRANCH = 5;
const MAXIMUM_PROPOSED_COMMITS = 500;
const PROPOSAL_SCHEMA = z.object({
    repository: workshopRepositoryWriteSchema,
    durationSeconds: z.number().positive().max(24 * 60 * 60),
    calibration: z.object({ sessionSeconds: z.number().nonnegative(), wallClockAtSessionSeconds: z.string().datetime({ offset: true }) }),
});

/** Commit dates offer review candidates only; they cannot prove when a push or edit appeared in the recording. */
export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse !== null) return unauthorizedResponse;
    const parsed = PROPOSAL_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success || parsed.data.calibration.sessionSeconds >= parsed.data.durationSeconds) {
        return NextResponse.json({ error: 'Zkontrolujte repozitář, délku záznamu a kalibraci času s časovým pásmem.' }, { status: 400 });
    }
    const { repository, durationSeconds, calibration } = parsed.data;
    const wallClockMilliseconds = Date.parse(calibration.wallClockAtSessionSeconds);
    const startMilliseconds = wallClockMilliseconds - calibration.sessionSeconds * 1_000;
    const endMilliseconds = startMilliseconds + durationSeconds * 1_000;
    try {
        const branches = await resolveWorkshopRepositoryBranches(repository);
        if (branches.length === 0) throw new Error('Vybrané větve nejsou dostupné.');
        const commits = new Map<string, { sha: string; committedAt: string; message: string; seconds: number }>();
        let isComplete = true;
        for (const branch of branches) {
            for (let page = 1; page <= MAXIMUM_PROPOSAL_PAGES_PER_BRANCH; page += 1) {
                const result = await fetchGithubRepositoryCommitPage({ repository, branch: branch.name, page,
                    since: new Date(startMilliseconds - 1_000).toISOString(),
                    until: new Date(endMilliseconds + 1_000).toISOString(),
                    revalidateSeconds: WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS });
                if (!result) throw new Error('Historii vybraných větví se nepodařilo načíst.');
                for (const commit of result.commits) {
                    const seconds = (Date.parse(commit.committedAt) - startMilliseconds) / 1_000;
                    if (seconds >= 0 && seconds < durationSeconds) commits.set(commit.sha, {
                        sha: commit.sha, committedAt: commit.committedAt, message: commit.message, seconds });
                }
                if (commits.size > MAXIMUM_PROPOSED_COMMITS) throw new Error('Nalezeno příliš mnoho commitů; zvolte kratší záznam nebo užší výběr větví.');
                if (!result.isMoreAvailable) break;
                if (page === MAXIMUM_PROPOSAL_PAGES_PER_BRANCH) isComplete = false;
            }
        }
        return NextResponse.json({ proposals: Array.from(commits.values()).sort((first, second) => first.seconds - second.seconds || first.sha.localeCompare(second.sha)),
            isComplete, calibration, note: 'Časy commitů jsou pouze návrh. Ověřte časové pásmo, zpožděné push, rebase, odchylku hodin a neuloženou práci proti záznamu.' },
        { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Návrh commitů se nepodařilo načíst.' }, { status: 422 });
    }
}
