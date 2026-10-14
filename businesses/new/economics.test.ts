import { describe, expect, it } from 'vitest';
import { APP_PRICES_USD, calculateEconomics, DEFAULT_INPUT, SCENARIOS } from './economics';

describe('Promptbook economics', () => {
    it('keeps the engine free and charges only the app licence', () => {
        expect(calculateEconomics({ ...DEFAULT_INPUT, plan: 'engine' }).licence).toBe(0);
        expect(calculateEconomics({ ...DEFAULT_INPUT, plan: 'starter' }).licence).toBe(220);
        expect(APP_PRICES_USD.business).toBe(100);
    });
    it('counts tokens, infrastructure, human review and setup exactly once', () => {
        const r = calculateEconomics(DEFAULT_INPUT);
        expect(r.ai).toBeCloseTo(356.4);
        expect(r.reserve).toBeCloseTo(89.1);
        expect(r.cashMonthly).toBeCloseTo(5745.5);
        expect(r.baselineHours).toBe(40);
        expect(r.remainingHours).toBe(12);
        expect(r.savedHours).toBe(28);
        expect(r.netMonthly).toBeCloseTo(9654.5);
        expect(r.horizonBenefit).toBeCloseTo(r.netMonthly * 12 - 15000);
        expect(r.paybackMonths).toBeCloseTo(15000 / r.netMonthly);
    });
    it('does not add token usage or token retries to a subscription', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, aiBilling: 'subscription' });
        expect(r.ai).toBe(1500);
        expect(r.reserve).toBe(0);
    });
    it('includes hardware and energy for local inference but no token bill', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, aiBilling: 'local', hardwareCzk: 2000, energyCzk: 300 });
        expect(r.ai).toBe(0);
        expect(r.infrastructure).toBe(2900);
    });
    it('multiplies metered costs by pages, channels, minutes or websites', () => {
        const first = calculateEconomics(DEFAULT_INPUT);
        const second = calculateEconomics({ ...DEFAULT_INPUT, unitsPerItem: 4 });
        expect(second.ai).toBeCloseTo(first.ai * 2);
        expect(second.licence).toBe(first.licence);
        expect(second.baselineHours).toBe(first.baselineHours);
    });
    it('preserves a negative business case instead of inventing savings', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, volume: 0 });
        expect(r.netMonthly).toBeLessThan(0);
        expect(r.savedHours).toBeLessThan(0);
        expect(r.paybackMonths).toBeNull();
    });
    it('separates partner revenue, delivery costs and limited commission duration', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, horizonMonths: 24 }).partner;
        expect(r.monthlyCommission).toBe(4400);
        expect(r.monthlyServices).toBe(25000);
        expect(r.recurringRevenue).toBe(29400);
        expect(r.deliveryCost).toBe(14000);
        expect(r.setupRevenue).toBe(150000);
        expect(r.setupCost).toBe(92000);
        expect(r.horizonRevenue).toBe(25000 * 24 + 4400 * 12 + 150000);
        expect(r.afterCommissionContribution).toBe(11000);
        expect(r.horizonContribution).toBe(r.horizonRevenue - r.horizonPartnerCost);
    });
    it('does not treat client-paid tokens or hosting as partner revenue or costs', () => {
        const a = calculateEconomics(DEFAULT_INPUT);
        const b = calculateEconomics({ ...DEFAULT_INPUT, hostingCzk: 10000, inputPriceUsd: 999 });
        expect(b.cashMonthly).toBeGreaterThan(a.cashMonthly);
        expect(b.partner).toEqual(a.partner);
    });
    it('handles zero clients, zero commission and no setup without divisions by zero', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, clients: 0, commissionMonths: 0, setupFeeCzk: 0 });
        expect(r.partner.recurringRevenue).toBe(0);
        expect(r.partner.setupRevenue).toBe(0);
        expect(r.partner.monthlyContribution).toBe(-DEFAULT_INPUT.partnerOverheadCzk);
        expect(r.paybackMonths).toBe(0);
    });
    it('normalizes invalid numerical inputs', () => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, volume: NaN, clients: -4, exchangeRate: 0,
            inputTokens: Infinity, horizonMonths: 0, commissionPercent: 999, retainedWorkPercent: -10 });
        expect(r.input.volume).toBe(0);
        expect(r.input.clients).toBe(0);
        expect(r.input.horizonMonths).toBe(1);
        expect(r.input.commissionPercent).toBe(100);
        expect(Number.isFinite(r.horizonCost)).toBe(true);
    });
    it.each(Object.keys(SCENARIOS))('has a finite editable model for %s', (id) => {
        const r = calculateEconomics({ ...DEFAULT_INPUT, ...SCENARIOS[id as keyof typeof SCENARIOS].defaults });
        expect(Number.isFinite(r.netMonthly)).toBe(true);
        expect(r.units).toBeGreaterThan(0);
    });
});
