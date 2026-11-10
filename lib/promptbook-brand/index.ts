import type { CSSProperties } from 'react';
import brand from './brand.json';

/** Product-only tokens. Apply to a Promptbook wrapper, never the shared document root. */
export const PROMPTBOOK_BRAND = brand;
export const PROMPTBOOK_BRAND_STYLE = Object.fromEntries(
    Object.entries(brand.colors).map(([name, value]) => [`--ptbk-${name}`, value]),
) as CSSProperties;

export const PROMPTBOOK_DEPLOYMENT = {
    cs: 'Tým agentů si spustíte na svém počítači, firemním serveru nebo VPS.',
    en: 'Run your team of agents on your own computer, company server or VPS.',
};

export const PROMPTBOOK_INTRO = {
    cs: ['Předáte agendu a nastavíte pravidla.', 'Agenti pracují samostatně a ozvou se, když Vás potřebují.'],
    en: ['Hand over ongoing work and set the rules.', 'Your agents work independently and check in when they need you.'],
};
