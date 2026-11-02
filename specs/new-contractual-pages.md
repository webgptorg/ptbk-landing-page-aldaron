# Smluvní a licenční stránky — 2. listopadu 2026

Vlastník výslovně požádal o zveřejnění návrhů na hlavním webu a push do `main`. Toto zadání nahrazuje dřívější omezení marketingových úkolů, které zakazovalo měnit právní texty. Nejde o přijetí návrhů smluv s třetí osobou.

- `/cs/podminky-produktu` a `/en/podminky-produktu`: samostatný neúčinný návrh B2B produktu. Dosavadní smlouvy workshopů a komunity se nepřepisují.
- `/cs/partnerske-podminky` a `/en/partnerske-podminky`: neúčinný návrh programu agentur, nikoli zveřejnění individuálních obchodních podmínek koordinátora.
- `/cs/licence` a `/en/licence`: dosavadní verzované licenční oznámení a neúčinný návrh budoucího komerčního/continuity grantu. Rozpor placený engine versus obecný bezplatný komerční self-hosting zůstává výslovně otevřený.
- Obě existující varianty ochrany osobních údajů i jejich marketingové aliasy používají jeden aktualizovaný obsah. Jmenuje Neonmedia, účely, rozsah, právní základy a odděluje kontaktní evidenci od pracovního obsahu enginu. Text nenahrazuje potřebné smlouvy správců/zpracovatelů.

Patička odkazuje na návrhy s jasným označením; uživatel schválil jejich veřejné zpřístupnění. Návrhy mají `noindex` a nejsou v sitemap, nejsou však neveřejné ani chráněné před přístupem. Žádné interní rozpočty, individuální podíly koordinátora nebo vyjednávací otázky se na těchto stránkách nezveřejňují.

## Obsah a hranice návrhu

Partnerský základ je skutečně uhrazená způsobilá softwarová licence bez DPH po vratkách, bez odečtení běžného poplatku brány. Roční bonus musí být popsán zvlášť: při ceně deseti měsíců a dvanácti výplatách po 20 % měsíčního základu činí 24 % roční platby. Zveřejnění nezavádí roční tarif do existujícího ceníku ani kalkulačky.

Atribuce identifikuje právnickou osobu, skutečné klientské prostředí a potvrzený obchod. Nejde o trvalou rezervaci celého IČO. Technická migrace nárok neruší; pozdní platba odloží výplatu a skutečné ukončení vyžaduje nové posouzení. Samostatně se řeší předání péče, doba nároku a případný odkup. Neodsouhlasený výkupní násobek ani cenový koridor nesmějí být vydávány za sjednané podmínky.

Podpora se nesmí omezit pouze na semver-stable verze: aktuální běžně distribuované verze mají číselné prerelease označení. Výslovně podporovaná produkční řada, frekvence vydávání, automatická aktualizace a lidské SLA jsou čtyři různé věci. Navržené lhůty nejsou tvrzením o dosavadní garanci.

Texty jsou serverově vykreslené v `NewLegalPage`, sdílejí `lib/legal` a data publikace. Celý právní obsah se nepřibaluje do klientského JavaScriptu hlavních marketingových stránek. Jazykové varianty, canonical, social cards, stav návrhu a datum mají být stejné ve všech cestách.

## Veřejné podklady

Ověřeno 2. 11. 2026. Níže jsou příklady konkrétních programů; žádný není automaticky univerzálním tržním standardem.

| Téma | Primární zdroj | Použití a omezení |
| --- | --- | --- |
| Roční předplatné, výplata, převod produktu | [HubSpot HSPPA](https://legal.hubspot.com/solutions-partner-program-agreement), zejména 5(b), 12(e), 17(k) | Předplacený rok se rozpočítává, výplaty jsou čtvrtletní. Nejde o precedent povinné výplaty vždy 10. dne. |
| Výše a doba partnerské odměny | [HubSpot program policies](https://www.hubspot.com/partners/solutions-program-policies), [Shopify earnings](https://help.shopify.com/en/partners/partner-program/how-to-earn) | Konkrétní víceleté programy, odlišné od neomezené doživotní provize. |
| Obchod a expanze | [HubSpot sales rules](https://www.hubspot.com/hubspot-partner-program-sales-rules) | Atribuce na úrovni potvrzeného obchodu a jeho rozsahu. |
| Vratky a opravy | [Shopify Partner Agreement](https://www.shopify.com/partners/terms) | Refundace a chargeback neznamenají zachování nekráceného základu. |
| Aktivní spolupráce | [Gorgias referral agreement](https://www.gorgias.com/legal/referral-agreement) | Průběžné podmínky účasti; neprokazuje optimální podíl jiného projektu. |
| Fungující partnerská péče | [Gorgias × Domaine](https://www.gorgias.com/partner-stories/domaine) | Dodavatelem popsaný případ více než 20 společných klientů, nikoli nezávislá studie kauzality. |
| Platba versus bankovní převod | [Stripe payouts](https://docs.stripe.com/payouts), [reserves](https://support.stripe.com/questions/view-reserve-status-and-details-in-dashboard) | Přijetí karty a připsání do banky se mohou lišit; poplatek se ekonomicky odečítá jen jednou. |
| BUSL a dřívější oprávnění | [MariaDB BUSL](https://mariadb.com/bsl11/), [FAQ](https://mariadb.com/bsl-faq-adopting/), [OSI definition](https://opensource.org/osd) | Dostupný zdroj není sám o sobě OSI open source; nová licence neodnímá starý grant. |
| Údaje a role stran | [EDPB Guidelines 07/2020](https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-of-controller-and-processor-in-the-gdpr_en) | Rozhodují účely a prostředky, nikoli název smlouvy nebo společné CRM. |
| Obchodní oslovování | [ÚOOÚ](https://uoou.gov.cz/pravni-ramec/ochrana-osobnich-udaju/sireni-obchodnich-sdeleni) | Pravidla obchodních sdělení chrání i právnické osoby. |
| Kogentní práva | [Občanský zákoník, státní publikace účinná k 1. 1. 2026](https://spu.gov.cz/frontend/webroot/uploads/files/2026/02/dokument_89_2012_sb25958._zakon_obcansky_zakonik25958.pdf) | Změny dlouhodobých podmínek, postoupení, případné zastoupení a limity odpovědnosti nelze libovolně obejít. |

Identifikace AI Webu vychází z [Obchodního věstníku, zápis zveřejněný 8. 10. 2026](https://ov.gov.cz/zapis/25360448); údaje Neonmedia z [jejích vlastních zásad](https://www.neonmedia.cz/ochrana-osobnich-udaju). Zdroj jejich údajů neznamená přijetí všech jejich právních závěrů.
