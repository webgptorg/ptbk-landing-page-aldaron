import 'server-only';
import type { ManagedAgent } from './agentModel';

/** The same Book runtime as workshop agents; each invocation has its own message context and conversation. */
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
                const { LiteAgent } = await import('@promptbook/node');
                const runner = new LiteAgent({ book: agent.bookSource, apiKey, isVerbose: false });
                return runner.run(instruction, { context, signal: controller.signal });
            })(),
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => { controller.abort(); reject(new Error('Generování překročilo časový limit.')); }, 100_000);
                controller.signal.addEventListener('abort', () => reject(new Error('Generování bylo přerušeno.')), { once: true });
            }),
        ]);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
