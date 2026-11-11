# Srovnání alternativ

Patička webu má v češtině i angličtině sekci **Promptbook versus**. Nadpis přehledu, jeho metadata, první odkaz i návrat z detailu používají název **Promptbook versus**; nejde o úplný seznam nástrojů. První odkaz vede na společnou tabulku `/[locale]/srovnani`, následuje šest přímých odkazů. Každá alternativa má vlastní stránku `/[locale]/srovnani/{slug}`. Z tabulky se na detail přechází přes název nástroje. Záhlaví detailu vede zpět na společnou tabulku.

Detail začíná dvěma konkrétními situacemi, kdy zvolit Promptbook a kdy druhý nástroj. Kompaktní tabulka ukazuje vlastní provoz, práci při vypnutém počítači, umístění dat, AI modely a plánované úlohy. V každém detailu je zvýrazněn jeden doložitelný rozdíl ve prospěch Promptbooku. U alternativ s vlastním provozem porovnává ukládání úkolů a chatů jako souborů projektu v Gitu. Stavy mají ikonu i text a podmínka je vidět přímo v buňce. Delší vysvětlení je rozbalitelné pod tabulkou.

Společná tabulka má jeden řádek pro každý parametr a jeden sloupec pro každý nástroj. První dva sloupce patří Promptbook App a Promptbook Open Source, vizuálně odděleným od alternativ. Přehled sdílí technické hodnoty s detaily. Cena, účtovací jednotka, příklad kapacity a licence mají vlastní řádky. Ceny uvádějí příklady tarifů s odkazy na zdroje. U veřejného enginu platí podmínky licence konkrétní verze. Posuvná oblast má přístupný název. Na desktopu názvy sloupců a parametrů zůstávají při posunu viditelné.

Na mobilu se hlavička přehledu i detailu posouvá se stránkou, aby při posouvání nezakrývala nadpis. Tabulka má vodorovný posuv a připnutý sloupec parametrů. Výšku obsahu neomezuje vnitřní svislý posuv. Kompaktní záhlaví tabulky se posouvá se stránkou.

## Podklady a aktualizace

- Promptbook se posuzuje podle [Rebornu](https://github.com/webgptorg/promptbook/blob/1292ef33153efe17ea2886f1d2a569ff6c3c0e9e/README.md). Hostitel enginu může být počítač, firemní server nebo VPS. Externí modely a služby dostávají potřebné vstupy, lokální model závisí na adaptéru a úloze.
- Cloudová služba může pokračovat bez desktopu a zároveň potřebovat jeho dostupnost pro místní akce. Lokální konektor, běh agenta a místo zpracování modelem jsou samostatné vlastnosti.
- Vlastní provoz nabízejí také OpenClaw, n8n a Paperclip. Claude Code a Codex lze porovnat jako samostatné nástroje i zapojit do Promptbooku. Gemini pro Google Workspace je nástupce názvu Duet AI, Workspace Studio pokrývá automatizace.
- Každý detail odkazuje na primární zdroje a uvádí skutečné datum jejich kontroly. Doporučení vhodnosti vychází z typu práce a provozních potřeb. Ceny, výkon a bezpečnostní garance do tabulky patří pouze s odpovídajícím podkladem.

## Revize 11. listopadu 2026: integrace, modely a přístup

Společná tabulka má 15 parametrů. Detaily sdílejí stejné hodnoty: přidané řádky Integrace, Hesla a přístupy, Trust model, Ovládání z mobilu a AI nástroje a jejich výběr. Pracovní prostředí nahrazuje Kde jsou Vaše data. Modely uvádějí konkrétní rodiny, u otevřených nástrojů více poskytovatelů. Automatická volba Promptbooku vybírá vhodný dostupný nakonfigurovaný nástroj podle úlohy a respektuje model i limity. Neslibovat podporu libovolného neexistujícího adaptéru.

Promptbook ovládá webové aplikace univerzálním prohlížečem i bez konektoru; u alternativ zachovat jejich vlastní prohlížeče, MCP, HTTP a rozšiřitelnost. Wallet ukládá chráněné přístupy lokálně a šifrovaně, mimo Git a kontext agenta při dodržení izolace. Git uchovává historii pracovních souborů, není šifrováním ani vracením externích akcí. Zero Trust popisuje E2E spojení App–engine, které relay/backend nedešifruje; nezamlčet vstupy externím modelům a službám. Vlastní běh Open Source neimplikuje bezplatnou produkční licenci ani neomezený nárok na vzdálenou Appku.

`comparisonCapabilities.ts` obsahuje lokalizované hodnoty a primární zdroje, ověřené 11. listopadu; starší cenové a základní parametry si ponechávají vlastní datum kontroly. Zdroje Promptbooku ukazují na kontrakty Rebornu v commitu `3ed6803`, v souladu se schválenou prezentací produktových schopností. Tato redakční změna sama neprokazuje audit nebo implementaci kryptografické izolace.
