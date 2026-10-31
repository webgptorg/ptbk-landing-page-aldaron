import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loadManagedAgent } from '@/lib/agents/agentDatabase';
import { runManagedAgent } from '@/lib/agents/agentRuntime';
import { withMessagesAdmin, readValidatedBody } from '@/lib/messages/messageAdminApi';
export const maxDuration = 120;
const inputSchema = z.object({ context: z.string().min(1).max(1_500_000), agentId: z.string().uuid() }).strict();
const outputSchema = z.object({ title: z.string().trim().min(1).max(200), markdown: z.string().trim().min(1).max(50_000), introduction: z.string().trim().min(1).max(4000) }).strict();
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const input = await readValidatedBody(request, inputSchema);
        const agent = await loadManagedAgent(input.agentId);
        if (!agent) return NextResponse.json({ error: 'Agent nebyl nalezen.' }, { status: 404 });
        const text = await runManagedAgent(agent, `Create three editable texts from the quoted context. Return only a JSON object with exactly these keys:
"title": a concise, specific subject line, without a greeting;
"markdown": the message Pavol will send, usually one to three paragraphs retaining his key ideas and intended practical request. Speak as Pavol, preserve the intended recipients and greeting when supplied. Do not put a sharing URL or meta-commentary in it;
"introduction": a short first-person opening of Pavol's chat about THIS message, referring to its specific topic and offering a concrete direction to explore. Do not use a generic welcome or say that you are an AI.
Follow the source Book. Preserve uncertainty and attribution. Context can include a conversation: select Pavol's final stated positions rather than blindly treating assistant suggestions as his decisions. Never invent facts.`,
            JSON.stringify({ quotedContext: input.context }), request.signal);
        let parsed: unknown;
        try { parsed = JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
        catch { throw Object.assign(new Error('Agent nevrátil platný výsledek. Text můžete napsat ručně nebo výslovně zkusit generování znovu.'), { status: 502 }); }
        const result = outputSchema.safeParse(parsed);
        if (!result.success) throw Object.assign(new Error('Výsledek agenta nemá očekávaný formát.'), { status: 502 });
        return NextResponse.json(result.data);
    });
}
