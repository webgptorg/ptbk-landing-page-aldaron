export type RecordingMonitorLayout = 'grid' | 'focus' | 'pinned';
export type RecordingMonitorPreferences = {
    readonly layout: RecordingMonitorLayout;
    readonly primarySourceId: string | null;
    readonly hiddenSourceIds: readonly string[];
    readonly minimizedSourceIds: readonly string[];
    readonly audibleSourceIds: readonly string[];
    readonly mirroredSourceIds: readonly string[];
};

const MONITOR_PREFERENCES_KEY = 'promptbook-recording-studio-monitor-v1';
export const DEFAULT_MONITOR_PREFERENCES: RecordingMonitorPreferences = {
    layout: 'grid', primarySourceId: null, hiddenSourceIds: [], minimizedSourceIds: [], audibleSourceIds: [], mirroredSourceIds: [],
};

/** Presentation only. Capture source intent remains in its separate versioned key. */
export function loadRecordingMonitorPreferences(): RecordingMonitorPreferences {
    if (typeof window === 'undefined') return DEFAULT_MONITOR_PREFERENCES;
    try {
        const value = JSON.parse(window.localStorage.getItem(MONITOR_PREFERENCES_KEY) ?? '{}') as Partial<RecordingMonitorPreferences>;
        const stringIds = (ids: unknown): string[] => Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
        return {
            layout: value.layout === 'focus' || value.layout === 'pinned' ? value.layout : 'grid',
            primarySourceId: typeof value.primarySourceId === 'string' ? value.primarySourceId : null,
            hiddenSourceIds: stringIds(value.hiddenSourceIds), minimizedSourceIds: stringIds(value.minimizedSourceIds),
            audibleSourceIds: stringIds(value.audibleSourceIds), mirroredSourceIds: stringIds(value.mirroredSourceIds),
        };
    } catch { return DEFAULT_MONITOR_PREFERENCES; }
}

export function saveRecordingMonitorPreferences(preferences: RecordingMonitorPreferences): void {
    try { window.localStorage.setItem(MONITOR_PREFERENCES_KEY, JSON.stringify(preferences)); }
    catch { /* A blocked preference store must not affect capture. */ }
}
