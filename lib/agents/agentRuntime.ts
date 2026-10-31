import 'server-only';
import type { ManagedAgent } from './agentModel';

/** Compile the shared Book, then use Responses without the LiteAgent SDK's incompatible sampling defaults. */
export async function runManagedAgent(agent: ManagedAgent, instruction: string, context: string, signal?: AbortSignal): Promise<string> {
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
                const model = book.modelName || 'gpt-6-luna';
                // Messages only explain quoted context. No Book tools, actions or hosted knowledge are executed here.
                // Sampling parameters are deliberately omitted: reasoning models can reject even SDK default values.
                const response = await fetch('https://api.openai.com/v1/responses', {
                    method: 'POST', signal: controller.signal,
                    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, store: false, max_output_tokens: 6000,
                        instructions: [book.systemMessage, book.promptSuffix].filter(Boolean).join('\n\n'),
                        input: [{ role: 'user', content: `${instruction}\n\nQuoted message context and conversation:\n${context}` }],
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
                timer = setTimeout(() => { controller.abort(); reject(new Error('Generování překročilo časový limit.')); }, 100_000);
                controller.signal.addEventListener('abort', () => reject(new Error('Generování bylo přerušeno.')), { once: true });
            }),
        ]);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
