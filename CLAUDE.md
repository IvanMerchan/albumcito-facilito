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

## Status

Both the frontend (`apps/albumcito-facilito-app/`) and backend (`apis/albumcito-facilito-api/`) are scaffolded. Frontend: Next.js 16, TypeScript, Tailwind CSS, ESLint, Vitest. Backend: NestJS 11, TypeScript, ESLint, Jest/Supertest — only the default placeholder module exists, no domain modules (albums, stickers, users, etc.) yet. Persistence layer for the backend is not yet decided. Update this file and the per-component `CLAUDE.md` files as real features and architecture decisions land.
