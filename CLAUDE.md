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

Frontend and backend have three features end-to-end: browsing the album catalog (and opening an album to see its stickers), email/password signup and login, and a mandatory onboarding step that has every new signup add a first sticker to their personal collection before reaching their dashboard.

- Backend: `albums` feature module (`GET /albums`, `GET /albums/:albumId`, `GET /albums/:albumId/stickers`, in-memory seed), `auth` feature module (`POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, JWT-protected), and `collection` feature module (`POST /me/stickers`, `GET /me/stickers`, JWT-protected). `auth` and `collection` are backed by **Prisma + SQLite** — the first real persistence in this repo (see `apis/albumcito-facilito-api/CLAUDE.md`'s "Persistence" section for the details, including a couple of Prisma-7-specific gotchas). `albums` stays in-memory on purpose (fixed catalog content, not user data). Runs on port 3001.
- Frontend: home page (`/`) lists the album catalog; `/albums/[albumId]` shows an album's stickers; `/signup` and `/login` authenticate against the backend, with `signup` redirecting to `/onboarding` (not the dashboard) and `login` going straight to `/dashboard/[username]`. `/onboarding` → `/onboarding/[albumId]` lets the new user pick an album and a sticker; `/dashboard/[username]` then shows a summary of their collection. The session is a JWT in an httpOnly cookie, set by a Server Action — no browser-side call ever touches the API directly, so no CORS is needed.
- Onboarding also drives a business metric: `User.onboardingCompleted` flips to `true` on the first sticker added, and the backend logs the signup-to-first-sticker duration at that moment — see `apis/albumcito-facilito-api/CLAUDE.md`.
- Registered users and their collections now survive an API restart (Prisma/SQLite-backed). The album catalog does not need to, since it's a fixed in-memory seed.

Update this file and the per-component `CLAUDE.md` files as real features and architecture decisions land.
