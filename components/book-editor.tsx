'use client';

import type { BookEditorProps } from '@promptbook/components';
import { version as monacoVersion } from 'monaco-editor/package.json';
import dynamic from 'next/dynamic';

type Monaco = typeof import('monaco-editor');
type MonacoAmdLoader = {
    (modules: string[], loaded: (module: { m: Monaco }) => void, failed: (error: Error) => void): void;
    config(options: { paths: { vs: string } }): void;
};

let bookEditorModule: Promise<typeof import('@promptbook/components')> | undefined;

function loadBookEditorModule() {
    bookEditorModule ??= import('@promptbook/components');
    return bookEditorModule;
}

export function preloadBookEditor() {
    void loadBookEditorModule().catch(() => undefined);
}

function loadMonaco(): Promise<Monaco> {
    const vs = `/vendor/monaco/${monacoVersion}/vs`;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${vs}/loader.js`;
        script.onerror = () => reject(new Error('Monaco runtime could not be loaded.'));
        script.onload = () => {
            const runtime: unknown = Reflect.get(window, 'require');
            if (typeof runtime !== 'function' || typeof Reflect.get(runtime, 'config') !== 'function') {
                reject(new Error('Monaco AMD loader is unavailable.'));
                return;
            }
            const amd = runtime as MonacoAmdLoader;
            amd.config({ paths: { vs } });
            amd(['vs/editor/editor.main'], ({ m }) => {
                // Promptbook registers its language/theme on the instance; Monaco's AMD exports are frozen.
                resolve({ ...m });
            }, reject);
        };
        document.head.appendChild(script);
    });
}

/** Use the same highlighted editor and first-party runtime wherever the site renders a Book. */
export const BookEditor = dynamic<BookEditorProps>(async () => {
    const [{ loader }, { BookEditor }, monaco] = await Promise.all([
        import('@monaco-editor/react'), loadBookEditorModule(), loadMonaco(),
    ]);
    loader.config({ monaco });
    return BookEditor;
}, {
    ssr: false,
    loading: ({ error }) => error
        ? <p role="alert" className="p-4 text-sm text-red-700">Editor se nepodařilo načíst. Zkus obnovit stránku.</p>
        : <p role="status" className="p-4 text-sm text-slate-500">Načítám editor…</p>,
});
