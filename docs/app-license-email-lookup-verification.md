# Ověření licenčního lookupu V0

Datum: 18. 11. 2026. Výchozí licenční kód z revize `c4b49e3df80aefdf7e0815bc13d2f77ad9ef1bb6`.
Finální větev navazuje na novější `main` `e7ba0e08d12de8452a76a9382c67067e91f4a58a`; jeho změny exportů zůstaly zachovány.
Souvislosti a předání jsou v [integrační dokumentaci](app-license-email-lookup.md).

## Provedené kontroly

| Kontrola | Výsledek |
| --- | --- |
| `npx vitest run lib/promptbook-licensing app/api/promptbook-billing lib/promptbook-billing lib/community-membership lib/api/readBoundedJson.test.ts` | 188 testů / 32 souborů prošlo |
| Produkční sestavení (`npm run test-types`, následně finální `npx next build` po poslední úpravě resolveru) | Prošlo; finální sestavení zahrnuje aktuální zdroje |
| `npx tsc --noEmit --incremental false --pretty false` po finálním sestavení | Prošlo |
| `git diff --check` | Prošlo |
| Dokumentované JSON fixture přes skutečná Zod schémata | Všech 7 úspěšných příkladů prošlo; oba příklady 503 se správně odmítají jako úspěšná odpověď |
| Idempotentní doplnění historických účtů přes skutečné SQL v izolovaném PGlite | Preview bez zápisu, oddělení test/live, dvě apply bez duplicit, původní platby a podmínky nezměněné |

Licenční testy zahrnují normalizaci adresy bez slučování plus aliasů/teček, placený i ruční grant, nepodložený
checkout, neaktivovaný/běžící/budoucí/skončený trial, přesnou hranici expirace, zaplacený zbytek zrušeného
předplatného, více nesčítaných grantů, `null` jako unlimited, čistě komunitní grant, stránkování,
starší objednávku bez účtu i obnovení lookupu po jeho samostatném doplnění, úplnou/částečnou vratku a nulovou
potvrzenou fakturu. Chybějící/krátký/chybný token nebo konfigurace se odmítají před databází i čtením těla.
Ověřují se limity skutečných UTF-8 bajtů, chybný vstup, bezpečný cíl, soukromé odpovědi a původní GET kontrakt.
Testovací query store odmítá pokus o mutaci; při chybě evidence se nikdy nevrací potvrzené `none`.

## Skutečný lokální HTTP průchod

Po sestavení byl spuštěn skutečný Next development server s běžnou API route a skutečným Supabase klientem.
Úložiště představoval samostatný read-only HTTP fixture server na loopbacku, se syntetickými objednávkami,
fakturami a účty. Použit byl pouze náhodný dočasný lokální bearer a neplatné testovací přihlašovací řetězce
fixture úložiště. Žádná produkční hodnota nebyla čtena či aktivována.

| Požadavek / situace | Pozorovaný výsledek |
| --- | --- |
| GET bez bearer tokenu (ověření připravenosti) | 401, žádné čtení zákaznické evidence |
| POST s normalizovaným e-mailem zrušeného předplatného se zaplaceným obdobím | 200 / `active`, správný účet, číselné kapacity, `null` unlimited |
| POST s neznámým e-mailem | 200 / `none`, `snapshot: null` |
| GET se známým UUID | 200, původní numerický v1 bez prezentačních polí |
| POST s vadným JSON | 400 |
| POST po úplné vratce syntetické faktury | 200 / `expired`, žádné aktuální granty |
| POST při chybějícím licenčním účtu syntetické zaplacené objednávky | 503 / `license_account_backfill_required` |
| POST při simulovaném výpadku úložiště | 503 / obecná chyba bez interních údajů |

Obal a snapshot měly stejný čas a HTTP odpověď měla `private, no-store`. Počet mutací fixture úložiště: **0**.
Oba lokální servery byly po ověření ukončeny.

## Co tím nebylo ověřeno ani změněno

- Nebylo nasazeno do produkce, mergnuto do main ani upraveno produkční nastavení či zákaznická data.
- Produkční `PROMPTBOOK_APP_LICENSE_SECRET`, skutečné zákaznické řádky ani potřeba reálného backfillu nebyly kontrolovány.
  Operátor nebyl spuštěn proti skutečné databázi; SQL se ověřovalo izolovaně.
- Nevznikla platba, faktura, skutečný trial, zákaznický grant ani CRM kontakt. Nikomu nebyla odeslána zpráva.
- App PR #289 zůstává nezměněný otevřený draft. Kompatibilita původního GET je ověřena zachováním schématu
  a kontrolou zdrojů klienta; plný Bun workspace App ani skutečné stagingové propojení obou backendů neběžely.
- Badge v produkční App, cache podle její skutečné identity a konfigurace obou serverů jsou stále integrační
  kroky manGoweb. Žádné ověření nevydává osobní e-mail za potvrzenou licenci organizace.

Tyto meze nebrání revizi webové implementace. Aktivaci společného klíče a stagingové ověření je třeba provést
koordinovaně s připraveným konzumentem podle integračního dokumentu.
