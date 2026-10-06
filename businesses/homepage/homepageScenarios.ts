import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type HomepageScenarioId = 'software' | 'communication' | 'documents';
export type HomepageStoryStatus = 'received' | 'prepared' | 'attention' | 'approved' | 'waiting';

export type HomepageStoryStep = {
    readonly label: string;
    readonly title: string;
    readonly explanation: string;
    readonly result: string;
    readonly status: HomepageStoryStatus;
    readonly artifact: {
        readonly label: string;
        readonly title: string;
        readonly body: string;
        readonly rows: readonly { readonly label: string; readonly value: string }[];
        readonly note: string;
    };
};

export type HomepageScenario = {
    readonly id: HomepageScenarioId;
    readonly name: string;
    readonly burden: string;
    readonly responsibility: string;
    readonly benefit: string;
    readonly human: string;
    readonly steps: readonly HomepageStoryStep[];
};

/**
 * Fictional business stories drawn from whitepaper 0.1, chapters 1, 7 and 11.
 * Chapters 10 and 12 set their boundaries: preparation, authorization and external actions stay distinct.
 * The server reader and interactive view consume these same records; none describe a live integration.
 */
export const HOMEPAGE_SCENARIOS: Readonly<Record<SupportedHomepageLanguage, readonly HomepageScenario[]>> = {
    cs: [
        {
            id: 'software',
            name: 'Péče o web a aplikaci',
            burden: 'Web je hotový. Ale chyby, drobné úpravy a další požadavky pořád čekají na vaše zadání.',
            responsibility: 'Průběžně hledat a připravovat potřebné opravy a zlepšení v domluveném rozsahu.',
            benefit: 'Udržovaný produkt. Méně připomínání a koordinace.',
            human: 'Vy rozhodujete o prioritách, větších změnách a pravidlech nasazení.',
            steps: [
                {
                    label: 'Podnět',
                    title: 'Rezervace na telefonu končí chybou.',
                    status: 'received',
                    explanation:
                        'Hlášení z webu je relevantní pro svěřenou péči. Oprava dostává konkrétní zadání, aniž ji musíte znovu popisovat.',
                    result: 'Problém má návaznost. Nezůstává jen v doručené poště.',
                    artifact: {
                        label: 'Ukázkový web · hlášení',
                        title: 'Rezervujte si návštěvu',
                        body: 'Na menším displeji nejde dokončit rezervaci.',
                        rows: [
                            { label: 'Rezervační formulář', value: 'Hlášená chyba' },
                            { label: 'Další krok', value: 'Ověřit a připravit opravu' },
                        ],
                        note: 'Živý web zatím beze změny',
                    },
                },
                {
                    label: 'Návrh',
                    title: 'Oprava připravená. Kontrola hotová.',
                    status: 'prepared',
                    explanation:
                        'Návrh opravy prošel kontrolou rezervačního formuláře. Dostáváte srozumitelný výsledek, ne další sérii drobných úkolů k rozdělení.',
                    result: 'Méně koordinace mezi nahlášením chyby a návrhem řešení.',
                    artifact: {
                        label: 'Ukázkový web · náhled změny',
                        title: 'Rezervujte si návštěvu',
                        body: 'Formulář se vejde i na telefon. Potvrzení je dostupné.',
                        rows: [
                            { label: 'Telefon i počítač', value: 'Zkontrolováno' },
                            { label: 'Oprava formuláře', value: 'Připraveno k posouzení' },
                        ],
                        note: 'Náhled opravy · ještě není nasazeno',
                    },
                },
                {
                    label: 'Rozhodnutí',
                    title: 'Termín vydání zůstává na vás.',
                    status: 'attention',
                    explanation:
                        'V této ukázce vyžaduje změna živého webu vaše schválení. Příprava pokračovala samostatně; tato hranice patří člověku.',
                    result: 'Dostáváte jedno konkrétní rozhodnutí: vydat připravenou opravu?',
                    artifact: {
                        label: 'Žádost o schválení',
                        title: 'Vydat opravu rezervací?',
                        body: 'Rozsah: úprava formuláře na mobilu. Obsah nabídky a ceny se nemění.',
                        rows: [
                            { label: 'Kontrola návrhu', value: 'Dokončeno' },
                            { label: 'Nasazení', value: 'Čeká na vlastníka' },
                        ],
                        note: 'Bez schválení se živý web nemění',
                    },
                },
                {
                    label: 'Vydání',
                    title: 'Po schválení přichází nasazení.',
                    status: 'approved',
                    explanation:
                        'V příběhu vlastník schválil vydání. Teprve samostatné nasazení a ověření provozu uzavírá tuto opravu.',
                    result: 'Oprava je dotažená až k ověřenému webu.',
                    artifact: {
                        label: 'Ukázkový web · po schváleném vydání',
                        title: 'Rezervace je potvrzená',
                        body: 'Odeslání formuláře funguje i na telefonu.',
                        rows: [
                            { label: 'Schválení vlastníka', value: 'Uděleno v příběhu' },
                            { label: 'Nasazení a ověření', value: 'Dokončeno v příběhu' },
                        ],
                        note: 'Ilustrované vydání · žádný skutečný web neměníme',
                    },
                },
                {
                    label: 'Později',
                    title: 'Další potřeba. Bez dalšího pobízení.',
                    status: 'prepared',
                    explanation:
                        'Při další kontrole se objeví nejasné potvrzení rezervace. V rámci stejné agendy vznikne lepší text a jeho kontrola. Nové zadání od vás není potřeba.',
                    result: 'Péče pokračuje i po první opravě.',
                    artifact: {
                        label: 'Ukázkový web · další návrh',
                        title: 'Co bude po rezervaci?',
                        body: 'Potvrzení nově vysvětluje, kde návštěvník najde detaily návštěvy.',
                        rows: [
                            { label: 'Srozumitelnější potvrzení', value: 'Připraveno a zkontrolováno' },
                            { label: 'Další vydání', value: 'Ke schválení' },
                        ],
                        note: 'Nový návrh · dosud nezveřejněno',
                    },
                },
                {
                    label: 'Klid',
                    title: 'Když není co řešit, práce počká.',
                    status: 'waiting',
                    explanation:
                        'Další návrh čeká na schválení vydání. Žádný nový relevantní problém není otevřený. Agenda nevyrábí práci jen proto, aby byla aktivní.',
                    result: 'Přehled o stavu, bez nekonečného proudu úkolů.',
                    artifact: {
                        label: 'Přehled péče',
                        title: 'Víte, na čem jste',
                        body: 'Rezervace opravené. Lepší potvrzení připravené pro další vydání.',
                        rows: [
                            { label: 'Nové podněty', value: 'Žádné k řešení' },
                            { label: 'Rozhodnutí vlastníka', value: 'Schválit další vydání' },
                        ],
                        note: 'Čeká se na rozhodnutí nebo užitečný podnět',
                    },
                },
            ],
        },
        {
            id: 'communication',
            name: 'Komunikace se zákazníky',
            burden: 'Stejné otázky se vracejí. Odpovědi i další kroky stojí na tom, kdo si právě vzpomene.',
            responsibility: 'Připravovat odpovědi, držet návaznost a zlepšovat vysvětlení, která dotazy vyvolávají.',
            benefit: 'Souvislá péče o zákazníky. Méně opakovaných zásahů.',
            human: 'Neobvyklé požadavky a závazky mimo dohodnutá pravidla řeší člověk.',
            steps: [
                {
                    label: 'Dotaz',
                    title: '„Kde najdu potvrzení rezervace?“',
                    status: 'received',
                    explanation:
                        'Stejná otázka přišla znovu. Patří do svěřené komunikace, takže může navázat příprava odpovědi.',
                    result: 'Dotaz má další krok i bez vašeho připomenutí.',
                    artifact: {
                        label: 'Ukázková zákaznická zpráva',
                        title: 'Potvrzení rezervace',
                        body: 'Rezervaci jsem dokončil. Kde najdu její přehled?',
                        rows: [
                            { label: 'Téma', value: 'Opakovaný dotaz' },
                            { label: 'Odpověď', value: 'K přípravě' },
                        ],
                        note: 'Fiktivní zpráva · bez osobních údajů',
                    },
                },
                {
                    label: 'Odpověď',
                    title: 'Připravená odpověď, jasný další krok.',
                    status: 'prepared',
                    explanation:
                        'Návrh vychází z domluveného způsobu komunikace a popisu služby. Je připravený ke kontrole; ještě nebyl odeslán.',
                    result: 'Konzistentní odpověď bez psaní stejného vysvětlení od začátku.',
                    artifact: {
                        label: 'Koncept odpovědi',
                        title: 'Vaše rezervace je v přehledu',
                        body: 'Po přihlášení otevřete Moje rezervace. Najdete tam termín i možnost změny.',
                        rows: [
                            { label: 'Odpověď', value: 'Připravená ke kontrole' },
                            { label: 'Odeslání', value: 'Neodesláno' },
                        ],
                        note: 'Koncept není odeslaná zpráva',
                    },
                },
                {
                    label: 'Zlepšení',
                    title: 'Další odpověď už nemusí být potřeba.',
                    status: 'prepared',
                    explanation:
                        'Opakování dotazu vede i k návrhu srozumitelnějšího potvrzení. Péče řeší příčinu, nejen každou novou zprávu zvlášť.',
                    result: 'Lepší vysvětlení pro příští zákazníky.',
                    artifact: {
                        label: 'Návrh vysvětlení v potvrzení',
                        title: 'Vše najdete v Moje rezervace',
                        body: 'Termín i jeho změnu vyřídíte ve svém přehledu. Odkaz je hned pod potvrzením.',
                        rows: [
                            { label: 'Úprava vysvětlení', value: 'Připraveno' },
                            { label: 'Zveřejnění', value: 'Čeká na schválení' },
                        ],
                        note: 'Další užitečná práce v rámci stejné agendy',
                    },
                },
                {
                    label: 'Výjimka',
                    title: 'Zvláštní podmínky rozhoduje člověk.',
                    status: 'attention',
                    explanation:
                        'Další zákazník žádá výjimku ze storno podmínek. Systém připraví souvislosti a předá konkrétní rozhodnutí odpovědnému člověku.',
                    result: 'Běžná návaznost pokračuje. Výjimka má jasného vlastníka.',
                    artifact: {
                        label: 'K rozhodnutí člověku',
                        title: 'Výjimka ze storno podmínek',
                        body: 'Požadavek přesahuje schválená pravidla. Je potřeba rozhodnout, jaké podmínky nabídnout.',
                        rows: [
                            { label: 'Podklady k rozhodnutí', value: 'Připraveno' },
                            { label: 'Příslib zákazníkovi', value: 'Žádný neodeslán' },
                        ],
                        note: 'Obchodní rozhodnutí zůstává na vás',
                    },
                },
                {
                    label: 'Klid',
                    title: 'Nic nezapadlo. Další krok je zřejmý.',
                    status: 'waiting',
                    explanation:
                        'Koncepty jsou připravené, výjimka čeká na člověka. Bez nových dotazů není důvod vytvářet další zprávy.',
                    result: 'Kontinuita bez zbytečné aktivity.',
                    artifact: {
                        label: 'Přehled komunikace',
                        title: 'Připraveno k navázání',
                        body: 'Odpověď a lepší vysvětlení čekají na kontrolu. Výjimka je odděleně k rozhodnutí.',
                        rows: [
                            { label: 'Nové dotazy', value: 'Žádné k řešení' },
                            { label: 'Zprávy odeslané v ukázce', value: 'Žádné' },
                        ],
                        note: 'Odesílání by vyžadovalo samostatné oprávnění',
                    },
                },
            ],
        },
        {
            id: 'documents',
            name: 'Účetní podklady',
            burden: 'Doklady přibývají po jednom. Chybějící údaje se dohánějí až před předáním účetnímu.',
            responsibility: 'Udržovat podklady uspořádané a včas označovat, co chybí nebo nesouhlasí.',
            benefit: 'Lépe připravené podklady. Méně dohledávání na poslední chvíli.',
            human: 'Nejasnosti, odborné posouzení a finální kontrola patří odpovědnému člověku.',
            steps: [
                {
                    label: 'Nový doklad',
                    title: 'Nový doklad zapadá do souvislostí.',
                    status: 'received',
                    explanation:
                        'Do podkladů přibyla faktura. Naváže na ostatní doklady za dané období, bez dalšího pokynu k roztřídění.',
                    result: 'Podklady se připravují průběžně.',
                    artifact: {
                        label: 'Ukázkové podklady · říjen',
                        title: 'Faktura za materiál',
                        body: 'Nový doklad přijatý do sady podkladů.',
                        rows: [
                            { label: 'Faktura', value: 'Přijato' },
                            { label: 'Dodací list', value: 'K dohledání' },
                        ],
                        note: 'Fiktivní doklady · žádné zaúčtování',
                    },
                },
                {
                    label: 'Uspořádání',
                    title: 'Doklad zařazený, souvislosti pohromadě.',
                    status: 'prepared',
                    explanation:
                        'Faktura je zařazená k období a související objednávce. Kontrola úplnosti ukazuje, který podklad ještě chybí.',
                    result: 'Méně ručního třídění před odbornou kontrolou.',
                    artifact: {
                        label: 'Sada podkladů ke kontrole',
                        title: 'Materiál · říjen',
                        body: 'Faktura a objednávka jsou ve stejné sadě.',
                        rows: [
                            { label: 'Faktura + objednávka', value: 'Přiřazeno' },
                            { label: 'Dodací list', value: 'Chybí' },
                        ],
                        note: 'Uspořádání podkladů není odborné zaúčtování',
                    },
                },
                {
                    label: 'Nejasnost',
                    title: 'Konkrétní otázka místo neurčitého problému.',
                    status: 'attention',
                    explanation:
                        'Chybí doklad o převzetí materiálu. Vznikne konkrétní požadavek pro odpovědného člověka, ne odhad doplněný do účetnictví.',
                    result: 'Je jasné, co doplnit a proč.',
                    artifact: {
                        label: 'Požadavek k doplnění',
                        title: 'Doplňte dodací list k materiálu',
                        body: 'Je třeba doložit převzetí a ověřit návaznost na fakturu.',
                        rows: [
                            { label: 'Požadovaný podklad', value: 'Dodací list' },
                            { label: 'Řeší', value: 'Odpovědný člověk' },
                        ],
                        note: 'Chybějící údaj se nevymýšlí',
                    },
                },
                {
                    label: 'Doplnění',
                    title: 'Doplněný podklad vrací věci do pohybu.',
                    status: 'prepared',
                    explanation:
                        'V příběhu člověk dodal chybějící doklad. Sada se doplní a návaznosti se znovu zkontrolují, bez nového zadání celé práce.',
                    result: 'Ucelenější podklady pro odpovědnou kontrolu.',
                    artifact: {
                        label: 'Aktualizovaná sada podkladů',
                        title: 'Připraveno pro účetní',
                        body: 'Faktura, objednávka a dodací list jsou pohromadě.',
                        rows: [
                            { label: 'Požadovaný doklad', value: 'Doplněno v příběhu' },
                            { label: 'Odborná kontrola', value: 'Na odpovědné osobě' },
                        ],
                        note: 'Žádné daňové podání ani platba',
                    },
                },
                {
                    label: 'Předání',
                    title: 'Podklady čekají připravené na kontrolu.',
                    status: 'waiting',
                    explanation:
                        'V této sadě není další chybějící podklad. Agenda počká na nový doklad; odborné rozhodnutí tím nepřebírá.',
                    result: 'Připravené vstupy místo dohánění dokladů na poslední chvíli.',
                    artifact: {
                        label: 'Přehled podkladů',
                        title: 'Sada připravená k předání',
                        body: 'Doplněné podklady i vyřešený požadavek zůstávají spolu.',
                        rows: [
                            { label: 'Otevřené požadavky', value: 'Žádné v této sadě' },
                            { label: 'Finální kontrola', value: 'Čeká na účetní' },
                        ],
                        note: 'Odborná odpovědnost zůstává člověku',
                    },
                },
            ],
        },
    ],
    en: [
        {
            id: 'software',
            name: 'Website & application care',
            burden: 'Your product is built. But fixes, small improvements and follow-ups still wait for you to assign them.',
            responsibility: 'Keep identifying and preparing relevant fixes and improvements within an agreed scope.',
            benefit: 'A maintained product. Less chasing and coordination.',
            human: 'You set priorities and decide on major changes and release permissions.',
            steps: [
                {
                    label: 'Issue',
                    title: 'Mobile bookings hit an error.',
                    status: 'received',
                    explanation:
                        'A report from the website falls within the agreed responsibility. It becomes a concrete repair task without you having to describe it again.',
                    result: 'The issue has a next step. It does not just sit in an inbox.',
                    artifact: {
                        label: 'Example website · issue report',
                        title: 'Book your visit',
                        body: 'Visitors cannot complete a booking on a smaller screen.',
                        rows: [
                            { label: 'Booking form', value: 'Error reported' },
                            { label: 'Next step', value: 'Check and prepare a fix' },
                        ],
                        note: 'The live website is unchanged',
                    },
                },
                {
                    label: 'Proposal',
                    title: 'Fix prepared. Checks complete.',
                    status: 'prepared',
                    explanation:
                        'The proposed fix has passed the booking form checks. You get a clear result instead of another series of small tasks to coordinate.',
                    result: 'Less coordination between a reported issue and a proposed solution.',
                    artifact: {
                        label: 'Example website · change preview',
                        title: 'Book your visit',
                        body: 'The form fits a phone screen. The confirmation is within reach.',
                        rows: [
                            { label: 'Phone and desktop', value: 'Checked' },
                            { label: 'Form fix', value: 'Ready for review' },
                        ],
                        note: 'Fix preview · not deployed yet',
                    },
                },
                {
                    label: 'Decision',
                    title: 'You decide when to release.',
                    status: 'attention',
                    explanation:
                        'In this example, changing the live website requires your approval. Preparation continued independently; this decision belongs to a person.',
                    result: 'One concrete decision for you: release the prepared fix?',
                    artifact: {
                        label: 'Approval request',
                        title: 'Release the booking fix?',
                        body: 'Scope: mobile form adjustment. The offer and prices stay the same.',
                        rows: [
                            { label: 'Proposal checks', value: 'Complete' },
                            { label: 'Deployment', value: 'Awaiting owner approval' },
                        ],
                        note: 'No approval means no change to the live site',
                    },
                },
                {
                    label: 'Release',
                    title: 'Approval comes before deployment.',
                    status: 'approved',
                    explanation:
                        'In the story, the owner approves the release. A separate deployment and a check of the live site then complete the repair.',
                    result: 'The fix is followed through to a verified website.',
                    artifact: {
                        label: 'Example website · approved release',
                        title: 'Your booking is confirmed',
                        body: 'The form now works on phones too.',
                        rows: [
                            { label: 'Owner approval', value: 'Granted in this story' },
                            { label: 'Deployment and live check', value: 'Completed in this story' },
                        ],
                        note: 'Illustrated release · no real website is changed',
                    },
                },
                {
                    label: 'Later',
                    title: 'Another need. No new prompt.',
                    status: 'prepared',
                    explanation:
                        'A later check finds an unclear booking confirmation. The same responsibility leads to clearer wording and a check of the change, without another assignment from you.',
                    result: 'Care continues after the first repair.',
                    artifact: {
                        label: 'Example website · next proposal',
                        title: 'What happens after booking?',
                        body: 'The confirmation now explains where to find the details of the visit.',
                        rows: [
                            { label: 'Clearer confirmation', value: 'Prepared and checked' },
                            { label: 'Next release', value: 'Awaiting approval' },
                        ],
                        note: 'New proposal · not published yet',
                    },
                },
                {
                    label: 'At rest',
                    title: 'When nothing needs doing, it waits.',
                    status: 'waiting',
                    explanation:
                        'The next proposal is waiting for release approval. There are no new relevant issues. The system does not invent work just to stay busy.',
                    result: 'A clear view of progress, without an endless stream of tasks.',
                    artifact: {
                        label: 'Care overview',
                        title: 'You know where things stand',
                        body: 'Bookings repaired. A clearer confirmation prepared for the next release.',
                        rows: [
                            { label: 'New issues', value: 'None to address' },
                            { label: 'Owner decision', value: 'Approve the next release' },
                        ],
                        note: 'Waiting for a decision or a useful new signal',
                    },
                },
            ],
        },
        {
            id: 'communication',
            name: 'Customer communication',
            burden: 'The same questions keep coming back. Replies and follow-ups depend on someone remembering.',
            responsibility:
                'Prepare replies, keep follow-ups connected and improve the explanations behind recurring questions.',
            benefit: 'Consistent customer care. Fewer repetitive interventions.',
            human: 'A person handles unusual requests and commitments outside the agreed rules.',
            steps: [
                {
                    label: 'Question',
                    title: '“Where can I find my booking?”',
                    status: 'received',
                    explanation:
                        'The same question has come up again. It belongs to the entrusted responsibility, so preparing a reply can follow.',
                    result: 'A next step without another reminder from you.',
                    artifact: {
                        label: 'Example customer message',
                        title: 'Booking confirmation',
                        body: 'I completed my booking. Where can I see the details?',
                        rows: [
                            { label: 'Topic', value: 'Recurring question' },
                            { label: 'Reply', value: 'To prepare' },
                        ],
                        note: 'Fictional message · no personal information',
                    },
                },
                {
                    label: 'Reply',
                    title: 'A prepared reply. A clear next step.',
                    status: 'prepared',
                    explanation:
                        'The draft follows the agreed communication rules and service information. It is ready for review; it has not been sent.',
                    result: 'Consistent replies without writing the same explanation from scratch.',
                    artifact: {
                        label: 'Draft reply',
                        title: 'Your booking is in your account',
                        body: 'After signing in, open My bookings. You can find your date and change it there.',
                        rows: [
                            { label: 'Reply', value: 'Ready for review' },
                            { label: 'Sending', value: 'Not sent' },
                        ],
                        note: 'A draft is not a sent message',
                    },
                },
                {
                    label: 'Improvement',
                    title: 'The next question may not need asking.',
                    status: 'prepared',
                    explanation:
                        'Repeated questions also lead to a clearer confirmation message. Ongoing care addresses the cause, as well as each individual enquiry.',
                    result: 'A better explanation for future customers.',
                    artifact: {
                        label: 'Proposed confirmation wording',
                        title: 'Find everything in My bookings',
                        body: 'View or change your date in your account. The link is just below your confirmation.',
                        rows: [
                            { label: 'Clearer explanation', value: 'Prepared' },
                            { label: 'Publication', value: 'Awaiting approval' },
                        ],
                        note: 'More useful work within the same responsibility',
                    },
                },
                {
                    label: 'Exception',
                    title: 'Special terms need a person.',
                    status: 'attention',
                    explanation:
                        'Another customer asks for an exception to the cancellation policy. The system gathers the context and passes a concrete decision to the responsible person.',
                    result: 'Routine follow-through continues. The exception has a clear owner.',
                    artifact: {
                        label: 'For a person to decide',
                        title: 'Exception to cancellation terms',
                        body: 'This request exceeds the approved rules. Someone needs to decide what terms to offer.',
                        rows: [
                            { label: 'Decision context', value: 'Prepared' },
                            { label: 'Promise to the customer', value: 'None sent' },
                        ],
                        note: 'The business decision stays with you',
                    },
                },
                {
                    label: 'At rest',
                    title: 'Nothing lost. The next step is clear.',
                    status: 'waiting',
                    explanation:
                        'Drafts are ready and the exception awaits a person. With no new questions, there is no reason to generate more messages.',
                    result: 'Continuity without unnecessary activity.',
                    artifact: {
                        label: 'Communication overview',
                        title: 'Ready to follow through',
                        body: 'The reply and clearer explanation await review. The exception is a separate decision.',
                        rows: [
                            { label: 'New questions', value: 'None to address' },
                            { label: 'Messages sent in this demo', value: 'None' },
                        ],
                        note: 'Sending would need separate authorization',
                    },
                },
            ],
        },
        {
            id: 'documents',
            name: 'Accounting documents',
            burden: 'Documents arrive one by one. Missing details get chased just before the handover to your accountant.',
            responsibility: 'Keep supporting documents organized and flag missing or inconsistent information early.',
            benefit: 'Better-prepared inputs. Less last-minute document chasing.',
            human: 'A responsible person resolves uncertainty and retains professional judgment and final review.',
            steps: [
                {
                    label: 'New document',
                    title: 'A new document joins the bigger picture.',
                    status: 'received',
                    explanation:
                        'An invoice arrives and joins the records for the period, without another instruction to sort it.',
                    result: 'Preparation happens as documents arrive.',
                    artifact: {
                        label: 'Example documents · October',
                        title: 'Materials invoice',
                        body: 'A new invoice received into the supporting records.',
                        rows: [
                            { label: 'Invoice', value: 'Received' },
                            { label: 'Delivery note', value: 'To find' },
                        ],
                        note: 'Fictional documents · no accounting entry',
                    },
                },
                {
                    label: 'Organize',
                    title: 'Filed with the records that belong together.',
                    status: 'prepared',
                    explanation:
                        'The invoice is linked to the period and the related order. A completeness check shows which supporting document is still missing.',
                    result: 'Less manual sorting before professional review.',
                    artifact: {
                        label: 'Supporting documents for review',
                        title: 'Materials · October',
                        body: 'The invoice and order are in the same set.',
                        rows: [
                            { label: 'Invoice + order', value: 'Linked' },
                            { label: 'Delivery note', value: 'Missing' },
                        ],
                        note: 'Organizing inputs is not professional accounting',
                    },
                },
                {
                    label: 'Missing detail',
                    title: 'A specific request, not a vague problem.',
                    status: 'attention',
                    explanation:
                        'Proof of delivery is missing. A concrete request goes to the responsible person instead of a guess being entered into the books.',
                    result: 'It is clear what to supply and why.',
                    artifact: {
                        label: 'Request for missing information',
                        title: 'Add the materials delivery note',
                        body: 'Receipt of the goods needs evidence so it can be checked against the invoice.',
                        rows: [
                            { label: 'Document needed', value: 'Delivery note' },
                            { label: 'To resolve', value: 'Responsible person' },
                        ],
                        note: 'Missing information is not invented',
                    },
                },
                {
                    label: 'Resolved',
                    title: 'The missing document moves things forward.',
                    status: 'prepared',
                    explanation:
                        'In the story, a person supplies the document. The set is updated and the links checked again, without assigning the whole job from scratch.',
                    result: 'More complete inputs for responsible review.',
                    artifact: {
                        label: 'Updated supporting documents',
                        title: 'Ready for the accountant',
                        body: 'The invoice, order and delivery note are together.',
                        rows: [
                            { label: 'Requested document', value: 'Supplied in this story' },
                            { label: 'Professional review', value: 'With the responsible person' },
                        ],
                        note: 'No tax filing or payment',
                    },
                },
                {
                    label: 'Handover',
                    title: 'Prepared inputs await review.',
                    status: 'waiting',
                    explanation:
                        'No further supporting document is missing from this set. Work waits for the next arrival; it does not take over professional judgment.',
                    result: 'Ready inputs instead of a last-minute scramble for documents.',
                    artifact: {
                        label: 'Document overview',
                        title: 'Ready for handover',
                        body: 'The completed records and resolved request stay together.',
                        rows: [
                            { label: 'Open requests', value: 'None in this set' },
                            { label: 'Final review', value: 'Awaiting the accountant' },
                        ],
                        note: 'Professional responsibility stays with a person',
                    },
                },
            ],
        },
    ],
};
