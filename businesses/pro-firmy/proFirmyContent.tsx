import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Language the company-data landing page is published in
 */
export type ProFirmyLanguage = SupportedHomepageLanguage;

export type ProFirmyChatMessage = {
    id: number;
    type: 'user' | 'bot';
    text: string;
    startDelay: number;
    static?: boolean;
};

type Question = {
    id: string;
    question: string;
    subtitle?: string;
    type: 'single' | 'contact';
    options?: string[];
    fields?: { id: string; label: string; type: string; placeholder: string; inputMode?: string }[];
};

type ProFirmyContent = {
    loading: string;
    hero: {
        eyebrow: string;
        heading: ReactNode;
        description: ReactNode;
        cta: string;
        badges: [string, string, string];
        chatTitle: string;
        chatInputPlaceholder: string;
        chatMessages: ProFirmyChatMessage[];
    };
    socialProof: {
        eyebrow: string;
        industries: string[];
    };
    painPoints: {
        eyebrow: string;
        heading: ReactNode;
        points: {
            title: string;
            description: string;
            consequence: string;
        }[];
        timeAllocation: {
            title: string;
            beforeLabel: string;
            beforePrimary: string;
            beforeSecondary: string;
            beforeNote: string;
            afterLabel: string;
            afterPrimary: string;
            afterSecondary: string;
            afterNote: string;
        };
    };
    solution: {
        eyebrow: string;
        heading: ReactNode;
        description: string;
        benefits: {
            title: string;
            description: string;
            highlight: string;
        }[];
    };
    howItWorks: {
        eyebrow: string;
        heading: ReactNode;
        steps: {
            title: string;
            description: string;
        }[];
        cta: string;
    };
    enemy: {
        eyebrow: string;
        heading: ReactNode;
        chatgptLabel: string;
        promptbookLabel: string;
        comparisons: {
            feature: string;
            chatgpt: string;
            promptbook: string;
        }[];
    };
    testimonials: {
        eyebrow: string;
        heading: ReactNode;
        items: {
            quote: string;
            author: string;
            company: string;
        }[];
        metrics: {
            value: string;
            label: string;
            suffix: string;
        }[];
    };
    team: {
        title: string;
        description: ReactNode;
        jiriDescription: ReactNode;
        pavolDescription: ReactNode;
    };
    finalCta: {
        heading: ReactNode;
        description: string;
        cta: string;
        capacityPrefix: string;
        capacityStrong: string;
        capacitySuffix: string;
        capacityRemaining: string;
        capacityNote: string;
        riskReversal: string;
    };
    qualificationPopup: {
        dialogTitle: string;
        questions: Question[];
        successTitle: (name: string) => string;
        successDescription: ReactNode;
        successEmailPrefix: string;
        close: string;
        stepLabel: (currentStep: number, totalSteps: number) => string;
        remainingSpots: string;
        intro: string;
        submitting: string;
        submit: string;
        back: string;
    };
    bookingNotification: {
        notifications: { company: string; time: string }[];
        messageSuffix: string;
    };
};

/**
 * Every word of the company-data landing page, in each language it is published in
 *
 * Note: This is the proposition of `/cs/pro-firmy` — company documents, a virtual employee and a strategic call.
 *       The agenda homepage at `/cs` and `/en` owns its own content and must leave this proposition alone.
 */
export const proFirmyContent = {
    cs: {
        loading: 'Načítání...',
        hero: {
            eyebrow: 'Česká AI platforma pro firemní data',
            heading: (
                <>
                    Co kdyby každý váš
                    <br />
                    zaměstnanec měl{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        okamžitý
                        <br />
                        přístup
                    </span>{' '}
                    ke všemu, co vaše
                    <br />
                    firma kdy napsala?
                </>
            ),
            description: (
                <>
                    Promptbook přečte až milion normostran vašich dokumentů a&nbsp;odpoví na cokoliv. Ptát se může
                    nováček i zkušený manažer. Oba dostanou stejně přesnou odpověď.
                </>
            ),
            cta: 'Chci strategický hovor zdarma',
            badges: ['100% GDPR', 'Až 1 000 000 normostran', 'Česká platforma'],
            chatTitle: 'Promptbook - HR Asistent',
            chatInputPlaceholder: 'Napište dotaz...',
            chatMessages: [
                {
                    id: 1,
                    type: 'user',
                    text: 'Ahoj, jsem tu nová a nikde nemůžu najít, kolik mám dní dovolené. Poradíte?',
                    startDelay: 0,
                    static: true,
                },
                {
                    id: 2,
                    type: 'bot',
                    text: 'Vítejte ve firmě, Anno! Podle pracovního řádu máte nárok na **25 dní dovolené ročně**.',
                    startDelay: 2000,
                    static: false,
                },
                {
                    id: 3,
                    type: 'bot',
                    text: 'Pošlu vám to i na e-mail, ať to máte po ruce. Ještě něco?',
                    startDelay: 1200,
                    static: false,
                },
                {
                    id: 4,
                    type: 'user',
                    text: 'Super, díky! Přesně tohle jsem potřebovala. 🙌',
                    startDelay: 1000,
                    static: false,
                },
            ],
        },
        socialProof: {
            eyebrow: 'Pro firmy, které berou svá data vážně',
            industries: [
                'Výrobní firmy',
                'Advokátní kanceláře',
                'Stavební firmy',
                'Veřejná správa',
                'Zdravotnictví',
                'Vzdělávání',
                'Logistika',
                'Energetika',
                'IT firmy',
                'Pojišťovnictví',
                'Farmaceutický průmysl',
                'E-commerce',
                'Účetní kanceláře',
                'Telekomunikace',
            ],
        },
        painPoints: {
            eyebrow: 'Proč firmy ztrácejí miliony',
            heading: (
                <>
                    Znalosti ve firmě existují.{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        Problém je, že je nikdo nenajde.
                    </span>
                </>
            ),
            points: [
                {
                    title: 'Roztříštěná firemní data',
                    description:
                        'Směrnice na SharePointu, smlouvy v e-mailech, manuály na Google Disku, procesy v hlavách lidí. Informace existují, jen jsou rozházené po desítkách systémů.',
                    consequence: 'Zaměstnanci hledají místo toho, aby dělali práci, za kterou je platíte.',
                },
                {
                    title: 'Klíčoví lidé jako interní helpdesk',
                    description:
                        'Seniorní lidé odpovídají pořád dokola na ty samé dotazy od nováčků i kolegů. Místo strategické práce dělají informační servis.',
                    consequence: 'Vaši nejdražší lidé dělají práci, kterou by měl dělat systém.',
                },
                {
                    title: 'Riziko veřejné AI',
                    description:
                        'Zaměstnanci řeší pracovní úkoly přes veřejný ChatGPT, včetně citlivých firemních dokumentů. Veřejná AI přitom vaši firmu nezná. Když odpověď nemá, domyslí si ji.',
                    consequence:
                        'Jedno rozhodnutí podle vymyšlené informace může stát víc než celý roční rozpočet na software.',
                },
                {
                    title: 'Odcházející know-how',
                    description:
                        'Když z firmy odejde zkušený člověk, odejdou s ním znalosti, které nikde nejsou zapsané. Jak se u vás rozhoduje, co má který klient za sebou, proč se věci dělají zrovna takhle.',
                    consequence: 'Firma přijde o roky zkušeností a nahradit se to hned tak nedá.',
                },
            ],
            timeAllocation: {
                title: 'Kam mizí čas vašich lidí?',
                beforeLabel: 'Před',
                beforePrimary: 'Nedůležité',
                beforeSecondary: '20%',
                beforeNote: 'E-maily · Porady · Rutinní úkoly',
                afterLabel: 'Po nasazení Promptbooku',
                afterPrimary: 'Důležité',
                afterSecondary: '20%',
                afterNote: 'Rodina · Kreativita · Strategická práce',
            },
        },
        solution: {
            eyebrow: 'Řešení',
            heading: (
                <>
                    Virtuální zaměstnanec, který{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        zná celou firmu.
                    </span>
                </>
            ),
            description:
                'Nahrajte firemní dokumenty do bezpečného trezoru. Promptbook z nich vytvoří virtuálního zaměstnance: HR-istu, právníka nebo technika. Kdokoliv se ho pak zeptá normální češtinou.',
            benefits: [
                {
                    title: 'Bez promptování',
                    description:
                        'Žádné školení. Žádné "napiš prompt jako ajťák". Vaši zaměstnanci jsou experti na svůj obor, ne na zaříkávání robotů. Prostě se zeptají, písemně nebo hlasovkou, a dostanou odpověď.',
                    highlight: 'Tak, jak jsou zvyklí komunikovat s lidmi.',
                },
                {
                    title: 'Kontextový trezor',
                    description:
                        'Data nikdy neopustí vaši infrastrukturu. Nepoužíváme je na trénování žádných modelů. Víte, co se stane, když zaměstnanec zkopíruje NDA do veřejného ChatGPT?',
                    highlight: 'My jo. Proto jsme to udělali jinak.',
                },
                {
                    title: 'Nevím je lepší než halucinace',
                    description:
                        'Veřejná AI si vymyslí pět odstavců, které zní důvěryhodně. Můžou vás stát firmu. Promptbook čerpá jen z vašich dat. A když odpověď nenajde?',
                    highlight: 'Řekne narovinu: "Tuto informaci ve vašich dokumentech nemám."',
                },
            ],
        },
        howItWorks: {
            eyebrow: 'Jak to funguje',
            heading: (
                <>
                    Nasazení,{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        které nebolí.
                    </span>
                </>
            ),
            steps: [
                {
                    title: 'Nahrajete dokumenty',
                    description:
                        'Směrnice, smlouvy, manuály, NDAčka, zápisy z porad. Cokoliv, co dnes leží rozházené po SharePointu, Google Disku nebo v šuplíku. Promptbook pojme až milion normostran.',
                },
                {
                    title: 'Vytvoříte virtuálního zaměstnance',
                    description:
                        'HR-istu, který zná pracovní řád. Právníka, který zná všechny smlouvy. Technika, který zná manuály. Každý agent odpovídá přesně podle vašich firemních dat.',
                },
                {
                    title: 'Lidé se ptají',
                    description:
                        'Normální češtinou. Jako by psali zprávu na WhatsApp. Nebo pošlou hlasovku. Bez promptů, bez školení, bez ajťáků.',
                },
            ],
            cta: 'Chci vidět, jak to funguje',
        },
        enemy: {
            eyebrow: 'Proč ne veřejný ChatGPT',
            heading: (
                <>
                    &quot;Tak to hodím do ChatGPT&quot;{' '}
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                        je firemní sebevražda.
                    </span>
                </>
            ),
            chatgptLabel: 'Veřejný ChatGPT',
            promptbookLabel: 'Promptbook',
            comparisons: [
                {
                    feature: 'Když nezná odpověď',
                    chatgpt: 'Sebevědomě si ji vymyslí',
                    promptbook: 'Řekne: "Nevím"',
                },
                {
                    feature: 'Vaše firemní data',
                    chatgpt: 'Veřejný cloud. Kdo ví, kdo je čte',
                    promptbook: 'Zamčené ve vašem trezoru',
                },
                {
                    feature: 'Trénink na vašich datech',
                    chatgpt: 'Ano, trénuje na nich další modely',
                    promptbook: 'Ne. Nikdy.',
                },
                {
                    feature: 'Jak se ptáte',
                    chatgpt: '"Act as senior lawyer, temperature 0.2..."',
                    promptbook: '"Hele, kde je to NDA z roku 2021?"',
                },
                {
                    feature: 'Firemní kontext',
                    chatgpt: 'Žádný. Neví nic o vaší firmě',
                    promptbook: 'Zná vaše směrnice, smlouvy, procesy',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Reference',
            heading: (
                <>
                    Co říkají firmy, které{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        přestaly hledat.
                    </span>
                </>
            ),
            items: [
                {
                    quote: 'Promptbook nás od sebe neodstřihl. Naopak. Konečně máme čas řešit opravdovou práci, za kterou jsme placeni.',
                    author: 'IT oddělení',
                    company: 'Slezská univerzita v Opavě',
                },
                {
                    quote: 'Nováčci se už nemusí bát zeptat. Mají odpovědi okamžitě a přesně podle našich interních směrnic.',
                    author: 'Městská část',
                    company: 'Praha 13',
                },
            ],
            metrics: [
                { value: '1 000 000', label: 'normostran kapacity', suffix: '' },
                { value: '100%', label: 'v souladu s GDPR', suffix: '' },
                { value: '0', label: 'halucinací', suffix: '' },
            ],
        },
        team: {
            title: 'Kdo za tím stojí',
            description: (
                <>Pomáháme firmám používat AI prakticky a bezpečně. Máme za sebou výzkum, vývoj i podnikání.</>
            ),
            jiriDescription: (
                <>
                    Ph.D. z matematiky, bývalý výzkumník v{' '}
                    <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
                </>
            ),
            pavolDescription: (
                <>
                    Jeden z předních <Link href="https://www.pavolhejny.com/">open-source contributorů</Link> v Česku.
                    Vývojář s 15+ lety zkušeností.
                </>
            ),
        },
        finalCta: {
            heading: (
                <>
                    Přestaňte platit za hledání.
                    <br />
                    Začněte platit za práci.
                </>
            ),
            description:
                'Zarezervujte si 20minutový strategický hovor s naším týmem. Žádný agresivní sales pitch. Projdeme vaši situaci a ukážeme vám Promptbook přímo na vašich datech.',
            cta: 'Zarezervovat strategický hovor zdarma',
            capacityPrefix: 'Obsazeno',
            capacityStrong: '7',
            capacitySuffix: 'z 10 míst',
            capacityRemaining: 'Zbývají 3',
            capacityNote: 'Bereme max. 10 firem měsíčně, abychom na každou měli čas.',
            riskReversal:
                'I když si Promptbook nakonec nepořídíte, odnesete si konkrétní plán, jak srovnat chaos ve firemních datech.',
        },
        qualificationPopup: {
            dialogTitle: 'Kvalifikační formulář',
            questions: [
                {
                    id: 'industry',
                    question: 'V jakém oboru působíte?',
                    type: 'single',
                    options: [
                        'Výroba / Průmysl',
                        'Právo / Finance',
                        'Stavebnictví / Real estate',
                        'Veřejná správa / Vzdělávání',
                        'IT / Technologie',
                        'Jiný obor',
                    ],
                },
                {
                    id: 'pain_point',
                    question: 'Co vás nejvíc trápí?',
                    type: 'single',
                    options: [
                        'Lidé tráví hodiny hledáním dokumentů',
                        'Senioři odpovídají stále na stejné dotazy',
                        'Firemní data ve veřejném ChatGPT nás děsí',
                        'Když odejde klíčový člověk, know-how zmizí s ním',
                        'Zatím jen zkoumám, co Promptbook umí',
                    ],
                },
                {
                    id: 'urgency',
                    question: 'Kdy byste chtěli začít?',
                    type: 'single',
                    options: ['Co nejdřív, řešíme to akutně', 'Příští kvartál', 'Zatím jen zkoumáme možnosti'],
                },
                {
                    id: 'contact',
                    question: 'Kam se vám ozveme?',
                    subtitle: 'Jirka vám zavolá do 24 hodin.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Jméno', type: 'text', placeholder: 'Jan Novák' },
                        { id: 'company', label: 'Firma', type: 'text', placeholder: 'Název vaší firmy' },
                        { id: 'email', label: 'E-mail', type: 'email', placeholder: 'jan@firma.cz' },
                        {
                            id: 'phone',
                            label: 'Telefon',
                            type: 'tel',
                            placeholder: '+420 777 123 456',
                            inputMode: 'tel',
                        },
                    ],
                },
            ],
            successTitle: (name) => `Díky, ${name}!`,
            successDescription: (
                <>
                    Do 24 hodin se vám telefonicky ozve <strong className="text-[#0f172a]">Jirka</strong>. Probereme
                    vaše otázky a domluvíme termín videohovoru.
                </>
            ),
            successEmailPrefix: 'Odkaz na videohovor pak pošleme na',
            close: 'Zavřít',
            stepLabel: (currentStep, totalSteps) => `Krok ${currentStep + 1} z ${totalSteps}`,
            remainingSpots: 'Zbývají 3 místa',
            intro: '4 otázky, 30 sekund. Ověříme, jestli pro vás Promptbook dává smysl.',
            submitting: 'Odesílám...',
            submit: 'Rezervovat hovor zdarma',
            back: 'Zpět',
        },
        bookingNotification: {
            notifications: [
                { company: 'Firma z Prahy', time: 'před 2 hodinami' },
                { company: 'Firma z Brna', time: 'před 4 hodinami' },
                { company: 'Firma z Ostravy', time: 'včera' },
            ],
            messageSuffix: 'si zarezervovala strategický hovor',
        },
    },
    en: {
        loading: 'Loading...',
        hero: {
            eyebrow: 'Czech AI platform for company data',
            heading: (
                <>
                    What if every
                    <br />
                    employee had{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        instant
                        <br />
                        access
                    </span>{' '}
                    to everything your
                    <br />
                    company has ever written?
                </>
            ),
            description: (
                <>
                    Promptbook reads up to one million standard pages of your documents and answers anything. A new hire
                    can ask, and so can a seasoned manager. Both get the same precise answer.
                </>
            ),
            cta: 'I want a free strategy call',
            badges: ['100% GDPR', 'Up to 1,000,000 standard pages', 'Czech platform'],
            chatTitle: 'Promptbook - HR Assistant',
            chatInputPlaceholder: 'Type a question...',
            chatMessages: [
                {
                    id: 1,
                    type: 'user',
                    text: "Hi, I just started here and I can't find how many vacation days I get. Can you help?",
                    startDelay: 0,
                    static: true,
                },
                {
                    id: 2,
                    type: 'bot',
                    text: 'Welcome to the company, Anna! According to the employee handbook, you get **25 vacation days per year**.',
                    startDelay: 2000,
                    static: false,
                },
                {
                    id: 3,
                    type: 'bot',
                    text: "I'll email it to you as well, so you have it handy. Anything else?",
                    startDelay: 1200,
                    static: false,
                },
                {
                    id: 4,
                    type: 'user',
                    text: 'Great, thanks! Exactly what I needed. 🙌',
                    startDelay: 1000,
                    static: false,
                },
            ],
        },
        socialProof: {
            eyebrow: 'For companies that take their data seriously',
            industries: [
                'Manufacturing',
                'Law firms',
                'Construction',
                'Public administration',
                'Healthcare',
                'Education',
                'Logistics',
                'Energy',
                'IT',
                'Insurance',
                'Pharma',
                'E-commerce',
                'Accounting firms',
                'Telecom',
            ],
        },
        painPoints: {
            eyebrow: 'Why companies lose millions',
            heading: (
                <>
                    The knowledge is already in your company.{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        Nobody can find it.
                    </span>
                </>
            ),
            points: [
                {
                    title: 'Scattered company data',
                    description:
                        "Policies on SharePoint, contracts in email, manuals on Google Drive, processes in people's heads. It all exists. It's just spread across dozens of systems.",
                    consequence: 'Employees search instead of doing the work you pay them for.',
                },
                {
                    title: 'Key people as an internal help desk',
                    description:
                        'Senior people answer the same questions over and over, from newcomers and colleagues alike. Instead of strategic work, they run an information desk.',
                    consequence: 'Your most expensive people are doing work a system should be doing.',
                },
                {
                    title: 'Public AI risk',
                    description:
                        "People paste work into public ChatGPT, sensitive company documents included. Public AI doesn't know your company. When it doesn't have the answer, it makes one up.",
                    consequence:
                        'One decision based on invented information can cost more than your whole annual software budget.',
                },
                {
                    title: 'Departing know-how',
                    description:
                        'When an experienced person leaves, they take knowledge nobody wrote down. How decisions get made, what each client has been through, why things are done this way.',
                    consequence: "The company loses years of experience, and you don't get that back quickly.",
                },
            ],
            timeAllocation: {
                title: "Where does your team's time go?",
                beforeLabel: 'Before',
                beforePrimary: 'Busywork',
                beforeSecondary: '20%',
                beforeNote: 'Emails · Meetings · Routine tasks',
                afterLabel: 'After deploying Promptbook',
                afterPrimary: 'What matters',
                afterSecondary: '20%',
                afterNote: 'Family · Creativity · Strategic work',
            },
        },
        solution: {
            eyebrow: 'Solution',
            heading: (
                <>
                    A virtual employee who{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        knows the whole company.
                    </span>
                </>
            ),
            description:
                'Upload your company documents into a secure vault. Promptbook turns them into a virtual employee: an HR specialist, a lawyer, a technician. Then anyone can just ask, in plain language.',
            benefits: [
                {
                    title: 'No prompting',
                    description:
                        'No training. No "write the prompt like an IT person would". Your people are experts in their field, not in casting spells on robots. They ask, by text or by voice, and they get an answer.',
                    highlight: 'The same way they talk to a colleague.',
                },
                {
                    title: 'Context vault',
                    description:
                        "Data never leaves your infrastructure. We don't use it to train any models. Do you know what happens when an employee pastes an NDA into public ChatGPT?",
                    highlight: "We do. That's why we built it differently.",
                },
                {
                    title: '"I don\'t know" beats a hallucination',
                    description:
                        "Public AI invents five paragraphs that sound convincing. They can cost you the company. Promptbook draws only from your data. And when it can't find the answer?",
                    highlight: 'It says it straight: "I don\'t have that information in your documents."',
                },
            ],
        },
        howItWorks: {
            eyebrow: 'How it works',
            heading: (
                <>
                    Deployment{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        without the pain.
                    </span>
                </>
            ),
            steps: [
                {
                    title: 'Upload documents',
                    description:
                        'Policies, contracts, manuals, NDAs, meeting notes. Anything sitting today in SharePoint, on Google Drive, or in a desk drawer. Promptbook handles up to one million standard pages.',
                },
                {
                    title: 'Create a virtual employee',
                    description:
                        'An HR specialist who knows the employee handbook. A lawyer who knows every contract. A technician who knows the manuals. Each agent answers strictly from your company data.',
                },
                {
                    title: 'People ask questions',
                    description:
                        'In plain language. Like sending a WhatsApp message. Or a voice note. No prompts, no training, no IT department.',
                },
            ],
            cta: 'I want to see how it works',
        },
        enemy: {
            eyebrow: 'Why not public ChatGPT',
            heading: (
                <>
                    &quot;I&apos;ll just paste it into ChatGPT&quot;{' '}
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                        is corporate self-sabotage.
                    </span>
                </>
            ),
            chatgptLabel: 'Public ChatGPT',
            promptbookLabel: 'Promptbook',
            comparisons: [
                {
                    feature: "When it doesn't know",
                    chatgpt: 'Confidently invents one',
                    promptbook: 'Says: "I don\'t know"',
                },
                {
                    feature: 'Your company data',
                    chatgpt: 'Public cloud. Who knows who reads it',
                    promptbook: 'Locked in your vault',
                },
                {
                    feature: 'Training on your data',
                    chatgpt: 'Yes, it trains other models on it',
                    promptbook: 'No. Never.',
                },
                {
                    feature: 'How you ask',
                    chatgpt: '"Act as senior lawyer, temperature 0.2..."',
                    promptbook: '"Hey, where\'s that NDA from 2021?"',
                },
                {
                    feature: 'Company context',
                    chatgpt: 'None. It knows nothing about your company',
                    promptbook: 'It knows your policies, contracts, processes',
                },
            ],
        },
        testimonials: {
            eyebrow: 'Testimonials',
            heading: (
                <>
                    What companies say once they{' '}
                    <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                        stop searching.
                    </span>
                </>
            ),
            items: [
                {
                    quote: "Promptbook didn't cut us off from each other. The opposite. We finally have time for the real work we're paid to do.",
                    author: 'IT department',
                    company: 'Silesian University in Opava',
                },
                {
                    quote: "Newcomers aren't afraid to ask anymore. They get answers right away, straight from our internal policies.",
                    author: 'Municipal district',
                    company: 'Prague 13',
                },
            ],
            metrics: [
                { value: '1,000,000', label: 'standard pages of capacity', suffix: '' },
                { value: '100%', label: 'GDPR compliant', suffix: '' },
                { value: '0', label: 'hallucinations', suffix: '' },
            ],
        },
        team: {
            title: "Who's behind this",
            description: (
                <>
                    We help companies use AI practically and safely. Our backgrounds are in research, development, and
                    business.
                </>
            ),
            jiriDescription: (
                <>
                    Ph.D. in Mathematics, former researcher at{' '}
                    <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
                </>
            ),
            pavolDescription: (
                <>
                    One of the top <Link href="https://www.pavolhejny.com/">open-source contributors</Link> in Czechia.
                    Developer with 15+ years of experience.
                </>
            ),
        },
        finalCta: {
            heading: (
                <>
                    Stop paying people to search.
                    <br />
                    Start paying them to work.
                </>
            ),
            description:
                "Book a 20-minute strategy call with our team. No hard sell. We'll go through your situation and show you Promptbook running on your own data.",
            cta: 'Book a free strategy call',
            capacityPrefix: 'Booked',
            capacityStrong: '7',
            capacitySuffix: 'of 10 spots',
            capacityRemaining: '3 left',
            capacityNote: 'We take on 10 companies a month at most, so we have time for each one.',
            riskReversal:
                "Even if you never buy Promptbook, you'll walk away with a concrete plan for sorting out the chaos in your company data.",
        },
        qualificationPopup: {
            dialogTitle: 'Qualification form',
            questions: [
                {
                    id: 'industry',
                    question: 'What industry are you in?',
                    type: 'single',
                    options: [
                        'Manufacturing / Industry',
                        'Legal / Finance',
                        'Construction / Real estate',
                        'Public administration / Education',
                        'IT / Technology',
                        'Other industry',
                    ],
                },
                {
                    id: 'pain_point',
                    question: "What's your biggest headache?",
                    type: 'single',
                    options: [
                        'People spend hours searching for documents',
                        'Senior people answer the same questions again and again',
                        'Company data in public ChatGPT worries us',
                        'When a key person leaves, know-how leaves with them',
                        "I'm just exploring what Promptbook can do",
                    ],
                },
                {
                    id: 'urgency',
                    question: 'When would you like to start?',
                    type: 'single',
                    options: [
                        'As soon as possible, this is urgent',
                        'Next quarter',
                        "We're just exploring options for now",
                    ],
                },
                {
                    id: 'contact',
                    question: 'Where should we reach you?',
                    subtitle: 'Jiri will call you within 24 hours.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Name', type: 'text', placeholder: 'Jane Smith' },
                        { id: 'company', label: 'Company', type: 'text', placeholder: 'Your company name' },
                        { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com' },
                        { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 123 4567', inputMode: 'tel' },
                    ],
                },
            ],
            successTitle: (name) => `Thanks, ${name}!`,
            successDescription: (
                <>
                    <strong className="text-[#0f172a]">Jiri</strong> will call you within 24 hours. We&apos;ll go
                    through your questions and set a time for a video call.
                </>
            ),
            successEmailPrefix: "We'll send the video call link to",
            close: 'Close',
            stepLabel: (currentStep, totalSteps) => `Step ${currentStep + 1} of ${totalSteps}`,
            remainingSpots: '3 spots left',
            intro: "4 questions, 30 seconds. We'll see whether Promptbook makes sense for you.",
            submitting: 'Submitting...',
            submit: 'Book a free call',
            back: 'Back',
        },
        bookingNotification: {
            notifications: [
                { company: 'A company in Prague', time: '2 hours ago' },
                { company: 'A company in Brno', time: '4 hours ago' },
                { company: 'A company in Ostrava', time: 'yesterday' },
            ],
            messageSuffix: 'booked a strategy call',
        },
    },
} satisfies Record<ProFirmyLanguage, ProFirmyContent>;

export function getProFirmyContent(language: ProFirmyLanguage = 'cs') {
    return proFirmyContent[language];
}
