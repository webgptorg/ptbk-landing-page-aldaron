import 'dotenv/config';
import { defineConfig } from '@playwright/test';

/**
 * How long a cold Next.js start or one E2E test may take, compilation included
 *
 * Note: This is the shared cold-start budget for the server and every E2E test, so neither a slow first server
 *       readiness check nor a route reached first can be reported as broken merely for having been compiled.
 */
const E2E_COLD_COMPILATION_TEST_TIMEOUT_MS = 180_000;

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009';
const usesExternalServer = process.env.E2E_BASE_URL !== undefined;
const usesIsolatedInMemorySupabase = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/.artifacts',
    fullyParallel: false,
    workers: 1,
    // The Next.js development server compiles a page or an API endpoint the first time a test reaches it, so the first
    // test which visits a page or submits into an endpoint pays for that compilation on top of its own work. The
    // budget of one test is therefore that compilation headroom rather than the time its assertions need.
    timeout: E2E_COLD_COMPILATION_TEST_TIMEOUT_MS,
    expect: {
        timeout: 10_000,
    },
    reporter: 'list',
    globalTeardown: './tests/e2e/globalTeardown.ts',
    use: {
        baseURL,
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1280, height: 720 } },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: usesExternalServer
        ? undefined
        : {
              command: 'npx next dev -p 4009',
              url: baseURL,
              reuseExistingServer: !process.env.CI,
              timeout: E2E_COLD_COMPILATION_TEST_TIMEOUT_MS,
              // The test server exercises the public API without running or repairing
              // migrations as a side effect.
              // Without a service role key, the same endpoints use an isolated in-memory
              // store so local verification does not depend on a private credential.
              // It also keeps every route it compiled for the whole run, so that a route
              // is never disposed and rebuilt underneath a later test.
              // Next does not replace explicitly empty environment values from .env.
              env: {
                  ...process.env,
                  DATABASE_URL: '',
                  E2E_IN_MEMORY_SUPABASE: usesIsolatedInMemorySupabase ? 'true' : '',
                  E2E_KEEP_COMPILED_ROUTES: 'true',
              },
          },
});
