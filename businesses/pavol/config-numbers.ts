import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { Bot, BriefcaseBusiness, FolderKanban } from 'lucide-react';

export type PavolNumber = {
    icon: LucideIcon;
    value: string;
    label: string;
};

export const pavolNumbers: Record<SupportedHomepageLanguage, PavolNumber[]> = {
    cs: [
        {
            icon: BriefcaseBusiness,
            value: '15+',
            label: 'let vývoje',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'roky s AI v praxi',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'projektů od prototypu ke spuštění',
        },
    ],
    en: [
        {
            icon: BriefcaseBusiness,
            value: '15+',
            label: 'years building software',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'years applying AI',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'projects from prototype to launch',
        },
    ],
};
