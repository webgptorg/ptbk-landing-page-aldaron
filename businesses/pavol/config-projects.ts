import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ExternalLink, FileText, Github } from 'lucide-react';

export type PavolProjectLink = {
    href: string;
    label: string;
    icon?: LucideIcon;
};

export type PavolProjectLogo = {
    src: string;
    className?: string;
};

export type PavolProject = {
    icon?: LucideIcon;
    logos?: PavolProjectLogo[];
    logoText?: string;
    logoFrameClassName?: string;
    title: string;
    description: string;
    links: PavolProjectLink[];
};

const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png';
const collboardLogo = '/pavol/projects/collboard.svg';
const hEduLogo = '/pavol/projects/h-edu.svg';

export const pavolProjects: Record<SupportedHomepageLanguage, PavolProject[]> = {
    cs: [
        {
            logos: [{ src: promptbookLogo, className: 'h-7 w-7' }],
            title: 'Promptbook',
            description:
                'Ekosystém AI agentů, kteří si drží cíle, pravidla, znalosti a firemní kontext.',
            links: [{ href: createPublicUrl('/'), label: 'Otevřít Promptbook', icon: ArrowRight }],
        },
        {
            logos: [{ src: collboardLogo, className: 'h-7 w-7' }],
            title: 'Collboard & H-edu',
            description:
                'Produkty pro vzdělávání a spolupráci online, které se osvědčily ve školách i při rychlé změně okolností.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
                { href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink },
            ],
        },
        {
            logoText: 'AI*',
            title: 'AI Supervize',
            description:
                'Praktický rámec pro firmy a týmy, které chtějí mít při vývoji s AI méně chaosu a lépe hlídat kvalitu.',
            links: [{ href: createPublicUrl('/ai-supervize'), label: 'AI Supervize', icon: ArrowRight }],
        },
        {
            icon: Github,
            title: 'Všechny projekty',
            description:
                'Desítky open-source a produktových projektů. Od prototypů přes vzdělávací produkty po nástroje pro AI a vývoj.',
            links: [
                { href: 'https://github.com/hejny', label: 'GitHub', icon: Github },
                {
                    href: 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing',
                    label: 'CV',
                    icon: FileText,
                },
            ],
        },
    ],
    en: [
        {
            logos: [{ src: promptbookLogo, className: 'h-7 w-7' }],
            title: 'Promptbook',
            description:
                'AI agents that keep track of goals, rules, knowledge, and company context.',
            links: [{ href: createPublicUrl('/'), label: 'Open Promptbook', icon: ArrowRight }],
        },
        {
            logos: [{ src: collboardLogo, className: 'h-7 w-7' }],
            title: 'Collboard & H-edu',
            description:
                'Education and online collaboration products used in schools, including when circumstances changed quickly.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
                { href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink },
            ],
        },
        {
            logoText: 'AI*',
            title: 'AI Supervize',
            description:
                'A practical framework for companies and teams that want less chaos and tighter quality control when developing with AI.',
            links: [{ href: createPublicUrl('/ai-supervize'), label: 'AI Supervize', icon: ArrowRight }],
        },
        {
            icon: Github,
            title: 'All projects',
            description:
                'Dozens of open-source and product projects, from prototypes and education products to AI and developer tools.',
            links: [
                { href: 'https://github.com/hejny', label: 'GitHub', icon: Github },
                {
                    href: 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing',
                    label: 'CV',
                    icon: FileText,
                },
            ],
        },
    ],
};
