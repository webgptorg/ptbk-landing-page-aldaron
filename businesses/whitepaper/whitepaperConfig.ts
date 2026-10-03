import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export const WHITEPAPER_PATHS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: '/cs/whitepaper',
    en: '/en/whitepaper',
};

export const WHITEPAPER_VERSION = '0.1';
export const WHITEPAPER_DATE = '2026-10-02';
export const WHITEPAPER_AUTHOR = 'Pavol Hejný';
export const WHITEPAPER_REPOSITORY_URL = 'https://github.com/webgptorg/promptbook';
export const WHITEPAPER_PARTS = ['agent', 'project', 'task'] as const;
export type WhitepaperPart = (typeof WHITEPAPER_PARTS)[number];

export const WHITEPAPER_SECTIONS = ['framework', 'idea', 'cycle', 'history', 'practice', 'read'] as const;
export type WhitepaperSection = (typeof WHITEPAPER_SECTIONS)[number];
