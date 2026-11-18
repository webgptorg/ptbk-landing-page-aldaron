/** Bounded streaming JSON reader; never trusts Content-Length and never buffers an unbounded body. */
export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
    const reader = request.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) {
                void reader.cancel().catch(() => undefined);
                return null;
            }
            chunks.push(value);
        }
        return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    } catch {
        return null;
    } finally {
        reader.releaseLock();
    }
}
