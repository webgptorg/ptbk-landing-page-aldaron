import 'dotenv/config';
import { defineConfig } from '@playwright/test';

/**
 * How long a cold Next.js start or one E2E test may take, compilation included
 *
 * Note: This is the shared cold-start budget for the server and every E2E test, so neither a slow first server
 *       readiness check nor a route reached first can be reported as broken merely for having been compiled.
 */
const E2E_COLD_COMPILATION_TEST_TIMEOUT_MS = 180_000;

/**
 * A browser assertion can be the first request for a lazily loaded client-side editor. Keep its cold compilation
 * allowance next to the suite-wide test allowance instead of making individual tests depend on implementation timing.
 */
const E2E_COLD_COMPONENT_EXPECT_TIMEOUT_MS = 60_000;

// This suite retains every lazily compiled route to avoid re-emitting shared chunks under an active request.
// Its complete compiler graph needs more heap than Next's ordinary development-session default (half of RAM).
// Set the budget only on the owned E2E server, and honor an explicit owner-supplied Node heap limit.
const E2E_DEVELOPMENT_SERVER_HEAP_SIZE_MIB = 10_240;
const E2E_INHERITED_NODE_OPTIONS = process.env.NODE_OPTIONS ?? '';
const IS_E2E_SERVER_HEAP_LIMIT_CONFIGURED = /(?:^|[\s"'])--max[-_]old[-_]space[-_]size(?:[-_]percentage)?(?:[=\s"']|$)/.test(
    E2E_INHERITED_NODE_OPTIONS,
);
const E2E_DEVELOPMENT_SERVER_NODE_OPTIONS = IS_E2E_SERVER_HEAP_LIMIT_CONFIGURED
    ? E2E_INHERITED_NODE_OPTIONS
    : `${E2E_INHERITED_NODE_OPTIONS} --max-old-space-size=${E2E_DEVELOPMENT_SERVER_HEAP_SIZE_MIB}`.trim();

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009';
const usesExternalServer = process.env.E2E_BASE_URL !== undefined;
const usesIsolatedInMemorySupabase = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/.artifacts',
    fullyParallel: false,
    workers: 1,
    // A cold development server or the configured external database can fail transiently. Retry the whole test in
    // a fresh browser context once; keep its assertions and failed-attempt trace, and still fail persistent errors.
    retries: 1,
    // The Next.js development server compiles a page or an API endpoint the first time a test reaches it, so the first
    // test which visits a page or submits into an endpoint pays for that compilation on top of its own work. The
    // budget of one test is therefore that compilation headroom rather than the time its assertions need.
    timeout: E2E_COLD_COMPILATION_TEST_TIMEOUT_MS,
    expect: {
        timeout: E2E_COLD_COMPONENT_EXPECT_TIMEOUT_MS,
    },
    reporter: 'list',
    globalTeardown: './tests/e2e/globalTeardown.ts',
    use: {
        baseURL,
        // Allows the same real recording/storage suite to verify an installed browser, e.g. msedge.
        channel: process.env.E2E_BROWSER_CHANNEL || undefined,
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1280, height: 720 } },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: usesExternalServer
        ? undefined
        : {
              // Next normally enables Node's source-map cache as well as the browser's development maps. Keeping
              // every compiled route adds avoidable memory in that server cache. Together with the explicit heap
              // budget below, the supported flag omits only Node's --enable-source-maps;
              // browser source maps, failed-attempt traces and the complete development-server suite stay available.
              command: 'npx next dev --disable-source-maps -p 4009',
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
                  NODE_OPTIONS: E2E_DEVELOPMENT_SERVER_NODE_OPTIONS,
                  DATABASE_URL: '',
                  E2E_IN_MEMORY_SUPABASE: usesIsolatedInMemorySupabase ? 'true' : '',
                  E2E_KEEP_COMPILED_ROUTES: 'true',
              },
          },
});
