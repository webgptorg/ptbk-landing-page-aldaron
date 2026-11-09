import { CommunityProjectDiscussionPage } from '@/businesses/community/projects/CommunityProjectDiscussionPage';
import { createCommunityProjectPageDefinition } from '@/businesses/community/projects/communityProjectMetadata';
import { loadPublicCommunityProject } from '@/lib/community-projects/publicCommunityProject';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { notFound } from 'next/navigation';

type CommunityProjectDiscussionRouteProps = {
    readonly params: Promise<{ readonly projectId: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CommunityProjectDiscussionRouteProps) {
    const { projectId } = await params;
    const project = await loadPublicCommunityProject(projectId);
    if (project === null) {
        notFound();
    }

    return createPageMetadata(createCommunityProjectPageDefinition(project));
}

export default async function CommunityProjectDiscussionRoute({ params }: CommunityProjectDiscussionRouteProps) {
    const { projectId } = await params;
    const project = await loadPublicCommunityProject(projectId);
    if (project === null) {
        notFound();
    }

    return <CommunityProjectDiscussionPage project={project} />;
}
