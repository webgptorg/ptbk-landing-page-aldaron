import { HOMEPAGE_AGENDA_TASK_STYLES } from '@/businesses/homepage/homepageAgendaTaskStyle';
import type { HomepageAgendaPreview, HomepageAgendaTaskState } from '@/businesses/homepage/homepageContent';
import { cn } from '@/lib/utils';
import { ArrowUp, Check, CircleDashed, Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Mark put in front of a task for each state it can be in
 */
const HOMEPAGE_AGENDA_TASK_ICONS: Readonly<Record<HomepageAgendaTaskState, ComponentType<{ className?: string }>>> = {
    done: Check,
    running: Loader2,
    scheduled: CircleDashed,
    escalated: ArrowUp,
};

/**
 * One agenda drawn as the thing it is: a named area of responsibility which carries its own context and holds
 * several tasks of different lifecycles at once
 *
 * Note: This is the first thing a visitor sees, so it deliberately shows no chat. The old proposition was answered
 *       in a conversation; this one is answered by work which keeps happening whether or not anybody is watching.
 */
export function HomepageAgendaCard({ agenda }: { readonly agenda: HomepageAgendaPreview }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#071d29] shadow-2xl shadow-cyan-950/40">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-4 sm:px-6">
                <div className="min-w-0">
                    {/* Note: The name of the agenda is what the card is about, so on a narrow screen it wraps
                        rather than being cut off; only the area it covers gives way. */}
                    <p className="text-[15px] font-semibold leading-snug text-white sm:text-base">{agenda.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-white/50">{agenda.scope}</p>
                </div>
                <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-cyan-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 motion-safe:animate-pulse" />
                    {agenda.runningLabel}
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-5 py-3.5 sm:px-6">
                {agenda.context.map((item) => (
                    <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11.5px] text-white/60"
                    >
                        {item}
                    </span>
                ))}
            </div>

            <ul className="divide-y divide-white/[0.06]">
                {agenda.tasks.map((task) => {
                    const style = HOMEPAGE_AGENDA_TASK_STYLES[task.state];
                    const TaskIcon = HOMEPAGE_AGENDA_TASK_ICONS[task.state];

                    return (
                        <li key={task.label} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
                            <span
                                className={cn(
                                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                    style.marker,
                                )}
                            >
                                <TaskIcon
                                    className={cn('h-3 w-3', style.isMarkerAnimated && 'motion-safe:animate-spin')}
                                />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className={cn('block text-[14px] leading-snug', style.label)}>{task.label}</span>
                                <span className={cn('mt-0.5 block text-[12px]', style.cadence)}>{task.cadence}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>

            <p className="border-t border-white/10 bg-white/[0.02] px-5 py-3 text-[12px] text-white/40 sm:px-6">
                {agenda.status}
            </p>
        </div>
    );
}
