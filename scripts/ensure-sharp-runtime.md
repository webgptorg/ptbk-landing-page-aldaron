# Linux image runtime build preflight

The first production deployment of `/new` compiled successfully but failed collecting the existing `/ai-ta-krajta/logo.png` route: the root Sharp installation could not load its Linux x64 optional runtime. A clean Linux install also lacked the nested Sharp runtime used by Next.js. Restoring those exact optional packages made the full production build and TypeScript checks pass.

`npm run build` now runs `ensure-sharp-runtime.cjs` first. On Linux x64 with glibc only, it checks the root and Next.js-nested Sharp copies in separate Node processes. Working installations are untouched. Missing runtimes are restored with `npm pack` using exact versions declared in the installed packages' `optionalDependencies`, then verified. Temporary archives are removed. Package manifests, lockfile, non-Linux systems, and other dependencies are not rewritten or upgraded.

This is a narrow build-time workaround for the existing cross-platform lockfile, not a product runtime download. It requires npm registry access only when a native runtime is missing. Remove the workaround after regenerating and validating the complete cross-platform lockfile on both clean Linux and Windows installs.
