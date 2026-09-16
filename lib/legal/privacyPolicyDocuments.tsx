import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getOperatorIdentification, PRIVACY_CONTACT_EMAIL } from '@/lib/legal/legalOperator';
import { ORGANIZATION_DATA_BOX_ID, SITE_URL } from '@/lib/metadata/site-config';
import Link from 'next/link';

/**
 * Host of the site as a visitor reads it, without the protocol
 */
const SITE_HOST = new URL(SITE_URL).host;

/**
 * Supervisory authority a Czech data subject may complain to
 */
const SUPERVISORY_AUTHORITY_URL = 'https://uoou.gov.cz';

/**
 * How the site describes what it does with the personal data of its visitors, in every language it is published in
 */
export const PRIVACY_POLICY_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Ochrana osobních údajů',
        perex: `Tyto zásady popisují, jaké osobní údaje o vás zpracováváme, když navštívíte web ${SITE_HOST} nebo využijete služeb Promptbook, proč to děláme a jaká máte práva.`,
        sections: [
            {
                heading: 'Kdo vaše údaje zpracovává',
                paragraphs: [
                    `Správcem vašich osobních údajů je společnost ${getOperatorIdentification('cs')}, která provozuje web ${SITE_HOST} a služby Promptbook.`,
                    <>
                        Ve všem, co se týká osobních údajů, nás zastihnete na{' '}
                        <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a> nebo prostřednictvím
                        datové schránky {ORGANIZATION_DATA_BOX_ID}.
                    </>,
                    'Pověřence pro ochranu osobních údajů jsme nejmenovali, protože nám to zákon neukládá.',
                ],
            },
            {
                heading: 'Jaké údaje zpracováváme',
                paragraphs: [
                    'Zpracováváme jen údaje, které nám sami dáte, a údaje, které o návštěvě webu vzniknou automaticky.',
                ],
                bullets: [
                    'Údaje z formulářů: jméno a příjmení, e-mailová adresa, telefonní číslo, název firmy, fakturační údaje a text zprávy, kterou nám napíšete.',
                    'Údaje o registraci na akci: zvolený termín, počet účastníků, formát a případný slevový kód.',
                    'Technické údaje o návštěvě: IP adresa, typ a jazyk prohlížeče, typ zařízení, navštívené stránky, čas návštěvy a stránka, ze které jste přišli.',
                    'Údaje z cookies a měřicích nástrojů, a to v rozsahu, ke kterému nám dáte souhlas.',
                ],
            },
            {
                heading: 'Proč údaje zpracováváme',
                paragraphs: ['Každé zpracování má svůj účel a svůj právní základ.'],
                bullets: [
                    'Abychom vám odpověděli a domluvili se na spolupráci - na základě jednání o smlouvě a našeho oprávněného zájmu odpovědět na poptávku.',
                    'Abychom vás zaregistrovali na workshop nebo jinou akci, vystavili fakturu a poslali vám podklady - na základě plnění smlouvy a našich zákonných povinností.',
                    'Abychom vám posílali novinky - na základě vašeho souhlasu, který můžete kdykoli odvolat.',
                    'Abychom rozuměli tomu, jak web funguje a co návštěvníky zajímá - na základě souhlasu s analytickými cookies.',
                    'Abychom měřili účinnost reklamy - na základě souhlasu s marketingovými cookies.',
                    'Abychom plnili zákonné povinnosti, především účetní a daňové.',
                ],
            },
            {
                heading: 'Jak dlouho údaje uchováváme',
                bullets: [
                    'Údaje z poptávkových a registračních formulářů po dobu jednání a následně tři roky od posledního kontaktu.',
                    'Účetní doklady deset let, jak nám ukládá zákon.',
                    'Kontakt pro zasílání novinek do doby, než souhlas odvoláte.',
                    'Údaje v analytických a marketingových nástrojích podle nastavení daného nástroje, nejdéle 26 měsíců.',
                ],
            },
            {
                heading: 'Komu údaje předáváme',
                paragraphs: [
                    'Osobní údaje neprodáváme. Předáváme je pouze zpracovatelům, kteří nám pomáhají provozovat web a služby, a vždy jen v nezbytném rozsahu.',
                ],
                bullets: [
                    'Supabase - databáze, ve které jsou uložené kontakty z formulářů.',
                    'Google Analytics - měření návštěvnosti webu.',
                    'Meta Pixel - měření účinnosti reklamy na Facebooku a Instagramu.',
                    'LogRocket - záznam chování na webu, který nám pomáhá odhalovat chyby.',
                    'YouTube - přehrávání vložených videí.',
                    'Poskytovatelé e-mailových, kalendářních a fakturačních služeb, které používáme pro běžný provoz.',
                ],
            },
            {
                heading: 'Cookies a měřicí technologie',
                paragraphs: [
                    'Nutné cookies zajišťují základní fungování webu a ukládáme je vždy. Analytické a marketingové cookies ukládáme jen s vaším souhlasem, který nám dáte v cookies liště.',
                    <>
                        Svoji volbu můžete kdykoli změnit v <Link href={COOKIE_SETTINGS_HASH}>nastavení cookies</Link>{' '}
                        nebo smazáním cookies ve svém prohlížeči.
                    </>,
                ],
            },
            {
                heading: 'Předávání mimo Evropskou unii',
                paragraphs: [
                    'Někteří naši zpracovatelé sídlí ve Spojených státech amerických. Údaje jim předáváme na základě standardních smluvních doložek schválených Evropskou komisí, případně na základě jejich certifikace v rámci EU-US Data Privacy Framework.',
                ],
            },
            {
                heading: 'Jak údaje chráníme',
                paragraphs: [
                    'Přístup k údajům mají jen lidé, kteří ho ke své práci potřebují. Data přenášíme šifrovaně a v databázi je chráníme pravidly přístupu na úrovni jednotlivých záznamů.',
                ],
            },
            {
                heading: 'Jaká máte práva',
                paragraphs: ['Ve vztahu ke svým osobním údajům máte tato práva:'],
                bullets: [
                    'Vědět, jaké údaje o vás zpracováváme, a dostat jejich kopii.',
                    'Nechat si opravit údaje, které nejsou přesné.',
                    'Nechat si údaje vymazat, pokud pro jejich zpracování nemáme další důvod.',
                    'Omezit zpracování nebo proti němu vznést námitku.',
                    'Dostat své údaje ve strojově čitelném formátu a předat je jinému správci.',
                    'Kdykoli odvolat souhlas, který jste nám dali; zpracování do odvolání tím zůstává v pořádku.',
                    'Obrátit se se stížností na dozorový úřad.',
                ],
            },
            {
                heading: 'Jak práva uplatnit',
                paragraphs: [
                    <>
                        Stačí napsat na <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.
                        Odpovíme nejpozději do jednoho měsíce. Postup pro smazání údajů popisujeme podrobněji v{' '}
                        <Link href="/data-deletion">návodu na smazání údajů</Link>.
                    </>,
                    <>
                        Pokud si myslíte, že s vašimi údaji nezacházíme správně, můžete se obrátit na Úřad pro ochranu
                        osobních údajů, Pplk. Sochora 27, 170 00 Praha 7,{' '}
                        <a href={SUPERVISORY_AUTHORITY_URL} target="_blank" rel="noopener noreferrer">
                            uoou.gov.cz
                        </a>
                        .
                    </>,
                ],
            },
            {
                heading: 'Změny těchto zásad',
                paragraphs: [
                    'Zásady můžeme upravit, například když začneme používat nový nástroj. Aktuální znění je vždy na této stránce a je označené datem účinnosti.',
                ],
            },
        ],
    },
    en: {
        title: 'Privacy Policy',
        perex: `This policy describes which personal data we process when you visit ${SITE_HOST} or use the Promptbook services, why we do it, and which rights you have.`,
        sections: [
            {
                heading: 'Who processes your data',
                paragraphs: [
                    `The controller of your personal data is ${getOperatorIdentification('en')}, which operates the ${SITE_HOST} website and the Promptbook services.`,
                    <>
                        For anything concerning personal data, reach us at{' '}
                        <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a> or through the Czech
                        data box {ORGANIZATION_DATA_BOX_ID}.
                    </>,
                    'We have not appointed a data protection officer, because the law does not require us to.',
                ],
            },
            {
                heading: 'Which data we process',
                paragraphs: [
                    'We process only the data you give us yourself and the data which arises automatically from your visit.',
                ],
                bullets: [
                    'Data from forms: name, e-mail address, phone number, company name, billing details, and the message you write to us.',
                    'Data about an event registration: the chosen date, the number of participants, the format, and any discount code.',
                    'Technical data about the visit: IP address, browser type and language, device type, visited pages, time of the visit, and the page you came from.',
                    'Data from cookies and measurement tools, to the extent you consent to.',
                ],
            },
            {
                heading: 'Why we process the data',
                paragraphs: ['Every processing has its purpose and its legal basis.'],
                bullets: [
                    'To answer you and agree on working together - based on pre-contractual negotiations and our legitimate interest in replying to an enquiry.',
                    'To register you for a workshop or another event, issue an invoice, and send you the materials - based on the performance of the contract and our legal obligations.',
                    'To send you news - based on your consent, which you may withdraw at any time.',
                    'To understand how the website works and what visitors care about - based on your consent to analytics cookies.',
                    'To measure the effectiveness of our advertising - based on your consent to marketing cookies.',
                    'To meet our legal obligations, mainly accounting and tax ones.',
                ],
            },
            {
                heading: 'How long we keep the data',
                bullets: [
                    'Data from enquiry and registration forms for the duration of the negotiations and then three years from the last contact.',
                    'Accounting documents for ten years, as the law requires.',
                    'The contact for sending news until you withdraw your consent.',
                    'Data in analytics and marketing tools according to the settings of the given tool, at most 26 months.',
                ],
            },
            {
                heading: 'Who we share the data with',
                paragraphs: [
                    'We do not sell personal data. We share it only with processors who help us run the website and the services, and always only to the extent needed.',
                ],
                bullets: [
                    'Supabase - the database which holds the contacts from the forms.',
                    'Google Analytics - measuring website traffic.',
                    'Meta Pixel - measuring the effectiveness of advertising on Facebook and Instagram.',
                    'LogRocket - a recording of behaviour on the website which helps us find bugs.',
                    'YouTube - playback of embedded videos.',
                    'Providers of the e-mail, calendar, and invoicing services we use to run the company.',
                ],
            },
            {
                heading: 'Cookies and measurement technologies',
                paragraphs: [
                    'Necessary cookies keep the website working and are always stored. Analytics and marketing cookies are stored only with the consent you give in the cookie bar.',
                    <>
                        You can change your choice at any time in the{' '}
                        <Link href={COOKIE_SETTINGS_HASH}>cookie settings</Link> or by deleting the cookies in your
                        browser.
                    </>,
                ],
            },
            {
                heading: 'Transfers outside the European Union',
                paragraphs: [
                    'Some of our processors are based in the United States. We transfer data to them under the standard contractual clauses approved by the European Commission, or under their certification in the EU-US Data Privacy Framework.',
                ],
            },
            {
                heading: 'How we protect the data',
                paragraphs: [
                    'Only the people who need it for their work have access to the data. We transfer data encrypted and protect it in the database with access rules at the level of individual records.',
                ],
            },
            {
                heading: 'Which rights you have',
                paragraphs: ['You have the following rights regarding your personal data:'],
                bullets: [
                    'To know which data we process about you and to get a copy of it.',
                    'To have inaccurate data corrected.',
                    'To have the data erased when we have no further reason to process it.',
                    'To restrict the processing or to object to it.',
                    'To receive your data in a machine-readable format and pass it to another controller.',
                    'To withdraw the consent you gave us at any time; the processing before the withdrawal stays lawful.',
                    'To complain to the supervisory authority.',
                ],
            },
            {
                heading: 'How to exercise your rights',
                paragraphs: [
                    <>
                        Just write to <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>. We answer
                        within one month at the latest. The steps for deleting your data are described in detail in the{' '}
                        <Link href="/data-deletion">data deletion instructions</Link>.
                    </>,
                    <>
                        If you believe we do not handle your data properly, you can turn to the Czech Office for
                        Personal Data Protection, Pplk. Sochora 27, 170 00 Prague 7,{' '}
                        <a href={SUPERVISORY_AUTHORITY_URL} target="_blank" rel="noopener noreferrer">
                            uoou.gov.cz
                        </a>
                        .
                    </>,
                ],
            },
            {
                heading: 'Changes to this policy',
                paragraphs: [
                    'We may amend this policy, for example when we start using a new tool. The current wording is always on this page and carries its effective date.',
                ],
            },
        ],
    },
};
