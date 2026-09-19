import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

/**
 * Backgrounds a phase is drawn on: the light administration and the dark room a member reads
 */
export type WorkshopPhaseTone = 'light' | 'dark';

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
            dark: 'bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/40',
        },
        calendarDayClassName: 'border-emerald-300/50 bg-emerald-400/15 text-emerald-50',
        markClassName: 'bg-emerald-300',
    },
    // Note: A term which has only just been held is neither what is happening nor what is long over, and it is drawn
    //       as exactly that: warm enough to be noticed among the history, quiet enough never to be mistaken for a
    //       workshop which is still running.
    'freshly-past': {
        label: 'Právě proběhlo',
        badgeClassNameByTone: {
            light: 'bg-amber-100 text-amber-800',
            dark: 'bg-amber-300/15 text-amber-100 ring-1 ring-inset ring-amber-300/40',
        },
        calendarDayClassName: 'border-amber-300/40 bg-amber-300/10 text-amber-50',
        markClassName: 'bg-amber-300',
    },
    // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
    //       cannot infer a date at a glance.
    'upcoming-next-week': {
        label: 'Do týdne',
        badgeClassNameByTone: {
            light: 'bg-violet-100 text-violet-800',
            dark: 'bg-violet-300/15 text-violet-100 ring-1 ring-inset ring-violet-300/40',
        },
        calendarDayClassName: 'border-violet-300/40 bg-violet-300/10 text-violet-50',
        markClassName: 'bg-violet-300',
    },
    upcoming: {
        label: 'Nadchází',
        badgeClassNameByTone: {
            light: 'bg-cyan-100 text-cyan-800',
            dark: 'bg-cyan-300/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/40',
        },
        calendarDayClassName: 'border-cyan-300/40 bg-cyan-300/10 text-cyan-50',
        markClassName: 'bg-cyan-300',
    },
    past: {
        label: 'Proběhlo',
        badgeClassNameByTone: {
            light: 'bg-slate-100 text-slate-500',
            dark: 'bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10',
        },
        calendarDayClassName: 'border-slate-300/25 bg-slate-300/10 text-slate-300',
        markClassName: 'bg-slate-400',
    },
};

export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
    return WORKSHOP_PHASE_APPEARANCES[phase];
}
