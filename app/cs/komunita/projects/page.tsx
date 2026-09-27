import { CommunityProjectsListingPage } from '@/businesses/community/projects/CommunityProjectsListingPage';
import { COMMUNITY_PROJECTS_METADATA } from '@/businesses/community/projects/communityProjectMetadata';

export const metadata = COMMUNITY_PROJECTS_METADATA;

export const dynamic = 'force-dynamic';

export default function CommunityProjectsRoute() {
    return <CommunityProjectsListingPage />;
}
