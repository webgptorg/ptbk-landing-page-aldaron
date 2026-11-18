import { expect, it } from 'vitest';
import { readBoundedJson } from './readBoundedJson';

it('counts actual UTF-8 bytes and cancels chunked oversized bodies before parsing', async () => {
    const cancel = (() => { let called = false; return { run: () => { called = true; }, get called() { return called; } }; })();
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(new TextEncoder().encode('{"text":"'));
            controller.enqueue(new TextEncoder().encode('é'.repeat(32)));
            // Leave the stream open: the reader must cancel as soon as the limit is exceeded.
        },
        cancel: cancel.run,
    });
    const request = new Request('http://localhost/api', { method: 'POST', body, duplex: 'half' } as RequestInit);
    expect(await readBoundedJson(request, 40)).toBeNull();
    expect(cancel.called).toBe(true);
});

it('accepts JSON at the exact bound and refuses malformed UTF-8, invalid JSON and absent bodies', async () => {
    const payload = '{"ok":true}';
    expect(await readBoundedJson(new Request('http://localhost', { method: 'POST', body: payload }), payload.length))
        .toEqual({ ok: true });
    expect(await readBoundedJson(new Request('http://localhost', { method: 'POST', body: new Uint8Array([0xff]) }), 10)).toBeNull();
    expect(await readBoundedJson(new Request('http://localhost', { method: 'POST', body: '{' }), 10)).toBeNull();
    expect(await readBoundedJson(new Request('http://localhost'), 10)).toBeNull();
});
