# Web Promptbooku

Specifikace hlavního webu publikovaného na `/cs` (česky) a `/en` (anglicky). Kořen `/` a marketingové cesty bez prefixu zůstávají českými aliasy s canonical URL pod `/cs`. Vlastník výslovně schválil přepnutí 23. října 2026. Staré cesty `/new` se trvale přesměrují na odpovídající cesty bez prefixu se zachováním query parametrů. České `/cs` routy znovu používají stránky v `app/(marketing)`, anglické v samostatné catch-all routě vedle existujících článků a whitepaperu. Ostatní značkové weby, články, workshopy a administrace si zachovávají své cesty.

## Produkt a publikum

Promptbook zajišťuje dlouhodobé firemní AI agendy. Klient vlastní pracovní prostředí a kontext; engine a ovládací aplikace jsou oddělené. Primární distribuční partner je agentura, freelancer nebo integrátor: dodává konkrétní řešení a pečuje o klienta. Promptbook je technologický partner. Klient hradí licenci Promptbooku a práci partnerovi.

## Rozcestník specifikace

- [Obsah a informační architektura](new-product-page.md): jednoduchý úvod, ukázky, data, publikum a rozdělení podstránek.
- [Partnerství](new-partnership-page.md): vlastní služby, role, 20% podíl a cesta prvního nasazení.
- [Cena, licence a podpora](new-commercial-offer.md): přesné podmínky Start/Business, plátci, instance, výluky a SLA.
- [Kalkulačka](new-economics-calculator.md): rychlý a pokročilý pohled, kompletní model, parametry a ekonomika.
- [Kontakt, sdílení a PDF](new-contact-and-pdf.md): kontaktní systém, e-mailová brána, celý report a ochrana údajů.
- [Srovnání](new-comparisons.md): férové vymezení alternativ, zdroje a aktualizace.
- [Společná kvalita](new-pages-quality.md): navigace, přístupnost, metadata, testy a podmínky přesunu.
- [Zdroje a rozhodnutí](new-pages-sources.md): podklady, autorita posledního zadání, příběh a hranice veřejných tvrzení.

## Rozsah cest

`/`, `/partnership`, `/kalkulacka`, `/cenik`, `/agendy`, `/agendy/{email|documents|social|video|coding}`, `/srovnani`, `/srovnani/{claude-code|codex|n8n|make|openclaw|paperclip|grok-bot|openai-dots|meta-muse|chatgpt}`, `/o-nas`, `/bezpecnost`, `/faq`, `/soukromi`, `/podminky`.

Interní marketingové odkazy používají jazykové prefixy `/cs` a `/en`; přepínač zachová cestu, query a fragment. GitHub, zdroje srovnání, obchodní rejstřík a sociální profily jsou záměrně externí. Právní dokumenty používají existující společný obsah a zachovávají jeho právní odkazy. Údaje o firmě a fotografie pocházejí ze stávajícího webu, nevytvářejí se nové identity.

## Závazné redakční principy

Každý blok má jeden účel. Bez prázdných štítků, opakování téže výhody v mnoha místech a technických vysvětlivek v hero. `book` se nepřekládá a není vstupním požadavkem ani tématem zákaznického webu. Uživatel předává práci a pravidla, ne interní souborový formát.

Navenek není rozlišení „dnes / připravujeme / vize“, termín dokončení aplikace ani odkaz „současný web“. Jde o cílové znění pro uvedení kompletního produktu. Interní kontrola připravenosti tím nezaniká; po schváleném přepnutí jsou veřejné marketingové stránky indexovatelné. Smluvní podmínky se tím nemění.

## Jazyky a měny — zadání 17. října 2026

Český web je na `/cs` i na `/`, plná anglická verze pod `/en` se stejnými suffixy cest. Přepínač zachovává protějšek stránky, query výpočtu a fragment. Překlady zahrnují ukázky, formuláře, kalkulačku, právní texty a PDF; serverový výstup má správný jazyk už před hydratací. Metadata uvádějí canonical a jazykové alternativy, veřejné stránky jsou indexovatelné a uvedené v sitemap.

České částky se zobrazují v Kč, anglické v USD. Základ nabídky 19/100 USD se nemění; česká prezentace používá stávající modelový kurz 22 Kč/USD (418 / 2 200 Kč) s uvedeným přepočtem. Kalkulačka zachovává původní jednotky uložených parametrů a převádí zobrazení i vstupy podle jazyka, včetně tokenových sazeb. Její zadaný kurz je odhad, ne živý kurz. Podíl zůstává pevný 20 %.

Barevnost vychází z původního modrého loga Promptbooku: indigo, inkoustová modrá, ledově modré odlesky a neutrální světlé plochy. Prostorové scény, řízení scrollem a přístupnost pohybu zůstávají zachované.
