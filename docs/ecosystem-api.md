# Společné API webového ekosystému

Revize vlastníka 20. listopadu 2026 sjednocuje veřejný integrační vstup a správu klíčů pro existující weby. Licence jsou první dostupný zdroj. Každý web volá svou aktuální instanci; samostatná nasazení potřebují vlastní databázi klíčů. Tato změna nesynchronizuje odlišná nasazení.

| Adresa | Účel |
| --- | --- |
| `/api/docs` | Veřejný Swagger s interaktivní konzolí |
| `/api/openapi.json` | Schéma, `?download=1` stáhne JSON |
| `/api/v1/licenses` | Stávající POST lookup podle ověřeného e-mailu a GET striktního v1 snapshotu |
| `/api/v1/identity/exchange` | Stávající výměna jednorázového identity ticketu |
| `/admin/api-keys` | Soukromé vytváření, přehled a zneplatnění klíčů |

Původní `/api/promptbook-billing/app/licenses`, `/exchange`, `/docs` a `/openapi.json` dál fungují. Nové cesty znovu exportují stejné handlery, bez změny odpovědí. Ve schématu jsou staré operace označené jako kompatibilní. Žádné přesměrování nepřenáší Authorization mezi doménami.

## Oprávnění administrace

Superadministrátor přiděluje tři nezávislé sekce: Licence, Předplatná a objednávky, API klíče. Přiřazení nemění existující účty. Aktuální oprávnění se čtou na každém serverovém požadavku a platí i pro přímé API volání. Klientský kontext jen skrývá nepřístupné odkazy; nikdy neautorizuje požadavek.

Licence bez přístupu k předplatným nečtou související objednávky, platby ani nákupy jiných produktů. Správce klíčů nemá automaticky přístup do licenční administrace; jím vydaný integrační klíč ovšem může číst dokumentované licenční údaje, pokud mu toto oprávnění udělí. Přidělujte správu klíčů s tímto vědomím. Správa administrátorů zůstává pouze superadministrátorovi.

## Životní cyklus klíče

1. Vytvoření vyžaduje název a alespoň jedno povolené oprávnění: `licenses:read` nebo `identity:exchange`. Volitelná expirace musí být v budoucnosti.
2. Server vygeneruje 32 kryptograficky náhodných bajtů. Výsledné `ptbk_…` se ukáže pouze v odpovědi na vytvoření a v paměti otevřeného dialogu. Po zavření/obnovení stránky jej nelze znovu přečíst.
3. Databáze ukládá pouze SHA-256 hash, veřejný prefix, oprávnění, platnost a aktéra. Výpisy nikdy nevracejí hash nebo celý token. Tabulka má RLS a nemá oprávnění pro veřejné ani běžné přihlášené role.
4. Backend integrace posílá `Authorization: Bearer <klíč>`. Ověření kontroluje aktuální databázový záznam, scope, expiraci a zneplatnění bez cache. Vlastní čtení licencí nevytváří účty, nákupy, zkoušky ani CRM záznamy.
5. Zneplatnění zachová záznam, čas a prvního aktéra; je nevratné a idempotentní. Další požadavky selžou. Již přijatý běžící požadavek se neruší. Neplatný, vypršelý, zneplatněný nebo nedostatečně oprávněný token dostane 401; nedostupná evidence klíčů 503.

Starší `PROMPTBOOK_APP_LICENSE_SECRET` zůstává podporovaný pro dokončené integrační spotřebitele. Administrace signalizuje jeho přítomnost bez čtení hodnoty do prohlížeče. Při přechodu vytvořte spravovaný klíč, aktualizujte konfiguraci backendu spotřebitele, ověřte provoz a pak odstraňte starý secret v nastavení nasazení. Spravovaný prefix nikdy nepoužívá environment fallback, takže vložení spravovaného klíče do této proměnné nemůže obejít jeho zneplatnění. Žádné klíče ani integrace se touto migrací automaticky neaktivují.

## Swagger a konzole

Dokumentace i assety jsou stejného původu, ze stávající připnuté verze Swagger UI. Odkazy ze stránky licencí i ze Swaggeru vedou na správu klíčů. Uživatel zvolí Authorize, zadá samotný klíč, otevře operaci a explicitně použije Try it out / Execute. Konzole zobrazí cURL, stav, hlavičky, odpověď a dobu požadavku. Výchozí příklady jsou syntetické.

Authorization zůstává jen v paměti karty, bez localStorage, cookies a předvyplnění. Obnovení stránky jej vymaže. CSP i request interceptor omezují požadavky na dokumentované endpointy stejného webu; parametry URL nemohou podstrčit jinou specifikaci. Prohlížeč neposílá ambientní cookies. Konzole nevolá cizí validátor ani analytiku. Čtení licence nic nemění; explicitní výměna identity spotřebuje skutečný jednorázový ticket.

## Nasazení a ověření

Přidejte standardním migračním mechanismem `2026-11-2000-licensing-api-admin-permissions.sql` a `2026-11-2001-ecosystem-api-keys.sql`. První rozšíří povolené hodnoty bez změny existujících grantů, druhá přidá soukromou tabulku. Produkční prebuild je provede před nasazením; lokální testy neběží proti produkční databázi. Příprava Swagger assetů zůstává v predev/prebuild.

PGlite testy používají skutečné migrace, constraints, hashování, handlery a kontrolu rolí. Ověřují jednorázové vydání, metadata bez tajemství, scope, expiraci, zneplatnění a opakování, serverové aktéry, CSRF, chybové stavy a kompatibilní cesty. Administrátorské integrační testy ověřují všechny tři sekce nezávisle i odebrání práva se stávající relací. Samostatné testy dokumentace kontrolují konzoli, nepersistovanou autorizaci a odmítnutí jiného cíle.
