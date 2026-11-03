import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getOperatorIdentification, LEGAL_CONTACT_EMAIL, NEONMEDIA_IDENTIFICATION } from '@/lib/legal/legalOperator';

/** Proposed B2B subscription contract, separate from the existing workshop and community terms. */
export const PRODUCT_TERMS_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Podmínky produktu Promptbook',
        publication: {
            date: '2026-11-03', isDraft: true,
            notice: 'Pracovní návrh, dosud neúčinný. Zveřejnění není nabídkou k uzavření smlouvy ani změnou již sjednaných práv. Použije se až po výslovném přijetí konkrétní verze v objednávce. Ceny a otevřené varianty se tímto textem neaktivují.',
        },
        perex: 'Návrh pravidel pro firemní předplatné, produktovou podporu a vztah mezi klientem, jeho agenturou a dodavatelem Promptbooku. Podmínky workshopů a členství v komunitě zůstávají samostatné.',
        sections: [
            {
                heading: 'Dodavatel, zákazník a uzavření smlouvy',
                paragraphs: [
                    `Dodavatelem je ${getOperatorIdentification('cs')} („AI Web“). Kontakt pro smluvní otázky: ${LEGAL_CONTACT_EMAIL}. Zákazníkem je podnikatel určený názvem, identifikačním číslem, sídlem a fakturačním kontaktem v objednávce. Tyto podmínky nejsou určeny pro spotřebitelské objednávky.`,
                    'Smlouva vzniká potvrzením objednávky AI Webem, nikoli odesláním nezávazné poptávky. Potvrzení určí tarif, klientské prostředí, cenu, měnu, dobu, plátce, podporovanou konfiguraci a verzi přijatých podmínek. Individuálně sjednaná ustanovení mají přednost. Není-li určitá služba výslovně objednána, nevzniká povinnost ji poskytnout.',
                ],
            },
            {
                heading: 'Co předplatné obsahuje',
                bullets: [
                    'Placené oprávnění k užívání komerční ovládací aplikace Promptbook, sjednané spojovací služby relay a objednané produktové služby. Samostatný engine běží v prostředí zákazníka a jeho práva určuje licence konkrétní verze. Předplatné aplikace se automaticky nevydává za povinnou platbu za každé samostatné použití enginu.',
                    'Jedno klientské prostředí je konkrétní samostatný projekt zákazníka s vymezenou agendou a oprávněními, nikoli jeden fyzický počítač nebo jeden agent. Oddělená oddělení jedné firmy mohou mít různé samostatné licence. Pouhé přejmenování či technická migrace nové prostředí nevytváří.',
                    'Vlastní zdrojový kód a práva ke konkrétní verzi se řídí její přiloženou licencí. Předplatné samo nepřepisuje licence cizích komponent ani již udělená oprávnění. Pracovní návrh licenčních oprávnění je na stránce Licence enginu.',
                    'AI modely, tokeny, hosting klientského enginu, databáze, úložiště, externí nástroje, instalace, integrace, individuální školení, konzultace a zakázková práce se hradí zvlášť. Obecná dokumentace a zveřejněná výuková videa nejsou samostatným placeným školením.',
                ],
            },
            {
                heading: 'Tarify, úhrada a ukončení obnovování',
                paragraphs: [
                    'Start je jednorázový třicetidenní produkční pilot, dostupný jednou pro koncového zákazníka, bez automatického obnovení a bez produktového SLA. Business se standardně obnovuje měsíčně; zákazník může další obnovení zrušit nejpozději před začátkem dalšího období. Již zaplacené období tím nekončí.',
                    'Cenu, měnu, DPH a splatnost vždy určuje potvrzená objednávka. Roční předplatné a sleva za předplacení vzniknou jen jejich výslovným sjednáním; tento draft nezavádí nový roční tarif. Předplacené plnění se poprvé aktivuje až přijetím sjednané úhrady, není-li výslovně sjednáno jinak. Úspěšné stržení platby a převod platební brány na účet AI Webu jsou dvě odlišné události.',
                    'Při neúspěšné obnově již běžícího předplatného zákazníka vyzveme k nápravě a určíme přiměřenou dodatečnou lhůtu; běžný návrh je 30 dní od splatnosti. Poté lze pozastavit placené služby. Ukončení předplatného samo neodebírá práva, která zákazník podle konkrétní licence smí vykonávat i bez něj.',
                ],
            },
            {
                heading: 'Partner, školení a zákaznická péče',
                paragraphs: [
                    'Zákazník běžně komunikuje se svou partnerskou agenturou, která má samostatnou smlouvu o implementaci a péči. AI Web odpovídá za objednané produktové plnění, nikoli automaticky za služby agentury. Agentura nesmí jménem AI Webu slibovat slevu, funkci, termín ani vyšší SLA bez jeho oprávnění.',
                    `Na koordinaci partnerského programu se může podílet ${NEONMEDIA_IDENTIFICATION.cs}. Neonmedia není automaticky poskytovatelem všech služeb ani smluvní stranou každého předplatného. Její konkrétní role a případná vlastní objednávka musí být určeny zvlášť.`,
                    'Placené školení a individuální služby fakturuje ten, kdo je poskytuje. Nejsou součástí základu licenční provize. Partner i AI Web mohou poskytovat jiné služby a používat jiné technologie; spolupráce je nevýhradní.',
                ],
            },
            {
                heading: 'Produktová podpora Business',
                paragraphs: [
                    'První věcnou reakci na řádně doručené hlášení problému platformy poskytneme do 16 pracovních hodin, pondělí až pátek 9:00–17:00 v časové zóně Europe/Prague mimo české svátky. Reakcí je první posouzení, žádost o nezbytné podklady nebo návrh dalšího postupu; automatická doručenka nestačí.',
                    'Objednávka určí jeden pověřený technický kontakt a kanál hlášení. Zákazník poskytne popis, relevantní verzi a dostupné podklady; čekání na nezbytnou součinnost se nezapočítává do doby následného řešení. První reakce není garancí opravy, dostupnosti ani konkrétního obchodního výsledku. Nejde o nepřetržitou pohotovost nebo servis cizích systémů.',
                    "Navržená politika podpory se vztahuje na stabilní vydání řady 0.118 a novějších. Řada znamená dvojici major.minor. Každou takovou nově vydanou řadu podporujeme nejméně 90 kalendářních dní od vydání první stabilní verze této řady na npm nebo GitHubu; přehled a zdrojové datum zveřejňujeme na ptbk.io/cs/releases; v jejím rámci se podpora vztahuje vždy jen na nejnovější stabilní patch. Nový patch tuto devadesátidenní lhůtu celé řady nespouští znovu. Podpora zahrnuje posouzení hlášení a podle potřeby vydávání opravných patchů, nikoli garantovaný termín opravy nebo novou funkci.",
                    "Po dobu poskytování této podpory musí být k dispozici nejméně jedna podporovaná stabilní řada a její nejnovější patch. Prerelease vydání včetně číselných přípon, alpha, beta a RC jsou z této politiky vyloučena. Uvedení řady 0.118 neprohlašuje její historická prerelease vydání za stabilní ani zpětně nezakládá SLA. Před přijetím tohoto návrhu musí být skutečně dostupná alespoň jedna stabilní podporovaná řada; seznam a minimum podpory se zveřejní před objednávkou na ptbk.io/cs/releases. Původní externí datum vydání není zdejším datem zveřejnění a změna zdroje již slíbenou podporu nezkrátí. Označení LTS je pouze informativní a samo nepřidává smluvní dobu podpory. Prerelease nejsou určena pro komerční provoz. Nevzniká individuální větev ani neomezená podpora historie.",
                ],
            },
            {
                heading: 'Vydávání a aktualizace',
                paragraphs: [
                    'Vydáváme průběžně podle potřeb produktu; negarantujeme denní, týdenní ani jinou pevnou četnost vydání. Aktualizace, změny podporovaných řad a přesné opravné termíny nejsou totéž. Zásadní změnu obecné politiky podpory nebo vydávání oznámíme nejméně 90 dní předem; v již zaplaceném období nezkrátíme výslovně sjednanou podporu.',
                    'Automatické aktualizace se řídí nastavením konkrétního projektu a kompatibilitou. Připnutá verze může aktualizaci blokovat. Zákazník zajišťuje své zálohy, dostupnost zařízení, oprávnění nástrojů a kontrolu výstupů. Bezpečnostní nebo právní důvod může vyžadovat rychlejší ochranné opatření, o němž informujeme bez zbytečného odkladu.',
                ],
            },
            {
                heading: 'Změny cen a podmínek',
                paragraphs: [
                    'Nová cena se použije nejdříve pro následující obnovované období po oznámení nejméně 30 dní předem. Již předplacené období nepřeceníme zpětně. Zákazník může obnovení před účinností změny bez sankce zrušit. Zlevnění a dočasné slevy se automaticky nepřepisují do jiných objednávek.',
                    'Změny dlouhodobých podmínek lze oznámit v přiměřeném rozsahu z právních, bezpečnostních, technických a ekonomických důvodů nejméně 30 dní předem, s uvedením změn a práva změnu odmítnout a závazek ukončit před její účinností. Samotné vyvěšení jiného textu na webu nepřepisuje přijatou smlouvu. Nové granty licence nepůsobí zpětně.',
                    'Budoucí plán zahrnující spotřebu AI nebo další infrastrukturu musí před objednáním oddělit cenu softwarové složky a spotřebních služeb. Na licenční složku nadále platí sjednaná pravidla; tokenová spotřeba a jiné průtokové služby vyžadují vlastní předem oznámené podmínky.',
                ],
            },
            {
                heading: 'Data, nástroje a důvěrnost',
                paragraphs: [
                    'Pracovní projekty, oprávnění a pravidla spravuje zákazník. Externí modely a nástroje mohou dostat údaje, které jim agenda v povoleném rozsahu odešle; dostupnost kódu neznamená, že každý externí dodavatel zůstává mimo zpracování.',
                    'Pro vyřízení poptávky, smlouvy, podpory a partnerské evidence lze v nezbytném rozsahu sdílet kontaktní, smluvní a provizní informace s určenou agenturou a koordinátorem Neonmedia. Pracovní obsah enginu se tím automaticky nesdílí. Účely, příjemce, právní základy, práva a dobu uchování vysvětlují zásady ochrany osobních údajů. Je-li potřebná zpracovatelská smlouva či ujednání společných správců, musí být uzavřeno před příslušným zpracováním.',
                    'Strany chrání neveřejné obchodní a technické informace a zpřístupní je jen oprávněným osobám a nabyvateli závodu či produktu v nezbytném rozsahu, se zajištěním důvěrnosti a zákonného titulu pro osobní údaje.',
                ],
            },
            {
                heading: 'Ukončení, převod a pokračování vlastního provozu',
                paragraphs: [
                    'AI Web může opakované plnění ukončit s 60denním oznámením. Neodstraněné podstatné porušení po výzvě, naléhavá bezpečnost nebo protiprávní jednání umožní odpovídající omezení či ukončení dříve. Pokud AI Web neposkytne část již předplacené služby, vrátí poměrnou cenu neposkytnutého plnění; již vzniklé platební povinnosti se vypořádají zvlášť.',
                    'Zákazník předem souhlasí s postoupením smlouvy spolu s produktem nebo závodem na nabyvatele, který převezme sjednané povinnosti; AI Web mu převod oznámí. Změna vlastníka společnosti sama není zánikem smlouvy. Ukončení hostované služby a odkup provizních práv partnera jsou samostatné otázky.',
                    'Zánik aplikace nebo relay sám fyzicky nevypíná lokální engine. Pokračování může vyžadovat vlastní modely, klíče, zálohy, nástroje, alternativní ovládání a zásahy vývojáře. Rozsah práv dále provozovat a upravovat konkrétní verzi musí být výslovně obsažen v přijaté licenci; tento draft nepředstírá, že chybějící oprávnění již existuje.',
                ],
            },
            {
                heading: 'Odpovědnost a rozhodné právo',
                paragraphs: [
                    'AI Web odpovídá za své sjednané plnění, nikoli za správnost každého výstupu AI, výpadek zákazníkova zařízení či cizího modelu nebo úspěch podnikání. Pro běžnou nedbalost v podnikatelském vztahu návrh omezuje souhrnnou náhradu na cenu dotčené služby zaplacenou za předchozích 12 měsíců a vylučuje ušlý zisk. Omezení se neuplatní, kde je zákon zakazuje, zejména u úmyslu, hrubé nedbalosti a újmy na přirozených právech člověka.',
                    `Použije se české právo a příslušné české soudy. Před soudním sporem se strany pokusí vyjasnit konkrétní nárok přes ${LEGAL_CONTACT_EMAIL}. Znění přijaté při objednávce musí být uchovatelné; pozdější překlad nemění dříve sjednaná práva.`,
                ],
            },
        ],
    },
    en: {
        title: 'Promptbook product terms',
        publication: {
            date: '2026-11-03', isDraft: true,
            notice: 'Discussion draft, not yet effective. Publication is neither an offer nor a change to existing rights. It applies only when a specific version is expressly accepted in an order. This text does not activate prices or unresolved alternatives.',
        },
        perex: 'Proposed rules for business subscriptions, product support and the respective roles of the customer, its agency and Promptbook. Existing workshop and community terms remain separate.',
        sections: [
            {
                heading: 'Supplier, customer and agreement',
                paragraphs: [
                    `The supplier is ${getOperatorIdentification('en')} ("AI Web"). Contract contact: ${LEGAL_CONTACT_EMAIL}. The customer is the business identified by legal name, registration number, registered office and billing contact in the order. These terms are not intended for consumer orders.`,
                    'The agreement is formed when AI Web confirms an order, not when a nonbinding enquiry is submitted. Confirmation specifies the plan, client environment, price, currency, term, payer, supported configuration and accepted terms version. Individually agreed provisions prevail. Services not expressly ordered are not included.',
                ],
            },
            {
                heading: 'Subscription scope',
                bullets: [
                    'Paid permission to use the commercial Promptbook control application, agreed relay connectivity and ordered product services. The standalone engine runs in the customer’s environment under its version-specific licence. Application subscription is not automatically presented as compulsory payment for every independent engine use.',
                    'One client environment means a defined separate customer project with its own workflow and permissions, not a physical server or one agent. Separate departments may have separate licences. Renaming or a technical migration does not by itself create a new environment.',
                    'Rights to a particular source version follow its accompanying licence. A subscription does not rewrite third-party licences or rights already granted. The proposed commercial grant is described on the Engine licence page.',
                    'Models, tokens, engine hosting, databases, storage, external tools, installation, integration, individual training, consulting and custom work are charged separately. General documentation and published instructional videos are not separate paid training.',
                ],
            },
            {
                heading: 'Plans, payment and renewal',
                paragraphs: [
                    'Start is a single 30-day production pilot, available once per end customer, without automatic renewal or product SLA. Business normally renews monthly; cancellation before the next period stops the next renewal and does not shorten a paid period.',
                    'The confirmed order specifies price, currency, VAT and due date. Annual billing or a prepayment discount requires express agreement; this draft does not launch an annual plan. Prepaid services are first activated only after the agreed payment is received, unless expressly agreed otherwise. A successful customer charge and a payment-processor payout to AI Web are distinct events.',
                    'Following a failed renewal of an existing subscription, we request payment and allow an appropriate cure period; the proposed ordinary period is 30 days from the due date. Paid services may then be suspended. Subscription termination does not remove rights which the applicable licence allows the customer to exercise independently.',
                ],
            },
            {
                heading: 'Partners, training and customer care',
                paragraphs: [
                    'Customers normally contact their partner agency, which has its own implementation and care agreement. AI Web supplies the agreed product services, not automatically the agency services. An agency cannot promise discounts, features, delivery dates or additional SLA on behalf of AI Web without authority.',
                    `The partner programme may be coordinated with ${NEONMEDIA_IDENTIFICATION.en}. Neonmedia is not automatically the supplier of every service or party to every subscription. Its specific role and any separate order must be identified separately.`,
                    'Paid training and individual services are invoiced by their provider and excluded from licence commission. Agencies and AI Web may supply other services and use other technologies; cooperation is non-exclusive.',
                ],
            },
            {
                heading: 'Business product support',
                paragraphs: [
                    'We provide a first substantive response to a properly received platform issue within 16 working hours, Monday–Friday 09:00–17:00 Europe/Prague excluding Czech public holidays. A response is an initial assessment, request for necessary information or proposed next step; an automated receipt is insufficient.',
                    'The order identifies one authorised technical contact and reporting channel. The customer provides a description, relevant version and available evidence; time awaiting necessary cooperation is excluded from subsequent resolution time. The first response is not a guaranteed fix, availability commitment or business outcome. There is no continuous on-call service or support for third-party systems.',
                    "The proposed support policy covers stable releases in line 0.118 and later. A line means the major.minor pair. Each newly released line receives at least 90 calendar days of support from its first stable release on npm or GitHub, recorded with its source date in our catalogue at ptbk.io/en/releases; within that line only its latest stable patch is supported. A new patch does not restart the line’s 90-day period. Support includes assessing reports and issuing corrective patches as needed, without a guaranteed repair deadline or new features.",
                    "At least one supported stable line and its latest patch must remain available throughout the provision of this support. Prereleases, including numeric suffixes, alpha, beta and RC, are excluded. Naming line 0.118 does not reclassify historical prereleases as stable or create retrospective SLA. Before this proposal is accepted at least one stable supported line must actually be available; the list and retirement dates are disclosed before ordering. LTS is an informational label and does not itself add a contractual support period. Prereleases are not intended for commercial production. No individual branch or unlimited historic maintenance is included.",
                ],
            },
            {
                heading: 'Releases and updates',
                paragraphs: [
                    'Releases follow product needs, without a guaranteed daily, weekly or other schedule. Updates, supported release lines and repair deadlines are separate matters. Material changes to general support or release policy receive at least 90 days’ notice and do not shorten expressly agreed support in a prepaid period.',
                    'Automatic updates follow project settings and compatibility; a pinned version can block an update. Customers remain responsible for backups, device availability, tool permissions and review of outputs. Urgent legal or security reasons may require earlier protective action, with notice without undue delay.',
                ],
            },
            {
                heading: 'Price and contract changes',
                paragraphs: [
                    'A new price applies no earlier than the next renewal after at least 30 days’ notice. Prepaid periods are not repriced retrospectively. Customers may cancel renewal without penalty before a change takes effect. Price reductions and temporary offers do not automatically amend other orders.',
                    'Reasonable changes to long-term terms for legal, security, technical or economic reasons require at least 30 days’ notice describing the changes and the right to reject them and terminate before effectiveness. Replacing a webpage does not itself amend an accepted agreement. New licence grants are not retrospective.',
                    'A future plan including AI usage or infrastructure must identify its software and consumption components before purchase. Agreed rules continue for the licence component; token consumption and other pass-through services require separately disclosed terms.',
                ],
            },
            {
                heading: 'Data, tools and confidentiality',
                paragraphs: [
                    'Customers control their projects, permissions and rules. External models and tools may receive authorised inputs; access to source code does not remove those providers from the processing chain.',
                    'Necessary contact, contractual and commission information may be shared with the assigned agency and programme coordinator Neonmedia to handle enquiries, contracts, support and partner records. This does not automatically share engine working content. The privacy policy explains purposes, recipients, legal bases, retention and rights. Required processor or joint-controller arrangements must be in place before the relevant processing.',
                    'The parties protect confidential commercial and technical information and disclose it only to authorised persons and a product or business purchaser where necessary, under confidentiality protections and a lawful basis for personal data.',
                ],
            },
            {
                heading: 'Termination, transfer and independent operation',
                paragraphs: [
                    'AI Web may terminate recurring services on 60 days’ notice. An uncured material breach following notice, urgent security issue or unlawful conduct permits proportionate earlier restriction or termination. AI Web refunds the proportional price of prepaid services it does not supply; accrued payment duties are settled separately.',
                    'The customer gives advance consent to assignment together with the product or business to an acquirer assuming the agreed obligations; AI Web gives notice of assignment. A shareholder change does not itself terminate the agreement. Hosted-service retirement and purchase of partner commission rights are separate matters.',
                    'Loss of the application or relay does not itself physically stop the local engine. Continued operation may require the customer’s own models, keys, backups, tools, alternative controls and developer work. Continued rights to run or modify a version must be expressly granted by the accepted licence; this draft does not claim that missing permissions already exist.',
                ],
            },
            {
                heading: 'Liability and governing law',
                paragraphs: [
                    'AI Web is responsible for its agreed services, not every AI output, customer-device or third-party model outage, or commercial success. For ordinary negligence in a business relationship, the proposed aggregate damages cap is the price paid for the affected service in the preceding 12 months, excluding lost profit. Mandatory exceptions remain, including intent, gross negligence and injury to natural personal rights.',
                    `Czech law and the competent Czech courts apply. The parties first try to clarify a specific claim through ${LEGAL_CONTACT_EMAIL}. The accepted order and terms must be retainable; a later translation does not change previously agreed rights.`,
                ],
            },
        ],
    },
};
