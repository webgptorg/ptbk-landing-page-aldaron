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
        },
    },
    test: {
        exclude: ['node_modules/**', '.git/**', '.next/**', '.tmp/**', 'out/**', 'tests/e2e/**'],
    },
});
