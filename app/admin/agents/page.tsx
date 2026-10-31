import { AgentsAdmin } from '@/components/agents/AgentsAdmin';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
export const metadata = { title: 'Agents · Administrace', robots: { index: false, follow: false } };
export default async function AgentsPage() {
    await requireAdminSignedIn('/admin/agents');
    return <main className="min-h-screen bg-slate-50"><AgentsAdmin /></main>;
}
