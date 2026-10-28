import { AdminUsers } from '@/components/admin/AdminUsers';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { AdminUserDatabaseError, loadAdminUsers } from '@/lib/admin/adminUserDatabase';
import { ADMIN_USERS_PATH } from '@/lib/admin/adminUserSchemas';

export default async function AdminUsersPage() {
    await requireAdminSignedIn(ADMIN_USERS_PATH);
    try {
        const users = await loadAdminUsers();
        return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl"><AdminUsers initialUsers={users} /></div></main>;
    } catch (error) {
        if (!(error instanceof AdminUserDatabaseError)) throw error;
        return <main className="min-h-screen bg-slate-50 px-4 py-8"><p role="alert" className="mx-auto max-w-5xl rounded-xl bg-red-50 p-5 text-red-700">{error.message}</p></main>;
    }
}
