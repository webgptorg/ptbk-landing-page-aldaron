import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export const HOMEPAGE_SCENARIO_IDS = ['software', 'communication', 'documents'] as const;
export type HomepageScenarioId = (typeof HOMEPAGE_SCENARIO_IDS)[number];
export type HomepageWorkStatus = 'incoming' | 'prepared' | 'decision' | 'continuing' | 'waiting';

export type HomepageStoryStep = {
    readonly label: string;
    readonly title: string;
    readonly description: string;
    readonly status: HomepageWorkStatus;
    readonly statusLabel: string;
    readonly artifactTitle: string;
    readonly artifactDetail: string;
    readonly task: string;
    readonly result: string;
};

export type HomepageScenario = {
    readonly id: HomepageScenarioId;
    readonly name: string;
    readonly benefit: string;
    readonly burden: string;
    readonly entrusted: string;
    readonly ownerDecision: string;
    readonly project: string;
    readonly role: string;
    readonly steps: readonly HomepageStoryStep[];
};

// Fictional stories grounded in whitepaper chapter 11, not a catalogue of shipped integrations.
// The scene, controls and server-rendered summaries all read this same definition.
export const HOMEPAGE_SCENARIOS: Readonly<Record<SupportedHomepageLanguage, readonly HomepageScenario[]>> = {
    cs: [
        {
            id: 'software',
            name: 'Web a aplikace',
            benefit: 'Produkt v péči. Méně urgencí pro vás.',
            burden: 'Web je spuštěný. Drobné chyby a další vylepšení ale pořád čekají, až je někdo zadá a pohlídá.',
            entrusted: 'Průběžně hledat relevantní problémy, připravovat opravy a ověřovat navržené změny.',
            ownerDecision: 'Vy určujete priority a pravidla nasazení. Změna mimo dohodnutý rozsah se vrací k vám.',
            project: 'Ukázkový firemní web',
            role: 'AI péče o produkt',
            steps: [
                {
                    label: 'Podnět',
                    title: 'Na telefonu nejde dokončit poptávku.',
                    description: 'Hlášení chyby se mění v konkrétní práci: ověřit problém kontaktního formuláře.',
                    status: 'incoming',
                    statusLabel: 'K prověření',
                    artifactTitle: 'Pojďme spolu něco vytvořit.',
                    artifactDetail: 'Tlačítko formuláře překrývá text.',
                    task: 'Prověřit formulář na telefonu',
                    result: 'Podnět má svůj další krok.',
                },
                {
                    label: 'Návrh',
                    title: 'Oprava připravená. Kontroly hotové.',
                    description:
                        'Návrh opravuje formulář na telefonu i počítači. Je připravený k rozhodnutí; na živém webu se zatím nic nemění.',
                    status: 'prepared',
                    statusLabel: 'Ověřený návrh',
                    artifactTitle: 'Pojďme spolu něco vytvořit.',
                    artifactDetail: 'Telefon i počítač: kontrola v pořádku.',
                    task: 'Oprava formuláře připravená',
                    result: 'Méně koordinace kolem běžné opravy.',
                },
                {
                    label: 'Rozhodnutí',
                    title: 'Nasazení má vlastní pravidla.',
                    description:
                        'V této ukázce nasazení vyžaduje váš souhlas. Dostáváte ověřenou změnu a jasnou otázku, zda ji zveřejnit.',
                    status: 'decision',
                    statusLabel: 'Čeká na váš souhlas',
                    artifactTitle: 'Pojďme spolu něco vytvořit.',
                    artifactDetail: 'Návrh je ověřený, zatím nenasazený.',
                    task: 'Schválit nasazení opravy?',
                    result: 'Vy rozhodujete o změně v provozu.',
                },
                {
                    label: 'Další potřeba',
                    title: 'Později se objeví nefunkční odkaz.',
                    description:
                        'Péče pokračuje: další kontrola najde nefunkční odkaz a připraví jeho opravu. Nemusíte zadávat nový úkol.',
                    status: 'continuing',
                    statusLabel: 'Navazující návrh',
                    artifactTitle: 'Každý detail má své místo.',
                    artifactDetail: 'Náhradní odkaz ověřený v návrhu.',
                    task: 'Připravit opravu odkazu',
                    result: 'Další potřeba nezůstává na vás.',
                },
                {
                    label: 'Klid',
                    title: 'Připraveno. Teď se čeká.',
                    description:
                        'Oba návrhy čekají na schválení nasazení. Není potřeba vyrábět další práci jen proto, aby systém běžel.',
                    status: 'waiting',
                    statusLabel: 'Čeká na rozhodnutí',
                    artifactTitle: 'Připraveno pro další krok.',
                    artifactDetail: 'Opravy zkontrolované · nasazení čeká.',
                    task: 'Žádná další oprava k přípravě',
                    result: 'Přehledný stav místo dalšího urgování.',
                },
            ],
        },
        {
            id: 'communication',
            name: 'Komunikace se zákazníky',
            benefit: 'Plynulé navázání. Méně opakování.',
            burden: 'Stejné otázky se vracejí a odpovědi závisejí na tom, kdo má zrovna čas.',
            entrusted: 'Připravovat odpovědi v kontextu a z opakovaných dotazů navrhovat srozumitelnější vysvětlení.',
            ownerDecision: 'Neobvyklý požadavek posoudí člověk. Návrh odpovědi není její odeslání.',
            project: 'Ukázková zákaznická péče',
            role: 'AI péče o komunikaci',
            steps: [
                {
                    label: 'Dotaz',
                    title: '„Kde změním termín rezervace?“',
                    description: 'Další zákazník se ptá na stejnou věc. Agenda poznává opakující se nejasnost.',
                    status: 'incoming',
                    statusLabel: 'Nový dotaz',
                    artifactTitle: 'Změna rezervace',
                    artifactDetail: 'Kde mohu upravit vybraný termín?',
                    task: 'Připravit odpověď k rezervaci',
                    result: 'Dotaz má navazující péči.',
                },
                {
                    label: 'Návrh',
                    title: 'Odpověď i lepší vysvětlení.',
                    description:
                        'Vzniká návrh odpovědi a jasnější návod pro příští dotazy. Zpráva zatím není odeslaná.',
                    status: 'prepared',
                    statusLabel: 'Koncept · neodesláno',
                    artifactTitle: 'Návrh odpovědi',
                    artifactDetail: 'Termín upravíte v detailu rezervace. Vyberte „Změnit termín“.',
                    task: 'Zpřesnit také návod k rezervaci',
                    result: 'Konzistentnější odpovědi i příště.',
                },
                {
                    label: 'Výjimka',
                    title: 'Nestandardní vrácení peněz? To je na vás.',
                    description:
                        'Požadavek přesahuje běžná pravidla. Člověk dostane souvislosti a otázku k rozhodnutí; AI nic neslibuje.',
                    status: 'decision',
                    statusLabel: 'Potřebuje člověka',
                    artifactTitle: 'Výjimka z podmínek',
                    artifactDetail: 'Zákazník žádá vrácení peněz mimo běžná pravidla.',
                    task: 'Předat výjimku odpovědné osobě',
                    result: 'Důležité rozhodnutí zůstává u člověka.',
                },
                {
                    label: 'Další dotaz',
                    title: 'Stejná otázka. Už s lepším podkladem.',
                    description:
                        'Příští návrh odpovědi využije připravené vysvětlení. Není třeba znovu popisovat celý postup.',
                    status: 'continuing',
                    statusLabel: 'Další koncept',
                    artifactTitle: 'Jasnější odpověď na stejný dotaz',
                    artifactDetail: 'Detail rezervace → Změnit termín → Potvrdit výběr.',
                    task: 'Navázat na připravené vysvětlení',
                    result: 'Méně opakovaných zásahů vašeho týmu.',
                },
                {
                    label: 'Připraveno',
                    title: 'Koncepty jsou připravené ke kontrole.',
                    description:
                        'Odesílání odpovědí a zveřejnění návodu jsou samostatné kroky podle dohodnutých oprávnění. Ukázka je neprovádí.',
                    status: 'waiting',
                    statusLabel: 'Čeká na kontrolu',
                    artifactTitle: 'Připravené odpovědi',
                    artifactDetail: 'Koncepty uložené · nic neodesláno.',
                    task: 'Vyčkat na kontrolu a další podnět',
                    result: 'Návaznost bez ztracených souvislostí.',
                },
            ],
        },
        {
            id: 'documents',
            name: 'Účetní podklady',
            benefit: 'Podklady pohromadě. Méně dohledávání.',
            burden: 'Před každou kontrolou znovu třídíte doklady a zjišťujete, co komu chybí.',
            entrusted: 'Průběžně organizovat nové doklady, hledat nesrovnalosti a připravovat konkrétní otázky.',
            ownerDecision:
                'Věcnou správnost posuzuje odpovědný člověk. Jde o přípravu podkladů, ne platby nebo daňová podání.',
            project: 'Ukázková sada podkladů',
            role: 'AI péče o podklady',
            steps: [
                {
                    label: 'Doklad',
                    title: 'Přichází další faktura.',
                    description:
                        'Nový doklad se zařazuje k ostatním podkladům. Kontrola úplnosti nemusí čekat až na konec měsíce.',
                    status: 'incoming',
                    statusLabel: 'Nový podklad',
                    artifactTitle: 'Faktura za služby',
                    artifactDetail: 'Přijato do říjnové sady podkladů.',
                    task: 'Zařadit a zkontrolovat úplnost',
                    result: 'Podklady se shromažďují průběžně.',
                },
                {
                    label: 'Příprava',
                    title: 'Doklad má místo. Nesrovnalost má jméno.',
                    description:
                        'Faktura je zařazená, ale chybí odkaz na objednávku. Místo obecného „něco nesedí“ vzniká konkrétní otázka.',
                    status: 'prepared',
                    statusLabel: 'Zařazeno · chybí údaj',
                    artifactTitle: 'Říjnové podklady',
                    artifactDetail: 'Faktura za služby: chybí číslo objednávky.',
                    task: 'Připravit dotaz na objednávku',
                    result: 'Méně ručního hledání chybějících údajů.',
                },
                {
                    label: 'Upřesnění',
                    title: 'Která objednávka k faktuře patří?',
                    description:
                        'Odpovědný člověk doplní vazbu a posoudí nejasnost. Systém si chybějící údaj nedomýšlí.',
                    status: 'decision',
                    statusLabel: 'Potřebuje upřesnění',
                    artifactTitle: 'Otázka k doplnění',
                    artifactDetail: 'Ke které objednávce patří tato faktura za služby?',
                    task: 'Doplnit vazbu na objednávku',
                    result: 'Přesná otázka pro správného člověka.',
                },
                {
                    label: 'Další doklad',
                    title: 'Další doklad naváže na stejný pořádek.',
                    description:
                        'Nový podklad se zařadí bez dalšího zadání. Otevřená otázka u původní faktury zůstává viditelná.',
                    status: 'continuing',
                    statusLabel: 'Další podklad zařazen',
                    artifactTitle: 'Sada se průběžně doplňuje',
                    artifactDetail: 'Nový doklad zařazený · jedna otázka stále otevřená.',
                    task: 'Připojit nový podklad k sadě',
                    result: 'Příprava pokračuje i mezi kontrolami.',
                },
                {
                    label: 'Ke kontrole',
                    title: 'Uspořádané podklady pro odbornou kontrolu.',
                    description:
                        'Doklady i otevřené otázky jsou pohromadě. Odpovědná osoba má připravené vstupy pro svou práci.',
                    status: 'waiting',
                    statusLabel: 'Připraveno pro člověka',
                    artifactTitle: 'Podklady k odborné kontrole',
                    artifactDetail: 'Doklady roztříděné · nejasnost označená.',
                    task: 'Předat sadu s otevřenou otázkou',
                    result: 'Lepší vstupy pro odpovědné posouzení.',
                },
            ],
        },
    ],
    en: [
        {
            id: 'software',
            name: 'Websites & applications',
            benefit: 'A product cared for. Less chasing for you.',
            burden: 'Your product is live. Small bugs and improvements still wait for someone to assign them and follow up.',
            entrusted: 'Spot relevant issues, prepare fixes and check proposed changes as part of ongoing care.',
            ownerDecision: 'You set priorities and release rules. Anything beyond the agreed scope comes back to you.',
            project: 'Example company website',
            role: 'AI product care',
            steps: [
                {
                    label: 'Issue',
                    title: 'The enquiry form breaks on a phone.',
                    description: 'A reported problem becomes concrete work: reproduce the issue with the contact form.',
                    status: 'incoming',
                    statusLabel: 'Needs checking',
                    artifactTitle: 'Let’s make something together.',
                    artifactDetail: 'The form button overlaps the text.',
                    task: 'Check the form on mobile',
                    result: 'The issue has a clear next step.',
                },
                {
                    label: 'Proposal',
                    title: 'Fix prepared. Checks complete.',
                    description:
                        'The proposed fix works on mobile and desktop. It is ready for a decision; the live website has not changed.',
                    status: 'prepared',
                    statusLabel: 'Checked proposal',
                    artifactTitle: 'Let’s make something together.',
                    artifactDetail: 'Mobile and desktop checks passed.',
                    task: 'Form fix ready for review',
                    result: 'Less coordination around a routine fix.',
                },
                {
                    label: 'Decision',
                    title: 'Going live has its own rules.',
                    description:
                        'In this example, release needs your approval. You get a checked change and a clear question: should it go live?',
                    status: 'decision',
                    statusLabel: 'Awaiting your approval',
                    artifactTitle: 'Let’s make something together.',
                    artifactDetail: 'Checked proposal · not deployed.',
                    task: 'Approve release of the fix?',
                    result: 'You decide what changes in production.',
                },
                {
                    label: 'Next need',
                    title: 'Later, a broken link appears.',
                    description:
                        'Care continues: another check finds a broken link and prepares a fix. You do not need to write another task.',
                    status: 'continuing',
                    statusLabel: 'Follow-up proposal',
                    artifactTitle: 'Every detail has its place.',
                    artifactDetail: 'Replacement link checked in the proposal.',
                    task: 'Prepare the broken-link fix',
                    result: 'The next need does not fall back to you.',
                },
                {
                    label: 'Waiting',
                    title: 'Prepared. Now it waits.',
                    description:
                        'Both proposals await release approval. There is no reason to invent more work just to keep the system busy.',
                    status: 'waiting',
                    statusLabel: 'Awaiting a decision',
                    artifactTitle: 'Ready for the next step.',
                    artifactDetail: 'Fixes checked · release pending.',
                    task: 'No further fixes to prepare',
                    result: 'A clear status instead of more chasing.',
                },
            ],
        },
        {
            id: 'communication',
            name: 'Customer communication',
            benefit: 'Better follow-through. Less repetition.',
            burden: 'The same questions keep coming back, and the answer depends on who has a moment to respond.',
            entrusted: 'Prepare answers in context and use recurring questions to propose clearer guidance.',
            ownerDecision: 'A person handles unusual requests. Preparing a reply and sending it are separate actions.',
            project: 'Example customer care',
            role: 'AI communication care',
            steps: [
                {
                    label: 'Question',
                    title: '“Where can I change my booking?”',
                    description:
                        'Another customer asks the same question. The responsibility includes recognising this recurring confusion.',
                    status: 'incoming',
                    statusLabel: 'New question',
                    artifactTitle: 'Changing a booking',
                    artifactDetail: 'Where can I change the date I selected?',
                    task: 'Prepare a reply about the booking',
                    result: 'The question receives follow-through.',
                },
                {
                    label: 'Draft',
                    title: 'An answer and a clearer explanation.',
                    description:
                        'A reply is drafted along with better guidance for future questions. The message has not been sent.',
                    status: 'prepared',
                    statusLabel: 'Draft · not sent',
                    artifactTitle: 'Draft reply',
                    artifactDetail: 'Open your booking details and choose “Change date”.',
                    task: 'Clarify the booking guide too',
                    result: 'More consistent answers next time.',
                },
                {
                    label: 'Exception',
                    title: 'An unusual refund? That comes to you.',
                    description:
                        'The request falls outside the usual rules. A person receives the context and a decision to make; AI makes no promise.',
                    status: 'decision',
                    statusLabel: 'Needs a person',
                    artifactTitle: 'Exception to the terms',
                    artifactDetail: 'A customer requests a refund outside the usual policy.',
                    task: 'Refer the exception to its owner',
                    result: 'A person keeps the important decision.',
                },
                {
                    label: 'Next question',
                    title: 'Same question. Better starting point.',
                    description:
                        'The next draft builds on the prepared explanation. Nobody needs to describe the whole process again.',
                    status: 'continuing',
                    statusLabel: 'Follow-up draft',
                    artifactTitle: 'A clearer answer to the same question',
                    artifactDetail: 'Booking details → Change date → Confirm selection.',
                    task: 'Build on the prepared guidance',
                    result: 'Fewer repetitive interventions for your team.',
                },
                {
                    label: 'Ready',
                    title: 'Drafts ready for review.',
                    description:
                        'Sending replies and publishing the guide are separate steps under agreed permissions. This example does neither.',
                    status: 'waiting',
                    statusLabel: 'Awaiting review',
                    artifactTitle: 'Prepared replies',
                    artifactDetail: 'Drafts saved · nothing sent.',
                    task: 'Wait for review and the next relevant need',
                    result: 'Continuity without lost context.',
                },
            ],
        },
        {
            id: 'documents',
            name: 'Accounting documents',
            benefit: 'Documents in order. Less chasing details.',
            burden: 'Before every review, you sort documents again and work out which information is missing.',
            entrusted:
                'Organise incoming documents, identify mismatches and prepare specific questions for resolution.',
            ownerDecision:
                'A responsible person reviews their substance. This is preparation, not payments or tax filing.',
            project: 'Example document set',
            role: 'AI document care',
            steps: [
                {
                    label: 'Document',
                    title: 'Another invoice arrives.',
                    description:
                        'The new document joins the existing set. Checking completeness does not have to wait until month-end.',
                    status: 'incoming',
                    statusLabel: 'New document',
                    artifactTitle: 'Invoice for services',
                    artifactDetail: 'Received into the October document set.',
                    task: 'File it and check completeness',
                    result: 'Documents come together throughout the month.',
                },
                {
                    label: 'Preparation',
                    title: 'Filed. With the missing detail identified.',
                    description:
                        'The invoice is organised, but its order reference is missing. A specific question replaces “something doesn’t match”.',
                    status: 'prepared',
                    statusLabel: 'Filed · detail missing',
                    artifactTitle: 'October documents',
                    artifactDetail: 'Services invoice: missing order number.',
                    task: 'Prepare a question about the order',
                    result: 'Less manual searching for missing details.',
                },
                {
                    label: 'Clarification',
                    title: 'Which order does this invoice belong to?',
                    description:
                        'The responsible person supplies the reference and resolves the uncertainty. The system does not invent the missing detail.',
                    status: 'decision',
                    statusLabel: 'Needs clarification',
                    artifactTitle: 'Question to resolve',
                    artifactDetail: 'Which order relates to this invoice for services?',
                    task: 'Confirm the related order',
                    result: 'A precise question for the right person.',
                },
                {
                    label: 'Next document',
                    title: 'The next document joins the same order.',
                    description:
                        'Another document is filed without a new instruction. The open question on the original invoice stays visible.',
                    status: 'continuing',
                    statusLabel: 'Next document filed',
                    artifactTitle: 'The set keeps coming together',
                    artifactDetail: 'New document filed · one question still open.',
                    task: 'Add the next document to the set',
                    result: 'Preparation continues between reviews.',
                },
                {
                    label: 'For review',
                    title: 'Organised inputs for professional review.',
                    description:
                        'Documents and outstanding questions are together. The responsible person has a better starting point for their work.',
                    status: 'waiting',
                    statusLabel: 'Ready for a person',
                    artifactTitle: 'Documents for professional review',
                    artifactDetail: 'Documents organised · uncertainty flagged.',
                    task: 'Hand over the set and its open question',
                    result: 'Better inputs for responsible judgement.',
                },
            ],
        },
    ],
};
