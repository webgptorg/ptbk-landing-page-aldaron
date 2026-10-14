export type ScenarioId = 'documents' | 'social' | 'video' | 'coding';
export type PlanId = 'engine' | 'starter' | 'business' | 'custom';
export type AiBilling = 'tokens' | 'subscription' | 'local';

/** Proposed app prices, not inference/hosting prices or published contractual terms. */
export const APP_PRICES_USD = { engine: 0, starter: 10, business: 100 } as const;

export interface EconomicsInput {
    plan: PlanId;
    aiBilling: AiBilling;
    exchangeRate: number;
    customLicenseUsd: number;
    volume: number;
    unitsPerItem: number;
    manualMinutes: number;
    hourlyCost: number;
    retainedWorkPercent: number;
    oversightHours: number;
    inputTokens: number;
    outputTokens: number;
    inputPriceUsd: number;
    outputPriceUsd: number;
    aiSubscriptionCzk: number;
    retryReservePercent: number;
    externalPerUnitCzk: number;
    hostingCzk: number;
    backupCzk: number;
    toolsCzk: number;
    energyCzk: number;
    hardwareCzk: number;
    serviceFeeCzk: number;
    setupFeeCzk: number;
    horizonMonths: number;
    clients: number;
    commissionPercent: number;
    commissionMonths: number;
    partnerHours: number;
    partnerHourlyCost: number;
    partnerSetupHours: number;
    acquisitionPerClientCzk: number;
    partnerOverheadCzk: number;
}

/** Illustrative editable assumptions. These are NOT measured benchmarks, wages, exchange quotes or provider tariffs. */
export const DEFAULT_INPUT: EconomicsInput = {
    plan: 'business', aiBilling: 'tokens', exchangeRate: 22, customLicenseUsd: 100,
    volume: 300, unitsPerItem: 2, manualMinutes: 8, hourlyCost: 550,
    retainedWorkPercent: 25, oversightHours: 2,
    inputTokens: 5000, outputTokens: 800, inputPriceUsd: 3, outputPriceUsd: 15,
    aiSubscriptionCzk: 1500, retryReservePercent: 25, externalPerUnitCzk: 0,
    hostingCzk: 500, backupCzk: 100, toolsCzk: 0, energyCzk: 0, hardwareCzk: 0,
    serviceFeeCzk: 2500, setupFeeCzk: 15000, horizonMonths: 12,
    clients: 10, commissionPercent: 20, commissionMonths: 12,
    partnerHours: 2, partnerHourlyCost: 600, partnerSetupHours: 12,
    acquisitionPerClientCzk: 2000, partnerOverheadCzk: 2000,
};

export const SCENARIOS: Record<ScenarioId, {
    title: string; short: string; volumeLabel: string; unitsLabel: string; unit: string;
    description: string; example: string; defaults: Partial<EconomicsInput>;
}> = {
    documents: {
        title: 'Účetní doklady', short: 'Doklady', volumeLabel: 'Dokladů za měsíc',
        unitsLabel: 'Průměrný počet stran / doklad', unit: 'stranu',
        description: 'Příjem dokladů, vytěžení údajů, kontrola a příprava podkladů pro účetní.',
        example: 'Z e-mailu do přehledných podkladů. Nestandardní doklad čeká na kontrolu člověkem.',
        defaults: { volume: 300, unitsPerItem: 2, manualMinutes: 8, hourlyCost: 550, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 5000, outputTokens: 800, externalPerUnitCzk: 0, hostingCzk: 500 },
    },
    social: {
        title: 'Sociální sítě', short: 'Sociální sítě', volumeLabel: 'Témat příspěvků za měsíc',
        unitsLabel: 'Sítí na jedno téma', unit: 'variantu pro jednu síť',
        description: 'Z jednoho tématu připravte příspěvky pro Facebook, Instagram a LinkedIn.',
        example: 'Návrh textů a vizuálů, schválení a publikace podle obsahového plánu.',
        defaults: { volume: 20, unitsPerItem: 3, manualMinutes: 90, hourlyCost: 700, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 16000, outputTokens: 4000, externalPerUnitCzk: 10, hostingCzk: 500 },
    },
    video: {
        title: 'Video → obsah', short: 'Video → obsah', volumeLabel: 'Videí za měsíc',
        unitsLabel: 'Průměrná délka videa v minutách', unit: 'minutu zdrojového videa',
        description: 'Z videa na YouTube vznikne přepis, článek, popis i navazující příspěvky.',
        example: 'Jedna nahrávka. Více výstupů. Publikace až podle vašich pravidel.',
        defaults: { volume: 8, unitsPerItem: 30, manualMinutes: 240, hourlyCost: 800, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 2000, outputTokens: 600, externalPerUnitCzk: 1, hostingCzk: 900 },
    },
    coding: {
        title: 'Web, který se udržuje', short: 'Údržba webu', volumeLabel: 'Údržbových úkolů za měsíc',
        unitsLabel: 'Webů na jeden úkol', unit: 'úkol na jednom webu',
        description: 'Kontrola webu, aktualizace závislostí, opravy a testování změn v repozitáři.',
        example: 'Zjištěný problém → návrh opravy → testy → kontrola a nasazení.',
        defaults: { volume: 12, unitsPerItem: 1, manualMinutes: 75, hourlyCost: 1200, retainedWorkPercent: 30,
            oversightHours: 2, inputTokens: 180000, outputTokens: 18000, externalPerUnitCzk: 0, hostingCzk: 900 },
    },
};

/** Bounds make empty, negative, non-finite and extreme input safe in both UI and direct calls. */
export function normalizeInput(input: EconomicsInput): EconomicsInput {
    const result = { ...input };
    for (const key of Object.keys(result) as (keyof EconomicsInput)[]) {
        if (typeof result[key] === 'number') {
            const value = result[key] as number;
            (result as unknown as Record<string, unknown>)[key] = Number.isFinite(value)
                ? Math.min(1e9, Math.max(0, value)) : 0;
        }
    }
    result.exchangeRate = Math.max(0.01, result.exchangeRate);
    result.horizonMonths = Math.max(1, Math.min(120, Math.floor(result.horizonMonths)));
    result.commissionMonths = Math.min(120, Math.floor(result.commissionMonths));
    result.clients = Math.min(5000, Math.floor(result.clients));
    result.retainedWorkPercent = Math.min(100, result.retainedWorkPercent);
    result.commissionPercent = Math.min(100, result.commissionPercent);
    result.retryReservePercent = Math.min(500, result.retryReservePercent);
    return result;
}

/** All monetary results are CZK excluding VAT; setup is a one-off, never silently a monthly charge. */
export function calculateEconomics(raw: EconomicsInput) {
    const i = normalizeInput(raw);
    const licence = (i.plan === 'custom' ? i.customLicenseUsd : APP_PRICES_USD[i.plan]) * i.exchangeRate;
    const units = i.volume * i.unitsPerItem;
    const tokenCost = units * (i.inputTokens * i.inputPriceUsd + i.outputTokens * i.outputPriceUsd)
        / 1_000_000 * i.exchangeRate;
    const ai = i.aiBilling === 'tokens' ? tokenCost : i.aiBilling === 'subscription' ? i.aiSubscriptionCzk : 0;
    const external = units * i.externalPerUnitCzk;
    // A fixed subscription is not charged again for retries. The reserve covers metered services only.
    const reserve = ((i.aiBilling === 'tokens' ? ai : 0) + external) * i.retryReservePercent / 100;
    const infrastructure = i.hostingCzk + i.backupCzk + i.energyCzk + i.hardwareCzk;
    const cashMonthly = licence + ai + external + reserve + infrastructure + i.toolsCzk + i.serviceFeeCzk;
    const baselineHours = i.volume * i.manualMinutes / 60;
    const remainingHours = baselineHours * i.retainedWorkPercent / 100 + i.oversightHours;
    const savedHours = baselineHours - remainingHours;
    const baselineCost = baselineHours * i.hourlyCost;
    const remainingWorkCost = remainingHours * i.hourlyCost;
    const economicMonthly = cashMonthly + remainingWorkCost;
    const netMonthly = baselineCost - economicMonthly;
    const horizonCost = economicMonthly * i.horizonMonths + i.setupFeeCzk;
    const horizonBenefit = baselineCost * i.horizonMonths - horizonCost;
    const paybackMonths = netMonthly > 0 ? i.setupFeeCzk / netMonthly : null;

    const monthlyCommission = i.clients * licence * i.commissionPercent / 100;
    const monthlyServices = i.clients * i.serviceFeeCzk;
    const recurringRevenue = monthlyServices + (i.commissionMonths > 0 ? monthlyCommission : 0);
    const deliveryCost = i.clients * i.partnerHours * i.partnerHourlyCost + i.partnerOverheadCzk;
    const setupRevenue = i.clients * i.setupFeeCzk;
    const setupCost = i.clients * (i.partnerSetupHours * i.partnerHourlyCost + i.acquisitionPerClientCzk);
    const horizonRevenue = monthlyServices * i.horizonMonths
        + monthlyCommission * Math.min(i.horizonMonths, i.commissionMonths) + setupRevenue;
    const horizonPartnerCost = deliveryCost * i.horizonMonths + setupCost;
    return {
        input: i, licence, units, ai, external, reserve, infrastructure, cashMonthly,
        baselineHours, remainingHours, savedHours, baselineCost, remainingWorkCost, economicMonthly,
        netMonthly, horizonCost, horizonBenefit, paybackMonths,
        partner: {
            monthlyCommission: i.commissionMonths > 0 ? monthlyCommission : 0, monthlyServices,
            recurringRevenue, deliveryCost, monthlyContribution: recurringRevenue - deliveryCost,
            afterCommissionRevenue: monthlyServices,
            afterCommissionContribution: monthlyServices - deliveryCost,
            setupRevenue, setupCost, setupContribution: setupRevenue - setupCost,
            horizonRevenue, horizonPartnerCost, horizonContribution: horizonRevenue - horizonPartnerCost,
        },
    };
}
