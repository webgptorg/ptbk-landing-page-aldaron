import { z } from 'zod';

export const AGENT_VALUES_SCHEMA = z.object({
    name: z.string().trim().min(1).max(200),
    bookSource: z.string().trim().min(3).max(50_000),
    isEnabled: z.boolean(),
}).strict();
export type AgentValues = z.infer<typeof AGENT_VALUES_SCHEMA>;
export type ManagedAgent = AgentValues & { readonly id: string };
