'use client';

import { Button } from '@/components/ui/button';
import {
    getWorkshopPollOptionVotePercentage,
    getWorkshopPollVoteCount,
} from '@/lib/workshops/workshopPollValues';
import type { WorkshopAdminPoll } from '@/lib/workshops/workshopTypes';
import { ArrowUpRight, Vote } from 'lucide-react';
import Link from 'next/link';

type WorkshopAttachedPollListProps = {
    readonly polls: readonly WorkshopAdminPoll[];

    /**
     * Where the polls are administered, which is the administration of the community owning them.
     */
    readonly pollAdministrationPath?: string;
};

/**
 * The community polls asked about this workshop, read from its own administration.
 *
 * Note: This deliberately only reads. A poll belongs to the community, so its question, its choices, its visibility
 *       and its lifecycle stay editable in exactly one place while its aggregate includes the e-mail-shared votes
 *       cast in this occurrence too.
 */
export function WorkshopAttachedPollList({ polls, pollAdministrationPath }: WorkshopAttachedPollListProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <Vote className="h-5 w-5 text-cyan-600" /> Ankety komunity o tomto workshopu
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        Tyto ankety patří komunitě, která je také spravuje. Zde jsou jen ke čtení, včetně jejich
                        průběžných výsledků společných pro komunitu a připojené workshopy.
                    </p>
                </div>
                {pollAdministrationPath !== undefined && (
                    <Button asChild variant="outline" size="sm">
                        <Link href={pollAdministrationPath}>
                            Spravovat v komunitě <ArrowUpRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>

            <div className="mt-6 space-y-3">
                {polls.map((poll) => {
                    const totalVoteCount = getWorkshopPollVoteCount(poll);
                    return (
                        <article key={poll.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h3 className="font-semibold text-slate-950">{poll.question}</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {totalVoteCount} hlasů · {poll.isClosed ? 'Hlasování ukončeno' : 'Hlasování probíhá'} ·{' '}
                                {poll.isVisible ? 'Viditelná pro členy' : 'Skrytá před členy'}
                            </p>
                            <ol className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                {poll.options.map((option) => (
                                    <li key={option.id} className="rounded-lg border border-slate-100 bg-white p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="min-w-0 break-words font-medium text-slate-700">
                                                {option.label}
                                            </span>
                                            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                                                {option.voteCount} ·{' '}
                                                {getWorkshopPollOptionVotePercentage(option, totalVoteCount)} %
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
