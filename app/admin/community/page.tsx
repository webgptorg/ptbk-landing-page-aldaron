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
 * Administration of the one persistent community. The reusable dashboard is restricted to the `community` room kind,
 * so workshop occurrences cannot be edited accidentally from this route, and the kind itself takes away what a single
 * permanent room does not have: a choice between rooms, the creation of a second one, and an editable URL.
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
