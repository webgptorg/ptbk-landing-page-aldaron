import { ArticlesAdmin } from '@/components/articles/ArticlesAdmin';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';

export const metadata = { title: 'Články · Administrace', robots: { index: false, follow: false } };

export default async function ArticlesAdminPage() {
    await requireAdminSignedIn('/admin/articles');
    return <main className="min-h-screen bg-slate-50"><ArticlesAdmin /></main>;
}
