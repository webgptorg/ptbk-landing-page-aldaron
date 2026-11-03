import { describe, expect, it } from 'vitest';
import { calculateEconomics, DEFAULT_INPUT, SCENARIOS, type ScenarioId } from './economics';
import { calculatorPath, changeScenario, defaultCalculatorState, NUMERIC_KEYS, parseCalculatorState, serializeCalculatorState } from './calculatorState';
import { createCalculationPdfDefinition } from './calculationPdf';

describe('complete public calculator state', () => {
    it('starts with the social preset while preserving explicit saved scenarios', () => {
        const state = defaultCalculatorState();
        expect(state.scenario).toBe('social');
        expect(state.input).toMatchObject(SCENARIOS.social.defaults);
        const saved = parseCalculatorState(new URLSearchParams('scenario=documents'));
        expect(saved.scenario).toBe('documents');
        expect(saved.input).toMatchObject(SCENARIOS.documents.defaults);
    });
    it('round-trips all fields, mode, scenario and hidden values', () => {
        const state = changeScenario(defaultCalculatorState('partner'),'video');
        state.input = { ...state.input, plan:'start', aiBilling:'subscription', costPayer:'partner',
            horizonMonths:24, instancesPerClient:3, inputPriceUsd:7.25, refundPercent:13,
            databaseCzk:241, partnerSetupHours:22, clients:17, hardwareCzk:1749 };
        const restored = parseCalculatorState(new URLSearchParams(serializeCalculatorState(state)));
        expect(restored).toEqual(state);
        expect(calculateEconomics(restored.input).input.horizonMonths).toBe(1);
        expect(calculateEconomics(restored.input).input.instancesPerClient).toBe(1);
        for (const key of Object.keys(DEFAULT_INPUT)) expect(new URLSearchParams(serializeCalculatorState(state)).has(key)).toBe(true);
    });
    it('ignores identity, prototypes, unknown enums and commission overrides', () => {
        const state = parseCalculatorState(new URLSearchParams('scenario=__proto__&mode=admin&plan=enterprise&aiBilling=other&costPayer=other&commissionPercent=99&partnerSharePercent=100&email=secret%40example.com&__proto__=test'));
        expect(state).toEqual(defaultCalculatorState());
        const serialized = serializeCalculatorState(state);
        expect(serialized).not.toContain('secret');expect(serialized).not.toContain('commissionPercent');
        expect(calculateEconomics(state.input).partner.licenceShare).toBe(4400);
    });
    it('bounds URL numbers and falls back for non-finite input', () => {
        const state = parseCalculatorState(new URLSearchParams('volume=NaN&clients=-2&refundPercent=150&horizonMonths=24.9&exchangeRate=Infinity&hostingCzk=-1'));
        expect(state.input.volume).toBe(20);expect(state.input.clients).toBe(0);
        expect(state.input.refundPercent).toBe(100);expect(state.input.horizonMonths).toBe(24);
        expect(state.input.exchangeRate).toBe(22);expect(state.input.hostingCzk).toBe(0);
    });
    it.each(Object.keys(SCENARIOS) as ScenarioId[])('uses the %s preset before explicit URL overrides', scenario => {
        const state = parseCalculatorState(new URLSearchParams(`scenario=${scenario}&volume=9`));
        expect(state.scenario).toBe(scenario);expect(state.input.volume).toBe(9);
        expect(state.input.manualMinutes).toBe(SCENARIOS[scenario].defaults.manualMinutes);
    });
    it('scenario changes preserve prices, plan and partner assumptions', () => {
        const state = defaultCalculatorState('partner');state.input.partnerHours=99;state.input.inputPriceUsd=19;state.input.plan='start';
        const changed=changeScenario(state,'email');
        expect(changed.input.partnerHours).toBe(99);expect(changed.input.inputPriceUsd).toBe(19);expect(changed.input.plan).toBe('start');
        expect(calculatorPath(changed)).toMatch(/^\/cs\/kalkulacka\?/);
    });
});

describe('self-contained PDF definition', () => {
    it('includes every numeric assumption and no personal identity', () => {
        const state=defaultCalculatorState();const definition=createCalculationPdfDefinition(state);const text=JSON.stringify(definition);
        expect(definition.pageSize).toBe('A4');expect(text).toContain('100');expect(text).toContain('20 %');
        expect(text).toContain('Otevřít a upravit tuto kalkulaci');
        for (const key of NUMERIC_KEYS) expect(text).toContain(String(state.input[key]));
        expect(text).not.toContain('email@example.com');
    });
    it('does not extrapolate Start revenue or payback into a year', () => {
        const state=defaultCalculatorState('partner');state.input.plan='start';state.input.horizonMonths=24;
        const text=JSON.stringify(createCalculationPdfDefinition(state));
        expect(text).toContain('30 dní pilotu Start');expect(text).toContain('bez automatického pokračování');
        expect(text).not.toContain('24 měsíců Business');
    });
});
