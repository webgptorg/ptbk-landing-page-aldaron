# Smluvní a licenční stránky — 3. listopadu 2026

Vlastník výslovně požádal o zveřejnění návrhů na hlavním webu a push do `main`. Toto zadání nahrazuje dřívější omezení marketingových úkolů, které zakazovalo měnit právní texty. Nejde o přijetí návrhů smluv s třetí osobou.

- `/cs/podminky-produktu` a `/en/podminky-produktu`: samostatný neúčinný návrh B2B produktu. Dosavadní smlouvy workshopů a komunity se nepřepisují.
- `/cs/partnerske-podminky` a `/en/partnerske-podminky`: neúčinný návrh programu agentur, nikoli zveřejnění individuálních obchodních podmínek koordinátora.
- `/cs/licence` a `/en/licence`: dosavadní verzované licenční oznámení a neúčinný návrh budoucích oprávnění. Placeným produktem programu je komerční aplikace. Návrh sám neuděluje nová trvalá ani neodvolatelná práva k enginu a neodebírá dřívější granty.
- Obě existující varianty ochrany osobních údajů i jejich marketingové aliasy používají jeden aktualizovaný obsah. Jmenuje Neonmedia, účely, rozsah, právní základy a odděluje kontaktní evidenci od pracovního obsahu enginu. Text nenahrazuje potřebné smlouvy správců/zpracovatelů.

Patička odkazuje na návrhy s jasným označením; uživatel schválil jejich veřejné zpřístupnění. Návrhy mají `noindex` a nejsou v sitemap, nejsou však neveřejné ani chráněné před přístupem. Žádné interní rozpočty, individuální podíly koordinátora nebo vyjednávací otázky se na těchto stránkách nezveřejňují.

## Obsah a hranice návrhu

Pracovní sazby podle odpovědí z 3. listopadu jsou 17 % při měsíční a 20 % při roční platbě komerční aplikace. Základem je uhrazená způsobilá softwarová část bez DPH po slevách a přípustných opravách, bez poplatku brány. Vlastník potvrdil, že nová sazba nahrazuje dřívější efektivní 24% bonus. Jde o neúčinný návrh; starší přijaté dohody se samotnou právní stránkou nemění; měsíční modelové kalkulace nyní používají 17 %. Roční tarif se neaktivuje.

Atribuce identifikuje právnickou osobu, skutečné klientské prostředí a potvrzený obchod. Nejde o trvalou rezervaci celého IČO. Technická migrace nárok neruší; pozdní platba odloží výplatu a skutečné ukončení vyžaduje nové posouzení. Samostatně se řeší předání péče, doba nároku a případný odkup. Neodsouhlasený výkupní násobek ani cenový koridor nesmějí být vydávány za sjednané podmínky.

Vlastník nově výslovně vyloučil všechna prerelease vydání. Návrh politiky proto podporuje stabilní řady major.minor od 0.118, každou alespoň 90 dní od prvního stabilního vydání a vždy jen její nejnovější stabilní patch. Nový patch neobnovuje celou lhůtu. Nejméně jedna stabilní podporovaná řada musí existovat po dobu podpory. Historická `0.118.0-0` z 11. října 2026 a aktuální `0.119.0-47` jsou prerelease, nejsou přeznačeny jako stabilní. Před přijetím SLA je nutné skutečně vydat nebo doložit stabilní podporovanou řadu. Reborn cleanup probíhal již u 0.115; řada 0.118 je navržená obchodní hranice, nikoli tvrzení o prvním commitu celé větve.

Návrh mění oznámení ceny při obnově na 30 dní bez pevného procentního koridoru; odděluje změnu ceny od změny sazby partnera. Pracovní slevová pravomoc je do 30 % na první objednané období bez automatického souběhu s jinými slevami. Pravidla zůstávají neúčinná do přijetí konkrétní verze.

U skutečného obchodního zastoupení nelze interním měsíčním rozvrhem roční platby ani čekáním na bankovní payout obejít § 2504 odst. 2 a § 2505. Opravy provizí respektují § 2507 a § 2519. Návrh výpovědi 60 dní zachovává zákonná měsíční minima i konec kalendářního měsíce. Samostatná smlouva s koordinátorem, její rozpočet, výpočet výsledku a otázky zůstávají mimo veřejný repozitář.

Zásady uvádějí podmíněné předání dat skutečně zvolenému AI poskytovateli a rozlišují naše funkce, zpracování podle pokynů zákazníka a přímý zákaznický účet. Zmínka OpenAI nebo Anthropic nedokládá použití v každém nasazení. Konkrétní smluvní subjekt, retence, region a předání mimo EHP se ověřují pro danou cestu. Úprava zásad neuzavírá za strany smlouvu podle čl. 26 nebo 28 GDPR.

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

## Owner revision of 3 November 2026

All legal documents have canonical language-prefixed URLs under `/cs/legal` and `/en/legal`; English document slugs are translated. Old public URLs redirect with queries preserved. The hub, document navigation and all shared footers link to the canonical documents and to `/cs|en/releases`. Releases are a product resource rather than a legal document. Discussion drafts remain non-effective and noindex; the new joint-processing outline does not claim a signed agreement or completed safeguards.

Referral partners may simply recommend customers; customers purchase directly from AI Web and separately order an agency’s services. The 17% monthly / 20% annual proposal replaces the old effective 24% bonus. The monthly calculator and its exports use 17%. Mandatory rules follow the actual relationship, not its label.

The catalogue mirrors every public npm/GitHub release with a version base at least 0.118.0, preserving publication dates separately from the first listing here. A six-hourly append-preserving sync commits source updates; failures do not erase history. The initial 23 versions are all prereleases. The proposed line support minimum is 90 days from the first stable listing here, latest stable patch only; a new patch does not reset the line’s clock. Existing support promises cannot be shortened by source edits. This policy remains a proposal pending the final agreement.

The bilateral Neonmedia contract, its budget, buyout valuations, liability discussions and negotiating brief remain outside the repository.
