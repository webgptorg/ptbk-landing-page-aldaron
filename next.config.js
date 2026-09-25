/**
 * The end-to-end suite drives a development server, which compiles a route on its first visit and, by default,
 * disposes it again after a minute without a request. Disposing a route re-emits the shared server chunks, and a
 * request which arrives while they are being re-emitted fails inside the Next.js module registry with
 * `TypeError: Cannot read properties of undefined (reading 'call')`. Keeping every route the suite already compiled
 * means each of them is compiled exactly once, so no test can be hit by that re-emit.
 *
 * Note: An ordinary `npm run dev` keeps disposing routes it no longer serves, because a development session lasts far
 *       longer than a test run and has no reason to hold every route it ever opened in memory.
 */
const IS_COMPILED_ROUTE_KEPT_FOR_WHOLE_RUN = process.env.E2E_KEEP_COMPILED_ROUTES === 'true';

/**
 * Longer than any end-to-end run, so that no route is disposed while the suite is still using the server.
 */
const KEPT_COMPILED_ROUTE_MAXIMAL_INACTIVE_AGE_MS = 24 * 60 * 60 * 1000;

const PUBLIC_DOMAIN_HOSTS = require('./lib/domains/publicDomainHosts.json');
const PUBLIC_DEVELOPMENT_ORIGINS = Object.values(PUBLIC_DOMAIN_HOSTS).flatMap((hostname) => [
    hostname,
    `www.${hostname}`,
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    images: { unoptimized: true },
    serverExternalPackages: ['pg', '@promptbook/node'],
    outputFileTracingIncludes: {
        '/*': ['./migrations/**/*.sql'],
    },
    devIndicators: false,
    async redirects() {
        return [
            {
                source: '/pavol/cs',
                destination: '/cs/pavol',
                permanent: true,
            },
            {
                source: '/pavol/en',
                destination: '/en/pavol',
                permanent: true,
            },
            {
                source: '/jirka',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
            {
                source: '/jiri',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
        ];
    },
    allowedDevOrigins: [
        '127.0.0.1',
        ...PUBLIC_DEVELOPMENT_ORIGINS,
        '*.macaly.dev',
        '*.macaly.app',
        '*.macaly-app.com',
        '*.macaly-user-data.dev',
    ],
    webpack: (config, { dev, isServer }) => {
        // Note: [📖] Allow books to be imported:
        config.module.rules.push({
            test: /\.book$/,
            use: 'raw-loader',
        });

        // Allow YAML files to be imported
        config.module.rules.push({
            test: /\.ya?ml$/,
            use: 'raw-loader',
        });

        // TODO: [🧵]

        return config;
    },
};

if (IS_COMPILED_ROUTE_KEPT_FOR_WHOLE_RUN) {
    // Note: Next.js merges this over its own defaults, so the buffer of recently accessed routes keeps its default.
    nextConfig.onDemandEntries = { maxInactiveAge: KEPT_COMPILED_ROUTE_MAXIMAL_INACTIVE_AGE_MS };
}

module.exports = nextConfig;
