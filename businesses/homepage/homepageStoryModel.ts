import type { HomepageScenario } from './homepageScenarios';

export type HomepageStoryState = { readonly scenarioIndex: number; readonly stepIndex: number };
export type HomepageStoryAction =
    | { readonly type: 'scenario'; readonly index: number }
    | { readonly type: 'step'; readonly index: number }
    | { readonly type: 'previous' | 'next' | 'replay' };

/** Start on a prepared result: no introductory wait is required to understand the benefit. */
export const INITIAL_HOMEPAGE_STORY_STATE: HomepageStoryState = { scenarioIndex: 0, stepIndex: 1 };

/** A single atomic selection, with no queued events, history accumulation or automatic progression. */
export function reduceHomepageStory(
    scenarios: readonly HomepageScenario[],
    state: HomepageStoryState,
    action: HomepageStoryAction,
): HomepageStoryState {
    if (action.type === 'scenario') {
        if (!scenarios[action.index]) return state;
        return { scenarioIndex: action.index, stepIndex: INITIAL_HOMEPAGE_STORY_STATE.stepIndex };
    }
    const lastStepIndex = scenarios[state.scenarioIndex].steps.length - 1;
    const stepIndex =
        action.type === 'replay'
            ? 0
            : action.type === 'step'
              ? action.index
              : state.stepIndex + (action.type === 'next' ? 1 : -1);
    return { ...state, stepIndex: Math.max(0, Math.min(lastStepIndex, stepIndex)) };
}
