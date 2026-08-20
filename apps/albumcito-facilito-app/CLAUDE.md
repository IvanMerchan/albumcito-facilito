# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development
When you need install/develop software use context7 mcp

## Component

This is the frontend application for Albumcito Facilito, a sticker-album collection app that lets users track which stickers they own, which are missing, and which are duplicated. It is the user-facing client that consumes the backend API in `apis/albumcito-facilito-api/` (see that directory's `CLAUDE.md` for API details). For the overall product description, see the root `CLAUDE.md`.

## Tech stack

- **Framework:** Next.js 16 (App Router, `app/` directory, no `src/` dir).
- **Language:** TypeScript (strict mode).
- **Styling:** Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css`; `tailwind.config.ts` is only for JS-side config like plugins).
- **Linting:** ESLint 9 flat config (`eslint-config-next`, core-web-vitals + TypeScript rules).
- **Testing:** Vitest + React Testing Library, jsdom environment. BDD scenarios use `@amiceli/vitest-cucumber` with Gherkin `.feature` files (see the `bdd-gherkin` skill).
- **Backend integration:** `app/lib/albums-api.ts` fetches from the API at `process.env.API_URL ?? "http://localhost:3001"`, wrapped in React's `cache()`. Pages that read from it must opt out of static prerendering (`export const dynamic = "force-dynamic"`, see `app/page.tsx`) since the data lives in the backend, not at build time.
- **Auth:** `app/lib/auth-api.ts` calls `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`. Mutations (`signup`/`login`) are deliberately **not** wrapped in `cache()` — that memoizes reads for one render pass, which is wrong for a POST. The session is a JWT in an httpOnly cookie (`app/lib/session.ts`, `next/headers` `cookies()`), written by the Server Actions in `app/actions/auth.ts`. Because every API call happens server-side (Server Actions, Server Components), `API_URL` stays server-only and the backend needs no CORS config.

## Commands

Run from this directory (`apps/albumcito-facilito-app/`), or from the repo root with `pnpm --filter @albumcito-facilito/app <script>`.

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` (run from repo root) |
| Start dev server | `pnpm dev` (http://localhost:3000) |
| Build for production | `pnpm build` |
| Start production server | `pnpm start` (after `pnpm build`) |
| Run tests | `pnpm test` |
| Run tests in watch mode | `pnpm exec vitest` |
| Lint | `pnpm lint` |

## Development conventions

- Use the App Router: routes live under `app/`, one `page.tsx` per route, shared UI in `layout.tsx`.
- Co-locate tests next to the code they cover (e.g. `app/page.tsx` + `app/page.test.tsx`), following the pattern in `app/page.test.tsx`.
- For BDD scenarios, co-locate a Gherkin `.feature` file with a `*.bdd.test.tsx` step-definition file using `@amiceli/vitest-cucumber` (`loadFeature`/`describeFeature`), following `app/page.feature` + `app/page.bdd.test.tsx`. **Gotcha:** each `Given`/`When`/`Then` runs as its own Vitest test under the hood, so React Testing Library does **not** auto-clean the DOM between them — that's what lets state (e.g. a `render()` in `Given`) survive into a later `Then`. But it also means a leftover render from one `Scenario` can bleed into the next one and break queries like `getByRole`. When a feature file has more than one `Scenario`, register `AfterEachScenario(() => cleanup())` (from `@testing-library/react`) once at the top of the `describeFeature` callback — see `app/page.bdd.test.tsx`. Do not add a global `afterEach(cleanup)` in `vitest.setup.ts`: that cleans between every step too, wiping renders before later steps can assert on them.
- Reusable presentational components go in `app/components/` (e.g. `album-grid.tsx`, `sticker-grid.tsx`) — pure, prop-driven, no data fetching, so they're easy to unit test in isolation.
- Backend data access goes in `app/lib/` (e.g. `albums-api.ts`, `albums.types.ts`) — plain async functions wrapped in React's `cache()`, never called directly from client components.
- Prefer Server Components by default; add `"use client"` only when a component needs interactivity, state, or browser-only APIs. `app/components/auth-form.tsx` is the only Client Component in the app, because `useActionState` requires one.
- Server Actions live in `app/actions/*.ts` behind a file-level `"use server"` directive. **Every export of a `"use server"` file becomes a public POST endpoint** — never add that directive to a plain helper module (e.g. `app/lib/session.ts`, which writes the session cookie, is intentionally plain, not `"use server"`). `redirect()` (from `next/navigation`) throws internally, so in a Server Action it must be called **outside** any `try/catch` — see `app/actions/auth.ts`.
- Route protection is page-level (see `app/dashboard/[username]/page.tsx`): no `middleware.ts`/`proxy.ts` yet, since there is currently one protected route and it needs the real `GET /auth/me` check anyway to render the user.
- Use the `@/*` import alias (configured in `tsconfig.json`) instead of relative paths that climb more than one directory.
- Style with Tailwind utility classes directly in JSX; add shared design tokens (colors, fonts, spacing) via `@theme` in `app/globals.css` rather than inline styles.
- Keep components typed end-to-end — no `any`; rely on TypeScript strict mode (already enabled in `tsconfig.json`) to catch mistakes.
- Run `pnpm lint`, `pnpm test`, and `pnpm build` before considering a change done — `pnpm build` catches pages that need `export const dynamic = "force-dynamic"` (a page that fetches from the backend will fail to prerender at build time otherwise).

## Routes

- `/` (`app/page.tsx`) — home page, lists the album catalog (`AlbumGrid`) fetched via `getAlbums()`.
- `/albums/[albumId]` (`app/albums/[albumId]/page.tsx`) — album detail, shows its stickers (`StickerGrid`) fetched via `getAlbum(albumId)`; `notFound()` (with `not-found.tsx`) when the album doesn't exist, `loading.tsx` for the streaming fallback.
- `/signup` (`app/signup/page.tsx`) and `/login` (`app/login/page.tsx`) — render the shared `AuthForm` client component with `signupAction`/`loginAction`; on success both redirect to `/dashboard/[username]`. Neither reads cookies or the API at render time, so neither needs `force-dynamic`.
- `/dashboard/[username]` (`app/dashboard/[username]/page.tsx`) — reads the session cookie and calls `GET /auth/me`; redirects to `/login` if there's no cookie or the token is invalid/expired, or to the caller's own `/dashboard/[username]` if the URL segment doesn't match the token's user (the username is cosmetic — authorization comes entirely from the token).

## Status

Next.js 16, TypeScript, Tailwind CSS v4, ESLint, Vitest. Has two real features: the home page lists the album catalog and `/albums/[albumId]` shows an album's stickers; `/signup` and `/login` authenticate against the backend and land on `/dashboard/[username]` (see Routes above). Update this file as routing, state management, and API integration patterns evolve further.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
