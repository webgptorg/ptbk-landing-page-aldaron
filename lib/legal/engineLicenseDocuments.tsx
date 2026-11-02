import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getOperatorIdentification } from '@/lib/legal/legalOperator';

/** Immutable pre-proposal notice: a future edit to a website must not rewrite an earlier distribution. */
const EXISTING_ENGINE_LICENSE = 'https://github.com/webgptorg/promptbook/blob/c8718b5aa635b67aabf861e94ee673d23de74644/LICENSE.md';

/** Current licence information followed by an expressly non-effective commercial and continuity proposal. */
export const ENGINE_LICENSE_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Licence enginu Promptbook',
        publication: {
            date: '2026-11-02', isDraft: true,
            notice: 'Tato stránka rozlišuje dosavadní licenční oznámení a neúčinný návrh budoucích oprávnění. Návrh sám neuděluje novou licenci a nemění práva ke staženým verzím. Rozhodná zůstává licence přiložená ke konkrétní distribuci a skutečně přijatá smlouva.',
        },
        perex: 'Zdrojový kód, placené produktové služby a právo pokračovat ve vlastním provozu jsou různé věci. Zde uvádíme současný podklad a návrh jejich přesného oddělení.',
        sections: [
            {
                heading: 'Dosavadní licence konkrétní verze',
                paragraphs: [
                    <>Repozitář enginu dosud uvádí BUSL-1.1. <a href={EXISTING_ENGINE_LICENSE}>Neměnný snímek dosavadního oznámení</a> odkazuje na obecný text, ale neurčuje všechny produktové parametry. Nelze z něj dovozovat nové neomezené produkční oprávnění nebo konkrétní dodatečný grant. Licence jednotlivých součástí a dříve platně udělená práva zůstávají zachována.</>,
                    'BUSL-1.1 není open-source licence podle definice OSI. Dostupnost zdrojů sama neznamená bezplatné komerční použití. Při pokračování pod BUSL musí vydání obsahovat poskytovatele licence, vymezené dílo, Additional Use Grant, Change Date a Change License v souladu s neměněným textem BUSL. Změny podmínek se týkají budoucích vydání, nikoli zpětného odebrání již udělených práv.',
                ],
            },
            {
                heading: 'Navržený komerční grant',
                paragraphs: [
                    `Poskytovatelem navrhovaného oprávnění je ${getOperatorIdentification('cs')}, pouze v rozsahu práv, která může udělit. Licence zákazníka by byla nevýhradní a vztahovala by se na konkrétní prostředí, verze a období určené objednávkou. Nejde o převod vlastnictví autorských práv ani práv ke značce.`,
                    'Po přijetí licence a zaplacení sjednané ceny by zákazník směl engine spouštět ve vlastním prostředí pro svou činnost, pořizovat potřebné kopie a zálohy, upravovat kód pro toto prostředí a pověřit úpravami nebo provozem jiného vývojáře. Vývojář by jednal pro zákazníka, nebyl oprávněn automaticky poskytovat neomezené další licence a chránil by jeho data.',
                    'Vlastní provoz neuděluje sám o sobě právo používat cizí značku, provozovat konkurenční hostovanou službu pro neomezené další zákazníky nebo přelicencovat cizí komponenty. Práva vyplývající z jiné platně získané veřejné licence se tímto návrhem neomezují.',
                ],
            },
            {
                heading: 'Pokračování již oprávněného provozu',
                paragraphs: [
                    'Navržená doložka: Zákazník, který oprávněně získal a zaplatil produkční použití konkrétní verze pro své prostředí, smí tuto verzi v tomto prostředí nadále samostatně provozovat, zálohovat a upravovat i po skončení předplatného nebo poskytování služeb AI Webu. Tato oprávnění k již pokryté verzi nejsou časově omezena a lze je vykonávat i s pomocí třetího vývojáře. Závažné porušení licence má samostatný postup nápravy; zákonná práva zůstávají zachována.',
                    'Pokračování neobsahuje bezplatné nové verze, lidskou podporu, SLA, správu serveru, přístup k ukončené hostované aplikaci, provoz relay ani účty a modely třetích stran. Zákazník musí mít potřebné zálohy, zdroje a vlastní přístupy. Fork nepřebírá automaticky ochranné známky ani všechny distribuční kanály.',
                    'Změna vlastníka AI Webu nebo prodej produktu samy neruší takto dříve platně nabytá oprávnění. Tato navržená doložka chrání pokračování konkrétního oprávněného nasazení; není totožná s bezplatným komerčním self-hostingem pro kohokoli.',
                ],
            },
            {
                heading: 'Otevřené rozhodnutí o bezplatném samostatném enginu',
                paragraphs: [
                    'Před přijetím finální licence je třeba zvolit obchodní model: buď je produkční licence enginu placená s výše navrženým právem pokračovat na získané verzi, nebo má kdokoli právo na bezplatný samostatný komerční provoz bez aplikace a podpory a platí se produktové služby. Obě varianty nelze současně prezentovat jako povinnou platbu za stejné oprávnění.',
                    'Tento draft ani obecný odkaz na BUSL mezi variantami nerozhoduje. Zvolená varianta musí být shodná v objednávce, licenčním souboru konkrétního vydání, ceníku a příslušných metadatech balíčku. Úplná licence vydané verze musí být uchovatelná a dostupná offline, nejen pod proměnlivou URL.',
                ],
            },
            {
                heading: 'Aplikace, relay a obsah projektů',
                paragraphs: [
                    'Hostovaná ovládací aplikace a relay jsou služby s vlastním předplatným a dostupností, nikoli automaticky stejný licenční grant jako engine. Jejich ukončení nevypne lokální proces, ale může vyžadovat alternativní ovládání nebo spojení. Bez vlastních modelů, klíčů či funkčních nástrojů nelze slibovat nezměněnou činnost všech agend.',
                    'Data a vlastní zadání projektu zůstávají zákazníkovi podle sjednaných práv. Licence enginu nedává AI Webu nebo partnerovi automatické právo zveřejňovat jeho projektová data. Výuková dokumentace, reklamní materiály a školení mohou mít samostatné licenční podmínky.',
                ],
            },
            {
                heading: 'Cizí komponenty, záruky a budoucí revize',
                paragraphs: [
                    'Komponenty třetích stran se řídí svými licencemi a oznámeními. AI Web nemůže bez příslušných práv měnit oprávnění cizích autorů. Při distribuci se zachovají povinné licenční texty a upozornění.',
                    'Samostatně provozovaný kód se poskytuje bez produktové podpory a záruk nad rámec výslovně přijaté smlouvy a povinného práva. Nelze předem vyloučit odpovědnost, jejíž omezení zákon zakazuje. Podpora a aktualizace vznikají jen pro sjednanou službu a podporovanou konfiguraci.',
                    'Budoucí nové verze mohou mít jiné předem oznámené podmínky. Změna této stránky nepřepisuje oprávnění staré verze. Finální dokument musí označit verzi, datum účinnosti a přesný rozsah přijetí; do té doby zůstávají nové granty návrhem.',
                ],
            },
        ],
    },
    en: {
        title: 'Promptbook engine licence',
        publication: {
            date: '2026-11-02', isDraft: true,
            notice: 'This page distinguishes the existing licence notice from a non-effective proposal for future rights. The proposal grants no new licence and does not change downloaded versions. The notice supplied with the particular distribution and the actually accepted agreement remain controlling.',
        },
        perex: 'Source availability, paid product services and the right to continue independent operation are separate matters. This page identifies the current notice and proposes a clear separation.',
        sections: [
            {
                heading: 'Existing version-specific notice',
                paragraphs: [
                    <>The engine repository currently identifies BUSL-1.1. An <a href={EXISTING_ENGINE_LICENSE}>immutable snapshot of the existing notice</a> links to the generic text without specifying all product parameters. It does not establish new unlimited production rights or a particular additional grant. Component licences and rights already validly granted remain intact.</>,
                    'BUSL-1.1 is not an open-source licence under the OSI definition. Public source availability does not itself mean free commercial use. Continued use of BUSL requires the licensor, licensed work, Additional Use Grant, Change Date and Change License to be specified consistently with the unmodified BUSL text. Changes concern future distributions rather than retrospective withdrawal of existing grants.',
                ],
            },
            {
                heading: 'Proposed commercial grant',
                paragraphs: [
                    `The proposed licensor is ${getOperatorIdentification('en')}, only to the extent it has rights to grant. A customer licence would be non-exclusive and cover the environment, versions and period in the order. It does not transfer copyright ownership or trademark rights.`,
                    'Once accepted and the agreed price paid, the customer could run the engine in its own environment for its business, make necessary copies and backups, modify code for that environment and engage another developer for operation or changes. That developer would act for the customer, protect its data and acquire no automatic unlimited sublicensing right.',
                    'Independent operation does not by itself grant use of third-party brands, unrestricted provision of a competing hosted service or relicensing of third-party components. Rights under another validly acquired public licence are not curtailed by this proposal.',
                ],
            },
            {
                heading: 'Continuity of an already authorised deployment',
                paragraphs: [
                    'Proposed clause: A customer that lawfully obtained and paid for production use of a specific version in its environment may continue independently to operate, back up and modify that version in that environment after subscription or AI Web service termination. These rights to the already covered version are not time-limited and may be exercised with another developer. Serious licence breach has a separate cure process; statutory rights remain.',
                    'Continuity does not include free new versions, human support, SLA, server administration, access to a discontinued hosted application, relay operation or third-party accounts and models. Customers must retain the necessary backups, source and their own access. A fork does not automatically acquire trademarks or distribution channels.',
                    'An AI Web ownership change or product sale does not itself cancel such previously validly acquired rights. This proposed clause protects a specific authorised deployment and is not equivalent to free commercial self-hosting for everyone.',
                ],
            },
            {
                heading: 'Open decision about a free standalone engine',
                paragraphs: [
                    'Before adopting a final licence, the commercial model must be selected: either a paid production engine licence with the proposed right to continue an acquired version, or free standalone commercial operation for anyone without the application and support, with paid product services. Both cannot simultaneously be described as a compulsory payment for the same permission.',
                    'Neither this draft nor a generic BUSL link resolves that choice. The selected model must match the order, versioned licence, pricing and package metadata. Released terms must be retainable offline, not available only at a changeable URL.',
                ],
            },
            {
                heading: 'Application, relay and project content',
                paragraphs: [
                    'The hosted control application and relay are services with their own subscription and availability, not automatically the same licence grant as the engine. Their retirement does not itself stop a local process, but may require alternative controls or connectivity. Unchanged operation of every workflow cannot be promised without the customer’s models, keys and functioning tools.',
                    'Customers retain their data and authored instructions under the agreed rights. An engine licence gives AI Web or a partner no automatic right to publish project data. Documentation, advertising materials and training may have separate terms.',
                ],
            },
            {
                heading: 'Third-party components, warranties and future revisions',
                paragraphs: [
                    'Third-party components retain their own licences and notices. AI Web cannot change others’ rights without authority. Required licence texts and notices remain included in distributions.',
                    'Independently operated code includes no product support or warranties beyond an expressly accepted agreement and mandatory law. Liability that cannot lawfully be excluded remains. Support and updates apply only to the agreed service and supported configuration.',
                    'Future new versions may have different disclosed terms. Editing this page does not rewrite rights to an older version. A final document must identify its version, effective date and precise acceptance scope; until then new grants remain proposals.',
                ],
            },
        ],
    },
};
