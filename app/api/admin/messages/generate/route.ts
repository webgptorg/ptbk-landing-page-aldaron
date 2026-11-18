import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loadManagedAgent } from '@/lib/agents/agentDatabase';
import { runManagedAgent } from '@/lib/agents/agentRuntime';
import { withMessagesAdmin, readValidatedBody } from '@/lib/messages/messageAdminApi';
import { MESSAGE_CONTEXT_MAX_LENGTH } from '@/lib/messages/messageModel';
import { MESSAGE_SUMMARY_SCHEMA } from '@/lib/messages/messageSummary';
export const maxDuration = 120;
const inputSchema = z.object({ context: z.string().min(1).max(MESSAGE_CONTEXT_MAX_LENGTH).refine(value => Boolean(value.trim()), 'Nejprve vložte celý kontext.'), agentId: z.string().uuid(), summary: MESSAGE_SUMMARY_SCHEMA.optional() }).strict();
const outputSchema = z.object({ title: z.string().trim().min(1).max(200), markdown: z.string().trim().min(1).max(50_000), introduction: z.string().trim().min(1).max(4000) }).strict();
const summaryOutputSchema = outputSchema.pick({ markdown: true });
export function POST(request: NextRequest) {
    return withMessagesAdmin(request, async () => {
        const input = await readValidatedBody(request, inputSchema);
        const agent = await loadManagedAgent(input.agentId);
        if (!agent) return NextResponse.json({ error: 'Agent nebyl nalezen.' }, { status: 404 });
        const instruction = input.summary ? `Write a new short message directly from the ENTIRE quoted original context, never from a previous summary. Return only a JSON object with exactly one key, "markdown".
The complete decoded markdown value MUST be at most ${input.summary.maxCharacters} characters, including spaces, line breaks and Markdown syntax. Aim close to this limit without padding; count and revise before returning. Prioritize the main conclusion, practical request and essential qualifications over supporting detail. Do not cut off a sentence or invent facts to fit.
Format: ${{ paragraphs: 'plain prose in short paragraphs, without bullet points or headings; preserve the intended greeting if space allows', bullets: 'a concise Markdown bullet list, each item beginning with "- ", without a greeting, headings or surrounding prose', sentence: 'exactly one complete sentence, without a greeting, headings or bullet points' }[input.summary.format]}.
Speak as Pavol in the language of the context, addressing its intended recipients. Do not include a sharing URL or meta-commentary.` : `Create three editable texts from the quoted context. Return only a JSON object with exactly these keys:
"title": a concise, specific subject line, without a greeting;
"markdown": the message Pavol will send, usually one to three paragraphs retaining his key ideas and intended practical request. Speak as Pavol, preserve the intended recipients and greeting when supplied. Do not put a sharing URL or meta-commentary in it;
"introduction": a short first-person opening of Pavol's chat about THIS message, referring to its specific topic and offering a concrete direction to explore. Do not use a generic welcome or say that you are an AI.`;
        const text = await runManagedAgent(agent, `${instruction}
Follow the source Book. Preserve uncertainty and attribution. Context can include a conversation: select Pavol's final stated positions rather than blindly treating assistant suggestions as his decisions. Never invent facts.`,
            JSON.stringify({ quotedContext: input.context }), request.signal);
        let parsed: unknown;
        try { parsed = JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
        catch { throw Object.assign(new Error('Agent nevrátil platný výsledek. Text můžete napsat ručně nebo výslovně zkusit generování znovu.'), { status: 502 }); }
        const result = (input.summary ? summaryOutputSchema : outputSchema).safeParse(parsed);
        if (!result.success) throw Object.assign(new Error('Výsledek agenta nemá očekávaný formát.'), { status: 502 });
        if (input.summary && result.data.markdown.length > input.summary.maxCharacters) {
            throw Object.assign(new Error(`Agent překročil limit ${input.summary.maxCharacters} znaků. Původní zpráva zůstala zachována; zkuste úpravu znovu.`), { status: 502 });
        }
        return NextResponse.json(result.data, { headers: { 'Cache-Control': 'no-store' } });
    });
}
