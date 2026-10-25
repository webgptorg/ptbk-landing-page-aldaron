# Web Promptbooku

Specifikace hlavního webu publikovaného na `/cs` (česky) a `/en` (anglicky). Kořen `/` a marketingové cesty bez prefixu se podle jazyka prohlížeče přesměrují na `/cs` nebo `/en` se zachováním query parametrů. Přesměrování závislé na jazyce je dočasné a nesmí se sdíleně cachovat; explicitní jazykové cesty se nemění. Vlastník výslovně schválil přepnutí 23. října 2026. Staré cesty `/new` se trvale přesměrují na odpovídající cesty bez prefixu se zachováním query parametrů. České `/cs` routy znovu používají stránky v `app/(marketing)`, anglické v samostatné catch-all routě vedle existujících článků a whitepaperu. Ostatní značkové weby, články, workshopy a administrace si zachovávají své cesty.

## Produkt a publikum

Promptbook zajišťuje dlouhodobé firemní AI agendy. Klient vlastní pracovní prostředí a kontext; engine a ovládací aplikace jsou oddělené. Primární distribuční partner je agentura, freelancer nebo integrátor: dodává konkrétní řešení a pečuje o klienta. Promptbook je technologický partner. Klient hradí licenci Promptbooku a práci partnerovi.

## Rozcestník specifikace

- [Obsah a informační architektura](new-product-page.md): jednoduchý úvod, ukázky, data, publikum a rozdělení podstránek.
- [Vlastní instalace](new-open-source-page.md): npm, shell, Windows EXE a pomoc s nasazením.
- [Partnerství](new-partnership-page.md): vlastní služby, role, 20% podíl a cesta prvního nasazení.
- [Cena, licence a podpora](new-commercial-offer.md): přesné podmínky Start/Business, plátci, instance, výluky a SLA.
- [Kalkulačka](new-economics-calculator.md): rychlý a pokročilý pohled, kompletní model, parametry a ekonomika.
- [Kontakt, sdílení a PDF](new-contact-and-pdf.md): kontaktní systém, e-mailová brána, celý report a ochrana údajů.
- [Srovnání](new-comparisons.md): férové vymezení alternativ, zdroje a aktualizace.
- [Společná kvalita](new-pages-quality.md): navigace, přístupnost, metadata, testy a podmínky přesunu.
- [Zdroje a rozhodnutí](new-pages-sources.md): podklady, autorita posledního zadání, příběh a hranice veřejných tvrzení.

## Rozsah cest

`/`, `/open-source`, `/partnership`, `/kalkulacka`, `/cenik`, `/agendy`, `/agendy/{email|documents|social|video|coding}`, `/srovnani`, `/srovnani/{claude-code|codex|n8n|make|openclaw|paperclip|grok-bot|openai-dots|meta-muse|chatgpt}`, `/o-nas`, `/bezpecnost`, `/faq`, `/soukromi`, `/podminky`.

Interní marketingové odkazy používají jazykové prefixy `/cs` a `/en`; přepínač zachová cestu, query a fragment. GitHub, zdroje srovnání, obchodní rejstřík a sociální profily jsou záměrně externí. Právní dokumenty používají existující společný obsah a zachovávají jeho právní odkazy. Údaje o firmě a fotografie pocházejí ze stávajícího webu, nevytvářejí se nové identity.

## Závazné redakční principy

Každý blok má jeden účel. Bez prázdných štítků, opakování téže výhody v mnoha místech a technických vysvětlivek v hero. `book` se nepřekládá a není vstupním požadavkem ani tématem zákaznického webu. Uživatel předává práci a pravidla, ne interní souborový formát.

Zadání z 26. října 2026 navazuje na schválené úpravy přímo na main. Hero má jeden podnadpis s krátkými větami o předání agendy a samostatné práci; celé věty nastupují s pauzami. Robůtek napíše pointu „Teď pracuje pro Vás“, zaškrtne adresáta a potom mění činnost v nadpisu, bez posunu rozložení. Redukovaný pohyb ukáže statické úplné znění. Hlavní CTA „Chci uvolnit ruce“ otevírá existující formulář s otázkou „Co za Vás má AI převzít?“. Pod CTA zůstává menší instalační odkaz. Dostupnost se poctivě vysvětluje ve formuláři.

Sekce „Příklady použití“ bez dalšího podnadpisu ukazuje společnou technologii na příkladech v pořadí péče o kontakty, správa podcastů a údržba webu. Taby jsou jednorádkové a bez play/pause; podcast má mikrofon. Přepisy, zprávy a kód se skutečně píší, formulář se vyplňuje a zvuk má nepravidelný živý průběh. Mobil postupuje pouze v právě čitelném panelu podle scrollu a psaní; skryté panely ani karta nepostupují. Běžný scroll se nepřebírá. Modelový charakter zůstává v přístupném popisu, viditelný štítek „Ukázka“ odpadá.

Úplná scéna aplikace a enginu je pouze na podstránce bezpečnosti. Hlavní a partnerská stránka mají stručný odkaz, propojený rovněž z patičky. Výklad je pro laiky s technickými detaily na GitHubu a u Pavola. Kalkulačka má sociální sítě jako první a předvybranou položku včetně příslušných odhadů; matematika a existující sdílené scénáře se nemění. Jirkovo jméno i role se na mobilu zarovnávají doprava jako kontakty. Zrcadlové portréty, příběh pod nimi, obchodní karty a viditelný kontaktní formulář zůstávají zachované. Smluvní podmínky a licence se nemění.

## Jazyky a měny — zadání 17. října 2026

Český web je na `/cs`, plná anglická verze pod `/en` se stejnými suffixy cest. Kořen `/` vybere jazyk podle `Accept-Language`. Přepínač zachovává protějšek stránky, query výpočtu a fragment. Překlady zahrnují ukázky, formuláře, kalkulačku, právní texty a PDF; serverový výstup má správný jazyk už před hydratací. Metadata uvádějí canonical a jazykové alternativy, veřejné stránky jsou indexovatelné a uvedené v sitemap.

České částky se zobrazují v Kč, anglické v USD. Ceny zůstávají 400 / 2 200 Kč a 19 / 100 USD. Česká nabídka uvádí přímo české ceny, bez poznámky o přepočtu. Interní převod pro zobrazení zůstává zachovaný. Kalkulačka zachovává původní jednotky uložených parametrů a převádí zobrazení i vstupy podle jazyka, včetně tokenových sazeb. Její zadaný kurz je odhad, ne živý kurz. Podíl zůstává pevný 20 %.

Barevnost vychází z původního modrého loga Promptbooku (`#000080`) a černé. V hlavičce i patičce je původní symbol vedle slova `promptbook`, bez tečky: `prompt` černě a `book` modře. Hero nadpisy nemají závěrečné tečky. Světlé plochy, prostorové scény a přístupnost pohybu zůstávají zachované.
