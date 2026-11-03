import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from './legalDocument';
import { getOperatorIdentification, NEONMEDIA_IDENTIFICATION } from './legalOperator';

/** Public outline only. A bilateral signed allocation and live supplier records remain separate. */
export const JOINT_PRIVACY_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Společné zpracování projektových údajů',
        publication: { date: '2026-11-03', isDraft: false, notice: 'Informace o rozdělení rolí při projektové spolupráci. Pro konkrétní společné zpracování musí být předem účinné ujednání podle čl. 26 GDPR; pro práci podle pokynů smlouva podle čl. 28. Samotná veřejná informace nenahrazuje tato ujednání ani právní titul pro marketing.' },
        perex: 'Jak mohou AI Web a Neonmedia spolupracovat na projektových poptávkách, obchodní komunikaci a evidenci zákazníků. Konkrétní nástroje se mohou měnit při zachování účelu a ochrany údajů.',
        sections: [
            { heading: 'Společnosti a účely', paragraphs: [
                `Při společném určování účelů a prostředků kampaní a obchodní evidence vystupují jako společní správci ${getOperatorIdentification('cs')} a ${NEONMEDIA_IDENTIFICATION.cs}. Vlastní účetnictví, personální agenda a jiné projekty mají samostatné účely.`,
                'Rozsah zahrnuje pracovní kontakty, firmu a roli, zdroj a téma poptávky, související korespondenci, přiřazení agentury, stav licence a údaje nutné pro vyúčtování. Nezahrnuje automaticky obsah zákaznických agend ani zvláštní kategorie osobních údajů. Právním základem může být jednání o smlouvě nebo její plnění u její strany, posouzený oprávněný zájem u firemních kontaktů, zákonná povinnost nebo potřebný souhlas podle účelu.',
            ] },
            { heading: 'Přístup obou firem a změny pracovních rolí', paragraphs: [
                'Každá společnost může pověřit své pracovníky nebo dodavatele projektovou komunikací a prací s relevantními údaji. Oprávnění se řídí skutečným úkolem, nezbytným rozsahem a mlčenlivostí. Není vyhrazeno pouze jedné společnosti ani jedné jmenované osobě. Převzetí úkolu se zaznamená bez nutnosti pokaždé přepisovat celou smlouvu.',
                'Předávání projektové komunikace neznamená sdílení celých osobních schránek nebo nesouvisejících databází. U činností vykonávaných jen podle pokynů druhé strany se doplní zpracovatelské ujednání podle čl. 28 GDPR. Skutečné rozhodování má přednost před názvem smlouvy.',
            ] },
            { heading: 'Nástroje třetích stran', paragraphs: [
                'Obě společnosti mohou pro dohodnutý účel využít ověřené služby CRM, hostingu, ukládání souborů, komunikace, fakturace, marketingové automatizace a AI. Volba není omezena na konkrétní značku. Před vložením osobních údajů se ověří konkrétní smluvní subjekt, role, účel, potřebná smlouva, zabezpečení, uchování a případné předání mimo EHP.',
                'Aktuální evidence skutečně využívaných dodavatelů a datových toků se udržuje průběžně a zpřístupňuje v zákonem vyžadovaném rozsahu. Změna dalšího zpracovatele při obecné autorizaci vyžaduje aktivní oznámení a možnost námitky příslušného správce podle přijaté smlouvy. Nová služba nesmí začít zpracovávat údaje dříve, než jsou tyto podmínky splněny.',
                'Například zpracování kontaktu v podnikové AI službě a nahrání celého CRM do soukromého účtu mají odlišné smluvní a bezpečnostní podmínky. Obecná zmínka o AI nepovoluje oba postupy.',
            ] },
            { heading: 'Práva osob a odpovědnosti', paragraphs: [
                'Společným kontaktem je privacy@ptbk.io. Práva lze uplatnit u kterékoli společnosti. AI Web koordinuje informování a evidenci žádostí; Neonmedia poskytne informace při získání kontaktu a předá žádost druhé straně do dvou pracovních dnů. Odpovědnosti za bezpečnost přidělených systémů a dodavatelů nese každá společnost ve svém rozsahu; převzetí úkolu se zaznamená.',
                'Údaje se uchovávají jen po dobu potřebnou pro popsané účely a příslušné zákonné nároky. Po skončení spolupráce se upraví přístupy a oddělí údaje, které se musejí uchovat. Oprávnění k marketingovým e-mailům se ověřuje samostatně; předání kontaktu mezi firmami samo nepřenáší souhlas ani zákaznickou výjimku.',
            ] },
        ],
    },
    en: {
        title: 'Joint processing of project data',
        publication: { date: '2026-11-03', isDraft: false, notice: 'Information about responsibilities in project cooperation. A relevant Article 26 joint-controller arrangement or Article 28 processing agreement must be effective before that processing starts. This public notice does not replace those agreements or a legal basis for marketing.' },
        perex: 'How AI Web and Neonmedia may cooperate on project enquiries, business communications and customer records. Tools may change while the purposes and required safeguards remain defined.',
        sections: [
            { heading: 'Companies and purposes', paragraphs: [
                `Where campaign and sales-record purposes and means are determined jointly, the joint controllers are ${getOperatorIdentification('en')} and ${NEONMEDIA_IDENTIFICATION.en}. Each company’s accounting, personnel and unrelated projects have separate purposes.`,
                'Data include business contact details, company and role, enquiry source and subject, relevant correspondence, agency attribution, licence status and necessary settlement records. Customer workflow content and special-category personal data are not automatically included. Depending on the purpose, the basis may be pre-contractual steps or a contract with the individual, assessed legitimate interests for company contacts, legal obligations or required consent.',
            ] },
            { heading: 'Access by both companies and changing responsibilities', paragraphs: [
                'Either company may authorise its staff or contractors to handle project communications and relevant data. Access follows the actual task, necessity and confidentiality obligations; it is not reserved to one company or a named individual. Task handovers are recorded without rewriting the entire contract.',
                'Sharing project correspondence does not mean opening entire private mailboxes or unrelated databases. Work carried out solely on another party’s instructions requires an Article 28 processing arrangement. Actual decisions determine roles regardless of contract labels.',
            ] },
            { heading: 'Third-party tools', paragraphs: [
                'Either company may use assessed CRM, hosting, file storage, communications, billing, marketing-automation and AI services for the agreed purpose. No particular brand is mandatory. Before personal data are entered, the legal provider, role, purpose, required contract, security, retention and any transfer outside the EEA must be assessed.',
                'Actual suppliers and data flows are maintained in current records and disclosed as required by law. Changes to subprocessors under general authorisation require active notification and an opportunity for the relevant controller to object under the adopted agreement. New processing cannot start before these requirements are satisfied.',
                'Processing a contact in a business AI service and uploading an entire CRM into a personal account have different contractual and security requirements. A general mention of AI does not authorise both.',
            ] },
            { heading: 'Individual rights and responsibilities', paragraphs: [
                'The common contact is privacy@ptbk.io; individuals may exercise rights against either company. AI Web coordinates notices and request records. Neonmedia provides information when collecting contacts and forwards requests within two working days. Each company remains responsible for the systems and suppliers it engages; task transfers are recorded.',
                'Retention follows the necessary purposes and applicable legal claims. On termination, access is adjusted and legally retained records are separated. Permission to send marketing emails is assessed independently: sharing a contact does not itself transfer consent or another company’s customer exemption.',
            ] },
        ],
    },
};
