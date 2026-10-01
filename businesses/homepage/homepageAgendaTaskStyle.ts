import type { HomepageAgendaTaskState } from '@/businesses/homepage/homepageContent';

/**
 * How one state of a task inside an agenda looks
 */
type HomepageAgendaTaskStyle = {
    /**
     * Classes of the small marker in front of the task
     */
    readonly marker: string;

    /**
     * Classes of the task label, which only the escalated task raises above the rest
     */
    readonly label: string;

    /**
     * Classes of the line saying when the task happens
     */
    readonly cadence: string;

    /**
     * Whether the marker keeps moving, which only the task being worked on right now does
     */
    readonly isMarkerAnimated?: boolean;
};

/**
 * Look of every state a task of an agenda can be in
 *
 * Note: The map lives beside the components rather than in `lib`, because Tailwind only scans the directories the
 *       pages are built from and a class name written anywhere else would compile away to nothing.
 */
export const HOMEPAGE_AGENDA_TASK_STYLES: Readonly<Record<HomepageAgendaTaskState, HomepageAgendaTaskStyle>> = {
    done: {
        marker: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300',
        label: 'text-white/55 line-through decoration-white/25',
        cadence: 'text-white/35',
    },
    running: {
        marker: 'border-cyan-300/60 bg-cyan-300/20 text-cyan-200',
        label: 'text-white',
        cadence: 'text-cyan-200/80',
        isMarkerAnimated: true,
    },
    scheduled: {
        marker: 'border-white/20 bg-white/5 text-white/50',
        label: 'text-white/75',
        cadence: 'text-white/40',
    },
    escalated: {
        marker: 'border-amber-300/60 bg-amber-300/20 text-amber-200',
        label: 'text-white font-medium',
        cadence: 'text-amber-200/90',
    },
};
