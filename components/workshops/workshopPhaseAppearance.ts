import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

/**
 * Backgrounds a phase is drawn on: the light administration and a room following the member's theme.
 */
export type WorkshopPhaseTone = 'light' | 'room';

/**
 * How one phase names itself and which colour says so
 */
export type WorkshopPhaseAppearance = {
    /**
     * How this phase is named wherever a term of it is listed
     */
    readonly label: string;

    /**
     * Classes of the badge which names this phase on each of the two backgrounds
     */
    readonly badgeClassNameByTone: Readonly<Record<WorkshopPhaseTone, string>>;

    /**
     * Classes of a calendar day which carries a term of this phase
     */
    readonly calendarDayClassName: string;

    /**
     * Classes of the small mark standing for one term of this phase inside a calendar day and in its legend
     */
    readonly markClassName: string;
};

/**
 * The one description of how every phase looks, wherever a term is listed
 *
 * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
 *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
 *       history - because both of them read their colours here instead of choosing their own.
 * Note: These colours live beside the components which wear them rather than among the rules of the application,
 *       because only the directories of the components are read for the styles the application is built with.
 */
const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
    ongoing: {
        label: 'Probíhá',
        badgeClassNameByTone: {
            light: 'bg-emerald-100 text-emerald-800',
            room: 'bg-room-success/15 text-room-success ring-1 ring-inset ring-room-success/40',
        },
        calendarDayClassName: 'border-room-success/50 bg-room-success/15 text-room-success',
        markClassName: 'bg-room-success',
    },
    // Note: A term which has only just been held is neither what is happening nor what is long over, and it is drawn
    //       as exactly that: warm enough to be noticed among the history, quiet enough never to be mistaken for a
    //       workshop which is still running.
    'freshly-past': {
        label: 'Právě proběhlo',
        badgeClassNameByTone: {
            light: 'bg-amber-100 text-amber-800',
            room: 'bg-room-warning/15 text-room-warning ring-1 ring-inset ring-room-warning/40',
        },
        calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
        markClassName: 'bg-room-warning',
    },
    // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
    //       cannot infer a date at a glance.
    'upcoming-next-week': {
        label: 'Do týdne',
        badgeClassNameByTone: {
            light: 'bg-violet-100 text-violet-800',
            room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',
        },
        calendarDayClassName: 'border-room-upcoming/40 bg-room-upcoming/10 text-room-upcoming',
        markClassName: 'bg-room-upcoming',
    },
    upcoming: {
        label: 'Nadchází',
        badgeClassNameByTone: {
            light: 'bg-cyan-100 text-cyan-800',
            room: 'bg-room-accent/15 text-room-accent ring-1 ring-inset ring-room-accent/40',
        },
        calendarDayClassName: 'border-room-accent/40 bg-room-accent/10 text-room-accent',
        markClassName: 'bg-room-action',
    },
    past: {
        label: 'Proběhlo',
        badgeClassNameByTone: {
            light: 'bg-slate-100 text-slate-500',
            room: 'bg-room-overlay/5 text-room-muted ring-1 ring-inset ring-room-border/10',
        },
        calendarDayClassName: 'border-room-muted/25 bg-room-muted/10 text-room-text',
        markClassName: 'bg-room-muted',
    },
};

export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
    return WORKSHOP_PHASE_APPEARANCES[phase];
}
