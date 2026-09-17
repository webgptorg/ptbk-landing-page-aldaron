import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadCommunityProjectById,
    loadCommunityProjects,
} from '@/lib/community-projects/communityProjectDatabase';
import { createCommunityProject } from '@/lib/community-projects/communityProjectService';
import {
    isAuthenticatedCommunityRequest,
    getAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { scrapeCommunityProjectPreview } from '@/lib/community-projects/communityProjectPreview';
import { normalizeCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { communityProjectCreateSchema } from '@/lib/community-projects/communityProjectSchemas';
import { autoApproveWorkshopSubmission } from '@/lib/workshops/workshopAutoApproval';
import { NextRequest, NextResponse } from 'next/server';

const MAXIMAL_COMMUNITY_PROJECT_HOME_COUNT = 5;

function readProjectLimit(value: string | null): number | null {
    if (value === null) {
        return null;
    }

    const limit = Number(value);
    return Number.isSafeInteger(limit) && limit >= 1 && limit <= MAXIMAL_COMMUNITY_PROJECT_HOME_COUNT ? limit : null;
}

export async function GET(request: NextRequest) {
    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const requestedLimit = request.nextUrl.searchParams.get('limit');
    const limit = readProjectLimit(requestedLimit);
    if (requestedLimit !== null && limit === null) {
        return NextResponse.json({ error: 'Project limit must be from 1 to 5' }, { status: 400 });
    }

    const { projects, errorMessage } = await loadCommunityProjects(
        authenticatedRequest.supabase,
        authenticatedRequest.participant,
        limit,
    );
    if (projects === null) {
        console.error('Failed to load community projects:', errorMessage);
        return NextResponse.json({ error: 'Community projects could not be loaded' }, { status: 500 });
    }

    return NextResponse.json(
        {
            projects,
            isModerationOffered: isWorkshopParticipantModerating(authenticatedRequest.participant),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}

export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Doplňte platnou URL, název a popis projektu.' }, { status: 400 });
    }

    const normalizedUrl = normalizeCommunityProjectUrl(parsedResult.data.url);
    if (normalizedUrl === null) {
        return NextResponse.json({ error: 'URL projektu musí začínat na http:// nebo https://.' }, { status: 400 });
    }

    let preview;
    try {
        // The image is freshly scraped once more at save time. A forged request can therefore change only the title
        // and description which the wizard explicitly lets a member edit, never point a card at an arbitrary image.
        preview = await scrapeCommunityProjectPreview(normalizedUrl);
    } catch {
        return NextResponse.json(
            { error: 'Náhled projektu se nepodařilo načíst. Zkontrolujte, že je stránka veřejně dostupná.' },
            { status: 422 },
        );
    }

    const createdProject = await createCommunityProject({
        communityParticipantId: authenticatedRequest.participant.id,
        url: preview.url,
        title: parsedResult.data.title,
        description: parsedResult.data.description,
        previewImageUrl: preview.previewImageUrl,
    });
    if (createdProject.projectId === null) {
        console.error('Failed to create community project:', createdProject.errorMessage);
        return NextResponse.json({ error: 'Projekt se nepodařilo uložit.' }, { status: 500 });
    }

    const loadedProject = await loadCommunityProjectById(
        authenticatedRequest.supabase,
        createdProject.projectId,
        authenticatedRequest.participant,
    );
    if (loadedProject.project === null) {
        console.error('Failed to load created community project:', loadedProject.errorMessage);
        return NextResponse.json({ error: 'Projekt byl uložen, ale nepodařilo se ho načíst.' }, { status: 500 });
    }

    const project = loadedProject.project;
    const isAutomaticallyApproved = await autoApproveWorkshopSubmission(
        authenticatedRequest.supabase,
        authenticatedRequest.participant,
        {
            kind: 'project',
            id: project.id,
            status: project.status,
            content: {
                url: project.url,
                title: project.title,
                description: project.description,
                previewImageUrl: project.previewImageUrl,
            },
        },
    );

    return NextResponse.json(
        { project: isAutomaticallyApproved ? { ...project, status: 'approved' } : project },
        { status: 201 },
    );
}
