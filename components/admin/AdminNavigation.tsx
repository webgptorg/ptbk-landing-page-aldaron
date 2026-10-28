'use client';

import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from '@/lib/admin/adminConstants';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAVIGATION_ITEMS } from './adminNavigationConfig';

export function AdminNavigation({ allowedPaths, username }: { readonly allowedPaths: readonly string[]; readonly username?: string }) {
    const pathname = usePathname();
    const navigationItems = ADMIN_NAVIGATION_ITEMS.filter((item) => allowedPaths.includes(item.path));

    // The login page lives below the same Next.js layout, but it is not an authenticated admin page and must not
    // expose navigation or a sign-out action before the administrator has signed in.
    if (pathname === null || pathname === ADMIN_LOGIN_PATH || navigationItems.length === 0) {
        return null;
    }

    const currentPage = navigationItems.find((item) => item.path === pathname);

    return (
        <header className="border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-16 items-center gap-3 py-3">
                    <Link
                        href={ADMIN_DASHBOARD_PATH}
                        className="flex shrink-0 items-center gap-2 rounded-lg text-slate-950 outline-none transition hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                    >
                        <ShieldCheck className="h-5 w-5 text-cyan-600" />
                        <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] sm:inline">
                            Promptbook admin
                        </span>
                        <span className="sr-only"> – Admin dashboard</span>
                    </Link>

                    <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
                    <h1 className="truncate text-lg font-bold text-slate-950">
                        {currentPage?.title ?? currentPage?.label ?? 'Administrace'}
                    </h1>

                    <div className="ml-auto shrink-0">
                        {username && <span className="mr-3 hidden text-sm text-slate-500 sm:inline">{username}</span>}
                        <AdminSignOutButton />
                    </div>
                </div>

                <nav aria-label="Navigace administrace" className="-mx-1 overflow-x-auto pb-3">
                    <ul className="flex min-w-max items-center gap-1">
                        {navigationItems.map((item) => {
                            const isActive =
                                pathname === item.path ||
                                (item.path !== ADMIN_DASHBOARD_PATH && pathname.startsWith(`${item.path}/`));
                            const Icon = item.icon;

                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2',
                                            isActive
                                                ? 'bg-cyan-50 text-cyan-800'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
