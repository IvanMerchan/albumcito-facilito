# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

Albumcito Facilito is an app for collecting sticker albums ("álbumes de estampas") and checking which stickers a user already has versus which are missing or duplicated — similar to a digital Panini-style sticker album.

## Repository structure

This is a monorepo managed with **Turborepo** and **pnpm workspaces**, with two components, each documented in its own `CLAUDE.md`:

- `apps/albumcito-facilito-app/` — frontend application. See `apps/albumcito-facilito-app/CLAUDE.md`.
- `apis/albumcito-facilito-api/` — backend API. See `apis/albumcito-facilito-api/CLAUDE.md`.

`apps/*` holds user-facing applications; `apis/*` holds backend services/APIs. New packages go in whichever of those two matches their role, and must have a `package.json` to be picked up by the pnpm workspace (see `pnpm-workspace.yaml`).

## Monorepo tooling

- **Package manager:** pnpm (pinned via `packageManager` in the root `package.json`). Always use `pnpm`, never `npm`/`yarn`, so the lockfile and workspace resolution stay consistent.
- **Task runner:** Turborepo (`turbo.json` defines the `build`/`dev`/`lint`/`test` pipeline). Tasks are only run for packages that define the corresponding script, so scaffolding a package's tooling (e.g. adding Next.js/NestJS scripts) is what "activates" it in the pipeline.
- Common commands from the repo root:
  - `pnpm install` — install all workspace dependencies.
  - `pnpm dev` — run `dev` in every package that defines it (via `turbo run dev`).
  - `pnpm build` — build every package, respecting dependency order (via `turbo run build`).
  - `pnpm lint` / `pnpm test` — same pattern for lint/test.
  - `pnpm --filter @albumcito-facilito/app <script>` — run a script in just one package.

## Tech stack

- Frontend (`apps/albumcito-facilito-app/`): Next.js 16 (App Router), TypeScript, Tailwind CSS v4. See `apps/albumcito-facilito-app/CLAUDE.md`.
- Backend (`apis/albumcito-facilito-api/`): NestJS 11, TypeScript. See `apis/albumcito-facilito-api/CLAUDE.md`.

## Skills

- `nestjs-best-practices` — apply when writing/reviewing backend code in `apis/albumcito-facilito-api/`.
- `vercel-react-best-practices` — apply when writing/reviewing frontend React/Next.js code in `apps/albumcito-facilito-app/`.
- `bdd-gherkin` — apply whenever adding BDD/Gherkin `.feature` + step-definition tests to either package (jest-cucumber on the backend, `@amiceli/vitest-cucumber` on the frontend). See each package's `CLAUDE.md` for the exact patterns and gotchas.

## Status

Frontend and backend both have their first real feature end-to-end: browsing the album catalog and opening an album to see its stickers.

- Backend: `albums` feature module (`GET /albums`, `GET /albums/:albumId`, `GET /albums/:albumId/stickers`) backed by an in-memory seed (no DB/ORM yet — persistence is still "not decided", confirm with the user before adding one). Runs on port 3001.
- Frontend: home page (`/`) lists the album catalog; `/albums/[albumId]` shows an album's stickers. Both are Server Components fetching from the backend via `app/lib/albums-api.ts`, forced dynamic (`export const dynamic = "force-dynamic"`) since the data lives in the backend, not at build time.
- Persistence layer for the backend is still not decided beyond the in-memory seed — confirm with the user before adding a database/ORM.

Update this file and the per-component `CLAUDE.md` files as real features and architecture decisions land.
