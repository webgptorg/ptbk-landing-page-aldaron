export const WHITEPAPER_CYCLE_SCENARIOS = ['pass', 'repair', 'pause'] as const;
export type WhitepaperCycleScenario = (typeof WHITEPAPER_CYCLE_SCENARIOS)[number];

const INITIAL_STAGES = ['observe', 'select', 'work', 'verify'] as const;
export const WHITEPAPER_CYCLE_PATHS = {
    pass: [...INITIAL_STAGES, 'commit'],
    repair: [...INITIAL_STAGES, 'repair', 'recheck', 'commit'],
    pause: [...INITIAL_STAGES, 'repair', 'recheck', 'pause'],
} as const;
