import { COMMUNITY_ADMIN_PATH } from '@/businesses/community/config';
import { CommunityAdminDashboard } from '@/businesses/community/admin/CommunityAdminDashboard';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import { readFirstSearchParameters, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { Suspense } from 'react';

type AdminCommunityPageProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

/**
 * Administration of the configured permanent community rooms.
 */
export default async function AdminCommunityPage({ searchParams }: AdminCommunityPageProps) {
    const resolvedSearchParams = await searchParams;
    await requireAdminSignedIn(
        appendSearchParameters(COMMUNITY_ADMIN_PATH, readFirstSearchParameters(resolvedSearchParams)),
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <Suspense>
                <CommunityAdminDashboard />
            </Suspense>
        </main>
    );
}
