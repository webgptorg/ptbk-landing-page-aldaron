import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from './legalDocument';
import { PRODUCT_TERMS_V5_DOCUMENTS } from './productTermsV5Documents';
import { PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT } from './promptbookOnlineTermsV3Document';
const cs = PRODUCT_TERMS_V5_DOCUMENTS.cs;
const en = PRODUCT_TERMS_V5_DOCUMENTS.en;
/** A prospective edition. The prior complete edition remains available by its dated URL. */
export const PRODUCT_TERMS_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        ...cs,
        publication: {
            date: '2026-11-13',
            isDraft: false,
            notice: 'Znění 2026-11-13-v6 pro nové objednávky, které je výslovně přijmou. Dříve přijaté smlouvy se nemění. Znění 2026-11-03-v5 zůstává dostupné na své datované adrese.',
        },
        sections: [
            ...cs.sections.map((section) => ({
                ...section,
                paragraphs: section.paragraphs?.map((p) =>
                    typeof p === 'string'
                        ? p
                              .replace(
                                  'nepovolená placená kapacita se neaktivuje a cena se sama nezmění',
                                  'překročení kapacity se zobrazí pouze jako upozornění, běh ani ovládání se neblokují a cena se sama nezmění',
                              )
                              .replace(
                                  'Downgrade začne od dalšího fakturačního období, až projekt splní limity Startu.',
                                  'Downgrade začne od dalšího fakturačního období; překročení kapacity se zobrazí pouze jako upozornění.',
                              )
                        : p,
                ),
            })),
            {
                heading: 'Upřesnění nové softwarové nabídky',
                paragraphs: [
                    'U nové nabídky má toto upřesnění přednost před staršími obecnými popisy produktu v tomto dokumentu. Start a Business jsou softwarové licence zahrnující engine, dostupný rozsah ovládací appky, produktovou podporu a komunitní výhody. Dříve udělená oprávnění a licence součástí se nemění. Každá licence pokrývá svůj počet současně používaných projektů a lze ji v appce přeskupit; web ji trvale neváže ke konkrétnímu enginu.',
                    ...PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT.sections[0].paragraphs!,
                    'Start zahrnuje 1 a Business 10 komunitních míst; zkouška Business 10 po dobu zkoušky. Ovládající uživatelé a komunitní místa jsou oddělené. Veřejný vstup do komunity jménem a e-mailem sám prémiové oprávnění neuděluje. Vývojářská komunita je samostatný produkt.',
                    'Chybějící, vypršelá, překročená nebo dočasně neověřitelná licence automaticky neblokuje ovládání ani práci enginu. Zobrazí se upozornění a cesta k nápravě. Bez předchozího souhlasu a rozpočtu nevzniká placený příplatek. Autentizace, vlastnictví, oprávnění, bezpečnost a ruční pauza zůstávají nezávislé. Technická dostupnost neprodlužuje smluvní oprávnění.',
                    'Lokální Console je dostupná. Vzdálenou ovládací appku připravujeme; relay propojení samo není hotové vzdálené ovládání. Nová nabídka nesjednává konkrétní termín jeho vydání. AI účty, spotřebu a infrastrukturu zákazník hradí zvlášť. Automatizovaný online prodej je určen Česku a Slovensku; anglický web zatím přijímá poptávky.',
                ],
            },
        ],
    },
    en: {
        ...en,
        publication: {
            date: '2026-11-13',
            isDraft: false,
            notice: 'Prospective edition 2026-11-13-v6. Applies only to new orders expressly accepting it; previously accepted agreements remain unchanged. The complete 2026-11-03-v5 edition remains available at its dated URL.',
        },
        sections: [
            ...en.sections,
            {
                heading: 'Clarification for the new software offer',
                paragraphs: [
                    'This clarification prevails over older general product descriptions in this edition for the new offer. Start and Business are software licenses including the engine, available control-app functionality, product support and community benefits. Version-specific public rights and component licenses remain intact. Grants may cover different simultaneously used projects; the website does not bind a license permanently to one engine.',
                    'The no-card Business trial lasts 14 days from explicit activation by a verified user after engine setup. It includes the Business allocation and 10 Promptbook community seats during the trial. No automatic payment or paid subscription starts at expiry; paid continuation requires a separate order. Early users will be offered another trial when remote control becomes available.',
                    'Start includes 1 community seat and Business 10. Community seats are separate from controlling users. Typing a paid email into the public guest form never grants new premium rights. The Developers community is a separate product.',
                    'A missing, expired, exceeded or temporarily unverifiable license shows a notice only and never automatically blocks control or engine work. Paid add-ons need prior approval and a budget. Authentication, ownership, security, permissions and manual pause remain independent. Technical availability does not extend contractual rights.',
                    'The local Console is available. The remote control app is in preparation; relay connectivity alone is not completed remote control and no release date is promised. Customers pay for their own AI accounts, usage and infrastructure. Automated online commerce currently serves Czechia and Slovakia through the Czech website. English enquiries remain contact-only.',
                ],
            },
        ],
    },
};
