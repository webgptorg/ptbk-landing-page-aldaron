import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getOperatorIdentification } from '@/lib/legal/legalOperator';

/** Immutable version-specific notice: a future edit to a website must not rewrite an earlier distribution. */
const EXISTING_ENGINE_LICENSE = 'https://github.com/webgptorg/promptbook/blob/c8718b5aa635b67aabf861e94ee673d23de74644/LICENSE.md';

/** Current version-specific licensing and commercial continuity terms. */
export const ENGINE_LICENSE_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Licence enginu Promptbook',
        publication: {
            date: '2026-11-03', isDraft: false,
            notice: "Znění ze dne 3. listopadu 2026. Práva ke konkrétnímu vydání určuje přiložená licence a výslovně přijatá objednávka. Tato stránka vymezuje pravidla komerčního oprávnění a nepřepisuje dříve udělené licence. Nové verze mají vlastní datum a rozsah.",
        },
        perex: 'Zdrojový kód, placené produktové služby a právo pokračovat ve vlastním provozu jsou různé věci. Tento dokument vymezuje jejich rozsah a návaznost.',
        sections: [
            {
                heading: 'Dosavadní licence konkrétní verze',
                paragraphs: [
                    <>Repozitář enginu dosud uvádí BUSL-1.1. <a href={EXISTING_ENGINE_LICENSE}>Neměnný snímek dosavadního oznámení</a> odkazuje na obecný text, ale neurčuje všechny produktové parametry. Nelze z něj dovozovat nové neomezené produkční oprávnění nebo konkrétní dodatečný grant. Licence jednotlivých součástí a dříve platně udělená práva zůstávají zachována.</>,
                    'BUSL-1.1 není open-source licence podle definice OSI. Dostupnost zdrojů sama neznamená bezplatné komerční použití. Při pokračování pod BUSL musí vydání obsahovat poskytovatele licence, vymezené dílo, Additional Use Grant, Change Date a Change License v souladu s neměněným textem BUSL. Změny podmínek se týkají budoucích vydání, nikoli zpětného odebrání již udělených práv.',
                ],
            },
            {
                heading: 'Komerční oprávnění',
                paragraphs: [
                    `Poskytovatelem komerčního oprávnění je ${getOperatorIdentification('cs')}, pouze v rozsahu práv, která může udělit. Licence zákazníka je nevýhradní a vztahuje se na konkrétní prostředí, verze a období určené objednávkou. Nejde o převod vlastnictví autorských práv ani práv ke značce.`,
                    'Po přijetí licence a zaplacení sjednané ceny zákazník smí engine spouštět ve vlastním prostředí pro svou činnost, pořizovat potřebné kopie a zálohy, upravovat kód pro toto prostředí a pověřit úpravami nebo provozem jiného vývojáře. Vývojář jedná pro zákazníka, chrání jeho data a nezískává automaticky právo poskytovat neomezené další licence.',
                    'Vlastní provoz neuděluje sám o sobě právo používat cizí značku, provozovat konkurenční hostovanou službu pro neomezené další zákazníky nebo přelicencovat cizí komponenty. Práva vyplývající z jiné platně získané veřejné licence se těmito podmínkami neomezují.',
                ],
            },
            {
                heading: 'Pokračování již oprávněného provozu',
                paragraphs: [
                    "Tyto podmínky neposkytují nové obecné neodvolatelné nebo časově neomezené oprávnění ke všem verzím enginu. Zda konkrétní právo trvá i po skončení placené aplikace, určuje licence přiložená k dané verzi a výslovná individuální dohoda. Dříve platně získaná oprávnění nelze pouhou úpravou tohoto webu odebrat.",
                    'Pokračování neobsahuje bezplatné nové verze, lidskou podporu, SLA, správu serveru, přístup k ukončené hostované aplikaci, provoz relay ani účty a modely třetích stran. Zákazník musí mít potřebné zálohy, zdroje a vlastní přístupy. Fork nepřebírá automaticky ochranné známky ani všechny distribuční kanály.',
                    "Změna vlastníka AI Webu nebo prodej produktu samy neruší dříve platně nabytá oprávnění. Případná dlouhodobá licence pro konkrétního obchodního partnera musí samostatně vymezit verzi, účel, trvání, úpravy a pomoc dalšího vývojáře; nevzniká automaticky všem zákazníkům z tohoto dokumentu.",
                ],
            },
            {
                heading: 'Placená aplikace a samostatný engine',
                paragraphs: [
                    "Placeným produktem partnerského programu je komerční ovládací aplikace a objednané služby. Bezplatné samostatné použití enginu bez platby nevytváří partnerskou provizi. Tato volba provizního základu ale sama nerozšiřuje ani neomezuje práva enginu pod jeho dosavadní licencí.",
                    "Úplné podmínky samostatného enginu musí být vymezeny pro každé příslušné vydání a shodovat se s objednávkou a metadaty balíčku. Musí být uchovatelné offline. Objednávka a příslušné vydání musí jednoznačně určit úplné licenční podmínky; chybějící oprávnění se nedovozuje z dostupnosti zdrojového kódu.",
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
                    'Budoucí nové verze mohou mít jiné předem oznámené podmínky. Změna této stránky nepřepisuje oprávnění staré verze. Každé nové znění označuje datum a přesný rozsah oprávnění; pro již nabytá práva zůstává rozhodná přijatá licence.',
                ],
            },
        ],
    },
    en: {
        title: 'Promptbook engine licence',
        publication: {
            date: '2026-11-03', isDraft: false,
            notice: "Version dated 3 November 2026. Rights to a particular release follow its accompanying licence and the expressly accepted order. This page defines commercial permission and does not rewrite earlier grants. New versions have their own date and scope.",
        },
        perex: 'Source availability, paid product services and the right to continue independent operation are separate matters. This document defines their scope and relationship.',
        sections: [
            {
                heading: 'Existing version-specific notice',
                paragraphs: [
                    <>The engine repository currently identifies BUSL-1.1. An <a href={EXISTING_ENGINE_LICENSE}>immutable snapshot of the existing notice</a> links to the generic text without specifying all product parameters. It does not establish new unlimited production rights or a particular additional grant. Component licences and rights already validly granted remain intact.</>,
                    'BUSL-1.1 is not an open-source licence under the OSI definition. Public source availability does not itself mean free commercial use. Continued use of BUSL requires the licensor, licensed work, Additional Use Grant, Change Date and Change License to be specified consistently with the unmodified BUSL text. Changes concern future distributions rather than retrospective withdrawal of existing grants.',
                ],
            },
            {
                heading: 'Commercial permission',
                paragraphs: [
                    `The commercial licensor is ${getOperatorIdentification('en')}, only to the extent it has rights to grant. A customer licence is non-exclusive and covers the environment, versions and period in the order. It does not transfer copyright ownership or trademark rights.`,
                    'Once accepted and the agreed price paid, the customer may run the engine in its own environment for its business, make necessary copies and backups, modify code for that environment and engage another developer for operation or changes. That developer acts for the customer, protects its data and acquires no automatic unlimited sublicensing right.',
                    'Independent operation does not by itself grant use of third-party brands, unrestricted provision of a competing hosted service or relicensing of third-party components. Rights under another validly acquired public licence are not curtailed by these terms.',
                ],
            },
            {
                heading: 'Continuity of an already authorised deployment',
                paragraphs: [
                    "These terms grant no new general irrevocable or perpetual permission for all engine versions. Any permission surviving the paid application follows the licence accompanying the specific version and an express individual agreement. Editing this website cannot withdraw previously validly acquired rights.",
                    'Continuity does not include free new versions, human support, SLA, server administration, access to a discontinued hosted application, relay operation or third-party accounts and models. Customers must retain the necessary backups, source and their own access. A fork does not automatically acquire trademarks or distribution channels.',
                    "An ownership change or product sale does not itself cancel previously validly acquired rights. Any long-term licence for a specific business partner must separately define version, purpose, duration, modifications and assistance by another developer; this document does not automatically give it to all customers.",
                ],
            },
            {
                heading: 'Paid application and standalone engine',
                paragraphs: [
                    "The paid product covered by the partner programme is the commercial control application and ordered services. Free independent engine use without payment earns no partner commission. Defining that commission base does not itself extend or restrict rights under the existing engine licence.",
                    "Complete standalone-engine terms must be defined for each relevant release and match the order and package metadata. They must be retainable offline. The order and relevant release must identify complete licence terms; source availability does not supply missing permission.",
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
                    'Future new versions may have different disclosed terms. Editing this page does not rewrite rights to an older version. Each new version identifies its date and precise permission scope; previously acquired rights continue under the accepted licence.',
                ],
            },
        ],
    },
};
