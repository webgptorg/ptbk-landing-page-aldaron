import 'server-only';
import { comparisonAgentInstructions, createComparisonAgentContext } from './comparisonContext';
import type { SiteAgentEmbedId, SiteAgentLanguage } from './registry';
import { createPavolAvatarContext, pavolAvatarInstructions } from './pavolAvatarContext';

/** Each future placement must provide its own trusted context and purpose on the server. */
export const SITE_AGENT_BEHAVIOR = {
    comparison: { context: createComparisonAgentContext, instructions: comparisonAgentInstructions },
    'pavol-avatar': { context: createPavolAvatarContext, instructions: pavolAvatarInstructions },
} satisfies Record<SiteAgentEmbedId, {
    context: (language: SiteAgentLanguage) => string;
    instructions: (language: SiteAgentLanguage) => string;
}>;
