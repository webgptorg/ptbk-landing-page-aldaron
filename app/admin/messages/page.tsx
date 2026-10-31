import { Suspense } from 'react';
import { MessagesAdmin } from '@/components/messages/MessagesAdmin';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
export const metadata = { title: 'Messages · Administrace', robots: { index: false, follow: false } };
export default async function MessagesPage() {
    await requireAdminSignedIn('/admin/messages');
    return <main className="min-h-screen bg-slate-50"><Suspense><MessagesAdmin /></Suspense></main>;
}
