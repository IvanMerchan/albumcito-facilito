## 1. Backend: `popular-picks` module

- [x] 1.1 Add `src/popular-picks/dto/popular-album.dto.ts` and `popular-sticker.dto.ts` (`@Expose()`-only response DTOs, following `CollectedStickerDto`'s shape) and verify they compile with `tsc --noEmit`
- [x] 1.2 Add `src/popular-picks/popular-picks.mapper.ts` (`toPopularAlbumDto`, `toPopularStickerDto`) and verify with a quick unit test that a plain object maps to the DTO with only the exposed fields (covered by 2.2's controller spec, which exercises the mapper end-to-end)
- [x] 1.3 Add `src/popular-picks/popular-picks.service.ts`: `getPopularAlbums()` and `getPopularStickers()`, using `prisma.collectedSticker.groupBy({ by: ['stickerId'], _count: true })`, rolling album totals up in application code, sorting by count desc with catalog-order tiebreak, and slicing to top 5 — verify by running the service directly against a seeded test database (see 2.1). **Deviation from design.md**: builds the candidate list by walking the album catalog directly (album → its stickers) and looking up each sticker's count in a `Map`, rather than resolving each grouped `stickerId` via `AlbumsService.findStickerById` in a loop. Same O(catalog size) complexity, same behavior, but avoids a linear `find()` scan per lookup and gets the catalog-order tiebreak for free from the iteration order + a stable sort, instead of a separate sort key.
- [x] 1.4 Add `src/popular-picks/popular-picks.controller.ts` with `GET /popular-picks/albums` and `GET /popular-picks/stickers`, no `@UseGuards` (public per spec) — verified end-to-end via 2.4's e2e test (no `Authorization` header sent)
- [x] 1.5 Add `src/popular-picks/popular-picks.module.ts` importing `AlbumsModule` (Prisma is `@Global()`, no import needed) and register `PopularPicksModule` in `src/app.module.ts` — verified: app boots and both routes appear in the Nest startup log (`Mapped {/popular-picks/albums, GET}`, `Mapped {/popular-picks/stickers, GET}`)

## 2. Backend: tests

- [x] 2.1 `src/popular-picks/popular-picks.service.spec.ts`: ranks albums/stickers by collected count descending, breaks ties by catalog order, returns empty arrays when no stickers are collected — verified with `pnpm test` (all passing)
- [x] 2.2 `src/popular-picks/popular-picks.controller.spec.ts`: controller returns the mapped DTOs and never includes internal fields — verified with `pnpm test` (all passing)
- [x] 2.3 `src/popular-picks/popular-picks.feature` + `popular-picks.bdd.spec.ts` covering: albums ranked by real collection counts, stickers ranked by real collection counts, tie-breaking by catalog order, empty-collection-data state — verified with `pnpm test` (all passing)
- [x] 2.4 `test/popular-picks.e2e-spec.ts`: seeds a couple of users via `POST /auth/signup` + `POST /me/stickers`, then asserts `GET /popular-picks/albums` and `GET /popular-picks/stickers` reflect the real counts **without** an `Authorization` header, plus a case on a freshly reset database asserting both endpoints return empty arrays — verified with `pnpm test:e2e` (all passing)
- [x] 2.5 Run `pnpm lint && pnpm test && pnpm test:e2e` in `apis/albumcito-facilito-api` and confirm everything passes — 54 unit/BDD tests + 19 e2e tests, all green

## 3. Frontend: data layer and components

- [x] 3.1 Add `app/lib/popular-picks.types.ts` (`PopularAlbum`, `PopularSticker`) and verify with `tsc --noEmit`
- [x] 3.2 Add `app/lib/popular-picks-api.ts` (`getPopularAlbums`, `getPopularStickers`, both wrapped in React's `cache()` since they're pure reads, following `albums-api.ts`) — verified with `tsc --noEmit`; live-verified against the running API in 6.1 rather than a throwaway script
- [x] 3.3 Add `app/components/popular-albums.tsx`: renders a ranked list of albums with their collected count, returns `null` when the list is empty (per the spec's "omit rather than placeholder" requirement) — verify with a component test (see 4.1)
- [x] 3.4 Add `app/components/popular-stickers.tsx`: renders a ranked list of stickers (name, rarity, parent album), returns `null` when empty — verify with a component test (see 4.2)
- [x] 3.5 Wire both components into `app/page.tsx` as standalone sections (separate from the existing `AlbumGrid`), fetching via `getPopularAlbums()`/`getPopularStickers()` — verify visually with `pnpm dev` (deferred to 6.1's manual verification)
- [x] 3.6 Run `pnpm lint && pnpm build` in `apps/albumcito-facilito-app` and confirm the build succeeds with `/` still marked dynamic (`ƒ`) — confirmed

## 4. Frontend: tests

- [x] 4.1 `app/components/popular-albums.test.tsx`: renders the ranked list; renders nothing (`container.firstChild` is `null` or equivalent) when given an empty array — verified with `pnpm test` (passing)
- [x] 4.2 `app/components/popular-stickers.test.tsx`: same pattern for stickers — verified with `pnpm test` (passing)
- [x] 4.3 Updated `app/page.test.tsx` (mocked `getPopularAlbums`/`getPopularStickers`; added tests for both-sections-render and both-omitted) and `app/page.bdd.test.tsx` (mocked the same, defaulted to `[]` in the existing scenarios so they stay unaffected) — verified with `pnpm test` (passing). Also added `afterEach(cleanup)` to `page.test.tsx` since it now has 3 tests in one file and this project has no global auto-cleanup between plain (non-BDD) tests.
- [x] 4.4 Run `pnpm test` in `apps/albumcito-facilito-app` and confirm everything passes — 48 tests, all green

## 5. Documentation

- [x] 5.1 Update `apis/albumcito-facilito-api/CLAUDE.md` (Domain modules: add `popular-picks`; Status) to describe the new module
- [x] 5.2 Update `apps/albumcito-facilito-app/CLAUDE.md` (Routes: note the home page's new sections; Status)
- [x] 5.3 Update root `CLAUDE.md` Status to mention popular albums/stickers on the home page (also added a "Planning workflow" section documenting the new OpenSpec-based process this change was built with)

## 6. Manual verification

- [x] 6.1 With `pnpm dev` (both apps), sign up 2-3 users, have each add a different sticker via onboarding (some overlapping to create a real ranking), then load `/` and confirm "Popular albums" and "Popular stickers" reflect the real counts and ordering; then reset the dev database (or use a fresh one) and confirm both sections are absent when nothing has been collected yet. Verified in a real browser against a fresh `dev.db`: (1) empty DB → neither section rendered; (2) user1 + user2 both collected "Cody explorador" (cody-aventuras-01), user3 collected "Cody astronauta" (cody-espacio-01) → home page showed "Álbumes populares" with Cody Aventuras (2 estampas) above Cody en el Espacio (1), and "Estampas populares" with Cody explorador (2 veces) above Cody astronauta (1 vez) — matches the API responses exactly.
