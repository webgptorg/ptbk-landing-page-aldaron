<p align="center">
  <a href="https://ptbk.io">
    <img src="./public/logo/promptbook-logo-blue-transparent-1024.png" width="160" alt="Promptbook">
  </a>
</p>

<h1 align="center">Promptbook website</h1>

<p align="center">
  The Czech-first web platform behind <a href="https://ptbk.io">Promptbook</a>: landing pages, live AI workshops, a community, and the operations tools that make them run.
</p>

<p align="center">
  <a href="https://github.com/webgptorg/aldaron">Repository</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#database-and-migrations">Database</a>
  ·
  <a href="#verification">Verification</a>
</p>

## What this repository contains

This is a production Next.js application, not a collection of static marketing pages. It brings together:

- Czech and English Promptbook homepages, plus focused pages for businesses, cities, agriculture, industry, workshops, and individual experts.
- Registration and contact flows, waitlists, discount-code validation, legal pages, analytics, and social metadata.
- Live workshop rooms with a video stage, presence, reactions, moderated chat, polls, materials, feedback, and participant moderation.
- The Czech Promptbook community, including memberships, workshop links, polls, project publishing, project discussion, and voting.
- An authenticated operations area for workshops, community administration, contacts, discount codes, and short links with QR codes and click tracking.

| Area | Main paths |
| --- | --- |
| Homepages | `/` redirects by `Accept-Language`; `/cs` is the Czech source of truth and `/en` is its localized variant. |
| Audience pages | `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`, `/ai-supervize-mini`, and related campaign routes. |
| Workshops and community | `/cs/online-workshop`, `/cs/online-workshop/participant`, `/cs/komunita`, and `/cs/komunita/projects`. |
| Operations | `/admin`, `/admin/workshops`, `/admin/community`, `/admin/contacts`, `/admin/discount-codes`, and `/admin/shortener`. |
| Public short links | `/<shortcode>` resolves a managed short link; `/shortener` leads to its administration. |

## Technology

- **Next.js 15** App Router, React, and TypeScript
- **Tailwind CSS** and Radix-based reusable UI components
- **PostgreSQL** migrations and server-side access through `pg`
- **Supabase** clients for data-backed public and administrative workflows
- **Vitest** unit/component tests and **Playwright** end-to-end tests

## Quick start

### Prerequisites

- Node.js 20 or newer (Next.js 15 also supports Node.js 18.18+)
- npm
- A PostgreSQL database and Supabase project when working on data-backed flows

Install the locked dependency set and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:4009](http://localhost:4009). The development command frees port `4009` before starting Next.js, so do not use it for another local service at the same time.

The visual site can be explored without database credentials. Without the relevant configuration, database migrations are skipped in development and database-backed API routes are unavailable.

## Configuration

Create an ignored `.env` file for local server and command-line workflows. Next.js also reads `.env.local`, but the repository's maintenance scripts explicitly load `.env`.

```dotenv
# Required for migrations and production startup
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Required for browser-facing Supabase access
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Required by server-side workflows that access protected Supabase data
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Enables the single /admin account (username: admin)
ADMIN_PASSWORD=CHOOSE_A_LONG_RANDOM_VALUE

# Optional convenience switch for preview URLs; it is public, not access control
NEXT_PUBLIC_SKIP_WAITLIST_TOKEN=
```

`NEXT_PUBLIC_` variables are included in the browser bundle. Never place database passwords, service-role keys, or administrator credentials in them. With no `ADMIN_PASSWORD`, the administration remains closed.

### Automatic submission approval

Chat in workshop/community rooms (including project discussions), member-written poll answers, and community project
submissions share one server-side AI review. Apply the database migrations, then set this private variable to enable it:

```dotenv
WORKSHOP_AUTO_APPROVAL_API_KEY=YOUR_OPENAI_API_KEY

# Optional; defaults shown
WORKSHOP_AUTO_APPROVAL_MODEL=gpt-4.1-mini-2025-04-14
WORKSHOP_AUTO_APPROVAL_BASE_URL=https://api.openai.com/v1
```

An alternative HTTPS endpoint must support the same Chat Completions request and strict JSON schema response format.
The default model supports [structured outputs](https://developers.openai.com/api/docs/models/gpt-4.1-mini);
responses are also validated locally, including [refusals and incomplete output](https://developers.openai.com/api/docs/guides/structured-outputs).

Only pending contributions are reviewed, after successful persistence and the existing authentication/validation.
Trusted members and moderators still publish immediately, and banned participants cannot gain AI approval. The reviewer
can approve clearly suitable text or leave it for a human; it never rejects, edits, pins, or changes participant trust.
Only the contribution text/URLs and, for poll answers, the question are sent to the configured provider. Participant
names, e-mails and session data are not added to the request, although a member's text may itself contain personal data.
Project preview URLs are included as metadata; linked pages and images are not fetched or visually reviewed by the AI.

Each review has an eight-second timeout and no retries. Missing configuration, unavailable AI, or uncertain/invalid
responses leave the saved contribution pending in the existing moderator queue. Removing the key disables AI review.
Existing pending items are not bulk-processed. Concurrent edits, moderation decisions, deletion, or an author ban prevent
approval of the stale submission. Successful approvals record only the item kind/id, configured model and time in the
private `workshop_submission_auto_approvals` table. Existing visibility, poll votes, refreshes and manual moderation remain
the source of truth. This feature introduces no participant-facing AI configuration.

## Database and migrations

The application applies pending migrations automatically when a Node.js server starts. You can also run them directly:

```bash
npm run migrate-database
```

The migration runner always processes `migrations/_initialize.sql` first, then the remaining `.sql` files in filename order. Each applied file name and SHA-256 checksum is recorded in `public."Migration"`.

That makes migration files immutable once deployed:

1. Add a new migration for every schema or data change.
2. Never rename, delete, or edit a migration that a database may already have applied.
3. Run `npm run migrate-database` against the intended database before relying on the new schema.

In production, a missing `DATABASE_URL` stops startup rather than serving an outdated schema. In development, migrations are intentionally skipped when that variable is absent so that page work can continue without a database.

### Maintenance commands

| Command | Purpose |
| --- | --- |
| `npm run backup-database` | Writes a timestamped PostgreSQL archive under `backups/`. Requires `pg_dump` on `PATH`. |
| `npm run backup-database:verify` | Verifies a database backup. Requires PostgreSQL client tools on `PATH`. |
| `npm run delete-test-data` | Removes E2E data matching the test email pattern from the configured database. Use only against an intended environment. |

## Verification

| Command | What it checks |
| --- | --- |
| `npm run test` | Vitest unit and component tests. |
| `npm run test-types` | A production build followed by TypeScript checking. The build refreshes Next.js route types before `tsc` runs. |
| `npm run test-e2e` | Playwright public-flow tests on port `4009`. Each public-page route and each public submission is checked independently, every test is given enough time for the development server to compile the route it reaches first, and without a configured Supabase service-role key it uses an isolated in-memory Supabase-compatible store. Recordings of the most recent runs are kept in `tests/e2e/videos/`. |
| `npm run lint` | The configured Next.js lint command. |
| `npm run test-for-ptbk-coder` | The repository's full automated-agent verification sequence. |

For a production-like local run:

```bash
npm run build
npm run start
```

`npm run start` uses Next.js's default port. Pass `-- -p 4009` if you want it to match development.

## Where changes belong

| Need | Location |
| --- | --- |
| Page, route handler, metadata route, or redirect | `app/` |
| Reusable presentation component | `components/` |
| Domain behavior, validation, database access, API helpers, or shared types | `lib/` |
| Database schema and data evolution | `migrations/` |
| Operational scripts | `scripts/` |
| Unit and component tests | Beside the code as `*.test.ts` or `*.test.tsx` |
| Browser-level regression tests | `tests/e2e/` |
| Static assets | `public/` |

Keep the generic homepage in sync across languages: `/cs` defines its structure and source copy, while `/en` is the English localized counterpart. Keep domain rules in `lib/` and let route handlers and components stay focused on transport and presentation.

## Contributing

1. Read [AGENTS.md](./AGENTS.md) for the route map and repository-specific constraints.
2. Make the smallest focused change and add or update the closest relevant test.
3. Run the verification commands appropriate to the change.
4. Keep credentials and production data out of commits; `.env`, backups, and E2E artifacts are intentionally ignored.

## License

This repository is available under the [Apache License 2.0](./LICENSE.md).
