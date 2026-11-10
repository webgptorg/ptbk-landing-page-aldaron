# Srovnání alternativ

Patička webu má v češtině i angličtině sekci **Promptbook versus**. První odkaz vede na společnou tabulku `/[locale]/srovnani`, následuje šest přímých odkazů. Každá alternativa má vlastní stránku `/[locale]/srovnani/{slug}`. Z tabulky se na detail přechází přes název nástroje. Záhlaví detailu vede zpět na společnou tabulku.

Detail začíná dvěma konkrétními situacemi, kdy zvolit Promptbook a kdy druhý nástroj. Kompaktní tabulka ukazuje vlastní provoz, práci při vypnutém počítači, pracovní prostředí, AI model a plánované úlohy. Stavy mají ikonu i text a podmínka je vidět přímo v buňce. Delší vysvětlení je rozbalitelné pod tabulkou. Společná tabulka má jeden řádek pro každý nástroj, samostatný sloupec pro typické použití a sdílí hodnoty pro vlastní provoz, plánování a pracovní prostředí s detailem. Na úzké obrazovce se tabulka posouvá do strany a název nástroje zůstává viditelný. Zdroje jsou dostupné u obou pohledů.

Na mobilu se hlavička přehledu i detailu posouvá se stránkou, aby při posouvání nezakrývala nadpis.

## Podklady a aktualizace

- Promptbook se posuzuje podle [Rebornu](https://github.com/webgptorg/promptbook/blob/1292ef33153efe17ea2886f1d2a569ff6c3c0e9e/README.md). Hostitel enginu může být počítač, firemní server nebo VPS. Externí modely a služby dostávají potřebné vstupy, lokální model závisí na adaptéru a úloze.
- Cloudová služba může pokračovat bez desktopu a zároveň potřebovat jeho dostupnost pro místní akce. Lokální konektor, běh agenta a místo zpracování modelem jsou samostatné vlastnosti.
- Vlastní provoz nabízejí také OpenClaw, n8n a Paperclip. Claude Code a Codex lze porovnat jako samostatné nástroje i zapojit do Promptbooku. Gemini pro Google Workspace je nástupce názvu Duet AI, Workspace Studio pokrývá automatizace.
- Každý detail odkazuje na primární zdroje a uvádí skutečné datum jejich kontroly. Doporučení vhodnosti vychází z typu práce a provozních potřeb. Ceny, výkon a bezpečnostní garance do tabulky patří pouze s odpovídajícím podkladem.
