import { describe, expect, it } from 'vitest';
import { calculateEconomics, DEFAULT_INPUT, exportEconomics, normalizeInput, SCENARIOS, type EconomicsInput, type ScenarioId } from './economics';
import { COMMERCIAL_TERMS } from './commercialTerms';

const calculate = (changes: Partial<EconomicsInput> = {}) => calculateEconomics({ ...DEFAULT_INPUT, ...changes });

describe('commercial offer v1.0', () => {
    it('prices a Business environment, not agents or physical machines', () => {
        expect(calculate().licence).toBe(2200);
        const three = calculate({ instancesPerClient: 3 });
        expect(three.licence).toBe(6600);
        expect(three.thirdPartyCosts).toBe(calculate().thirdPartyCosts);
        expect(three.baselineCost).toBe(calculate().baselineCost);
    });
    it('Start is 19 USD once for one environment and only 30 days', () => {
        const pilot = calculate({ plan: 'start', horizonMonths: 24, instancesPerClient: 5 });
        expect(pilot.licence).toBe(418);
        expect(pilot.input.horizonMonths).toBe(1);
        expect(pilot.input.instancesPerClient).toBe(1);
        expect(pilot.horizonCost).toBe(pilot.economicCost + DEFAULT_INPUT.setupFeeCzk);
        expect(pilot.partner.recurringRevenue).toBe(0);
        expect(pilot.partner.licenceShare).toBeCloseTo(836);
    });
    it('does not extrapolate pilot payback past its life', () => {
        expect(calculate({ plan: 'start', setupFeeCzk: 1e8 }).paybackMonths).toBeNull();
        expect(calculate({ plan: 'start', setupFeeCzk: 0 }).paybackMonths).toBe(0);
    });
    it('uses 20 percent and never expires it arbitrarily after 12 months', () => {
        const r = calculate({ horizonMonths: 24, exchangeRate: 1, clients: 1, serviceFeeCzk: 0, setupFeeCzk: 0 });
        expect(r.partner.licenceShare).toBe(20);
        expect(r.partner.horizonRevenue).toBe(480);
        expect(COMMERCIAL_TERMS.partnerSharePercent).toBe(20);
    });
    it('gives 3.80 USD from one paid Start', () => {
        expect(calculate({ plan: 'start', exchangeRate: 1, clients: 1 }).partner.licenceShare).toBeCloseTo(3.8);
    });
    it('excludes unpaid licences and deducts refunds from the paid amount', () => {
        const r = calculate({ clients: 1, exchangeRate: 1, paidLicencePercent: 50, refundPercent: 20 });
        expect(r.partner.netPaidLicences).toBe(40);
        expect(r.partner.licenceShare).toBe(8);
    });
    it.each([{ paidLicencePercent: 0 }, { refundPercent: 100 }])('no share without net paid licence: %o', (change) => {
        expect(calculate(change).partner.licenceShare).toBe(0);
    });
    it('does not include third-party costs, services or setup in the share base', () => {
        expect(calculate({ hostingCzk: 10000, serviceFeeCzk: 50000, setupFeeCzk: 90000 }).partner.licenceShare)
            .toBe(calculate().partner.licenceShare);
    });
});

describe('whole-client economics', () => {
    it('has explicit tokens and reserve for the whole workflow', () => {
        const r = calculate();
        expect(r.units).toBe(600);
        expect(r.ai).toBeCloseTo(356.4);
        expect(r.reserve).toBeCloseTo(89.1);
        expect(r.operatingCost).toBeCloseTo(5745.5);
        expect(r.baselineHours).toBe(40);
        expect(r.remainingHours).toBe(12);
        expect(r.netBenefit).toBeCloseTo(9654.5);
    });
    it('charges a subscription instead of tokens, without a retry markup', () => {
        const r = calculate({ aiBilling: 'subscription', externalPerUnitCzk: 1 });
        expect(r.ai).toBe(1500);
        expect(r.reserve).toBe(150);
    });
    it('local inference is not free infrastructure', () => {
        const r = calculate({ aiBilling: 'local', hardwareCzk: 2000, energyCzk: 100 });
        expect(r.ai).toBe(0);
        expect(r.infrastructure).toBe(2700);
    });
    it('keeps the manually specified complete-item time independent of units', () => {
        expect(calculate({ unitsPerItem: 9 }).baselineHours).toBe(40);
        expect(calculate({ unitsPerItem: 9 }).ai).toBeGreaterThan(calculate().ai);
    });
    it('retains negative benefits, remaining work and no payback at zero workload', () => {
        const r = calculate({ volume: 0 });
        expect(r.ai).toBe(0);
        expect(r.remainingHours).toBe(2);
        expect(r.netBenefit).toBeLessThan(0);
        expect(r.paybackMonths).toBeNull();
    });
    it('counts setup only once and never as monthly revenue', () => {
        const r = calculate();
        expect(r.horizonBenefit).toBeCloseTo(r.netBenefit * 12 - DEFAULT_INPUT.setupFeeCzk);
        expect(r.partner.recurringRevenue).toBe(29400);
        expect(r.partner.horizonRevenue).toBe(502800);
        expect(r.partner.horizonContribution).toBe(242800);
    });
    it('moves third-party costs to the partner without double billing the client', () => {
        const direct = calculate();
        const managed = calculate({ costPayer: 'partner' });
        expect(managed.operatingCost).toBe(2200 + 2500);
        expect(managed.partner.partnerThirdPartyCosts).toBeCloseTo(direct.thirdPartyCosts * 10);
        expect(managed.partner.periodContribution).toBeCloseTo(direct.partner.periodContribution - direct.thirdPartyCosts * 10);
        expect(managed.licence).toBe(direct.licence);
    });
    it('includes database costs once', () => {
        expect(calculate({ databaseCzk: 250 }).operatingCost - calculate().operatingCost).toBe(250);
    });
    it('zero clients yields zero revenue but retains portfolio overhead', () => {
        const r = calculate({ clients: 0 });
        expect(r.partner.periodRevenue).toBe(0);
        expect(r.partner.setupRevenue).toBe(0);
        expect(r.partner.periodContribution).toBe(-2000);
    });
    it('normalizes non-finite, negative and integer-only inputs', () => {
        const i = normalizeInput({ ...DEFAULT_INPUT, clients: 3.9, volume: NaN, hostingCzk: -1, refundPercent: 200,
            horizonMonths: 1000, instancesPerClient: 2.9, exchangeRate: Infinity });
        expect(i.clients).toBe(3); expect(i.instancesPerClient).toBe(2); expect(i.volume).toBe(0);
        expect(i.hostingCzk).toBe(0); expect(i.refundPercent).toBe(100);
        expect(i.horizonMonths).toBe(120); expect(i.exchangeRate).toBe(0.01);
    });
    it.each(Object.keys(SCENARIOS) as ScenarioId[])('calculates finite results for %s', (scenario) => {
        const r = calculate(SCENARIOS[scenario].defaults);
        expect(Number.isFinite(r.netBenefit)).toBe(true);
        expect(Number.isFinite(r.partner.horizonContribution)).toBe(true);
    });
    it('exports the offer version, every input and every result with a one-period pilot', () => {
        const text = exportEconomics({ ...DEFAULT_INPUT, plan: 'start' }, 'documents', 'partner');
        expect(text).toContain(COMMERCIAL_TERMS.version);
        expect(text).toContain('bez automatického pokračování');
        expect(text).toContain('"horizonMonths": 1');
        expect(text).toContain('"recurringRevenue": 0');
        expect(text).toContain('"databaseCzk": 0');
        expect(text).not.toContain('commissionMonths');
    });
});
