import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getOperatorIdentification, NEONMEDIA_IDENTIFICATION } from '@/lib/legal/legalOperator';

/** Public agency programme terms; it does not publish the coordinator's bilateral commercial agreement. */
export const PARTNER_TERMS_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Partnerské podmínky Promptbook',
        publication: {
            date: '2026-11-03', isDraft: false,
            notice: "Znění 2026-11-03-v4 ze dne 3. listopadu 2026. Podmínky se stávají součástí konkrétní partnerské smlouvy jejím přijetím; samotné odeslání poptávky partnerství nezakládá. Partnerský list určuje partnera, rozsah a dobu nároku. Nové znění nepřepisuje dříve přijaté dohody.",
        },
        perex: 'Pravidla pro agentury a integrátory, kteří doporučují konkrétní klientská prostředí a mohou poskytovat vlastní samostatně objednané služby. Odměna za software je oddělená od vlastní práce partnera a od samostatné dohody s koordinátorem programu.',
        sections: [
            {
                heading: 'Strany, role a nevýhradnost',
                paragraphs: [
                    `Poskytovatelem produktu a plátcem sjednané provize je ${getOperatorIdentification('cs')} („AI Web“). Partnerem je podnikatel s názvem, IČO, sídlem a kontakty uvedenými v podepsané smlouvě. Koordinátorem programu může být ${NEONMEDIA_IDENTIFICATION.cs}; tím se automaticky nestává stranou každé partnerské smlouvy.`,
                    'Partner může klientovi poskytovat vlastní implementaci, běžnou péči a školení podle samostatné objednávky. Samotná účast v doporučovacím programu nezakládá povinnost soustavně získávat obchody pro AI Web. Zákazník uzavírá produktovou smlouvu přímo s AI Webem. Doporučování se řídí rámcem zprostředkování podle § 2445 a násl. občanského zákoníku; případná další partnerská ujednání se posoudí podle svého obsahu. AI Web dodává produkt a sjednanou produktovou podporu. Partner nesmí zavazovat AI Web bez pověření. Spolupráce je nevýhradní: obě strany mohou dodávat jiným klientům, využívat jiné technologie a spolupracovat s dalšími dodavateli.',
                    'Kontakty podle tématu: příklady použití a partnerská koordinace — Kryštof, krystof@neonmedia.cz; obchod — Jiří Jahn, jiri@ptbk.io; technologie — Pavol Hejný, pavol@ptbk.io. Vlastník konkrétního otevřeného obchodu se určuje samostatně v evidenci.',
                    'Program je určen pro dohodnutý produkt a kanál v České republice a na Slovensku; odlišný trh, další produkt nebo podstatně jiný distribuční model vyžaduje dohodu. Kosmetické přejmenování stejného plnění není důvodem obejít existující nárok.',
                ],
            },
            {
                heading: 'Jak se přiřazuje obchod',
                paragraphs: [
                    'Partner před uzavřením obchodu registruje v dohodnuté evidenci zákaznickou právnickou osobu, vymezené klientské prostředí či agendu, odpovědný kontakt a doložený původ obchodu. AI Web přiřazení potvrdí. Samotný kontakt ve firemním adresáři, cookie nebo shodné IČO nárok nezakládá.',
                    'Přiřazení se váže na konkrétní licenci a její ekonomicky navazující předplatné, nikoli automaticky na celou skupinu firem či všechny útvary zákazníka. Tři oddělené projekty jedné velké firmy mohou mít tři partnery, pokud mají skutečně oddělené licence a doložený rozsah. Umělé dělení nebo přeznačení jediné licence nesmí vytvářet dvojí provizi.',
                    'Při souběhu doporučení se vychází z potvrzeného obchodu a doloženého přínosu. Sporný obchod se vyřeší podle záznamů před výplatou sporné části; nesporné provize zůstávají splatné. Technická změna ID, migrace projektu nebo změna tarifu sama přiřazení neruší.',
                ],
            },
            {
                heading: 'Základní provize a vyloučené služby',
                paragraphs: [
                    "Provize činí jednotných 20 % ze skutečně zaplacené způsobilé softwarové ceny bez DPH, po slevách a přípustných vratkách. Stejná sazba platí pro všechny současné i budoucí plány a měsíční, roční i jinou fakturaci; názvy tarifů sazbu nemění. Běžné poplatky platební brány základ provize nesnižují. Pouhá autorizace ani neuhrazená faktura nejsou přijatou platbou; povinná zákonná pravidla vzniku provize zůstávají zachována.",
                    "Bezplatné užití samostatného enginu nevytváří provizi. Vrácení platby nebo chargeback opraví provizi jen v prokázaném rozsahu, v němž podle smlouvy a zákona nárok nevznikl nebo zanikl; nesplnění z důvodu na straně AI Webu není automatickým důvodem odebrat provizi obchodního zástupce.",
                    "Podíl se vztahuje na způsobilou softwarovou složku všech plánů. Nevztahuje se na AI tokeny a kredity, infrastrukturu, daně ani na implementaci, konzultace, kurzy, školení a jinou práci. Příjmy z vlastní práce náleží jejímu poskytovateli. Za vlastní nákup partnera a víceúrovňové doporučování nevzniká automaticky provize.",
                    'Případný budoucí tokenový tarif zatím není nabízen; jeho licenční složka podléhá dohodnuté provizi, spotřební tokenová složka má samostatná předem sjednaná pravidla. Přeznačení stejné licence nesmí obcházet vzniklé nároky.',
                ],
            },
            {
                heading: 'Platby a splatnost provize',
                paragraphs: [
                    "Ze zaplacené částky 1 000 Kč bez DPH činí provize 200 Kč; z roční platby 10 000 Kč činí 2 000 Kč. Roční sleva sníží základ, nikoli sazbu. Absolutní odměny za různé způsoby placení se nedorovnávají. Samotná pravidla provize nezavádějí nový cenový tarif.",
                    "Pro ekonomickou evidenci lze roční příjem rozvrhnout do měsíců služby. U spolupráce, která je podle skutečného obsahu obchodním zastoupením, však tento rozvrh neodkládá vznik a splatnost provize podle § 2504 odst. 2 a § 2505 občanského zákoníku. Zaplacení celého ročního závazku zákazníkem může založit nárok na provizi za celý zaplacený obchod; jeho splatnost nelze automaticky roztáhnout do dvanácti měsíců.",
                    "Nesporná provize je splatná do 30 kalendářních dnů od přijetí odpovídající platby AI Webem, stejně u měsíční i roční fakturace. Roční provize se nevyplácí po dvanáctinách. Přijetím je disponibilní připsání na bankovní nebo platební účet AI Webu, nikoli pouhá autorizace či nepřístupná rezerva. Je-li povinná zákonná splatnost dřívější, má přednost; tato definice ji neodkládá.",
                ],
            },
            {
                heading: 'Vyúčtování a opravy',
                paragraphs: [
                    "Přehled za předchozí měsíc zpřístupníme do 10. dne a podklady poskytujeme průběžně tak, aby byla dodržena třicetidenní splatnost od přijetí platby. Partner dodá potřebné daňové údaje a doklad, je-li vyžadován. Námitky k jedné položce neblokují nesporné částky; administrativní čekání neposouvá sjednanou ani povinnou zákonnou lhůtu. Není minimální výplatní saldo.",
                    'Přehled rozlišuje klientské prostředí, platbu, období, tarif, slevu, vratku, bonus, sazbu a opravy předchozích období. Partner poskytne správné fakturační a bankovní údaje. DPH z jeho odměny se řeší podle jeho skutečného daňového postavení.',
                    'Vratka či chargeback se promítne do následujícího vyúčtování. Případný přeplatek lze započíst proti další splatné provizi; pokud další provize nevznikají, partner vrátí doložený přeplatek do 30 dní od doručení jeho vyúčtování. Jiné splátky lze sjednat individuálně. Není-li chyba partnera, nevzniká automaticky nárok přenést na něj všechny provozní poplatky nebo jiné škody.',
                ],
            },
            {
                heading: 'Kontinuita předplatného a změna partnera',
                paragraphs: [
                    'Pozdní platba sama neruší přiřazení. Po třicetidenní toleranci od splatnosti se pouze odloží provize; po doplacení se zúčtuje v dalším období. Delší doložená administrativní prodleva u jinak nepřerušené licence může být potvrzena v evidenci. Skutečně ukončená a později nově objednaná služba vyžaduje nové posouzení přivedení; původní partner nemá trvalou rezervaci celé firmy.',
                    'Změna tarifu zvýší nebo sníží provizi podle nové způsobilé zaplacené částky. Prostá technická migrace není odchod zákazníka.',
                    'Zákazník může požádat o změnu obsluhující agentury. AI Web ověří žádost a datum předání, vyslechne dosavadního partnera a zachová již vzniklé nároky. Předání péče samo nemění totožnost původního doporučitele. AI Web potvrdí datum a případný dopad na budoucí provize podle předem sjednaných pravidel; nesouhlas původní agentury sám neblokuje zákazníkovu změnu péče ani předání. Za stejné období se neplatí dvakrát. Není dovoleno jednostranně přepsat přiřazení jen pro úsporu provize.',
                ],
            },
            {
                heading: 'Průběžná péče a doba nároku',
                paragraphs: [
                    'U nově přijímaných partnerských smluv náleží 20% provize po dobu prvních 24 kalendářních měsíců od první placené aktivace konkrétní doporučené licence. Počítá se pouze zaplacená služba v tomto okně. Změna plánu, způsobu fakturace, technická migrace ani přerušení plateb lhůtu neobnovují a neprodlužují. Roční platba přesahující konec okna se do základu zahrne poměrně podle doby služby uvnitř okna; takto vypočtená provize se vyplatí do 30 dní od inkasa. Běžné ukončení partnerského rámce již potvrzené nároky do konce jejich okna neruší. Dříve přijaté odlišné dohody se tímto zveřejněním zpětně nemění.',
                    'Bez dohody nevzniká dodatečný bonus ani automatické snížení sazby. Pokud partner poskytuje i péči, její rozsah a cena se sjednávají samostatně a nevytvářejí další provizi z licence.',
                    'Při nečinnosti následuje doložená výzva, konkrétní náprava a lhůta 30 dní, pokud nejde o naléhavé porušení. Slabý výsledek při poctivém plnění není automaticky nečinnost. Již vydělané odměny nelze zpětně odebrat jen kvůli změně strategie nebo ceny.',
                ],
            },
            {
                heading: 'Ceny, slevy a změny programu',
                paragraphs: [
                    "AI Web a pověřený partner mohou pro novou objednávku nabídnout slevu až 30 % platného ceníku softwarové složky. Sleva se omezuje na první objednané období; nesčítá se automaticky s roční ani jinou slevou. Vyšší, kombinovaná či trvalá výjimka vyžaduje předchozí potvrzení AI Webu. Sleva se eviduje před příslibem klientovi a provize vychází ze skutečně snížené způsobilé ceny.",
                    "Cenu nových objednávek určuje aktuální ceník. Nová cena již běžícího předplatného se uplatní nejdříve při obnově po oznámení nejméně 30 dní předem, bez zpětného zásahu do předplaceného období. Není sjednán pevný desetiprocentní ani jiný cenový koridor; AI Web může pro budoucí obnovy změnit cenu oběma směry. Sjednaná 20% sazba se tím sama nemění. Změna budoucích podmínek potřebuje sjednaný mechanismus, odůvodněné oznámení a skutečnou možnost odmítnutí a ukončení před účinností.",
                    "AI Web může pro nové, dosud nepotvrzené obchody změnit nabídku nebo ukončit přijímání doporučení po oznámení partnerům nejméně 30 dní předem. U již potvrzených obchodů zůstávají sjednaná sazba a doba nároku zachovány; skutečně nový produkt může mít nový program. Přejmenování tarifu nebo technická migrace stejné služby nároky neruší. Změny běžícího smluvního vztahu se řídí sjednaným mechanismem a povinným právem.",
                    'Partner může změnu odmítnout a před její účinností ukončit budoucí účast s dohodnutým předáním. Samotné nové znění stránky automaticky nenahrazuje verzi, kterou partner přijal.',
                ],
            },
            {
                heading: 'Transparentnost a osobní údaje',
                paragraphs: [
                    'AI Web a oprávněný koordinátor sdílejí potřebné projektové kontakty, historii domluvy, stav licencí a finanční podklady k ověření nároků. Partner má přístup k údajům vztahujícím se k jeho obchodům; nevzniká mu přístup ke všem zákazníkům nebo celému účetnictví AI Webu. Přehled s doklady může nahradit přímé oprávnění k platebnímu účtu.',
                    'Sdílené CRM samo neuděluje právo na jiné marketingové využití. Před zpracováním se určí skutečné role a uzavře odpovídající ujednání správců či zpracovatele. Kontakty se nesmějí používat pro nesouvisející zakázky bez právního důvodu. Pracovní soubory enginu, přístupové klíče a osobní údaje nesouvisející s programem nejsou automaticky sdílenou evidencí.',
                    'Partner odpovídá za zákonnost svého oslovování, informování a případné souhlasy. Veřejně uvedená e-mailová adresa ani obecný oprávněný zájem samy nedávají univerzální oprávnění k rozesílání obchodních sdělení.',
                ],
            },
            {
                heading: 'Ukončení, převod produktu a odkup',
                paragraphs: [
                    "Běžná výpověď je 60 dní. Je-li vztah obchodním zastoupením na dobu neurčitou, konec nastane až posledním dnem kalendářního měsíce, který splní jak těchto 60 dní, tak zákonné minimum jednoho měsíce v prvním roce, dvou ve druhém a tří ve třetím a dalších letech. Strany předají otevřené případy, podklady a přístupy; zákaznickou péči nezadrží kvůli sporu. Podstatné porušení má vlastní postup výzvy a nápravy.",
                    'Při skončení nevznikají automaticky nové nároky z nových klientů. Dosavadní vzniklé odměny, schválené rozpracované obchody a případný omezený doběh se vypořádají podle konkrétní smlouvy. Dobu a rozsah doběhu určuje přijatá partnerská smlouva.',
                    'Partner předem souhlasí s postoupením smlouvy spolu s produktem nebo závodem nabyvateli, který převezme dohodnuté povinnosti; postoupení mu bude oznámeno. Nabyvatel může spolupráci převzít, nebo sjednat finanční vypořádání. Prodej samotné technologie automaticky neruší licence ani dluhy a nedává partnerovi podíl na celé kupní ceně.',
                    'Právo jednostranně vykoupit budoucí provize musí být výslovně sjednáno s určitelným výpočtem, rozhodným dnem, lhůtou a vypořádáním již vzniklých částek. Bez této doložky lze odkup provést jen dohodou. Libovolný násobek obratu není ověřený tržní standard; neomezený závazek nelze bez další dohody vydávat za dvanáctiměsíční nárok.',
                ],
            },
            {
                heading: 'Práva k produktu a zákonné hranice',
                paragraphs: [
                    'Partner nezískává výhradní právo k produktu, značce, zdrojovému kódu ani zákaznické firmě. Kód smí provozovat, upravovat a zadat jinému vývojáři jen v rozsahu licence konkrétní verze. Koncem partnerské role se samy neruší práva zákazníka platně nabytá dříve.',
                    'Použije se české právo. Pokud skutečný obsah spolupráce naplní obchodní zastoupení nebo jiný chráněný režim, tyto podmínky nevylučují povinné informační povinnosti, provize, výpovědní lhůty ani zvláštní odměnu. Ujednání o zaplacených příjmech a vratkách neobchází nároky při zmaření obchodu z důvodů na straně zastoupeného.',
                ],
            },
        ],
    },
    en: {
        title: 'Promptbook partner terms',
        publication: {
            date: '2026-11-03', isDraft: false,
            notice: "Version dated 3 November 2026 (2026-11-03-v4). These terms form part of a partner agreement when accepted; an enquiry alone does not create a partnership. The partner sheet identifies the partner, scope and commission period. A new version does not rewrite previously accepted agreements.",
        },
        perex: 'Rules for agencies and integrators referring specific client environments and optionally providing separately ordered services. Software commission is separate from the partner’s own work and the programme coordinator’s bilateral agreement.',
        sections: [
            {
                heading: 'Parties, roles and non-exclusivity',
                paragraphs: [
                    `The product supplier and agreed commission payer is ${getOperatorIdentification('en')} ("AI Web"). The partner is the business identified by name, registration number, registered office and contacts in the signed agreement. The programme may be coordinated by ${NEONMEDIA_IDENTIFICATION.en}; this does not automatically make it a party to every partner agreement.`,
                    'The partner may provide implementation, customer care and training under separate orders. Participation in the referral programme does not itself oblige the partner to continuously acquire business for AI Web. Customers contract for the product directly with AI Web. Referrals follow a brokerage framework under Sections 2445 et seq. of the Czech Civil Code; additional arrangements follow their actual substance. AI Web supplies the product and agreed product support. The partner cannot bind AI Web without authority. Cooperation is non-exclusive: both parties may serve other customers, use other technologies and work with other suppliers.',
                    'Contacts by topic: use cases and partner coordination — Kryštof, krystof@neonmedia.cz; sales — Jiří Jahn, jiri@ptbk.io; technology — Pavol Hejný, pavol@ptbk.io. The owner of each open deal is assigned separately in the shared records.',
                    'The programme covers the agreed product and channel in Czechia and Slovakia. Another market, product or materially different distribution model requires agreement. Cosmetic relabelling of identical services cannot be used to avoid existing entitlements.',
                ],
            },
            {
                heading: 'Deal attribution',
                paragraphs: [
                    'Before closing, the partner records the customer legal entity, defined client environment or workflow, responsible contact and evidenced origin of the deal. AI Web confirms attribution. An address-book entry, cookie or matching company number alone does not create commission.',
                    'Attribution follows the specific licence and its economically continuous subscription, not automatically the whole corporate group or every department. Three separate licensed projects at one company may have three partners with evidenced scope. Artificially splitting or relabelling one licence must not create duplicate commission.',
                    'Competing claims are resolved from the confirmed deal and evidenced contribution before paying the disputed portion; undisputed commission remains payable. Technical ID changes, project migration or plan changes do not by themselves cancel attribution.',
                ],
            },
            {
                heading: 'Base commission and excluded services',
                paragraphs: [
                    "Commission is a uniform 20% of the actually paid eligible software price, excluding VAT, after discounts and permitted refunds. The same rate applies to all current and future plans and monthly, annual or other billing; plan names do not change it. Ordinary payment-processing fees do not reduce the base. Authorisation alone or an unpaid invoice is not received payment; mandatory statutory commission-accrual rules remain applicable.",
                    "Free use of the standalone engine earns no commission. A refund or chargeback adjusts commission only to the evidenced extent the entitlement did not arise or ceased under the contract and law; non-performance caused by AI Web does not automatically remove a commercial agent’s commission.",
                    "The share covers the eligible software component of all plans. It excludes AI tokens and credits, infrastructure, taxes, implementation, consulting, courses, training and other work. Service income belongs to its provider. Own purchases and multi-level referrals earn no automatic commission.",
                    'A possible future token plan is not currently offered: its licence component remains subject to agreed commission, while token consumption requires separately agreed rules disclosed in advance. Relabelling the same licence must not circumvent accrued rights.',
                ],
            },
            {
                heading: 'Payments and commission due dates',
                paragraphs: [
                    "A paid eligible amount of CZK 1,000 excluding VAT earns CZK 200; an annual payment of CZK 10,000 earns CZK 2,000. An annual discount reduces the base, not the percentage. Absolute rewards for different billing schedules are not equalised. Commission rules do not themselves create a new price plan.",
                    "Annual receipts may be allocated across service months for management records. Where the actual relationship constitutes commercial agency, that allocation does not postpone accrual or payment under sections 2504(2) and 2505 of the Czech Civil Code. Full payment of the customer’s annual obligation may create commission on the entire paid transaction; payment cannot automatically be spread over twelve months.",
                    "Undisputed commission is payable within 30 calendar days of AI Web receiving the corresponding payment, for monthly and annual billing alike. Annual commission is not split into twelve instalments. Receipt means available credit to AI Web’s bank or payment account, not authorisation alone or an inaccessible reserve. An earlier mandatory statutory due date takes precedence and is not postponed by this definition.",
                ],
            },
            {
                heading: 'Statements and adjustments',
                paragraphs: [
                    "We provide the prior month’s statement by the 10th and make records available in time to meet the 30-day payment deadline from receipt. The partner supplies necessary tax details and documentation where required. A disputed item does not block undisputed amounts; administrative delay does not extend the agreed or mandatory statutory deadline. There is no minimum payout balance.",
                    'Statements identify the environment, payment, period, plan, discount, refund, bonus, rate and prior adjustments. Partners provide accurate billing and bank details; VAT on their remuneration follows their actual tax status.',
                    'Refunds and chargebacks are corrected in the next statement. A documented overpayment may be offset against future payable commission; absent further commission, the partner repays the evidenced overpayment within 30 days of its statement. Different instalments may be individually agreed. Without partner fault, all operating fees and other losses are not automatically shifted to the partner.',
                ],
            },
            {
                heading: 'Subscription continuity and partner changes',
                paragraphs: [
                    'Late payment alone does not cancel attribution. During the 30-day tolerance from the due date, commission is deferred and paid in a following statement once collected. Longer evidenced administrative delay on an otherwise uninterrupted licence can be confirmed in the records. Genuine termination and a later new order require attribution to be reassessed; the old partner does not permanently reserve the whole company.',
                    'Upgrades and downgrades adjust commission to the eligible paid price. A technical migration is not customer churn.',
                    'Customers may request a different servicing agency. AI Web verifies the request and handover date, hears the existing partner and preserves accrued rights. Care handover does not by itself change the original referrer. AI Web confirms the date and any effect on future commission under previously agreed rules; the old agency’s disagreement alone does not block the customer’s change or handover. The same period is not paid twice. Attribution cannot be changed merely to save commission.',
                ],
            },
            {
                heading: 'Ongoing care and entitlement duration',
                paragraphs: [
                    'For newly accepted partner agreements, the 20% commission covers the first 24 calendar months from the first paid activation of each referred licence, and only paid service within that window. Plan or billing changes, technical migration and payment interruptions do not restart or extend it. Annual payments crossing the end are included pro rata for service within the window; the resulting commission is paid within 30 days of receipt. Ordinary termination of the partner framework does not cancel confirmed rights before the end of their window. Previously accepted different agreements are not changed retrospectively.',
                    'There is no extra bonus or automatic rate reduction without agreement. If the partner also supplies customer care, its scope and price are agreed separately and do not create another licence commission.',
                    'Inactivity triggers an evidenced notice, specific remedy and 30-day cure period unless the breach is urgent. Honest work with weak results is not automatically inactivity. Earned amounts cannot be retrospectively confiscated merely because strategy or pricing changes.',
                ],
            },
            {
                heading: 'Prices, discounts and programme changes',
                paragraphs: [
                    "AI Web and an authorised partner may offer up to 30% off the current software list price for a new order. This is limited to the first ordered term; it does not automatically stack with annual or other discounts. Larger, combined or permanent exceptions need prior AI Web confirmation. The discount is recorded before the customer promise and commission follows the actual discounted eligible price.",
                    "New orders follow the current list price. A changed price for an existing subscription applies no earlier than renewal after at least 30 days’ notice, without retrospective repricing of prepaid terms. There is no fixed 10% or other price corridor; AI Web may change future renewal prices in either direction. This does not itself amend the agreed 20% commission rate. Future programme changes require an agreed mechanism, reasoned notice and a real opportunity to reject and terminate before effectiveness.",
                    "AI Web may change the offer for new, unconfirmed deals or stop accepting referrals on at least 30 days’ notice to partners. Confirmed deals retain their agreed rate and commission period; a genuinely new product may have a new programme. Renaming a plan or technically migrating the same service does not cancel rights. Changes to an existing agreement follow its agreed mechanism and mandatory law.",
                    'A partner may reject a change and end future participation with an agreed handover before it takes effect. A new webpage does not automatically replace the version previously accepted.',
                ],
            },
            {
                heading: 'Transparency and personal data',
                paragraphs: [
                    'AI Web and the authorised coordinator share necessary project contacts, communication history, licence status and financial evidence. Partners access records for their own deals, not all customers or AI Web’s entire accounts. A statement with supporting records can replace direct payment-account access.',
                    'Shared CRM does not authorise unrelated marketing. Actual roles and the necessary controller or processor arrangement are established before processing. Contacts cannot be reused for unrelated projects without a lawful basis. Engine working files, access keys and unrelated personal data are not automatically shared records.',
                    'Partners are responsible for lawful outreach, transparency and required consents. A publicly listed email address or general legitimate interest alone does not universally authorise sending commercial messages.',
                ],
            },
            {
                heading: 'Termination, product transfer and buyout',
                paragraphs: [
                    "Ordinary notice is 60 days. For indefinite commercial agency, termination falls on the final calendar-month day satisfying both that 60-day period and the statutory minimum of one month in year one, two in year two and three in subsequent years. Parties hand over open matters, records and access without withholding customer care over a dispute. Material breach has a separate notice and cure procedure.",
                    'Termination does not automatically create new entitlements for new customers. Accrued remuneration, approved open deals and any limited tail follow the specific agreement. The accepted partner agreement defines the duration and scope of any tail.',
                    'Partners give advance consent to assignment with the product or business to an acquirer assuming the agreed duties, with notice of assignment. An acquirer may continue cooperation or agree a settlement. Selling the technology alone does not cancel licences or debts and grants no automatic share in the whole purchase price.',
                    'Unilateral purchase of future commission requires an express clause with a determinable calculation, valuation date, notice and separate settlement of accrued amounts. Without it, buyout is by agreement only. An arbitrary revenue multiple is not a verified market standard; an unlimited entitlement cannot simply be treated as a twelve-month claim.',
                ],
            },
            {
                heading: 'Product rights and mandatory law',
                paragraphs: [
                    'Partners acquire no exclusive ownership of the product, brand, source or customer company. Running, modifying or engaging another developer follows the licence of the specific version. Ending a partner role does not by itself terminate rights a customer already validly acquired.',
                    'Czech law applies. If the actual activities constitute commercial agency or another protected relationship, these terms do not waive mandatory information duties, commissions, notice or termination compensation. Paid-receipt and refund clauses do not circumvent rights where the principal caused non-performance of a deal.',
                ],
            },
        ],
    },
};
