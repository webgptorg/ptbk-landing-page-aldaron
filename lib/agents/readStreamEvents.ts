/** Framed UTF-8 across arbitrary network boundaries, including an unterminated final line. */
export async function* readStreamLines(body: ReadableStream<Uint8Array>, signal?: AbortSignal) {
    const reader = body.getReader(), decoder = new TextDecoder();
    let buffer = '';
    try {
        while (true) {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const { value, done } = await reader.read();
            buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
            if (buffer.length > 2_000_000) throw new Error('Stream frame is too large.');
            let end: number;
            while ((end = buffer.indexOf('\n')) !== -1) {
                yield buffer.slice(0, end).replace(/\r$/, ''); buffer = buffer.slice(end + 1);
            }
            if (done) { if (buffer) yield buffer; break; }
        }
    } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
