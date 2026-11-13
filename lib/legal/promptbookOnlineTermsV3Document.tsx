import type { LegalDocument } from './legalDocument';
import { PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT } from './promptbookOnlineTermsV2Document';
/** New prospective edition; older accepted agreements keep their complete original wording. */
export const PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT: LegalDocument = {
    ...PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT,
    publication: {
        date: '2026-11-13',
        isDraft: false,
        notice: 'Znění 2026-11-13-online-v3. Použije se jen na zkoušky a objednávky, které je výslovně přijmou; starší práva se nemění.',
    },
    perex: 'Zkouška Business bez karty a online softwarové licence Start a Business pro Česko a Slovensko.',
    sections: [
        {
            heading: 'Business zkouška bez karty',
            paragraphs: [
                'Zkouška Business trvá 14 dní od výslovného spuštění ověřeným uživatelem v členské sekci. Instalace před spuštěním tuto dobu nečerpá. Kartu ani placenou objednávku pro zkoušku nevyžadujeme. Na jeden ověřený účet připadá jedna zkouška v této kampani. Zkoušku lze poskytnout zákazníkům z Česka a Slovenska.',
                'Zkouška po tuto dobu poskytuje rozsah Business, včetně 10 míst v komunitě Promptbook a licence pro vlastní produkční vyzkoušení enginu v rozsahu práv AI Webu. Spotřebu AI, externí účty a případnou infrastrukturu hradí uživatel. Po skončení nevzniká automatické placené předplatné ani automatická platba. Pro placené pokračování je třeba samostatná výslovná objednávka.',
                'Prvním uživatelům nabídneme novou Business zkoušku při zpřístupnění připravovaného vzdáleného ovládání. Konkrétní datum jeho vydání není sjednáno.',
            ],
        },
        ...PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT.sections.map((section) =>
            section.heading === 'Rozsah předplatného a licence enginu'
                ? {
                      ...section,
                      paragraphs: [
                          'Start a Business jsou softwarové licence s produktovou podporou a komunitními výhodami. Zahrnují oprávnění k enginu a ovládací aplikaci v dostupném rozsahu. Lokální Console je dostupná dnes; vzdálenou ovládací appku připravujeme. Samotné připojení přes relay není dokončené vzdálené ovládání a toto znění nesjednává termín jeho vydání.',
                          'Každá licence pokrývá jeden současně využívaný projekt enginu v zahrnuté kapacitě. Účet může mít více různých licencí a jejich pokrytí v appce přeskupovat; web licenci trvale nepřiřazuje k enginu. Start zahrnuje 3 odborné agenty, 1 ovládajícího člověka, 1 instanci harnessu a 1 webový profil. Business zahrnuje 10 odborných agentů, 5 ovládajících lidí, 5 webových profilů a počet harnessů licenčně neomezuje. Core a systémové role odborná místa nečerpají.',
                          'Start zahrnuje 1 a Business 10 míst v komunitě Promptbook. Správce účtu přiřazuje místa konkrétním e-mailům; příjemce musí prokázat jejich vlastnictví. Komunitní místa nejsou ovládající uživatelé appky. Vývojářská komunita je samostatný produkt. Partnerský komunitní přístup lze udělit individuálně i bez nákupu licence.',
                          'AI Web v rozsahu svých práv poskytuje na sjednané období nevýhradní oprávnění k vlastnímu i podnikatelskému provozu určeného vydání enginu v uvedeném rozsahu, včetně potřebných provozních kopií a úprav. Zákazník může pověřit svého dodavatele. Další distribuce, sublicence ani právo ke značce tím nevznikají. Dříve nabytá práva, veřejná licence konkrétní verze a licence jednotlivých součástí zůstávají zachovány.',
                          'Chybějící, vypršelá či kapacitně nedostatečná licence vede k upozornění a nabídce nápravy; sama automaticky neblokuje ovládání ani běh enginu a neukončuje úlohy. Výpadek licenční synchronizace nezastavuje práci. Technická dostupnost není prodloužením smluvního oprávnění. Placená kapacita ani příplatky nevzniknou bez předchozího souhlasu a sjednaného rozpočtu. Nákup, změna či konec licence samy nemažou projekt, agenty, historii ani soubory.',
                      ],
                  }
                : section,
        ),
        {
            heading: 'Doporučení a oddělení účtů',
            paragraphs: [
                'Doporučovací kód pouze eviduje původ zájemce; slevový kód samostatně určuje cenu. Oba lze použít současně. Původ doporučení a jeho změny uchováváme pro přiřazení obchodu. Samotný záznam kódu nezakládá nárok na provizi; obchod a nárok potvrzujeme podle sjednaných partnerských podmínek.',
                'Web a členská sekce spravují účet zákazníka, zkoušku, objednávky a licenční parametry. Ovládací appka čte potřebné parametry a provozní počty; neřídí ceny ani komunitní místa. Ověřenou identitu lze bezpečně propojit mezi webem a appkou. Tento přechod nepřenáší pracovní obsah ani nenahrazuje samostatné ověření přístupu k enginu.',
            ],
        },
    ],
};
