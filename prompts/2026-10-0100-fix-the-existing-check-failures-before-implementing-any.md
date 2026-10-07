[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account) - Implementation $2.28 an hour; Checking 37 minutes

[✨🛀] Fix the existing check failures before implementing any queued coding tasks.

The check command `npm run check` failed before coding started. Leave the project ready for the remaining coding prompts.

Fix the underlying lint, typechecking, build, generated-code consistency, or test failure without weakening validation.
Do not delete assertions, disable lint rules, remove failing checks from the aggregate, lower quality thresholds,
skip a build, or force exit code zero merely to obtain a pass. Keep the project's chosen check scope intact.
Missing or unconfigured validation requires project-owner setup; never replace it with a meaningless green result.

## Check output

```
Command "bash /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/check-before.sh" exited with code 1.

> promptbook-landing-page@0.1.0 check
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/recording-studio/RecordingDerivedEditor.tsx
95:8  Warning: React Hook useEffect has a missing dependency: 'isAvailableSourceId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
97:49  Warning: React Hook useEffect has a missing dependency: 'recording'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingSourceMonitor.tsx
59:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
63:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingStudioPublish.tsx
57:8  Warning: React Hook useEffect has a missing dependency: 'workshops'. Either include it or remove the dependency array. You can also do a functional update 'setWorkshops(w => ...)' if you only need 'workshops' in the 'setWorkshops' call.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
Failed to compile.

./lib/recording-studio/studioAssetS3.ts
Module not found: Can't resolve '@aws-sdk/s3-request-presigner'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/api/admin/studio/assets/[assetId]/route.ts


> Build failed because of webpack errors
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

