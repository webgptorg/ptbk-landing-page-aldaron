import type { CSSProperties } from 'react';
import brand from './brand.json';

/** Product-only tokens. Apply to a Promptbook wrapper, never the shared document root. */
export const PROMPTBOOK_BRAND = brand;
export const PROMPTBOOK_BRAND_STYLE = Object.fromEntries(
    Object.entries(brand.colors).map(([name, value]) => [`--ptbk-${name}`, value]),
) as CSSProperties;

export const PROMPTBOOK_INTRO = {
    cs: ['Předáte agendu.', 'Nastavíte pravidla.', 'Spustíte agenty.', 'Pracují sami.', 'Ozvou se, jen když Vás potřebují.', 'Vy máte kdykoliv přehled.'],
    en: ['Hand over a responsibility.', 'Set the rules.', 'Start your agents.', 'They work independently.', 'They ask only when they need you.', 'You can check in at any time.'],
};
