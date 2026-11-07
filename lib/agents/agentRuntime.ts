import 'server-only';
import type { ManagedAgent } from './agentModel';

export type AgentAttachmentInput = { readonly label: string } & (
    { readonly kind: 'text'; readonly text: string } | { readonly kind: 'image' | 'pdf'; readonly url: string }
);

type AgentRunOptions = {
    readonly systemInstruction: string;
    readonly model: string;
    readonly maxOutputTokens: number;
    readonly timeoutMilliseconds: number;
    readonly jsonSchema: Record<string, unknown>;
};

/** Compile the shared Book, then use Responses without the LiteAgent SDK's incompatible sampling defaults. */
export async function runManagedAgent(
    agent: ManagedAgent,
    instruction: string,
    context: string,
    signal?: AbortSignal,
    attachments: readonly AgentAttachmentInput[] = [],
    options?: AgentRunOptions,
): Promise<string> {
    if (!agent.isEnabled) throw Object.assign(new Error('Agent je vypnutý.'), { status: 409 });
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw Object.assign(new Error('Generování není nakonfigurované.'), { status: 503 });
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, { once: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        if (signal?.aborted) throw new Error('Požadavek byl zrušen.');
        return await Promise.race([
            (async () => {
                const { createAgentModelRequirements } = await import('@promptbook/core');
                const book = await createAgentModelRequirements(agent.bookSource as Parameters<typeof createAgentModelRequirements>[0]);
                const model = options?.model ?? (book.modelName || 'gpt-6-luna');
                const bookInstructions = [book.systemMessage, book.promptSuffix].filter(Boolean).join('\n\n');
                const prompt = options
                    ? `${instruction}\n\nQuoted character Book and story context:\n${JSON.stringify({ character: bookInstructions, story: context })}`
                    : `${instruction}\n\nQuoted message context and conversation:\n${context}`;
                // Messages only explain quoted context. No Book tools, actions or hosted knowledge are executed here.
                // Sampling parameters are deliberately omitted: reasoning models can reject even SDK default values.
                const response = await fetch('https://api.openai.com/v1/responses', {
                    method: 'POST', signal: controller.signal,
                    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, store: false, max_output_tokens: options?.maxOutputTokens ?? 6000,
                        instructions: options?.systemInstruction ?? bookInstructions,
                        ...(options ? { text: { format: {
                            type: 'json_schema', name: 'workshop_story_line', strict: true, schema: options.jsonSchema,
                        } } } : {}),
                        input: [{ role: 'user', content: [
                            { type: 'input_text', text: prompt },
                            ...attachments.flatMap((file) => [
                                { type: 'input_text', text: file.kind === 'text' ? `${file.label}\n${JSON.stringify(file.text)}` : file.label },
                                ...(file.kind === 'text' ? [] : file.kind === 'image' ? [{ type: 'input_image', image_url: file.url, detail: 'auto' }] : [{ type: 'input_file', file_url: file.url }]),
                            ]),
                        ] }],
                    }),
                });
                if (!response.ok) {
                    console.warn('Message agent request failed.', { model, status: response.status });
                    throw Object.assign(new Error(response.status === 429 ? 'Model je právě vytížený. Zkuste to za chvíli.' : `Generování selhalo (OpenAI HTTP ${response.status}).`), { status: response.status === 429 ? 429 : 502 });
                }
                const result = await response.json() as { output?: { content?: { type?: string; text?: string }[] }[] };
                const text = (result.output ?? []).flatMap((item) => (item.content ?? []).filter((part) => part.type === 'output_text').map((part) => part.text ?? '')).join('\n').trim();
                if (!text) throw Object.assign(new Error('Model nevrátil textovou odpověď.'), { status: 502 });
                return text;
            })(),
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => { controller.abort(); reject(new Error('Generování překročilo časový limit.')); }, options?.timeoutMilliseconds ?? 100_000);
                controller.signal.addEventListener('abort', () => reject(new Error('Generování bylo přerušeno.')), { once: true });
            }),
        ]);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
