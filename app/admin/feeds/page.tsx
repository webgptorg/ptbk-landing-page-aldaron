import { CalendarDays, Rss } from 'lucide-react';
import { ADMIN_FEEDS_PATH } from '@/lib/admin/adminConstants';
import { PUBLIC_CALENDAR_FEEDS, PUBLIC_RSS_FEEDS } from '@/lib/admin/publicFeedDirectory';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';

export const metadata = { title: 'Feeds · Administrace' };

const feedLinkClass = 'break-all text-sm text-cyan-800 underline decoration-cyan-800/30 underline-offset-2 hover:decoration-current';

export default async function FeedsAdminPage() {
    await requireAdminSignedIn(ADMIN_FEEDS_PATH);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
            <div className="mx-auto max-w-5xl space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Feeds</h1>
                <section aria-labelledby="admin-rss-heading">
                    <h2 id="admin-rss-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
                        <Rss size={20} aria-hidden="true" /> RSS
                    </h2>
                    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                        {PUBLIC_RSS_FEEDS.map(({ title, feedUrl }) => (
                            <li key={feedUrl} className="grid gap-1 px-4 py-3">
                                <h3 className="font-medium">{title}</h3>
                                <a className={feedLinkClass} href={feedUrl} target="_blank" rel="noreferrer">{feedUrl}</a>
                            </li>
                        ))}
                    </ul>
                </section>
                <section aria-labelledby="admin-calendar-heading">
                    <h2 id="admin-calendar-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
                        <CalendarDays size={20} aria-hidden="true" /> Kalendáře
                    </h2>
                    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                        {PUBLIC_CALENDAR_FEEDS.map(({ title, feedUrl, googleCalendarUrl, legacyUrl }) => (
                            <li key={feedUrl} className="grid gap-1 px-4 py-3">
                                <h3 className="font-medium">{title}</h3>
                                <a className={feedLinkClass} href={feedUrl} target="_blank" rel="noreferrer">{feedUrl}</a>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <a className={feedLinkClass} href={googleCalendarUrl} target="_blank" rel="noreferrer">Přidat do Google Kalendáře</a>
                                    {legacyUrl && <a className={feedLinkClass} href={legacyUrl} target="_blank" rel="noreferrer">Starší adresa kalendáře</a>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </main>
    );
}
