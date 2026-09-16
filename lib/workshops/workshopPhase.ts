import { DEFAULT_WORKSHOP_DURATION_MINUTES, FRESHLY_PAST_WORKSHOP_HOURS } from '@/lib/workshops/workshopConstants';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;

/**
 * Where one occurrence currently stands in time, named from the most pressing phase to the least
 *
 * Note: An occurrence which has only just been held is a phase of its own rather than the beginning of the history,
 *       because what a member does with a workshop of yesterday evening — its room, its recording, its materials — has
 *       nothing to do with what they do with a workshop of last spring.
 * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
 *       the others only here.
 */
export const WORKSHOP_PHASE_VALUES = ['ongoing', 'upcoming', 'freshly-past', 'past'] as const;

export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];

/**
 * Whether an occurrence of this phase has already been held, however long ago that was
 *
 * Note: This is the one answer to the question everything which opens after a workshop asks — the wrap-up, the
 *       feedback, and the recording — so a workshop which has only just ended is over exactly as much as one which
 *       ended a year ago.
 */
export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
    return phase === 'freshly-past' || phase === 'past';
}

/**
 * As much of a workshop as it takes to decide when it happens
 *
 * Note: Both a summary and the full details of a workshop satisfy this shape, so nothing has to be loaded just to
 *       place an occurrence in time.
 * Note: An occurrence without an end has not ended. It runs for as long as it takes and is only over once its end is
 *       recorded, which is what the administration does when the workshop is really finished.
 */
export type WorkshopOccurrenceTiming = {
    readonly startsAt: string;
    readonly endsAt: string | null;
};

/**
 * How pressing one phase is, which is nothing but the order the phases are named in
 */
function getWorkshopPhaseRank(phase: WorkshopPhase): number {
    return WORKSHOP_PHASE_VALUES.indexOf(phase);
}

/**
 * Moment an occurrence was really given as its end, or `null` while that end is left open
 *
 * Note: This is the single rule for whether an occurrence has an end at all, so nothing decides on its own that an
 *       unwritten or nonsensical end means the workshop is over.
 */
export function getWorkshopRecordedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number | null {
    const endsAtMilliseconds = occurrence.endsAt === null ? Number.NaN : Date.parse(occurrence.endsAt);

    return endsAtMilliseconds > Date.parse(occurrence.startsAt) ? endsAtMilliseconds : null;
}

/**
 * Whether an occurrence still has no end, so it runs until the administration ends it
 */
export function isWorkshopEndOpen(occurrence: WorkshopOccurrenceTiming): boolean {
    return getWorkshopRecordedEndsAtMilliseconds(occurrence) === null;
}

/**
 * Moment an occurrence is expected to end, taken from the usual length of a workshop while its end is left open
 *
 * Note: A calendar invitation and a duration label have to name a length before an occurrence has one, which is what
 *       this expectation is for. It deliberately never decides whether an occurrence is over — only a recorded end
 *       does that.
 */
export function getWorkshopExpectedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number {
    return (
        getWorkshopRecordedEndsAtMilliseconds(occurrence) ??
        Date.parse(occurrence.startsAt) + DEFAULT_WORKSHOP_DURATION_MINUTES * MILLISECONDS_PER_MINUTE
    );
}

/**
 * Decides whether an occurrence is still ahead, running right now, only just over, or already history
 *
 * Note: An occurrence whose end is open never becomes past by itself. It keeps running — and keeps its stage on —
 *       until an administrator records the end of it.
 * Note: How long an occurrence stays freshly past is counted from the end which was really recorded for it rather than
 *       from the end it was expected to have, so a workshop is never called fresh before anybody ended it.
 *
 * @param currentTimeMilliseconds moment to compare against, so a list places every occurrence against the same instant
 */
export function getWorkshopPhase(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds = Date.now(),
): WorkshopPhase {
    if (Date.parse(occurrence.startsAt) > currentTimeMilliseconds) {
        return 'upcoming';
    }

    const recordedEndsAtMilliseconds = getWorkshopRecordedEndsAtMilliseconds(occurrence);
    if (recordedEndsAtMilliseconds === null || recordedEndsAtMilliseconds > currentTimeMilliseconds) {
        return 'ongoing';
    }

    const millisecondsSinceEnd = currentTimeMilliseconds - recordedEndsAtMilliseconds;
    return millisecondsSinceEnd <= FRESHLY_PAST_WORKSHOP_HOURS * MILLISECONDS_PER_HOUR ? 'freshly-past' : 'past';
}

/**
 * The one phase which speaks for a group of occurrences, which is the most pressing among them
 *
 * Note: A day of a calendar carries whatever terms fall on it, and it can only be coloured by one of them. It is
 *       coloured by the very same ranking which puts a running term on top of a list, so a day where something is
 *       happening right now never looks like history.
 */
export function getMostProminentWorkshopPhase(phases: readonly WorkshopPhase[]): WorkshopPhase {
    return phases.reduce(
        (mostProminentPhase, phase) =>
            getWorkshopPhaseRank(phase) < getWorkshopPhaseRank(mostProminentPhase) ? phase : mostProminentPhase,
        'past',
    );
}

/**
 * The two keys which order one occurrence among the others
 *
 * Note: The history is ranked by its negated date, so the term which ended last leads it while the future is led by
 *       the term which starts next. The most relevant occurrence of every group therefore stays on top of it.
 */
function getWorkshopPhaseOrder(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds: number,
): { readonly phaseRank: number; readonly dateRank: number } {
    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    const dateRank = Number.isFinite(startsAtMilliseconds) ? startsAtMilliseconds : 0;

    return { phaseRank: getWorkshopPhaseRank(phase), dateRank: isWorkshopPhasePast(phase) ? -dateRank : dateRank };
}

/**
 * Orders occurrences by their phase first and by their date within every phase
 *
 * @param currentTimeMilliseconds moment which decides the phases, so one list is never sorted against a moving instant
 */
export function sortWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): readonly TWorkshop[] {
    return workshops
        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
        .sort(
            (firstEntry, secondEntry) =>
                firstEntry.order.phaseRank - secondEntry.order.phaseRank ||
                firstEntry.order.dateRank - secondEntry.order.dateRank,
        )
        .map(({ workshop }) => workshop);
}

/**
 * Splits occurrences into the same ordered phases which administration and public listings use.
 *
 * Keeping the ordering and the grouping together means a picker can progressively disclose an archive without
 * teaching a second place which workshop belongs before, during, or after the current moment.
 */
export function groupWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): Readonly<Record<WorkshopPhase, readonly TWorkshop[]>> {
    const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
        ongoing: [],
        upcoming: [],
        'freshly-past': [],
        past: [],
    };

    for (const workshop of sortWorkshopsByPhase(workshops, currentTimeMilliseconds)) {
        workshopsByPhase[getWorkshopPhase(workshop, currentTimeMilliseconds)].push(workshop);
    }

    return workshopsByPhase;
}
