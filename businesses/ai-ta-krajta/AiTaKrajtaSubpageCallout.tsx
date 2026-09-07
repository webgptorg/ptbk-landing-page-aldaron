import type { AiTaKrajtaSubpage } from '@/businesses/ai-ta-krajta/config';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

/**
 * A signpost from one page of the show to another one
 *
 * Note: It names the destination the way the destination names itself, so the media kit and the brand kit can point at
 *       each other without either of them writing down what the other one contains.
 *
 * @param subpage where the signpost leads
 * @param eyebrow why the visitor standing here would want to go there
 */
export function AiTaKrajtaSubpageCallout({
    subpage,
    eyebrow,
}: {
    readonly subpage: AiTaKrajtaSubpage;
    readonly eyebrow: string;
}) {
    return (
        <Link
            href={subpage.path}
            className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/30 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{eyebrow}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{subpage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{subpage.description}</p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#b5c2ff]">
                Otevřít
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
        </Link>
    );
}
