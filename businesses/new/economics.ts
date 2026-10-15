import { COMMERCIAL_TERMS } from './commercialTerms';

export type ScenarioId = 'email' | 'documents' | 'social' | 'video' | 'coding';
export type PlanId = 'start' | 'business';
export type AiBilling = 'tokens' | 'subscription' | 'local';
export type CostPayer = 'client' | 'partner';

export interface EconomicsInput {
    plan: PlanId;
    aiBilling: AiBilling;
    costPayer: CostPayer;
    exchangeRate: number;
    instancesPerClient: number;
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
    databaseCzk: number;
    backupCzk: number;
    toolsCzk: number;
    energyCzk: number;
    hardwareCzk: number;
    serviceFeeCzk: number;
    setupFeeCzk: number;
    horizonMonths: number;
    clients: number;
    paidLicencePercent: number;
    refundPercent: number;
    partnerHours: number;
    partnerHourlyCost: number;
    partnerSetupHours: number;
    acquisitionPerClientCzk: number;
    partnerOverheadCzk: number;
}

/** Workloads, labour rates, exchange rate and provider costs are editable examples, not benchmarks. */
export const DEFAULT_INPUT: EconomicsInput = {
    plan: 'business', aiBilling: 'tokens', costPayer: 'client', exchangeRate: 22, instancesPerClient: 1,
    volume: 300, unitsPerItem: 2, manualMinutes: 8, hourlyCost: 550,
    retainedWorkPercent: 25, oversightHours: 2,
    inputTokens: 5000, outputTokens: 800, inputPriceUsd: 3, outputPriceUsd: 15,
    aiSubscriptionCzk: 1500, retryReservePercent: 25, externalPerUnitCzk: 0,
    hostingCzk: 500, databaseCzk: 0, backupCzk: 100, toolsCzk: 0, energyCzk: 0, hardwareCzk: 0,
    serviceFeeCzk: 2500, setupFeeCzk: 15000, horizonMonths: 12,
    clients: 10, paidLicencePercent: 100, refundPercent: 0,
    partnerHours: 2, partnerHourlyCost: 600, partnerSetupHours: 12,
    acquisitionPerClientCzk: 2000, partnerOverheadCzk: 2000,
};

export const SCENARIOS: Record<ScenarioId, {
    title: string; volumeLabel: string; unitsLabel: string; unit: string;
    description: string; example: string; defaults: Partial<EconomicsInput>;
}> = {
    email: {
        title: 'E-maily a komunikace', volumeLabel: 'E-mailů za měsíc',
        unitsLabel: 'Zpráv v kontextu jednoho e-mailu', unit: 'zprávu v kontextu',
        description: 'Třídění příchozí komunikace a návrhy odpovědí podle znalostí a pravidel firmy.',
        example: 'Příchozí dotaz → návrh odpovědi → schválení nebo odeslání podle nastavených pravidel.',
        defaults: { volume: 500, unitsPerItem: 3, manualMinutes: 6, hourlyCost: 500, retainedWorkPercent: 30,
            oversightHours: 2, inputTokens: 4000, outputTokens: 600, externalPerUnitCzk: 0, hostingCzk: 500 },
    },
    documents: {
        title: 'Účetní podklady', volumeLabel: 'Dokladů za měsíc',
        unitsLabel: 'Průměrný počet stran / doklad', unit: 'stranu',
        description: 'Příjem dokladů, vytěžení údajů a příprava podkladů pro účetní.',
        example: 'Z e-mailu do přehledných podkladů. Výjimky a odborná odpovědnost zůstávají člověku.',
        defaults: { volume: 300, unitsPerItem: 2, manualMinutes: 8, hourlyCost: 550, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 5000, outputTokens: 800, externalPerUnitCzk: 0, hostingCzk: 500 },
    },
    social: {
        title: 'Sociální sítě', volumeLabel: 'Témat příspěvků za měsíc',
        unitsLabel: 'Sítí na jedno téma', unit: 'variantu pro jednu síť',
        description: 'Příprava obsahu pro Facebook, Instagram a LinkedIn podle obsahového plánu.',
        example: 'Jedno téma → varianty pro sítě → schválení a publikace podle vašich pravidel.',
        defaults: { volume: 20, unitsPerItem: 3, manualMinutes: 90, hourlyCost: 700, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 16000, outputTokens: 4000, externalPerUnitCzk: 10, hostingCzk: 500 },
    },
    video: {
        title: 'Video → obsah', volumeLabel: 'Videí za měsíc',
        unitsLabel: 'Průměrná délka videa v minutách', unit: 'minutu zdrojového videa',
        description: 'Z videa na YouTube vzniknou podklady pro přepis, článek i příspěvky.',
        example: 'Jedna nahrávka → více výstupů → publikace podle vašich pravidel.',
        defaults: { volume: 8, unitsPerItem: 30, manualMinutes: 240, hourlyCost: 800, retainedWorkPercent: 25,
            oversightHours: 2, inputTokens: 2000, outputTokens: 600, externalPerUnitCzk: 1, hostingCzk: 900 },
    },
    coding: {
        title: 'Web, který se udržuje', volumeLabel: 'Údržbových úkolů za měsíc',
        unitsLabel: 'Webů na jeden úkol', unit: 'úkol na jednom webu',
        description: 'Údržba webu, aktualizace závislostí a testování změn v repozitáři.',
        example: 'Zadaná údržba → návrh opravy → testy → nasazení podle pravidel.',
        defaults: { volume: 12, unitsPerItem: 1, manualMinutes: 75, hourlyCost: 1200, retainedWorkPercent: 30,
            oversightHours: 2, inputTokens: 180000, outputTokens: 18000, externalPerUnitCzk: 0, hostingCzk: 900 },
    },
};

/** Sanitize direct calls as well as form input. A Start pilot is one environment for one 30-day period. */
export function normalizeInput(input: EconomicsInput): EconomicsInput {
    const result = { ...input };
    for (const key of Object.keys(result) as (keyof EconomicsInput)[]) {
        if (typeof result[key] === 'number') {
            const value = result[key] as number;
            (result as unknown as Record<string, unknown>)[key] = Number.isFinite(value)
                ? Math.min(1e9, Math.max(0, value)) : 0;
        }
    }
    result.plan = input.plan === 'start' ? 'start' : 'business';
    result.aiBilling = ['tokens', 'subscription', 'local'].includes(input.aiBilling) ? input.aiBilling : 'tokens';
    result.costPayer = input.costPayer === 'partner' ? 'partner' : 'client';
    result.exchangeRate = Math.max(0.01, Math.min(1000, result.exchangeRate));
    result.horizonMonths = result.plan === 'start' ? 1 : Math.max(1, Math.min(120, Math.floor(result.horizonMonths)));
    result.instancesPerClient = result.plan === 'start' ? 1 : Math.max(1, Math.min(100, Math.floor(result.instancesPerClient)));
    result.clients = Math.min(5000, Math.floor(result.clients));
    result.retainedWorkPercent = Math.min(100, result.retainedWorkPercent);
    result.paidLicencePercent = Math.min(100, result.paidLicencePercent);
    result.refundPercent = Math.min(100, result.refundPercent);
    result.retryReservePercent = Math.min(500, result.retryReservePercent);
    return result;
}

/**
 * CZK excluding VAT. Period = month for Business, the entire 30-day pilot for Start.
 * Workload and non-licence costs describe a WHOLE CLIENT, not each instance.
 * No automatic pilot renewal/conversion; partner share has no invented 12-month expiry.
 */
export function calculateEconomics(raw: EconomicsInput) {
    const i = normalizeInput(raw);
    const isPilot = i.plan === 'start';
    const licence = (isPilot ? COMMERCIAL_TERMS.startUsd : COMMERCIAL_TERMS.businessUsd)
        * i.instancesPerClient * i.exchangeRate;
    const units = i.volume * i.unitsPerItem;
    const tokenCost = units * (i.inputTokens * i.inputPriceUsd + i.outputTokens * i.outputPriceUsd)
        / 1_000_000 * i.exchangeRate;
    const ai = i.aiBilling === 'tokens' ? tokenCost : i.aiBilling === 'subscription' ? i.aiSubscriptionCzk : 0;
    const external = units * i.externalPerUnitCzk;
    const reserve = ((i.aiBilling === 'tokens' ? ai : 0) + external) * i.retryReservePercent / 100;
    const infrastructure = i.hostingCzk + i.databaseCzk + i.backupCzk + i.energyCzk + i.hardwareCzk;
    const thirdPartyCosts = ai + external + reserve + infrastructure + i.toolsCzk;
    // When partner pays, the entered service fee includes those costs: do not charge the client twice.
    const clientDirectCosts = i.costPayer === 'client' ? thirdPartyCosts : 0;
    const operatingCost = licence + clientDirectCosts + i.serviceFeeCzk;
    const baselineHours = i.volume * i.manualMinutes / 60;
    const remainingHours = baselineHours * i.retainedWorkPercent / 100 + i.oversightHours;
    const savedHours = baselineHours - remainingHours;
    const baselineCost = baselineHours * i.hourlyCost;
    const remainingWorkCost = remainingHours * i.hourlyCost;
    const economicCost = operatingCost + remainingWorkCost;
    const netBenefit = baselineCost - economicCost;
    const horizonCost = economicCost * i.horizonMonths + i.setupFeeCzk;
    const horizonBenefit = baselineCost * i.horizonMonths - horizonCost;
    const rawPayback = netBenefit > 0 ? i.setupFeeCzk / netBenefit : null;
    // Never extrapolate cheap pilot economics beyond the pilot's actual life.
    const paybackMonths = isPilot && rawPayback !== null && rawPayback > 1 ? null : rawPayback;

    const netPaidLicences = i.clients * licence * i.paidLicencePercent / 100 * (1 - i.refundPercent / 100);
    const licenceShare = netPaidLicences * COMMERCIAL_TERMS.partnerSharePercent / 100;
    const services = i.clients * i.serviceFeeCzk;
    const periodRevenue = services + licenceShare;
    const partnerThirdPartyCosts = i.costPayer === 'partner' ? thirdPartyCosts * i.clients : 0;
    const deliveryCost = i.clients * i.partnerHours * i.partnerHourlyCost + i.partnerOverheadCzk + partnerThirdPartyCosts;
    const setupRevenue = i.clients * i.setupFeeCzk;
    const setupCost = i.clients * (i.partnerSetupHours * i.partnerHourlyCost + i.acquisitionPerClientCzk);
    const horizonRevenue = periodRevenue * i.horizonMonths + setupRevenue;
    const horizonPartnerCost = deliveryCost * i.horizonMonths + setupCost;
    return {
        input: i, isPilot, licence, units, ai, external, reserve, infrastructure, thirdPartyCosts,
        clientDirectCosts, operatingCost, baselineHours, remainingHours, savedHours, baselineCost,
        remainingWorkCost, economicCost, netBenefit, horizonCost, horizonBenefit, paybackMonths,
        partner: {
            netPaidLicences, licenceShare, services, periodRevenue,
            recurringRevenue: isPilot ? 0 : periodRevenue,
            partnerThirdPartyCosts, deliveryCost, periodContribution: periodRevenue - deliveryCost,
            setupRevenue, setupCost, setupContribution: setupRevenue - setupCost,
            horizonRevenue, horizonPartnerCost, horizonContribution: horizonRevenue - horizonPartnerCost,
        },
    };
}

/** Readable, complete local export. Includes the fixed offer version and every assumption/result. */
export function exportEconomics(input: EconomicsInput, scenario: ScenarioId, mode: 'company' | 'partner'): string {
    const result = calculateEconomics(input);
    return [
        'PROMPTBOOK — ORIENTAČNÍ KALKULACE',
        `Scénář: ${SCENARIOS[scenario].title}`,
        `Režim: ${mode === 'company' ? 'Vlastní agenda' : 'Partnerské nasazení'}`,
        `Nabídka: ${COMMERCIAL_TERMS.version}. Start 19 USD / 30 dní jednorázově; Business 100 USD / instanci / měsíc.`,
        `Období: ${result.isPilot ? 'jeden 30denní pilot, bez automatického pokračování' : `${result.input.horizonMonths} měsíců Business`}.`,
        'Částky CZK bez DPH; kurz, náklady a úspory jsou modelové předpoklady.',
        `${COMMERCIAL_TERMS.share} ${COMMERCIAL_TERMS.shareTerm}`,
        'Úspora kapacity není automaticky hotovostní úspora mezd. Tržby nejsou zisk.',
        'Stálý počet klientů od začátku, bez růstu/odchodů a daně z příjmů. Podíl předpokládá trvající dohodu.',
        '', 'Všechny vstupy a výsledky (pojmenování podle výpočetního modelu):',
        JSON.stringify(result, null, 2),
    ].join('\n');
}
