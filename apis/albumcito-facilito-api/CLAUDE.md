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
- **Testing:** Jest + `ts-jest` for unit tests, Jest + Supertest for e2e tests. BDD scenarios use `jest-cucumber` with Gherkin `.feature` files (see the `bdd-gherkin` skill).
- **Validation:** `class-validator` + `class-transformer`, wired via a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) in `src/main.ts`.
- **Persistence layer:** not yet decided beyond an in-memory seed used by the `albums` module — confirm with the user before adding a database/ORM.

## Commands

Run from this directory (`apis/albumcito-facilito-api/`), or from the repo root with `pnpm --filter @albumcito-facilito/api <script>`.

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` (run from repo root) |
| Start dev server (watch mode) | `pnpm dev` or `pnpm start:dev` (http://localhost:3001) — `dev` is what root `pnpm dev` (Turborepo) runs |
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
- For BDD scenarios, co-locate a Gherkin `.feature` file with a `*.bdd.spec.ts` step-definition file using `jest-cucumber` (`loadFeature`/`defineFeature`), following `src/app.controller.feature` + `src/app.controller.bdd.spec.ts`. Use `loadFeature(path, { loadRelativePath: true })` so the feature path resolves relative to the spec file.
- Keep code typed end-to-end — avoid `any` in new code even though the base `tsconfig.json` has `noImplicitAny: false` for compatibility with generated files.
- Never return domain entities directly from a controller — map to a response DTO (`class-transformer`'s `@Expose()` + `plainToInstance(..., { excludeExtraneousValues: true })`), following `src/albums/albums.mapper.ts`. This keeps the API response shape stable and independent from the internal entity shape (e.g. `AlbumSummaryDto` omits the full `stickers` list that `AlbumDetailDto` includes).
- Validate every route param with a DTO decorated with `class-validator`, following `src/albums/dto/album-id.param.dto.ts`.
- Run `pnpm lint`, `pnpm test`, and `pnpm test:e2e` before considering a change done.

## Domain modules

- `src/albums/` — first domain module. `GET /albums` (list, `AlbumSummaryDto[]`), `GET /albums/:albumId` (detail incl. stickers, `AlbumDetailDto`, 404 if unknown), `GET /albums/:albumId/stickers` (`StickerDto[]`). Data comes from the in-memory seed in `src/albums/albums.data.ts` (`Album`/`Sticker` types in `src/albums/entities/album.entity.ts`); no database yet. Use this module as the reference pattern (module/controller/service/mapper/dto/entities + `*.spec.ts` + `*.bdd.spec.ts` + e2e in `test/albums.e2e-spec.ts`) for any new feature module.

## Status

NestJS 11, TypeScript, ESLint, Jest/Supertest, `class-validator`/`class-transformer`. Has the `albums` feature module (see above) alongside the default placeholder `AppController`/`AppService`. Update this file as the data model, endpoints, and persistence layer evolve.
