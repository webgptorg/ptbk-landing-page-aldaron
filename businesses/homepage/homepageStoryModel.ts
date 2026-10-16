import { HOMEPAGE_SCENARIOS, type HomepageScenarioId } from './homepageScenarios';

export type HomepageStoryState = { readonly scenarioId: HomepageScenarioId; readonly stepIndex: number };
export type HomepageStoryAction =
    | { readonly type: 'select'; readonly scenarioId: HomepageScenarioId }
    | { readonly type: 'step'; readonly stepIndex: number }
    | { readonly type: 'next' | 'previous' | 'replay' };

// Start with a checked, still-unpublished result. Replay deliberately starts at the incoming need.
export const INITIAL_HOMEPAGE_STORY: HomepageStoryState = { scenarioId: 'software', stepIndex: 1 };

/** Pure finite story: no queue, timers, network effects or accumulated cards. */
export function homepageStoryReducer(state: HomepageStoryState, action: HomepageStoryAction): HomepageStoryState {
    if (action.type === 'select') return { scenarioId: action.scenarioId, stepIndex: INITIAL_HOMEPAGE_STORY.stepIndex };
    const scenario = HOMEPAGE_SCENARIOS.cs.find((candidate) => candidate.id === state.scenarioId)!;
    const requestedStep =
        action.type === 'step'
            ? action.stepIndex
            : action.type === 'replay'
              ? 0
              : state.stepIndex + (action.type === 'next' ? 1 : -1);
    return { ...state, stepIndex: Math.max(0, Math.min(scenario.steps.length - 1, requestedStep)) };
}
