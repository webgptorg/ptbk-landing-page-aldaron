import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { Bot, BrainCircuit, Facebook, FileText, Github, Linkedin, Presentation, Youtube } from 'lucide-react';

export type PavolLink = {
    label: string;
    href: string;
    icon?: LucideIcon;
};

type PavolService = {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    topics: string[];
    buttonLabel: string;
    prefillMessage: string;
    formats?: { title: string; description: string }[];
};

export type PavolPageContent = {
    header: {
        navItems: PavolLink[];
        primaryAction: string;
        secondaryAction: string;
        languageSwitcherLabel: string;
        navigationLabel: string;
        skipLinkLabel: string;
        menuLabel: string;
    };
    hero: {
        eyebrow: string;
        title: string;
        introduction: string;
        portraitCaption: string;
        description: string;
        badges: string[];
        primaryAction: string;
        secondaryAction: string;
    };
    services: {
        eyebrow: string;
        title: string;
        description: string;
        items: PavolService[];
    };
    testimonials: {
        eyebrow: string;
        title: string;
        description: string;
    };
    projects: {
        eyebrow: string;
        title: string;
        description: string;
    };
    numbers: {
        eyebrow: string;
        title: string;
        description: string;
    };
    media: {
        eyebrow: string;
        title: string;
        description: string;
        highlightsLabel: string;
        restLabel: string;
        moreLabel: string;
    };
    contact: {
        eyebrow: string;
        title: string;
        description: string;
        formNameLabel: string;
        formNamePlaceholder: string;
        formEmailLabel: string;
        formEmailPlaceholder: string;
        formCompanyLabel: string;
        formCompanyPlaceholder: string;
        optionalLabel: string;
        inquiryLabel: string;
        generalInquiryLabel: string;
        formMessageLabel: string;
        formMessagePlaceholder: string;
        submitLabel: string;
        submittingLabel: string;
        successTitle: string;
        successDescription: string;
        errorMessage: string;
        submissionErrorMessage: string;
        anotherMessageLabel: string;
        javascriptRequiredMessage: string;
        otherContactsTitle: string;
        links: PavolLink[];
    };
    footer: {
        description: string;
        navigationTitle: string;
        connectTitle: string;
        primaryAction: string;
        rightsReservedText: string;
    };
};

const CV_LINK = 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing';

export const PAVOL_PAGE_CONTENT: Record<SupportedHomepageLanguage, PavolPageContent> = {
    cs: {
        header: {
            navItems: [
                { label: 'Spolupráce', href: '#services' },
                { label: 'Projekty', href: '#projects' },
                { label: 'Píšu a mluvím', href: '#writing' },
                { label: 'Kontakt', href: '#contact' },
            ],
            primaryAction: 'Domluvit hovor',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Přepnout jazyk',
            navigationLabel: 'Navigace stránky',
            skipLinkLabel: 'Přejít k obsahu',
            menuLabel: 'Menu',
        },
        hero: {
            eyebrow: 'AI konzultace, workshopy a vývoj',
            title: 'Pavol Hejný',
            introduction: 'Navrhuji AI agentní týmy.\nA stavím s nimi produkty.',
            portraitCaption: 'Vývojář · AI konzultant · Lektor',
            description:
                'Vyvíjím Promptbook a pomáhám firmám zapojit AI agenty do každodenní práce.',
            badges: ['AI konzultace', 'Workshopy a přednášky', '15+ let vývoje'],
            primaryAction: 'Domluvit hovor',
            secondaryAction: 'Moje projekty',
        },
        services: {
            eyebrow: '',
            title: 'S čím vám pomohu',
            description: '',
            items: [
                {
                    id: 'ai-agents', icon: Bot, title: 'AI agenti pro vaši firmu',
                    description: 'Navrhnu agenty pro vaši firemní agendu a s kolegy je propojím s vašimi nástroji.',
                    topics: ['Návrh rolí a pravidel agentů', 'Propojení s vašimi nástroji', 'Nasazení a ověření v provozu'],
                    buttonLabel: 'Probrat nasazení agentů',
                    prefillMessage: 'Dobrý den, Pavole. Máme zájem o nasazení AI agentů v naší firmě.',
                },
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI konzultace',
                    description:
                        'Pomohu vám vybrat nástroje a rozhodnout, kde a jak má AI ve vašem týmu smysl.',
                    topics: [
                        'Konkrétní použití ve vašem týmu',
                        'Výběr nástrojů a práce s daty',
                        'AI agenti v každodenní praxi',
                    ],
                    buttonLabel: 'Domluvit AI konzultaci',
                    prefillMessage: 'Dobrý den, Pavle. Mám zájem o AI konzultaci. Prosím, ozvěte se mi.',
                },
                {
                    id: 'ai-workshops-talks',
                    icon: Presentation,
                    title: 'Přednášky a školení',
                    formats: [
                        { title: 'Přednáška · přibližně 60 minut', description: 'Ukázky použití AI, souvislosti a prostor pro otázky.' },
                        { title: 'Workshop · přibližně 3-4 hodiny', description: 'Práce nad úlohami vašeho týmu, vlastní výstup a postup pro další práci.' },
                    ],
                    description:
                        'Naučím váš tým pracovat s AI na vlastních úlohách. Pro firmy i vývojáře.',
                    topics: [
                        'Praktické příklady pro váš obor',
                        'Vývoj s AI a kontrola kvality',
                        'Pro vývojáře i produktové týmy',
                    ],
                    buttonLabel: 'Domluvit workshop nebo přednášku',
                    prefillMessage: 'Dobrý den, Pavle. Mám zájem o AI workshop nebo přednášku. Prosím, ozvěte se mi.',
                },
            ],
        },
        testimonials: {
            eyebrow: '',
            title: 'Lidé, se kterými jsem pracoval',
            description: '',
        },
        projects: {
            eyebrow: '',
            title: 'Co stavím',
            description: '',
        },
        numbers: {
            eyebrow: 'Čísla',
            title: 'Praxe v číslech',
            description: 'Zajímá mě, co funguje v praxi. V týmu, v produktu i po delší době.',
        },
        media: {
            eyebrow: 'Média',
            title: 'Mediální zmínky',
            description: 'Přednášky a výstupy v médiích o AI, vývoji a digitálních produktech.',
            highlightsLabel: 'Vybrané výstupy',
            restLabel: 'Přednášky a zmínky v médiích',
            moreLabel: 'Další výstupy na LinkedIn',
        },
        contact: {
            eyebrow: '',
            title: 'Napište mi, co řešíte',
            description: 'Napište stručně, co řešíte. Ozvu se do 24 hodin.',
            formNameLabel: 'Jméno',
            formNamePlaceholder: 'Vaše jméno',
            formEmailLabel: 'E-mail',
            formEmailPlaceholder: 'jmeno@firma.cz',
            formCompanyLabel: 'Firma / organizace',
            formCompanyPlaceholder: 'Firma s.r.o.',
            optionalLabel: 'nepovinné',
            inquiryLabel: 'S čím vám mohu pomoci?',
            generalInquiryLabel: 'Jiný dotaz',
            formMessageLabel: 'Zpráva',
            formMessagePlaceholder: 'Popište stručně, co řešíte a s čím byste potřebovali pomoci.',
            submitLabel: 'Odeslat zprávu',
            submittingLabel: 'Odesílám...',
            successTitle: 'Děkuji, zpráva je odeslaná',
            successDescription: 'Ozvu se na uvedený e-mail co nejdřív.',
            errorMessage: 'Vyplňte prosím jméno, e-mail a zprávu.',
            submissionErrorMessage:
                'Zprávu se nepodařilo odeslat. Vaše údaje zůstaly vyplněné, zkuste to prosím znovu.',
            anotherMessageLabel: 'Napsat další zprávu',
            javascriptRequiredMessage: 'Pro odeslání formuláře zapněte JavaScript, nebo mi napište přes LinkedIn.',
            otherContactsTitle: 'Další odkazy',
            links: [
                { label: 'CV', href: CV_LINK, icon: FileText },
                { label: 'GitHub', href: 'https://github.com/hejny', icon: Github },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/', icon: Linkedin },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny', icon: Facebook },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny', icon: Youtube },
            ],
        },
        footer: {
            description:
                'Pomáhám firmám a týmům používat AI v praxi, od strategie a workshopů po konkrétní produktové a vývojové workflow.',
            navigationTitle: 'Navigace',
            connectTitle: 'Spojte se se mnou',
            primaryAction: 'Napište mi',
            rightsReservedText: 'Všechna práva vyhrazena.',
        },
    },
    en: {
        header: {
            navItems: [
                { label: 'Work with me', href: '#services' },
                { label: 'Projects', href: '#projects' },
                { label: 'Writing & speaking', href: '#writing' },
                { label: 'Contact', href: '#contact' },
            ],
            primaryAction: "Let's talk",
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Change language',
            navigationLabel: 'Page navigation',
            skipLinkLabel: 'Skip to content',
            menuLabel: 'Menu',
        },
        hero: {
            eyebrow: 'AI consulting, workshops, and software development',
            title: 'Pavol Hejný',
            introduction: 'I design AI agent teams.\nAnd build products with them.',
            portraitCaption: 'Developer · AI consultant · Educator',
            description: 'I develop Promptbook and help companies put AI agents to work.',
            badges: ['AI consulting', 'Workshops and talks', '15+ years building software'],
            primaryAction: "Let's talk",
            secondaryAction: 'See my projects',
        },
        services: {
            eyebrow: '',
            title: 'Work with me',
            description: '',
            items: [
                {
                    id: 'ai-agents', icon: Bot, title: 'AI agents for your company',
                    description: 'I design agents for your company’s ongoing work and bring in colleagues to connect them to your tools.',
                    topics: ['Agent roles and rules', 'Connections to your tools', 'Deployment and real-world validation'],
                    buttonLabel: 'Discuss deploying agents',
                    prefillMessage: 'Hi Pavol, we would like to discuss deploying AI agents in our company.',
                },
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI consulting',
                    description:
                        'I help you choose tools and decide where AI can make a useful difference in your team.',
                    topics: [
                        'Useful applications for your team',
                        'Tool selection and data security',
                        'AI agents in everyday work',
                    ],
                    buttonLabel: "Let's talk about AI consulting",
                    prefillMessage: 'Hi Pavol, I would like to talk about AI consulting.',
                },
                {
                    id: 'ai-workshops-talks',
                    icon: Presentation,
                    title: 'Talks and training',
                    formats: [
                        { title: 'Talk · around 60 minutes', description: 'Practical examples, context and time for questions.' },
                        { title: 'Workshop · around 3-4 hours', description: 'Work on your team’s tasks, create a concrete result and take away a method you can use again.' },
                    ],
                    description:
                        'I teach your team to use AI on their own tasks. For companies and developers.',
                    topics: [
                        'Practical examples for your field',
                        'Development with AI and quality control',
                        'For developers and product teams',
                    ],
                    buttonLabel: 'Arrange a workshop or talk',
                    prefillMessage: 'Hi Pavol, I would like to talk about an AI workshop or talk.',
                },
            ],
        },
        testimonials: {
            eyebrow: '',
            title: 'People I have worked with',
            description: '',
        },
        projects: {
            eyebrow: '',
            title: 'What I build',
            description: '',
        },
        numbers: {
            eyebrow: 'By the numbers',
            title: 'Experience, in numbers',
            description: 'I care about what works in practice, in a team, in a product, and over time.',
        },
        media: {
            eyebrow: 'In the media',
            title: 'Media coverage',
            description: 'Talks and media appearances about AI, software development, and digital products.',
            highlightsLabel: 'Selected appearances',
            restLabel: 'Talks and media coverage',
            moreLabel: 'More on LinkedIn',
        },
        contact: {
            eyebrow: '',
            title: 'Tell me what you need help with',
            description: 'Tell me briefly what you need help with. I will reply within 24 hours.',
            formNameLabel: 'Name',
            formNamePlaceholder: 'Your name',
            formEmailLabel: 'Email',
            formEmailPlaceholder: 'you@company.com',
            formCompanyLabel: 'Company / organization',
            formCompanyPlaceholder: 'Awesome Company',
            optionalLabel: 'optional',
            inquiryLabel: 'What can I help you with?',
            generalInquiryLabel: 'General enquiry',
            formMessageLabel: 'Message',
            formMessagePlaceholder: 'Briefly explain your situation and what you need help with.',
            submitLabel: 'Send message',
            submittingLabel: 'Sending...',
            successTitle: 'Thanks. Your message has been sent.',
            successDescription: 'I will reply to your email soon.',
            errorMessage: 'Please fill in your name, email, and message.',
            submissionErrorMessage: 'Your message could not be sent. Your details are still here; please try again.',
            anotherMessageLabel: 'Write another message',
            javascriptRequiredMessage: 'To send this form, enable JavaScript or contact me through LinkedIn.',
            otherContactsTitle: 'Find me elsewhere',
            links: [
                { label: 'CV', href: CV_LINK, icon: FileText },
                { label: 'GitHub', href: 'https://github.com/hejny', icon: Github },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hejny/', icon: Linkedin },
                { label: 'Facebook', href: 'https://www.facebook.com/hejny', icon: Facebook },
                { label: 'YouTube', href: 'https://www.youtube.com/@pavolhejny', icon: Youtube },
            ],
        },
        footer: {
            description:
                'I help companies and teams use AI in their work, from strategy and workshops to product and engineering workflows.',
            navigationTitle: 'Navigation',
            connectTitle: 'Elsewhere',
            primaryAction: 'Contact me',
            rightsReservedText: 'All rights reserved.',
        },
    },
};
