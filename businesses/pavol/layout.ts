import type { CSSProperties } from 'react';

export const PAVOL_CONTAINER_CLASS_NAME = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12';

export const PAVOL_COLORS = {
    INK: '#203932',
    ACCENT: '#356653',
    PAPER: '#faf8f2',
    WARM: '#efece2',
    GOLD: '#e4bc70',
    MUTED: '#606b63',
    BORDER: '#d8dfd7',
} as const;

export const PAVOL_SITE_STYLE = {
    ['--pavol-ink' as string]: PAVOL_COLORS.INK,
    ['--pavol-accent' as string]: PAVOL_COLORS.ACCENT,
    ['--pavol-paper' as string]: PAVOL_COLORS.PAPER,
    ['--pavol-warm' as string]: PAVOL_COLORS.WARM,
    ['--pavol-gold' as string]: PAVOL_COLORS.GOLD,
    ['--pavol-muted' as string]: PAVOL_COLORS.MUTED,
    ['--pavol-border' as string]: PAVOL_COLORS.BORDER,
} as CSSProperties;
