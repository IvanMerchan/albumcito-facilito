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
- **Auth:** `@nestjs/jwt` for signing/verifying tokens, `bcryptjs` for password hashing (pure JS — no native build step). Deliberately no Passport: there is a single protected route, handled by a plain `CanActivate` guard (`src/auth/jwt-auth.guard.ts`).
- **Persistence:** Prisma 7 + SQLite (`@prisma/client`, `@prisma/adapter-libsql`), used by the `auth` and `collection` modules. `albums` is still the in-memory seed — see "Persistence" below for what that split means and why.

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
| Generate the Prisma client | `pnpm prisma:generate` (also runs automatically on `postinstall`) |
| Create/apply a migration (dev) | `pnpm prisma:migrate` |

Copy `.env.example` to `.env` before running anything that touches the database (`DATABASE_URL="file:./dev.db"` by default).

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

## Persistence

Prisma 7 + SQLite, backing the `User` and `CollectedSticker` models (`prisma/schema.prisma`). `albums` deliberately stays an in-memory seed (`src/albums/albums.data.ts`) — the album catalog is fixed content, not user data, so there was nothing to gain from moving it into the database for this iteration.

- `src/prisma/prisma.module.ts` is `@Global()` and exports `PrismaService` — inject it directly in any service, no need to import `PrismaModule` per-feature-module.
- **Prisma 7 changed how the client connects**: `schema.prisma`'s `datasource` block no longer takes a `url`. `prisma.config.ts` (used only by the CLI — `migrate`/`generate`) reads `DATABASE_URL` itself. `PrismaService` at runtime requires an explicit driver adapter (`@prisma/adapter-libsql`, chosen over `@prisma/adapter-better-sqlite3` because it ships prebuilt binaries — no native compiler needed on Windows, same reasoning as `bcryptjs` over `bcrypt`).
- Entities in `entities/*.entity.ts` re-export the Prisma-generated type (`export type { User } from '@prisma/client'`) instead of hand-maintaining a duplicate interface, so the shape can't drift from the schema.
- **Test isolation:** `src/prisma/reset-database.ts` (`resetDatabase(prisma)`) clears every table; call it in each spec's `beforeEach` with a real `PrismaService` in the `TestingModule` (no mocks — same house style as everything else). Tests run against a separate `test.db`, set up by `src/test-env.setup.ts` (a Jest `setupFile`) plus the `pretest`/`pretest:e2e` scripts (`prisma migrate deploy` against it).
- **SQLite cannot handle concurrent writers well.** Running Jest's default parallel workers against one SQLite file causes `deleteMany()` calls to time out under lock contention. `test`/`test:cov`/`test:e2e` all pass `--runInBand` to force serial execution — this is required, not optional, and also makes the suite noticeably faster (no worker-pool startup cost).
- `pnpm-workspace.yaml`'s `allowBuilds` had to explicitly allow `prisma` and `@prisma/engines` (pnpm blocks install scripts by default) — expect the same for any future dependency with a native/binary postinstall step.

## Domain modules

- `src/albums/` — first domain module, and the reference pattern (module/controller/service/mapper/dto/entities + `*.spec.ts` + `*.bdd.spec.ts` + e2e in `test/albums.e2e-spec.ts`) for any new feature module. `GET /albums` (list, `AlbumSummaryDto[]`), `GET /albums/:albumId` (detail incl. stickers, `AlbumDetailDto`, 404 if unknown), `GET /albums/:albumId/stickers` (`StickerDto[]`), plus `AlbumsService.findStickerById(stickerId)` (used by `collection` to validate a sticker exists — returns `{ album, sticker }` so callers don't have to resolve the parent album separately). Data comes from the in-memory seed in `src/albums/albums.data.ts`.
- `src/auth/` — signup/login, now Prisma-backed (was in-memory in an earlier iteration; see git history if you need the old array-based version for reference). `POST /auth/signup` (email + password + name, `201`, `ConflictException` on a duplicate email), `POST /auth/login` (email + password, `200` via `@HttpCode(HttpStatus.OK)` since Nest's `@Post` default is `201`, generic `UnauthorizedException` on any bad credential so the endpoint can't be used to enumerate emails), `GET /auth/me` (guarded by `JwtAuthGuard`, returns `UserDto`). `username` is derived from the email local part (`src/auth/auth.username.ts`, `deriveUsername`), never supplied by the client; collisions get a numeric suffix (`-2`, `-3`, ...). `JWT_SECRET`/token expiry are wired in `src/auth/auth.module.ts` via `process.env.JWT_SECRET ?? <dev fallback>` — the fallback is dev-only and must be overridden before any non-local deploy. `AuthModule` exports `JwtAuthGuard` **and** the `JwtModule` it wraps (not just the guard) — `@UseGuards(JwtAuthGuard)` resolves the guard's own dependencies (`JwtService`) in the *consuming* module's injector context, so any module using the guard needs `JwtService` transitively visible too. `collection` is the first consumer outside `auth` and is what surfaced this.
- `src/collection/` — a user's sticker collection, and the business logic behind the onboarding activation metric. `POST /me/stickers` (body `{ stickerId }`, guarded, idempotent — adding the same sticker twice is a no-op, not a `409`) and `GET /me/stickers` (guarded), both returning `CollectedStickerDto` (resolves the sticker's album/name via `AlbumsService` so the frontend doesn't need a second call). The first time a user adds a sticker, `CollectionService.addSticker` flips `User.onboardingCompleted` to `true` and logs a structured event (`{ event: "onboarding_completed", userId, signupAt, completedAt, durationMs }`) — the timestamps themselves live in the database (`User.createdAt`, `CollectedSticker.collectedAt`), so the metric survives even if the log line doesn't.

## Status

NestJS 11, TypeScript, ESLint, Jest/Supertest, `class-validator`/`class-transformer`, Prisma 7 + SQLite. Has the `albums`, `auth`, and `collection` feature modules (see above) alongside the default placeholder `AppController`/`AppService`. Update this file as the data model, endpoints, and persistence layer evolve.
