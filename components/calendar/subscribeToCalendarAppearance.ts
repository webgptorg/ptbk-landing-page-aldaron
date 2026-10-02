/**
 * The shape every way of taking the published calendar away is drawn in
 *
 * Note: Subscribing to the calendar and copying its address are the same offer made to different calendar
 *       applications, so they wear one pill rather than each control inventing its own.
 */
export const SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

/**
 * How the leading way of subscribing, which most members take, is coloured
 */
export const SUBSCRIBE_TO_CALENDAR_PRIMARY_CONTROL_CLASS_NAME =
    'border-room-accent/30 bg-room-accent/10 text-room-accent hover:border-room-accent/60 hover:bg-room-accent/20 hover:text-room-heading';

/**
 * How every further way of taking the calendar is coloured
 */
export const SUBSCRIBE_TO_CALENDAR_SECONDARY_CONTROL_CLASS_NAME =
    'border-room-border/10 bg-room-overlay/5 text-room-text hover:border-room-border/20 hover:bg-room-overlay/10 hover:text-room-heading';
