/** Commercial proposal v1.0, 15 October 2026. Not a checkout or a licence agreement. */
export const COMMERCIAL_TERMS = {
    version: '2026-10-15-v1',
    startUsd: 19,
    startDays: 30,
    businessUsd: 100,
    partnerSharePercent: 20,
    responseWorkingHours: 16,
    contact: 'jiri@ptbk.io',
    supportWindow: 'Pondělí–pátek, 9:00–17:00, Europe/Prague, mimo české státní a ostatní svátky.',
    instance: 'Instance je samostatné prostředí jednoho koncového klienta, nikoli fyzický server. Může obsahovat více agentů. Více klientských prostředí na společném serveru vyžaduje více licencí; další samostatná produkční instance se účtuje zvlášť.',
    exclusions: 'Hosting, databáze, úložiště, spotřeba AI modelů a externí služby se platí samostatně. Samostatně se platí také návrh řešení, instalace, integrace, školení a průběžná práce agentury.',
    support: 'Business zahrnuje první posouzení hlášených problémů platformy. První věcná reakce do 16 pracovních hodin znamená posouzení, žádost o potřebné podklady nebo návrh dalšího postupu. Automatické potvrzení přijetí není věcná reakce.',
    supportLimits: 'SLA negarantuje odstranění závady v určitém čase ani dostupnost serveru, aplikace nebo externích služeb. Nezahrnuje nepřetržitou pohotovost, telefonní linku ani servis cizích systémů. Podporovanou verzi a konfiguraci určí objednávka.',
    share: '20 % ze skutečně uhrazených licenčních plateb přivedeného klienta, bez DPH a po odečtení vratek. Platí pro Start i Business, nikoli pro hosting, spotřebu modelů nebo práci agentury.',
    shareTerm: 'Vyúčtování je měsíční, po dobu placeného užívání a trvání partnerské dohody. Přiřazení klienta, splatnost a ukončení nároku upraví partnerská dohoda.',
    publicLicence: 'Samostatný vývoj a neprodukční testování jsou bez licenčního poplatku za podmínek veřejné licence, bez produktové podpory a SLA. Nejde o třetí cenový plán.',
    productionLicence: 'Pro produkční provoz, včetně vlastního hostingu, nabízíme Start nebo Business. Placená licence je potřebná v rozsahu, v němž produkční použití nepovoluje veřejná licence konkrétní verze; již udělená práva a licence jednotlivých součástí tím nejsou dotčeny. Přesný rozsah oprávnění určí licenční podmínky a objednávka.',
} as const;

export const ENGINE_REPOSITORY = 'https://github.com/webgptorg/promptbook';

/** The supplied product brief describes the app as planned, not available for registration. */
export const PRODUCT_AVAILABILITY = {
    app: 'Aplikace od MangoWebu se připravuje. Orientační cíl je kolem 20. listopadu 2026, nikoli garantovaný termín. Dnes se engine ovládá přes terminál; technické nasazení řešíte s partnerem.',
    enquiryOnly: 'Domluva pilotu, nikoli online objednávka. Nabídka nenahrazuje licenční smlouvu ani partnerskou dohodu.',
} as const;

export const enquiry = (subject: string) => `mailto:${COMMERCIAL_TERMS.contact}?subject=${encodeURIComponent(subject)}`;
