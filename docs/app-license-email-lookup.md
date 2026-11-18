# Licenční badge V0 pro App / manGoweb

OpenAPI ke stažení: `https://www.ptbk.io/api/promptbook-billing/app/openapi.json?download=1`.
Swagger: `https://www.ptbk.io/api/promptbook-billing/app/docs`.
Licenční administrace a provázání plateb jsou popsané v [administraci licencí](license-administration.md).

Revize vlastníka: 18. 11. 2026. Web je jediná autorita plateb, zkoušek a grantů. Tento krok umožňuje osobnímu
přihlášenému účtu App zobrazit stav licence a odkaz. Běh, vytváření enginů, úlohy ani ovládání se podle licence
neblokují. Aktuální množství používání se ve V0 nevyhodnocuje.

## Serverové API

```http
POST https://www.ptbk.io/api/promptbook-billing/app/licenses
Authorization: Bearer <PROMPTBOOK_APP_LICENSE_SECRET>
Content-Type: application/json

{"email":"customer@example.test"}
```

Jediný povolený vstup je `email`: validní adresa do 254 znaků po trim/lowercase. Tělo má nejvýše 2 048 skutečných
UTF-8 bajtů, včetně mezer. Neplatný JSON, UTF-8, Content-Type či nadbytečné pole (včetně `is_test`) vrací 400.
Plus aliasy ani tečky se nemažou. E-mail není v URL. Výstup e-mail ani interní objednávky nevrací.

Autentizace předchází čtení těla i databáze. Vyhrazený sdílený serverový klíč `PROMPTBOOK_APP_LICENSE_SECRET`
musí mít alespoň 32 náhodných znaků. Znovu se používá existující guard a porovnání `timingSafeEqual`.
Chybějící, krátká nebo chybná konfigurace i chybný bearer vracejí 401; žádný fallback klíč neexistuje.

Odpovědi včetně chyb mají `Cache-Control: private, no-store` a `Referrer-Policy: no-referrer`.
API nepovoluje klientský CORS. Znovu se používá existující paměťový limiter: 3 000 autorizovaných POST
za pět minut na serverovou instanci, společně pro tento transport. Překročení vrací 429 a `Retry-After: 300`.
Jde o hrubou pojistku, ne distribuovaný limit; backend App má používat cache, timeout a odložené opakování.
Tokeny ani těla se nelogují. Nasazovací platforma musí zachovat stejné pravidlo v případném externím logování.

### Kontrakt a příklady

- Kopírovatelná Zod schémata a odvozené TypeScript typy: [lookupContract.ts](../lib/promptbook-licensing/lookupContract.ts).
  Přenést spolu s nezměněným numerickým [contract.ts](../lib/promptbook-licensing/contract.ts), upravit jen import.
- Úplné syntetické request/response fixture: [app-license-email-lookup.json](fixtures/app-license-email-lookup.json).
  Obsahují aktivní Business, běžící čtrnáctidenní trial, dvě různé licence, budoucí grant,
  expiraci, známý účet bez licence, neznámý účet a oba druhy 503.
  Všechny úspěšné příklady se ověřují skutečným schématem v testu.

```ts
type LicenseLookupRequest = { email: string };
type LicenseLookupResponse = {
    schemaVersion: 1;
    status: 'active' | 'trial' | 'scheduled' | 'expired' | 'none';
    display: { label: string };
    manageUrl: 'https://www.ptbk.io/cs/pricing/predplatne';
    generatedAt: string; // ISO UTC
    refreshAfterSeconds: number; // nyní 900
    enforcement: 'advisory';
    snapshot: LicenseSnapshot | null; // původní striktní numerický v1
};
```

`display.label` je prostý bezpečný český text, nejvýše 160 znaků; vykreslit jako text, nikoli HTML.
V0 nepřijímá jazykový parametr. App může lokalizovat vlastní stavové okolí, ale obchodní popisek zobrazuje z webu.
Z popisku ani názvu tarifu nesmí odvozovat oprávnění. Pozdější jazyková varianta vyžaduje koordinovanou revizi.

`manageUrl` je nyní pro všechny stavy stejná existující HTTPS členská stránka. Je to jediný povolený cíl v obou
schématech. Neobsahuje token, e-mail ani automatické přihlášení; zákazník použije běžné ověření webu.
Budoucí změnu cíle je nutné sladit se starším klientem, který tuto URL validuje literálem.

`generatedAt` i obnovu generujeme společně pro obal a snapshot. Platnost je na každém grantu zvlášť:
`validFrom <= now < validUntil`, `null` znamená bez časového konce. Číselná kapacita `null` znamená neomezenou
kapacitu; nula znamená nulu. Více grantů se nesčítá do jediného většího balíku ani trvale neváže na engine.

| Evidence | HTTP / status | Popisek / snapshot |
| --- | --- | --- |
| Jedna aktuální objednaná licence | 200 / `active` | Start nebo Business podle skutečné objednávky |
| Jedna aktuální ruční softwarová licence | 200 / `active` | Licence na míru; Stripe ID není třeba |
| Jen aktuální trial | 200 / `trial` | Business – zkušební období; skutečná platnost grantu |
| Více současných grantů, alespoň jeden netrialový | 200 / `active` | Např. 2 aktivní licence; všechny aktuální granty zůstávají samostatné |
| Jen budoucí grant, případně spolu s historií | 200 / `scheduled` | Licence začne platit později; aktuální `grants: []` |
| Historický nebo plně vrácený nárok bez aktuálního či budoucího | 200 / `expired` | Platnost licence skončila; `grants: []` |
| Známý účet bez softwarového nároku, včetně komunitního partnera | 200 / `none` | Bez aktivní licence; snapshot se skutečným UUID a `grants: []` |
| Žádný účet ani potvrzená starší objednávka | 200 / `none` | Bez aktivní licence; `snapshot: null` |
| Neznámý účet s potvrzenou starší objednávkou | 503 | `{"error":"Temporarily unavailable","code":"license_account_backfill_required"}` |
| Výpadek DB nebo nejednoznačná/chybná evidence | 503 | `{"error":"Temporarily unavailable"}` |
| Chybějící či chybný serverový klíč | 401 | `{"error":"Unauthorized"}` |
| Neplatný vstup po autentizaci | 400 | `{"error":"Invalid request"}` |
| Překročení hrubého limitu | 429 | `{"error":"Too many requests"}`; opakovat později |

Aktuální netrialový grant má přednost před aktuálním trialem. Bez aktuálních grantů má budoucí platnost přednost
před historií. Souhrnný počet při kombinaci trialu a jiné licence zahrnuje všechny aktuální softwarové granty;
pro více současných trialů se použije text „N aktivní zkušební licence“. Z číselných kapacit se název nikdy nehádá.

### Serverový příklad pro App

Následující funkce patří jen backendu. `identity` pochází z běžné ověřené relace App, nikdy z těla veřejného
požadavku. Ukazuje osobní licenci přihlášeného člověka. E-mail neprokazuje vlastnictví organizace, enginu,
passkey ani právo vstoupit do členské sekce webu.

```ts
import { licenseLookupRequestSchema, licenseLookupResponseSchema } from './lookup-contract';
import { readBoundedJson } from './read-bounded-json'; // existující helper v App PR #289, přijímá Response

export async function readPersonalLicense(identity: { email: string; emailVerified: boolean }) {
    if (!identity.emailVerified) throw new Error('Verified identity required');
    const input = licenseLookupRequestSchema.parse({ email: identity.email });
    const secret = process.env.PROMPTBOOK_APP_LICENSE_SECRET?.trim();
    if (!secret || secret.length < 32) throw new Error('License client not configured');
    const response = await fetch('https://www.ptbk.io/api/promptbook-billing/app/licenses', {
        method: 'POST',
        headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
        body: JSON.stringify(input),
        redirect: 'error',
        cache: 'no-store',
        signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error('License service unavailable');
    const value = licenseLookupResponseSchema.parse(await readBoundedJson(response, 512 * 1024));
    if (Date.parse(value.generatedAt) > Date.now() + 120_000) throw new Error('Unexpected license timestamp');
    return value;
}
```

Backend předá prohlížeči jen potřebný badge, stav ověření a bezpečný odkaz. Cache klíč obsahuje prostředí,
přihlášený účet a jeho aktuální ověřený normalizovaný e-mail. Při změně e-mailu/účtu oddělit nebo zahodit cache.
Nevystavit veřejnou proxy přijímající libovolný e-mail. U organizačního UI nevydávat osobní licenci člena za licenci
celé organizace. Organizační handoff v PR #289 zůstává samostatná větší integrace.

Obnova po `refreshAfterSeconds` (900 s), případně při ručním obnovení nebo návratu z webu; neblokovat dlouhým
voláním vykreslení App. Chyba sítě, timeout, 401, 429 i 503 znamenají neověřený stav, nikdy `none`.
Při výpadku lze ponechat poslední úspěšný údaj s výslovným označením neaktuálnosti a času ověření. Po známém
`validUntil` se starý grant nesmí zobrazovat jako právě ověřený aktivní: přepočítat zbylé granty, či ukázat nejistotu.
Bez cache zobrazit „Stav licence se nepodařilo ověřit“. Kliknutí vždy použije validované `manageUrl`.

## Evidence a opětovné použití

Resolver používá existující `promptbook_license_accounts`, `promptbook_license_grants`, `promptbook_orders`
a ověřené lokální `promptbook_invoices`. Nevolá Stripe, nezakládá účet či platbu, neaktivuje zkoušku ani nezapisuje
do CRM. Produkční POST pevně filtruje `is_test=false`; testovací data lze ověřovat jen v izolované fixture/databázi.
Ruční bankovní/partnerská softwarová licence používá existující administraci `custom`/`partner` s kladnou či
neomezenou `engineProjects`. Samotná komunitní místa s nulovou kapacitou projektu softwarovou licenci netvoří.

Pro předplatné zůstává nutný `confirmed_at`, `stripe_subscription_id` a důvěryhodné `paid_through`.
Pouhé `status=active` nebo založený checkout nestačí. Nezaplacená objednávka bez dokladů se ignoruje; částečně
potvrzený nekonzistentní záznam vyvolá 503. Licence placená mimo Stripe se nefalšuje dosazením subscription ID:
zaznamená se ručním grantem. Zrušení obnovy zachová zaplacený zbytek období.

Sdílený `accountGrants()` nyní také čte již ověřené vratky faktur. Plně vrácená kladná faktura neprodlužuje
platnost; předchozí nevrácené období může doběhnout. Částečná vratka i potvrzená nulová faktura nárok zachovají.
Pokud lokální historie faktur existuje, ale nedokládá souhrnné `paid_through`, vrací se 503. Starší kompletní
souhrn bez řádků faktur nadále funguje; nová logika nepřepočítává webhooky ani nesahá do původních plateb.

Současná historická mapa Start/Business na kapacity zůstává stejná. Objednávky zatím neukládají vlastní numerický
snapshot kapacit; nelze zpětně hádat jiné parametry z dnešních cen či částek. Rozdílné individuální nároky se mají
zaznamenat stávajícím ručním grantem po skutečném ověření; tento úkol plošně nemění přijaté podmínky ani kapacity.
Explicitní stránkování brání tichému vynechání historie; přes 10 000 řádků daného čtení je viditelná 503, nad
1 000 aktuálních grantů selže stávající schéma, nikoli tichý ořez.

### Starší zákazníci bez licenčního účtu

Read endpoint nikdy neprovádí upsert. Připraven je samostatný operátor, který přidá pouze chybějící účty pro
objednávky s evidencí potvrzení/úhrady/období. Nepřiděluje granty ani neprohlašuje všechny tyto objednávky za platné.
Respektuje prostředí a `ON CONFLICT (email,is_test) DO NOTHING`. Existující účet a jeho doporučení zůstávají stejné.

```bash
# Jen souhrn počtů po prostředích; výchozí transakce je READ ONLY.
node --import tsx scripts/backfill-promptbook-license-accounts.ts

# Teprve po revizi souhrnu a samostatné autorizaci změny produkčních dat.
node --import tsx scripts/backfill-promptbook-license-accounts.ts --apply
```

Používá serverové `DATABASE_URL`, nevypisuje adresy zákazníků ani připojovací údaje. Apply je jedna transakce,
opakování nepřidá duplicitní účty. Není v `migrations/`, prebuild ani startupu, a při této implementaci nebyl
spuštěn proti skutečné evidenci. Před ostrým otevřením zkontrolovat souhrn a potřebný backfill provést odděleně.
Při chybějícím účtu se starší potvrzenou objednávkou vrací lookup výslovnou 503 s výše uvedeným kódem.

## Kompatibilita a předání

Původní `GET ?subject=<uuid>` nadále vrací striktní `LicenseSnapshot` v1 bez prezentačních polí a se stejnými
kódy 400/401/404/503. Společný resolver opravuje vynechání komunitních grantů a plně vrácených období také pro GET.
Nový POST má oddělený obal; samotný vložený snapshot se nemění. Snapshot neobsahuje ceny, plány, community seats,
objednávky, metadata grantů ani vazbu na engine.

Znovu ověřeno na zdrojích 18. 11. 2026: licenční kód webu vychází z `c4b49e3`; finální větev navazuje na novější
webový main `e7ba0e0`. App main je `167f34c`, engine `d1fa319`.
[App PR #289](https://github.com/webgptorg/app/pull/289) je nadále otevřený draft s head `5b40197`.
Jeho GET klient i numerický parser jsou kompatibilní; nový POST zatím nevolají. Webová změna App kód nemění,
nezakládá konkurenční implementaci a neoznačuje produkční badge za hotový.

Zbývající práce manGoweb pro malé V0:

1. Přenést POST schéma a přidat serverové načtení podle ověřeného e-mailu osobního účtu; zachovat stávající GET klient.
2. Doplnit oddělenou cache a nejistý/neaktuální stav, limit velikosti odpovědi, timeout a pravidla expirace výše.
3. Přidat osobní badge s `display.label` a kliknutím na `manageUrl`; žádné rozhodování podle Start/Business.
4. Koordinovaně nasadit obě strany, až budou připravené, nastavit stejný dedikovaný klíč jen na serverech a ověřit
   na stagingu úspěch, `none`, výpadek a hranici expirace. Neaktivovat klíč jen pro nedokončeného konzumenta.

Pro V0 nejsou nutné org handoff, alokace licencí, měření používání, limity ani blokování enginu. Nastavení sdíleného
klíče ani stagingové propojení nebylo touto změnou provedeno; skutečné secret hodnoty nejsou součástí dokumentace.
Výsledky lokálního ověření jsou v [ověřovacím záznamu](app-license-email-lookup-verification.md).
