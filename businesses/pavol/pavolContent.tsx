import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { BrainCircuit, Facebook, FileText, Github, Linkedin, Presentation, Youtube } from 'lucide-react';

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
                { label: 'Jak vám pomohu', href: '#services' },
                { label: 'Reference', href: '#testimonials' },
                { label: 'Projekty', href: '#projects' },
                { label: 'Čísla', href: '#numbers' },
                { label: 'Média', href: '#media' },
                { label: 'Kontakt', href: '#contact' },
            ],
            primaryAction: 'Napište mi',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Přepnout jazyk',
            navigationLabel: 'Navigace stránky',
            skipLinkLabel: 'Přejít k obsahu',
            menuLabel: 'Menu',
        },
        hero: {
            eyebrow: 'AI konzultace, workshopy a vývoj',
            title: 'Pavol Hejný',
            introduction: 'Stavím produkty.\nPomáhám týmům s AI.',
            portraitCaption: 'Vývojář · AI konzultant · Lektor',
            description:
                'Pomáhám firmám a týmům nasadit AI do vývoje, produktů a interních procesů tak, aby jim v praxi přinášela užitek.',
            badges: ['AI konzultace', 'Workshopy a přednášky', '15+ let vývoje'],
            primaryAction: 'Probrat AI',
            secondaryAction: 'Moje projekty',
        },
        services: {
            eyebrow: 'S čím pomohu',
            title: 'S čím vám pomohu',
            description:
                'Každý tým řeší něco jiného. Pomohu vám najít konkrétní použití AI, nastavit proces a vybrat způsob práce, který sedne vašemu produktu.',
            items: [
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI konzultace',
                    description:
                        'Strategie, výběr nástrojů, vendor lock-in, bezpečnost dat, práce s AI agenty a cesta od dema k běžnému provozu.',
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
                    title: 'Workshopy a přednášky',
                    description:
                        'Přednášky a praktické workshopy pro firmy, produktové týmy a vývojáře. Zaměříme se na to, co můžete hned použít, jak udržet kvalitu a která rozhodnutí je potřeba udělat.',
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
            eyebrow: 'Reference',
            title: 'Lidé, se kterými jsem pracoval',
            description: 'Reference z projektů, školení, workshopů i delší spolupráce.',
        },
        projects: {
            eyebrow: 'Projekty',
            title: 'Od aplikací po AI agenty',
            description:
                'Vyvíjím už více než polovinu života. Pracoval jsem na webových aplikacích, vzdělávacích produktech i AI agentech. Tady jsou projekty, které nejlépe ukazují, čemu se věnuji dnes.',
        },
        numbers: {
            eyebrow: 'Čísla',
            title: 'Praxe v číslech',
            description: 'Zajímá mě, co funguje v praxi. V týmu, v produktu i po delší době.',
        },
        media: {
            eyebrow: 'Média',
            title: 'Rozhovory, podcasty a přednášky',
            description: 'O AI, vývoji a digitálních produktech mluvím v rozhovorech, podcastech a na přednáškách.',
            highlightsLabel: 'Vybrané výstupy',
            restLabel: 'Další výstupy',
            moreLabel: 'Další výstupy na LinkedIn',
        },
        contact: {
            eyebrow: 'Kontakt',
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
                { label: 'How I can help', href: '#services' },
                { label: 'What people say', href: '#testimonials' },
                { label: 'Projects', href: '#projects' },
                { label: 'By the numbers', href: '#numbers' },
                { label: 'In the media', href: '#media' },
                { label: 'Contact', href: '#contact' },
            ],
            primaryAction: 'Contact me',
            secondaryAction: 'CV',
            languageSwitcherLabel: 'Change language',
            navigationLabel: 'Page navigation',
            skipLinkLabel: 'Skip to content',
            menuLabel: 'Menu',
        },
        hero: {
            eyebrow: 'AI consulting, workshops, and software development',
            title: 'Pavol Hejný',
            introduction: 'I build products.\nI help teams work with AI.',
            portraitCaption: 'Developer · AI consultant · Educator',
            description: 'I help companies and teams put AI to work in development, products, and internal processes.',
            badges: ['AI consulting', 'Workshops and talks', '15+ years building software'],
            primaryAction: "Let's talk about AI",
            secondaryAction: 'See my projects',
        },
        services: {
            eyebrow: 'How I can help',
            title: 'What I can help with',
            description:
                'Every team needs something different. I help you find a useful role for AI, set up the process, and choose an approach that fits your product.',
            items: [
                {
                    id: 'ai-consulting',
                    icon: BrainCircuit,
                    title: 'AI consulting',
                    description:
                        'Strategy, tool selection, vendor lock-in, data security, AI agents, and the move from demo to daily use.',
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
                    title: 'Workshops and talks',
                    description:
                        'Talks and hands-on workshops for companies, product teams, and developers. We focus on what you can use right away, how to keep quality up, and the decisions you need to make.',
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
            eyebrow: 'What people say',
            title: 'People I have worked with',
            description: 'Notes from projects, training, workshops, and longer collaborations.',
        },
        projects: {
            eyebrow: 'Projects',
            title: 'From apps to AI agents',
            description:
                'I have been building software for more than half my life. I have worked on web apps, education products, and AI agents. These projects show the kind of work I do today.',
        },
        numbers: {
            eyebrow: 'By the numbers',
            title: 'Experience, in numbers',
            description: 'I care about what works in practice, in a team, in a product, and over time.',
        },
        media: {
            eyebrow: 'In the media',
            title: 'Interviews, podcasts, and talks',
            description: 'I talk about AI, development, and digital products on podcasts, in interviews, and at talks.',
            highlightsLabel: 'Selected appearances',
            restLabel: 'Other appearances',
            moreLabel: 'More on LinkedIn',
        },
        contact: {
            eyebrow: 'Contact',
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
