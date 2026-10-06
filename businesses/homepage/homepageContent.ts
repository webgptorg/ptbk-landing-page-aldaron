import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export const HOMEPAGE_CONTENT = {
    cs: {
        navigation: {
            skip: 'Přejít na obsah',
            label: 'Hlavní navigace',
            examples: 'Co můžete předat',
            control: 'Jak si udržíte kontrolu',
            contact: 'Probrat nasazení',
        },
        hero: {
            eyebrow: 'Promptbook pro vaši firmu',
            title: 'Předejte AI agendu.',
            accent: 'Ne každý další úkol.',
            description:
                'Méně zadávání a připomínání. Vyvíjíme a nasazujeme pro firmy AI systémy, které mají průběžně rozpoznávat potřebnou práci a navazovat na ni v dohodnutých mezích.',
            note: 'Vy určujete směr. Systém přebírá návaznost práce.',
            explore: 'Podívat se na příklady',
        },
        cta: 'Probrat naši agendu',
        stories: {
            eyebrow: 'Jedna odpovědnost. Více než jeden úkol.',
            title: 'Co už nemusíte pořád hlídat?',
            illustration: 'Interaktivní ilustrace na fiktivních příkladech. Ukazuje směr vývoje, ne hotové integrace.',
            choose: 'Vyberte agendu',
            steps: 'Momenty příběhu',
            previous: 'Předchozí krok',
            next: 'Další krok',
            replay: 'Příběh od začátku',
            entrusted: 'Svěřená agenda',
            result: 'Co tím získáte',
            owner: 'Kdy vstupujete vy',
            statuses: {
                received: 'Nový podnět',
                prepared: 'Připraveno',
                attention: 'Rozhoduje člověk',
                approved: 'Schváleno a vydáno',
                waiting: 'Čeká, až bude potřeba',
            },
            reader: 'Všechny příklady v textu',
            burden: 'Dnes vás zatěžuje',
            responsibility: 'Co předáváte',
            benefit: 'Přínos',
            fallback: 'Příběhy si můžete projít v textové podobě níže.',
        },
        control: {
            eyebrow: 'Méně operativy. Směr zůstává váš.',
            title: 'Dohodněte výsledek.\nA hranice.',
            description:
                'Agenda je trvalá oblast odpovědnosti — třeba péče o aplikaci. Má cíl, souvislosti a pravidla pro další práci.',
            before: 'Jednotlivá zadání',
            beforeSteps: ['Všimnete si problému', 'Zadáte další úkol', 'Připomenete návaznost'],
            after: 'Svěřená agenda',
            afterSteps: ['Dohodnete cíl a meze', 'Relevantní práce navazuje', 'Rozhodujete výjimky'],
            cards: [
                {
                    title: 'Jasný rozsah',
                    description: 'Společně určíme, o co má systém pečovat a podle čeho poznáte užitečný výsledek.',
                },
                {
                    title: 'Pravomoci podle dopadu',
                    description:
                        'Domluvíme, co může pokračovat samostatně a kde má změna, zpráva nebo jiný závazek čekat na člověka.',
                },
                {
                    title: 'Průběžný přehled',
                    description: 'Navrhneme dohled a předávání výjimek. Vy můžete změnit priority nebo práci zastavit.',
                },
            ],
        },
        contact: {
            eyebrow: 'Od vaší situace ke konkrétnímu nasazení',
            title: 'Kterou agendu už nechcete\nkaždý den roztáčet?',
            description:
                'Probereme opakující se práci ve vaší firmě, dostupné podklady a hranice odpovědnosti. Navrhneme, kde má smysl začít a co je potřeba nejdřív ověřit.',
            status: 'Na autonomních agendách pracujeme. Rozsah dnešního nasazení i potřebný vývoj posuzujeme pro konkrétní firmu; plná samostatnost napříč agendami je dlouhodobá vize.',
            team: 'Proberte to s týmem, který Promptbook vyvíjí.',
            direct: 'Nebo napište přímo',
            paperTitle: 'Chcete znát principy?',
            paper: 'Přečíst whitepaper',
            companyTitle: 'Hledáte odpovědi ve firemních datech?',
            company: 'AI nad firemními dokumenty',
        },
        enquiry: {
            title: 'Proberme vaši agendu',
            description: 'Popište, co se ve firmě opakuje. Ozveme se a společně posoudíme možnosti nasazení.',
            agenda: 'Kterou oblast chcete probrat?',
            other: 'Jiná firemní agenda',
            placeholder: 'Vyberte oblast',
            message: 'Co dnes musíte opakovaně řešit?',
            messagePlaceholder: 'Co se vrací, kdo to řeší a jak by měl vypadat dobrý výsledek…',
            name: 'Jméno',
            company: 'Firma',
            email: 'Pracovní e-mail',
            phone: 'Telefon (nepovinné)',
            submit: 'Odeslat poptávku',
            submitting: 'Odesíláme…',
            close: 'Zavřít',
            required: 'Vyplňte prosím toto pole.',
            invalidEmail: 'Zadejte prosím platný e-mail.',
            failure: 'Poptávku se nepodařilo odeslat. Vaše údaje zůstaly vyplněné. Zkuste to prosím znovu.',
            success: 'Děkujeme. Vaši poptávku máme.',
            successDescription: 'Ozveme se na uvedený e-mail a probereme vaši agendu, její hranice a možný další krok.',
            back: 'Zpět na hlavní stránku',
        },
    },
    en: {
        navigation: {
            skip: 'Skip to content',
            label: 'Main navigation',
            examples: 'What you can hand over',
            control: 'How you stay in control',
            contact: 'Discuss deployment',
        },
        hero: {
            eyebrow: 'Promptbook for your business',
            title: 'Hand over a responsibility.',
            accent: 'Not another prompt.',
            description:
                'Less assigning and chasing. We develop and deploy AI systems for businesses, designed to recognize useful work and keep it moving within agreed boundaries.',
            note: 'You set the direction. The system carries the work forward.',
            explore: 'Explore the examples',
        },
        cta: 'Discuss our use case',
        stories: {
            eyebrow: 'One responsibility. More than one task.',
            title: 'What could you stop chasing?',
            illustration:
                'Interactive illustrations with fictional examples. A direction we are developing, not a list of ready-made integrations.',
            choose: 'Choose a responsibility',
            steps: 'Moments in the story',
            previous: 'Previous step',
            next: 'Next step',
            replay: 'Replay from the start',
            entrusted: 'Entrusted responsibility',
            result: 'What you gain',
            owner: 'Where you step in',
            statuses: {
                received: 'New input',
                prepared: 'Prepared',
                attention: 'A person decides',
                approved: 'Approved and released',
                waiting: 'Waiting until needed',
            },
            reader: 'Read all examples',
            burden: 'The recurring burden',
            responsibility: 'What you hand over',
            benefit: 'The benefit',
            fallback: 'You can read the complete stories below.',
        },
        control: {
            eyebrow: 'Less day-to-day coordination. Still your direction.',
            title: 'Agree on the outcome.\nAnd the boundaries.',
            description:
                'An ongoing responsibility — caring for an application, for example — has a goal, context and rules for what happens next. We call that an autonomous agenda.',
            before: 'One-off assistance',
            beforeSteps: ['You spot the problem', 'You assign the next task', 'You chase the follow-up'],
            after: 'Entrusted responsibility',
            afterSteps: ['Agree on goals and limits', 'Relevant work continues', 'You decide the exceptions'],
            cards: [
                {
                    title: 'A clear scope',
                    description:
                        'Together, we define what the system should look after and what a useful result means for you.',
                },
                {
                    title: 'Permission that fits the impact',
                    description:
                        'We agree what can proceed independently and when a change, message or commitment needs a person.',
                },
                {
                    title: 'A view of progress',
                    description:
                        'We design oversight and exception handovers. You can change priorities or stop the work.',
                },
            ],
        },
        contact: {
            eyebrow: 'From your situation to a specific deployment',
            title: 'What would you like to stop\nsetting in motion every day?',
            description:
                'Let’s discuss recurring work in your business, the information available and the limits of responsibility. We will identify a useful starting point and what needs to be verified first.',
            status: 'We are developing autonomous agendas. We assess current capabilities and the development needed for each business; full independence across responsibilities remains a long-term vision.',
            team: 'Talk to the team building Promptbook.',
            direct: 'Or email us directly',
            paperTitle: 'Interested in the principles?',
            paper: 'Read the whitepaper',
            companyTitle: 'Looking for answers in company data?',
            company: 'AI for company documents (in Czech)',
        },
        enquiry: {
            title: 'Let’s discuss your use case',
            description:
                'Tell us what keeps coming back at work. We will get in touch to explore a business deployment with you.',
            agenda: 'Which area would you like to discuss?',
            other: 'Another business responsibility',
            placeholder: 'Choose an area',
            message: 'What work do you keep having to manage?',
            messagePlaceholder: 'What recurs, who handles it and what would a good outcome look like…',
            name: 'Name',
            company: 'Company',
            email: 'Work email',
            phone: 'Phone (optional)',
            submit: 'Send enquiry',
            submitting: 'Sending…',
            close: 'Close',
            required: 'Please fill in this field.',
            invalidEmail: 'Please enter a valid email address.',
            failure: 'Your enquiry could not be sent. Your details are still here. Please try again.',
            success: 'Thank you. We have your enquiry.',
            successDescription:
                'We will contact you at the email you provided to discuss your use case, its boundaries and a possible next step.',
            back: 'Back to the homepage',
        },
    },
} satisfies Record<SupportedHomepageLanguage, unknown>;

export type HomepageContent = (typeof HOMEPAGE_CONTENT)[SupportedHomepageLanguage];
