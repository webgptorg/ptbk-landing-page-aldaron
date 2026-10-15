# Srovnání alternativ

## Účel a struktura

Na úvodu je pouze stručná cesta k výběru přístupu. `/new/srovnani` nabízí šest konkrétních srovnání. Každé má podstránku `/new/srovnani/{slug}`, otázku pro rozhodnutí, faktický popis alternativy, vymezení Promptbooku, doporučení kdy zvažovat který přístup, zdroj a datum kontroly.

Vlastní doporučení vhodnosti jsou odlišená od tvrzení výrobce a od měřených výsledků. Nejde o nezávislý výkonnostní test. Nesrovnávají se neověřené aktuální ceny, inference, garance bezpečnosti nebo marketingové počty klientů. Žádné univerzální zelené zaškrtnutí Promptbooku a křížek všem ostatním.

## Zdroje a vymezení — kontrola 15. října 2026

| Stránka | Primární zdroj | Co zdroj podporuje | Jaký rozdíl vysvětlit |
| --- | --- | --- | --- |
| `claude-code` | [Claude Code headless](https://code.claude.com/docs/en/headless) | CLI / Agent SDK, neinteraktivní běh, skripty a CI/CD | Přímý vývojový nástroj vs. firemní agenda; harness může být součástí Promptbooku |
| `codex` | [Codex non-interactive](https://developers.openai.com/codex/noninteractive) | `codex exec`, skripty, CI a plánované úlohy | Přímá vývojová automatizace vs. dlouhodobá služba s partnerem |
| `n8n` | [Oficiální repozitář](https://github.com/n8n-io/n8n) | Vizuální workflow s kódem a AI, vlastní i cloudový provoz | Explicitní integrační kroky vs. agenda s vlastním kontextem |
| `make` | [Oficiální produkt](https://www.make.com/en/product) | Vizuální automatizace, integrace a AI agenti | Integrační plátno vs. agentní práce v klientově prostředí |
| `openclaw` | [Oficiální repozitář](https://github.com/openclaw/openclaw) | Osobní asistent pro jednoho operátora, vlastní zařízení, kanály a různé modely | Osobní asistent vs. partnersky dodávaná firemní agenda |
| `paperclip` | [Oficiální produkt](https://paperclip.ing/) | Agentní organizace, cíle, rozpočty, úkoly a plánované/událostní probouzení | Blízký orchestrátor; organizace agentů vs. konkrétní klientské agendy |

## Závazná férovost

Claude Code ani Codex se nepopisují jako nástroje, u kterých člověk musí stále sedět. n8n a Make už pracují s AI agenty. OpenClaw se neshazuje jako hračka; vlastní data a model nejsou výhradní vlastností Promptbooku. Paperclip je blízká alternativa s reálnou orchestrací, ne chatbot.

Kombinace nástrojů je legitimní možnost. Zdrojem potvrzená schopnost konkurenta se nesmí skrýt jen proto, že oslabuje slogan. Co zdroj neuvádí, se nesmí označit za nemožné. Každý faktický odstavec o alternativě má dostupný primární zdroj na stránce; doporučení Promptbooku je označeno jako vlastní pohled.

Z briefingových neověřených názvů Grok Bot a AI Dots se v tomto vydání nevytváří tvrzení ani prázdné srovnávací stránky. Před doplněním je potřeba ověřit konkrétní produkt, jeho dokumentaci a aktuální rozsah. Nepublikují se letní ceny z podkladů bez ověření.

Při změně popisu aktualizovat zdroj, datum a odpovídající srovnávací text. Samotné zobrazení aktuálního kalendářního data není nová kontrola. Při rozhodování doporučit ověřit stejný proces na vlastních podkladech, včetně kontroly, provozu a celkových nákladů.
