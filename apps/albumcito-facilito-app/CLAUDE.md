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
- **Testing:** Vitest + React Testing Library, jsdom environment.

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
- Prefer Server Components by default; add `"use client"` only when a component needs interactivity, state, or browser-only APIs.
- Use the `@/*` import alias (configured in `tsconfig.json`) instead of relative paths that climb more than one directory.
- Style with Tailwind utility classes directly in JSX; add shared design tokens (colors, fonts, spacing) via `@theme` in `app/globals.css` rather than inline styles.
- Keep components typed end-to-end — no `any`; rely on TypeScript strict mode (already enabled in `tsconfig.json`) to catch mistakes.
- Run `pnpm lint` and `pnpm test` before considering a change done.

## Status

Scaffolded with Next.js 16, TypeScript, Tailwind CSS v4, ESLint, and Vitest. No app-specific routes/features beyond the placeholder home page have been built yet. Update this file as routing, state management, and API integration patterns are established.
