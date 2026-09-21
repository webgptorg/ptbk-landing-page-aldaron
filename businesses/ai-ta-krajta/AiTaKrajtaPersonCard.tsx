'use client';

import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { AiTaKrajtaPersonAvatar } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonAvatar';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ListFilter, X } from 'lucide-react';

/**
 * Profile of one person, which is also the button which narrows the archive down to them
 *
 * Note: The link to their own page is a separate control inside the card, so that clicking the card itself always
 *       means the same thing.
 */
export function AiTaKrajtaPersonCard({
    person,
    episodeCount,
    isSelected,
    onSelect,
}: {
    readonly person: AiTaKrajtaPerson;

    /**
     * In how many episodes of the archive this person is named
     */
    readonly episodeCount: number;

    readonly isSelected: boolean;
    readonly onSelect: () => void;
}) {
    return (
        <div
            className={cn(
                'relative flex h-full flex-col rounded-2xl border p-6 transition-colors',
                isSelected
                    ? 'border-[#ff6b6b]/60 bg-[#ff6b6b]/[0.08]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25',
            )}
        >
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={isSelected}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-[#ff6b6b]"
            >
                <AiTaKrajtaPersonAvatar person={person} size="large" />

                <h3 className="mt-4 text-lg font-semibold text-white">{person.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{person.headline}</p>
            </button>

            <div className="mt-5 flex items-center justify-between gap-3 pt-1">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 text-xs',
                        isSelected ? 'text-[#ff9b8f]' : 'text-white/45',
                    )}
                >
                    {isSelected ? <X className="h-3.5 w-3.5" /> : <ListFilter className="h-3.5 w-3.5" />}
                    {isSelected
                        ? 'Zrušit filtr'
                        : formatCzechCountedNoun(episodeCount, ['díl', 'díly', 'dílů'])}
                </span>

                {person.url !== null && (
                    <a
                        href={person.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative z-10 inline-flex items-center gap-1 text-xs text-white/45 transition-colors hover:text-white"
                    >
                        Profil
                        <ArrowUpRight className="h-3 w-3" />
                    </a>
                )}
            </div>
        </div>
    );
}
