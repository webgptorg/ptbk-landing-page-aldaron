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
    caseStudy?: { problem: string; role: string; result: string };
    prominence?: number;
    publishedAt?: string;
    screenshot?: { src: string; alt: string };
    icon?: LucideIcon;
    logos?: PavolProjectLogo[];
    logoText?: string;
    logoFrameClassName?: string;
    title: string;
    description: string;
    links: PavolProjectLink[];
};

const PROMPTBOOK_LOGO = '/logo/promptbook-logo-blue-transparent-1024.png';
const collboardLogo = '/pavol/projects/collboard.svg';
const hEduLogo = '/pavol/projects/h-edu.svg';

export const pavolProjects: Record<SupportedHomepageLanguage, PavolProject[]> = {
    cs: [
        {
            logos: [{ src: PROMPTBOOK_LOGO, className: 'h-7 w-7' }],
            title: 'Promptbook',
            caseStudy: { problem: 'Jak dát AI agentům dlouhodobý cíl a firemní kontext?', role: 'Navrhuji a vyvíjím prostředí pro agentní týmy, jejich projekty a úkoly.', result: 'Vlastní open-source nástroj, na kterém tento způsob práce ověřuji.' }, prominence: 4,
            description:
                'Ekosystém AI agentů, kteří si drží cíle, pravidla, znalosti a firemní kontext.',
            links: [{ href: createPublicUrl('/'), label: 'Otevřít Promptbook', icon: ArrowRight }],
        },
        {
            logos: [{ src: collboardLogo, className: 'h-7 w-7' }],
            title: 'Collboard',
            caseStudy: { problem: 'Jak umožnit společnou práci na online tabuli a přidávat výukové nástroje?', role: 'Pracoval jsem na návrhu a vývoji rozšiřitelné tabule pro kreslení, výuku a spolupráci.', result: 'Online tabule s výukovými šablonami a rozšiřitelnými nástroji.' }, prominence: 3,
            screenshot: { src: '/pavol/projects/collboard-ui.png', alt: 'Collboard: online tabule a výběr výukových šablon' },
            description:
                'Sdílená online tabule pro výuku, kreslení a spolupráci. S rozšiřitelnými nástroji a výukovými šablonami.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
            ],
        },
        {
            logos: [{ src: hEduLogo }], title: 'H-edu',
            caseStudy: { problem: 'Jak převést výukové materiály do interaktivní aplikace?', role: 'Vytvořil jsem první prototyp a navrhl systémovou architekturu.', result: 'Prototyp pomohl týmu získat investici a pokračovat ve vývoji.' }, prominence: 3,
            description: 'Interaktivní učebnice a materiály, které propojují úlohy, metodiku a přípravu na výuku.',
            screenshot: { src: '/pavol/projects/h-edu-ui.png', alt: 'H-edu: matematická úloha a související materiály' },
            links: [{ href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink }],
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
            logos: [{ src: PROMPTBOOK_LOGO, className: 'h-7 w-7' }],
            title: 'Promptbook',
            caseStudy: { problem: 'How can AI agents retain a long-term goal and company context?', role: 'I design and develop an environment for agent teams, their projects and tasks.', result: 'An open-source product where I put this way of working into practice.' }, prominence: 4,
            description:
                'AI agents that keep track of goals, rules, knowledge, and company context.',
            links: [{ href: createPublicUrl('/'), label: 'Open Promptbook', icon: ArrowRight }],
        },
        {
            logos: [{ src: collboardLogo, className: 'h-7 w-7' }],
            title: 'Collboard',
            caseStudy: { problem: 'How can people share a whiteboard and extend it with teaching tools?', role: 'I worked on the design and development of an extensible whiteboard for drawing, teaching and collaboration.', result: 'A shared whiteboard with teaching templates and extensible tools.' }, prominence: 3,
            screenshot: { src: '/pavol/projects/collboard-ui.png', alt: 'Collboard: shared whiteboard and educational templates' },
            description:
                'A shared online whiteboard for teaching, drawing, and collaboration, with extensible tools and educational templates.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
            ],
        },
        {
            logos: [{ src: hEduLogo }], title: 'H-edu',
            caseStudy: { problem: 'How can teaching materials become an interactive application?', role: 'I built the first prototype and designed the system architecture.', result: 'The prototype helped the team secure investment and continue development.' }, prominence: 3,
            description: 'Interactive textbooks connecting exercises, teaching guidance, and lesson preparation.',
            screenshot: { src: '/pavol/projects/h-edu-ui.png', alt: 'H-edu: a maths exercise and related teaching materials' },
            links: [{ href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink }],
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
