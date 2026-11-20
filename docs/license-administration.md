# Licence, předplatná a dokumentace API

Revize vlastníka z 18. listopadu 2026 rozšiřuje existující licenční evidenci; nevzniká další platební systém.

## Obrazovky

- `/admin/promptbook-licensing`: stránkovaný přehled licencí z potvrzených nákupů, explicitních zkoušek a ručních přidělení. Vyhledávání podle e-mailu, stav a oddělené produkční/testovací prostředí.
- `/admin/promptbook-subscriptions`: společný stránkovaný přehled existujících objednávek/předplatných Promptbooku, komunit a Pavolova avatara. Produkt, stav, sleva, uhrazené období, obnova, zdrojová objednávka a přesné Stripe odkazy.
- Detail licence odkazuje na skutečně spárovanou objednávku a její historii plateb. Ostatní nákupy stejného e-mailu jsou samostatně označené; samotná shoda e-mailu nevytváří vztah platby k ruční licenci.
- Detail předplatného odkazuje zpět na vzniklou licenci nebo přesný členský záznam. Čekající objednávka bez potvrzeného nároku zůstává objednávkou.

Obě privátní sekce používají stávající kontrolu aktuální administrátorské relace a cross-site guard. Od revize vlastníka 20. listopadu mají samostatně přidělitelná oprávnění `promptbook-licensing` a `promptbook-subscriptions`. Licence bez oprávnění k předplatným nečtou ani nevracejí související nákupy; předplatná bez oprávnění k licencím nevracejí spárované licenční záznamy. Navigace a odkazy odpovídají přístupu. Delegovaný přístup ke komunitě neuděluje přístup k soukromým platbám jiných produktů. Vytváření administrátorů zůstává superadministrátorovi.

## Dvě samostatné cesty

| Cesta | Co vznikne | Licence |
| --- | --- | --- |
| Nákup včetně 100% slevy | Existující objednávka / členský nákup a jeho skutečné potvrzení; případné předplatné podle existujícího checkoutu | Podle potvrzeného nároku, nikoli jen podle existence slevy nebo checkoutu |
| Vytvořit licenci v administraci | Samostatný grant a případně jeho licenční účet | Vzniká přímo, bez objednávky, platby a Stripe subscription |

Ruční editor nabízí numerické předvolby Start/Business nebo samostatný komunitní přístup. Předvolby nejsou obchodní logikou App. Všechny kapacity a platnost jsou upravitelné, `null` znamená neomezeno a nula skutečnou nulu. Označení je bezpečný prostý text.

Vytváření je explicitní; stávající ruční licence se upravuje ve sdíleném dialogu s průběžným ukládáním a ochranou neuložených změn. Deaktivace, aktivace a odstranění jsou explicitní akce s důvodem. Aktivace zachová původní časový rozsah, takže neprodlouží vypršelou licenci. U zkoušky zůstává jednorázová explicitní aktivace původním tokem; editor ji nepřepisuje ani nerestartuje. Placený nárok zůstává spravovaný existující fakturací.

`admin_mutate_promptbook_grant` provede ruční změnu a historii atomicky. Revision brání přepsání souběžné změny (HTTP 409). Vytvoření posílá stabilní UUID pro bezpečný retry; stejný identický pokus nepřidá druhou licenci ani auditní řádek. Historie ukládá aktéra ze serverové relace, důvod a úplný stav před/po. Odstranění je měkké: grant zůstává dohledatelný a přestane poskytovat práva; historii nelze přes administraci mazat.

## Platby

Licenční/avatáří platby čte detail ze stávajících faktur, stránkovaně po 50. Nulová potvrzená faktura zůstává 0 Kč; objednávka bez potvrzení není platba. Částky jsou minor units, vratky jsou samostatné a plná vratka pozitivní faktury ruší příslušné období podle stejného resolveru. Chybějící doklad k období se nezobrazuje jako ověřený aktivní nárok.

Komunitní evidence nemá vlastní deník faktur. Její detail čte posledních až 100 faktur přímo z příslušného Stripe předplatného, pouze pokud konfigurace serveru patří ke stejnému prostředí. Kompletní historie a vratky jsou dostupné přes přesný Stripe odkaz. Chybějící konfigurace či chyba se výslovně zobrazí jako neověřená historie. Zobrazení detailu nic neúčtuje a neupravuje Stripe.

## Předání Sebastianovi

- Swagger: `https://www.ptbk.io/api/docs`
- OpenAPI JSON: `https://www.ptbk.io/api/openapi.json`
- Správa klíčů: `https://www.ptbk.io/admin/api-keys` s nezávislým oprávněním `api-keys`.
- Stažení: stejná adresa s `?download=1`, soubor `promptbook-licensing-openapi.json`.
- [Lookup podle ověřeného e-mailu](app-license-email-lookup.md) obsahuje serverové příklady a pravidla cachování; oba API kontrakty zůstávají kompatibilní.

OpenAPI 3.0.3 se generuje ze skutečných Zod validátorů lookupu, striktního v1 snapshotu a výměny identity. Příklady jsou existující syntetické fixture. Dokument je veřejný a nečte zákazníky ani tajné klíče. Swagger používá lokálně servírované připnuté assety `swagger-ui-dist`, bez cizího validátoru či ukládání autorizace. Ručně zadaný klíč dovolí explicitní `Try it out` a `Execute` na stejném webu s cURL, odpovědí, hlavičkami a časem. Aplikační integrace ponechává klíč na backendu; žádný klíč není předvyplněný. [Společné API a životní cyklus klíčů](ecosystem-api.md) popisují nové adresy i kompatibilitu původních cest.

Licenční API nepřidává žádné platební/subscription/fakturační/komunitní údaje. Deaktivované/odstraněné ruční granty se nepočítají do práv App ani komunitních míst. Komunitní grant bez kapacity enginu není softwarová licence. Nikomu se automaticky neodesílá zpráva.

## Nasazení a ověření

Nová aditivní migrace `2026-11-1830-license-administration.sql` přidává metadata, revize a audit ručních grantů a dva service-only read models nad existujícími tabulkami. Produkční prebuild ji spustí standardním migračním mechanismem; nemění přijaté smlouvy, existující platby ani předplatná. Dvě nové závislosti jsou připnuté, Swagger assety připravují predev/prebuild; nejsou závislé na externím CDN.

SQL test v izolovaném PGlite ověřuje celý životní cyklus, bezpečný retry, režimy, konflikt revize, historii, soukromí view a nulový počet vytvořených objednávek/faktur. Route testy kontrolují autentizaci před čtením/zápisem, serverového aktéra, rozsah těla, chyby a 409. Testy skutečného lookup resolveru kontrolují i vyřazení deaktivovaných/odstraněných grantů a vlastní popisek. Editor testy ověřují explicitní vznik bez platebních polí, neomezeno versus nula a samostatný komunitní preset. OpenAPI testy kontrolují runtime fixture a absenci obchodních dat.
