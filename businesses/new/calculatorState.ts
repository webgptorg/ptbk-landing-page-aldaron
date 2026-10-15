import { DEFAULT_INPUT, normalizeInput, SCENARIOS, type EconomicsInput, type ScenarioId } from './economics';
import { sitePath } from './siteConfig';

export type CalculatorMode = 'company' | 'partner';
export type CalculatorState = { mode: CalculatorMode; scenario: ScenarioId; input: EconomicsInput };
export const CALCULATOR_QUERY_VERSION = '2';
export type NumericKey = Exclude<keyof EconomicsInput, 'plan' | 'aiBilling' | 'costPayer'>;
export const NUMERIC_KEYS = Object.keys(DEFAULT_INPUT).filter((key) => typeof DEFAULT_INPUT[key as keyof EconomicsInput] === 'number') as NumericKey[];

export function defaultCalculatorState(mode: CalculatorMode = 'company'): CalculatorState {
    return { mode, scenario: 'documents', input: { ...DEFAULT_INPUT } };
}

/** Preserve inactive Business settings during a Start preview; the calculation itself still clamps Start. */
export function normalizeFormInput(input: EconomicsInput): EconomicsInput {
    return { ...normalizeInput({ ...input, plan: 'business' }), plan: input.plan === 'start' ? 'start' : 'business' };
}

/** Only known public calculation fields enter state. Identity, arbitrary keys and commercial overrides never do. */
export function parseCalculatorState(query: Pick<URLSearchParams, 'get'>, mode: CalculatorMode = 'company'): CalculatorState {
    const state = defaultCalculatorState(mode);
    const scenario = query.get('scenario');
    if (scenario && Object.prototype.hasOwnProperty.call(SCENARIOS, scenario)) {
        state.scenario = scenario as ScenarioId;
        state.input = { ...state.input, ...SCENARIOS[state.scenario].defaults };
    }
    const selectedMode = query.get('mode');
    if (selectedMode === 'partner' || selectedMode === 'company') state.mode = selectedMode;
    for (const key of NUMERIC_KEYS) {
        const raw = query.get(key);
        if (raw !== null && raw.trim() !== '' && raw.length < 40 && Number.isFinite(Number(raw))) state.input[key] = Number(raw);
    }
    const plan = query.get('plan');
    if (plan === 'start' || plan === 'business') state.input.plan = plan;
    const ai = query.get('aiBilling');
    if (ai === 'tokens' || ai === 'subscription' || ai === 'local') state.input.aiBilling = ai;
    const payer = query.get('costPayer');
    if (payer === 'partner' || payer === 'client') state.input.costPayer = payer;
    state.input = normalizeFormInput(state.input);
    return state;
}

/** Include defaults as well: a saved link must not change when a later release changes the example. */
export function serializeCalculatorState(state: CalculatorState): string {
    const query = new URLSearchParams({ v: CALCULATOR_QUERY_VERSION, mode: state.mode, scenario: state.scenario });
    const input = normalizeFormInput(state.input);
    for (const key of Object.keys(DEFAULT_INPUT) as (keyof EconomicsInput)[]) query.set(key, String(input[key]));
    return query.toString();
}

export const calculatorPath = (state: CalculatorState) => `${sitePath('kalkulacka')}?${serializeCalculatorState(state)}`;
export const calculationShareUrl = (state: CalculatorState) => `https://ptbk.io${calculatorPath(state)}`;
export function changeScenario(state: CalculatorState, scenario: ScenarioId): CalculatorState {
    return { ...state, scenario, input: { ...state.input, ...SCENARIOS[scenario].defaults } };
}
