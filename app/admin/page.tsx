import { ADMIN_NAVIGATION_ITEMS } from '@/components/admin/adminNavigationConfig';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { canAccessAdminPath } from '@/lib/admin/adminPermissions';
import Link from 'next/link';

const ADMIN_PAGE_CARDS = ADMIN_NAVIGATION_ITEMS.filter((page) => page.path !== ADMIN_DASHBOARD_PATH);

export default async function AdminDashboardPage({ searchParams }: { readonly searchParams: Promise<{ readonly access?: string }> }) {
    const identity = await requireAdminSignedIn(ADMIN_DASHBOARD_PATH);
    const cards = ADMIN_PAGE_CARDS.filter((page) => canAccessAdminPath(identity, page.path));
    const isAccessDenied = (await searchParams).access === 'denied';

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <p className="max-w-2xl text-slate-600">Všechny interní stránky na jednom místě.</p>
                {isAccessDenied && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">K této sekci nemáte přístup.</p>}
                {cards.length === 0 && <p className="mt-6 text-slate-600">Zatím nemáte povolenou žádnou sekci. Přístup vám může nastavit superadmin.</p>}

                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {cards.map((page) => {
                        const Icon = page.icon;

                        return (
                            <Link
                                key={page.path}
                                href={page.path}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
                            >
                                <Icon className="h-8 w-8 text-cyan-600" />
                                <h2 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-cyan-700">
                                    {page.label}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{page.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
