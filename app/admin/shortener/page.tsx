import { ShortcodeLinkAdmin } from '@/components/shortener/ShortcodeLinkAdmin';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { ADMIN_SHORTENER_METADATA } from '@/lib/metadata/site-page-definitions';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import { Suspense } from 'react';

export const metadata = ADMIN_SHORTENER_METADATA;

export default async function AdminShortenerPage() {
    const identity = await requireAdminSignedIn(ADMIN_SHORTENER_PATH);

    return (
        <main className="min-h-screen bg-slate-50">
            <Suspense>
                <ShortcodeLinkAdmin identity={identity} />
            </Suspense>
        </main>
    );
}
