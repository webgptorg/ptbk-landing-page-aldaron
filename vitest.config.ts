import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Note: The same JSX runtime Next.js compiles the components with, so that a component does not need to import
    //       React just to be renderable in a test.
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
            // Next replaces this marker with an empty module in its server runtime. Vitest also runs these routes
            // on the server; keep the production client-import protection in Next's own build untouched.
            'server-only': path.resolve(__dirname, 'node_modules/next/dist/compiled/server-only/empty.js'),
        },
    },
    test: {
        exclude: ['node_modules/**', '.git/**', '.next/**', '.tmp/**', 'out/**', 'tests/e2e/**'],
    },
});
