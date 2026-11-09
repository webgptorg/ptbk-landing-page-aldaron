import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { ADMIN_WORKSHOPS_PATH } from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import {
    readFirstSearchParameter,
    readFirstSearchParameters,
    type SearchParameterValue,
} from '@/lib/api/readFirstSearchParameter';
import { Suspense } from 'react';

type AdminWorkshopsPageProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

export default async function AdminWorkshopsPage({ searchParams }: AdminWorkshopsPageProps) {
    const resolvedSearchParams = await searchParams;
    const workshopSlug = readFirstSearchParameter(resolvedSearchParams.workshop);

    // Note: The whole view which was asked for is named to the login as well, so signing in returns to the very
    //       workshop, section and graph a shared link opened, rather than to the dashboard as it was left.
    await requireAdminSignedIn(
        appendSearchParameters(ADMIN_WORKSHOPS_PATH, readFirstSearchParameters(resolvedSearchParams)),
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <Suspense>
                <WorkshopAdminDashboard initialWorkshopSlug={workshopSlug} />
            </Suspense>
        </main>
    );
}
