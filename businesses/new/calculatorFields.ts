import type { NumericKey } from './calculatorState';

export const FIELD_LABELS: Record<NumericKey, string> = {
    exchangeRate: 'Kurz USD → Kč', instancesPerClient: 'Prostředí na jednoho klienta',
    volume: 'Počet položek za měsíc', unitsPerItem: 'Jednotek na položku',
    manualMinutes: 'Ruční práce na celou položku (min)', hourlyCost: 'Náklad na člověka (Kč/h)',
    retainedWorkPercent: 'Lidská práce, která zůstane (%)', oversightHours: 'Další dohled (h/měs.)',
    inputTokens: 'Vstupní tokeny na jednotku', outputTokens: 'Výstupní tokeny na jednotku',
    inputPriceUsd: 'Vstup (USD / milion tokenů)', outputPriceUsd: 'Výstup (USD / milion tokenů)',
    aiSubscriptionCzk: 'AI předplatné (Kč/měs.)', retryReservePercent: 'Rezerva na měřenou spotřebu (%)',
    externalPerUnitCzk: 'Další služby (Kč / jednotku)', hostingCzk: 'Server (Kč/měs.)',
    databaseCzk: 'Databáze (Kč/měs.)', backupCzk: 'Zálohy a úložiště (Kč/měs.)',
    toolsCzk: 'Ostatní nástroje (Kč/měs.)', energyCzk: 'Elektřina (Kč/měs.)',
    hardwareCzk: 'Rozpočítaný hardware (Kč/měs.)', serviceFeeCzk: 'Servis za klienta (Kč/měs.)',
    setupFeeCzk: 'Cena nasazení za klienta (Kč)', horizonMonths: 'Horizont výpočtu (měsíce)',
    clients: 'Počet aktivních klientů', paidLicencePercent: 'Skutečně uhrazené licence (%)',
    refundPercent: 'Vratky z uhrazených licencí (%)', partnerHours: 'Obsluha klienta (h/měs.)',
    partnerHourlyCost: 'Interní náklad partnera (Kč/h)', partnerSetupHours: 'Implementace za klienta (h)',
    acquisitionPerClientCzk: 'Získání klienta (Kč)', partnerOverheadCzk: 'Režie portfolia (Kč/měs.)',
};
export const FIELD_GROUPS: { title: string; description: string; keys: NumericKey[]; partnerOnly?: boolean }[] = [
    { title: 'Práce a lidská kontrola', description: 'Ruční čas je za celou položku, ne za každou dílčí jednotku. Kontroly a dohled zůstávají v nákladech.', keys: ['unitsPerItem', 'manualMinutes', 'hourlyCost', 'retainedWorkPercent', 'oversightHours'] },
    { title: 'AI a externí služby', description: 'Tokeny pokrývají celý postup včetně kontextu a nástrojů. Sazby jsou upravitelné modelové odhady, nikoli živý ceník poskytovatele.', keys: ['inputTokens', 'outputTokens', 'inputPriceUsd', 'outputPriceUsd', 'aiSubscriptionCzk', 'externalPerUnitCzk', 'retryReservePercent', 'exchangeRate'] },
    { title: 'Server a ostatní provoz', description: 'Částky za celého klienta. Co je již v ceně serveru, nepřičítejte podruhé. Lokální model také potřebuje hardware a elektřinu.', keys: ['hostingCzk', 'databaseCzk', 'backupCzk', 'toolsCzk', 'energyCzk', 'hardwareCzk'] },
    { title: 'Nasazení, servis a licence', description: 'Nasazení je jednorázové. Další prostředí násobí jen licenci; objem práce a ostatní náklady zadáváte za celého klienta.', keys: ['setupFeeCzk', 'serviceFeeCzk', 'instancesPerClient', 'horizonMonths'] },
    { title: 'Náklady a úhrady partnera', description: 'Podíl je pevně 20 % z uhrazených licencí bez DPH po vratkách. Neplatí pro hosting, AI ani vlastní služby.', keys: ['partnerHours', 'partnerHourlyCost', 'partnerSetupHours', 'acquisitionPerClientCzk', 'partnerOverheadCzk', 'paidLicencePercent', 'refundPercent'], partnerOnly: true },
];
export function numericFieldBounds(key: NumericKey): { min: number; max: number; step: number | 'any' } {
    if (key === 'clients') return { min: 0, max: 5000, step: 1 };
    if (key === 'horizonMonths') return { min: 1, max: 120, step: 1 };
    if (key === 'instancesPerClient') return { min: 1, max: 100, step: 1 };
    if (key === 'exchangeRate') return { min: 0.01, max: 1000, step: 'any' };
    if (key === 'retryReservePercent') return { min: 0, max: 500, step: 'any' };
    if (['retainedWorkPercent', 'paidLicencePercent', 'refundPercent'].includes(key)) return { min: 0, max: 100, step: 'any' };
    return { min: 0, max: 1e9, step: 'any' };
}
