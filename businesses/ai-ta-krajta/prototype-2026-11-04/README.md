# AI ta Krajta — tři vizuální prototypy

Prototyp k výběru směru, připravený 4. listopadu 2026. Otázka: jak spojit poslech aktuálních dílů s jasnou cestou k placenému tříměsíčnímu partnerství?

Každá varianta obsahuje úvod, archiv a nabídku pro firmy. Přepínač zachovává právě prohlíženou stránku. URL: `?variant=A|B|C&page=home|episodes|partners`. Fungují také šipky vlevo/vpravo mimo formulářová pole. Stav se neukládá. Formuláře jsou ukázky, neodesílají data. Přehled šesti klobouků včetně zapracovaných připomínek je přímo v každé variantě.

## Varianty

| Varianta | Struktura | Hlavní přínos | Riziko |
| --- | --- | --- | --- |
| A — Redakce | Světlé redakční médium, výrazná partnerská lišta, nabídka s kontaktem vedle sebe | Důvěryhodnost a klidná obchodní cesta | Nabídka by mohla ustoupit pořadu, proto je cena vidět před díly |
| B — Studio | Podcastový obsah ve větším sloupci, kontrastní nabídka v pravém panelu; na mobilu před díly | Poslech a obchod mají současně jasné místo | Hustota na mobilu, vyřešená jednořádkovou cenou a celoplošným tlačítkem |
| C — Partner | Firemní partnerství jako hlavní vstup, poslech v kompaktním bloku, tříkrokový brief | Konkrétnější obchodní zadání | Slabší orientace pro posluchače, proto zůstává přímá cesta k dílům |

Doporučený výchozí směr: **B — Studio**. Jde o návrhový úsudek, nikoli o výsledek měření konverzí.

## Šest klobouků a zapracované změny

| Klobouk | A | B | C |
| --- | --- | --- | --- |
| Bílý: ověřitelná fakta | Původní cena, datum statistik a minimální celková cena | Původní plnění a termíny reportů | Cena a období i v rekapitulaci briefu |
| Červený: dojem | Klidné médium, skutečné portréty | Charakter pořadu, kontrastní obchodní panel | Přímá obchodní nabídka a viditelný poslech |
| Černý: rizika | Nabídka před díly, krátký formulář | Čitelný mobilní panel a jasný další krok | Přímý vstup na kterýkoli krok, nezávazné zadání |
| Žlutý: přínosy | Důvěra a firma na jeden klik | Nabídka dostupná i z archivu | Cíl spolupráce před kontaktem |
| Zelený: alternativy | Redakční hranice vedle nabídky | Tříbodový průběh spolupráce | Volba cíle a rekapitulace místo dalšího tarifu |
| Modrý: postup ověření | Sledovat kvalifikaci a uzavření partnerství | Totéž a vedlejší kontrola poslechu | Dokončení briefu a podíl platících partnerů |

Všechny tři směry vycházejí ze stejné nabídky: od **39 000 Kč měsíčně bez DPH**, nejméně **3 měsíce**, od **117 000 Kč bez DPH celkem**, čtyři nativní integrace během 30 dnů, prioritní logo a odkaz, LinkedIn distribuce, UTM měření, report po 7 a 30 dnech a společné vyhodnocení. Žádné nové garance leadů nebo zhlédnutí. Jednorázová epizoda zůstává za 12 000 Kč bez DPH a tematická spolupráce od 40 000 Kč bez DPH, obojí v podrobnostech.

Statistiky jsou původní zveřejněné podklady s datem **28. 8. 2026**. Není předstírána jejich aktuálnost k datu prototypu. Epizody a portréty jsou skutečné veřejné podklady pořadu; jejich seznam je statický snímek pro porovnání variant.

## Spuštění

`npm run prototype`, potom otevřít místní adresu vypsanou serverem. Lze také přímo otevřít `dist/index.html`. Fonty, portréty a přehrávací ukázka využívají existující veřejné zdroje pořadu.

Prototyp je oddělený od hlavní aplikace a před případným převodem do produkce se vybraný směr implementuje v existujících komponentách a kontaktním systému. Po výběru se zaznamená vítězná varianta a důvody rozhodnutí.

## Zdroje

- Zadání a návrh struktury: Slack, AI ta Krajta, vlákno 4. 11. 2026 od 17:07 SEČ.
- `webgptorg/ptbk-landing-page-aldaron`, nabídka v `businesses/ai-ta-krajta/aiTaKrajtaMediaKitContent.ts`.
- Aktuální archiv pořadu a `businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json`.
- Postup prototypování: https://github.com/mattpocock/skills/tree/main/skills/engineering/prototype
