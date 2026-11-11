import 'server-only';
import { comparisonAgentInstructions, createComparisonAgentContext } from './comparisonContext';
import type { SiteAgentEmbedId, SiteAgentLanguage } from './registry';

/** Each future placement must provide its own trusted context and purpose on the server. */
export const SITE_AGENT_BEHAVIOR = {
    comparison: { context: createComparisonAgentContext, instructions: comparisonAgentInstructions },
} satisfies Record<SiteAgentEmbedId, {
    context: (language: SiteAgentLanguage) => string;
    instructions: (language: SiteAgentLanguage) => string;
}>;
