# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

When you need to install/develop software use context7 mcp.

## Component

This is the backend API for Albumcito Facilito, a sticker-album collection app that lets users track which stickers they own, which are missing, and which are duplicated. It is consumed by the frontend in `apps/albumcito-facilito-app/` (see that directory's `CLAUDE.md`). For the overall product description, see the root `CLAUDE.md`.

## Tech stack

- **Framework:** NestJS 11.
- **Language:** TypeScript 5 (`experimentalDecorators` + `emitDecoratorMetadata`, required by Nest's DI).
- **HTTP adapter:** Express (`@nestjs/platform-express`).
- **Linting:** ESLint 9 flat config (`typescript-eslint` + `eslint-plugin-prettier`).
- **Testing:** Jest + `ts-jest` for unit tests, Jest + Supertest for e2e tests.
- **Persistence layer:** not yet decided — confirm with the user before adding a database/ORM.

## Commands

Run from this directory (`apis/albumcito-facilito-api/`), or from the repo root with `pnpm --filter @albumcito-facilito/api <script>`.

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` (run from repo root) |
| Start dev server (watch mode) | `pnpm start:dev` (http://localhost:3000) |
| Start dev server (debug + watch) | `pnpm start:debug` |
| Build for production | `pnpm build` |
| Start production server | `pnpm start:prod` (after `pnpm build`) |
| Run unit tests | `pnpm test` |
| Run unit tests in watch mode | `pnpm test:watch` |
| Run unit tests with coverage | `pnpm test:cov` |
| Run e2e tests | `pnpm test:e2e` |
| Lint (auto-fix) | `pnpm lint` |
| Format | `pnpm format` |

## Development conventions

- Organize code by feature module (`src/<feature>/<feature>.module.ts`, `.controller.ts`, `.service.ts`), following Nest's standard module/controller/provider/service structure — mirror the pattern in `src/app.module.ts`.
- Keep controllers thin: they should only handle routing, validation via DTOs, and delegate business logic to services/providers.
- Use constructor-based dependency injection (`private readonly xService: XService`) — never instantiate providers manually.
- Co-locate unit tests next to the code they cover (`*.spec.ts`), following `src/app.controller.spec.ts`; put end-to-end tests in `test/*.e2e-spec.ts`, following `test/app.e2e-spec.ts`.
- Keep code typed end-to-end — avoid `any` in new code even though the base `tsconfig.json` has `noImplicitAny: false` for compatibility with generated files.
- Run `pnpm lint` and `pnpm test` before considering a change done.

## Status

Scaffolded with NestJS 11, TypeScript, ESLint, and Jest/Supertest. Only the default placeholder module/controller/service exist — no domain modules (albums, stickers, users, etc.) have been built yet. Update this file as the data model, endpoints, and persistence layer are established.
