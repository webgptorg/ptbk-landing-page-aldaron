import { Button } from '@/components/ui/button';
import { PublicWebPagePreviewImage } from '@/components/public-web-page-preview-image';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import type { EventListing } from '@/lib/events/eventListing';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { formatMediaDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import type { WorkshopFeedbackSummary, WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';
import { ArrowUpRight, CalendarDays, Clock3, ExternalLink, Github, Star } from 'lucide-react';
import Link from 'next/link';

const WORKSHOP_RATING_STAR_COUNT = 5;
const CZECH_WORKSHOP_RATING_FORMAT = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 });
const CZECH_WORKSHOP_RATING_COUNT_FORMS = ['hodnocení', 'hodnocení', 'hodnocení'] as const;

type WorkshopEventCardProps = {
    readonly listing: EventListing;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country this card is drawn for, which makes its term today, tomorrow, or one of the
     * days of this week
     */
    readonly todayDayKey: CalendarDayKey;
};

/**
 * When one term is held, as a member reads it, for example `dnes, pátek 4. 9. 2026 · 19:00`
 *
 * Note: The term has already been dated for the country this list is drawn for, so how near its day is is read from
 *       that day rather than dated a second time.
 */
function formatEventListingDateTime(
    listing: EventListing,
    todayDayKey: CalendarDayKey,
    locale: string,
    timeZone: string,
): string {
    const startsAtDate = new Date(listing.workshop.startsAt);
    const dateLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
    }).format(startsAtDate);
    const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(
        startsAtDate,
    );

    return `${formatCzechRelativeDayPrefix(listing.dayKey, todayDayKey)}${dateLabel} · ${timeLabel}`;
}

function getFilledWorkshopRatingStarCount(averageRating: number): number {
    return Math.min(WORKSHOP_RATING_STAR_COUNT, Math.max(0, Math.round(averageRating)));
}

/**
 * The anonymous reception of a workshop, reduced to a compact star row so a card never exposes private written
 * feedback or the participant who wrote it.
 */
function WorkshopEventCardFeedback({ feedback }: { readonly feedback: WorkshopFeedbackSummary }) {
    const formattedAverageRating = CZECH_WORKSHOP_RATING_FORMAT.format(feedback.averageRating);
    const formattedRatingCount = formatCzechCountedNoun(feedback.ratingCount, CZECH_WORKSHOP_RATING_COUNT_FORMS);
    const filledStarCount = getFilledWorkshopRatingStarCount(feedback.averageRating);

    return (
        <span
            aria-label={`Hodnocení ${formattedAverageRating} z 5 od ${formattedRatingCount}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-200"
        >
            <span className="inline-flex items-center" aria-hidden="true">
                {Array.from({ length: WORKSHOP_RATING_STAR_COUNT }, (_, starIndex) => (
                    <Star
                        key={starIndex}
                        className="h-3.5 w-3.5"
                        fill={starIndex < filledStarCount ? 'currentColor' : 'none'}
                    />
                ))}
            </span>
            <span>{formattedAverageRating} / 5</span>
            <span className="text-slate-400">· {formattedRatingCount}</span>
        </span>
    );
}

/**
 * The length somebody can replay, after the start of a recorded stream has been skipped.
 */
function WorkshopEventCardRecordingDuration({
    recordingDurationSeconds,
}: {
    readonly recordingDurationSeconds: number;
}) {
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-100">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Záznam {formatMediaDuration(recordingDurationSeconds)}
        </span>
    );
}

/**
 * A visual glimpse of the deployed project a workshop followed. It remains part of the term link, so the established
 * card interaction still opens the term while the project is recognized before a member enters it.
 */
function WorkshopEventCardProjectPreview({ project }: { readonly project: WorkshopProjectPreview }) {
    return (
        <span className="mt-3 flex overflow-hidden rounded-lg border border-white/10 bg-slate-950/35">
            <span className="flex aspect-[4/3] w-24 shrink-0 overflow-hidden bg-slate-900 sm:w-28">
                <PublicWebPagePreviewImage
                    imageUrl={project.previewImageUrl}
                    alt={`Náhled projektu ${project.title}`}
                    fallbackLabel="Náhled projektu není k dispozici"
                    fallback={<Github className="h-7 w-7 text-cyan-200/80" aria-hidden="true" />}
                />
            </span>
            <span className="min-w-0 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200/80">
                    <Github className="h-3.5 w-3.5" aria-hidden="true" /> Projekt workshopu
                </span>
                <span className="mt-1 block line-clamp-1 text-xs font-semibold text-slate-100">{project.title}</span>
                {project.description !== '' && (
                    <span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-slate-400">
                        {project.description}
                    </span>
                )}
                <span className="mt-1 block truncate font-mono text-[10px] text-slate-500">
                    {project.repositoryName}
                </span>
            </span>
        </span>
    );
}

/**
 * One listed term as a card leading to it, which says when it is held, what it is, and where it stands in time
 *
 * Note: The list of cards and the day of a calendar show a term with this very same card, so a member reads the same
 *       thing about a term however they came to it.
 */
export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
    const { workshop, event, link, phase } = listing;
    const eventCardDetails = workshop.eventCardDetails;
    const feedback = eventCardDetails?.feedback ?? null;
    const project = eventCardDetails?.project ?? null;
    const recordingDurationSeconds = eventCardDetails?.recordingDurationSeconds ?? null;
    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;

    // Note: A term held by somebody else leads out of this application, so it opens beside the room a member is
    //       reading rather than taking them out of it, and says so with its own icon.
    const isEventHeldExternally = isExternalEventType(event.type);
    const EventLinkIcon = isEventHeldExternally ? ExternalLink : ArrowUpRight;

    return (
        <Button
            asChild
            variant="outline"
            className="h-auto w-full justify-between whitespace-normal border-white/10 bg-white/[0.035] p-4 text-left text-slate-100 hover:border-cyan-200/50 hover:bg-cyan-300/10 hover:text-white"
        >
            <Link href={link} {...(isEventHeldExternally ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="break-words font-semibold">{workshop.title}</span>
                        <WorkshopPhaseBadge phase={phase} tone="dark" />
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
                    </span>
                    <span className="mt-1 block break-words text-xs font-normal text-slate-500">
                        {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                        {formatEventPrice(event.priceCzk)}
                    </span>
                    {(feedback !== null || isRecordingDurationShown) && (
                        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {feedback !== null && <WorkshopEventCardFeedback feedback={feedback} />}
                            {isRecordingDurationShown && (
                                <WorkshopEventCardRecordingDuration
                                    recordingDurationSeconds={recordingDurationSeconds}
                                />
                            )}
                        </span>
                    )}
                    {project !== null && <WorkshopEventCardProjectPreview project={project} />}
                </span>
                <EventLinkIcon className="ml-3 h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
            </Link>
        </Button>
    );
}
