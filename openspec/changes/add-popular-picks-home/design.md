## Context

Two data sources exist today with no prior cross-referencing beyond a single lookup helper: `CollectedSticker` (Prisma/SQLite, owned by the `collection` module) records who collected which `stickerId`, while the album catalog (`albums` module) is an in-memory seed with no `albumId` stored on `CollectedSticker` — `AlbumsService.findStickerById(stickerId)` is the only bridge between them today. Popular-picks needs counts aggregated from the database, joined with names/metadata that only exist in the in-memory seed. See proposal.md for why this matters now.

## Goals / Non-Goals

**Goals:**
- A single efficient query path for "top 5 albums" and "top 5 stickers" by real collection counts, satisfying the spec's tie-breaking rules.
- Keep the existing module boundaries clean: this is a new, public, read-only concern — not user-scoped data, so it doesn't belong under `collection`'s `/me/...` routes.

**Non-Goals:**
- Caching or precomputing rankings. Traffic and dataset size don't warrant it yet.
- Time-windowed "trending" (e.g. popular this week) — only all-time totals.
- Personalized rankings ("popular among people like you") — global aggregate only.
- Any change to the `CollectedSticker` schema (no `albumId` column added) — see Decisions and the risk it trades off.

## Decisions

**New `popular-picks` module, not an extension of `collection`.** `CollectionController`'s routes are all user-scoped (`/me/stickers`, guarded). Popular picks is global and public. Mixing them under the same controller would make `/me/...` ambiguous. A dedicated `src/popular-picks/` module (service + controller, mirroring the existing module-per-concern pattern used by `albums`/`auth`/`collection`) depends on `PrismaService` (for the raw counts) and `AlbumsService` (for names/metadata) — the same dependency shape `CollectionService` already has.

**Album rollup computed in application code, not the database.** Prisma's `groupBy` on `CollectedSticker.stickerId` with `_count` gives per-sticker totals directly (this alone answers "popular stickers"). Rolling those up into "popular albums" needs to know which album each `stickerId` belongs to — but that mapping only lives in the in-memory seed, not the database. Two options: (a) denormalize an `albumId` column onto `CollectedSticker` so the album rollup can happen in SQL, or (b) fetch the per-sticker counts, resolve each distinct `stickerId` to its album via `AlbumsService.findStickerById`, and sum in application code. Chose (b): the proposal explicitly rules out schema changes, and the catalog is small enough (tens of stickers total) that summing in application code is trivial. Revisit with a denormalized `albumId` if the catalog grows to a size where this stops being cheap.

**No caching for v1.** Every request runs one `groupBy` query. This matches the existing performance posture — `getAlbums()`/`getMyStickers()` are already uncached per-request reads — so it's not a regression, just consistent with how the rest of the app already behaves at this scale.

**Response DTOs mirror the existing `collection` module's shape.** `PopularAlbumDto` (`albumId`, `name`, `coverEmoji`, `collectedCount`) and `PopularStickerDto` (`stickerId`, `stickerName`, `rarity`, `albumId`, `albumName`, `collectedCount`), built with `@Expose()` + `plainToInstance`, same as `CollectedStickerDto`.

## Risks / Trade-offs

- **[Risk]** Resolving every distinct collected `stickerId` through `AlbumsService.findStickerById` in a loop is O(distinct stickers collected) in application code, not a single SQL query. → **Mitigation**: fine at current catalog scale (tens of stickers); revisit with a denormalized `albumId` column if the catalog grows substantially.
- **[Risk]** No caching means every home-page load triggers a fresh aggregation query. → **Mitigation**: consistent with the existing uncached-per-request pattern already used for the album catalog and a user's collection; not a new class of problem.
- **[Risk]** The empty-state behavior (hide a section entirely rather than show it empty) adds conditional rendering on the frontend. → **Mitigation**: mirrors the empty-state pattern already used by `app/components/album-grid.tsx`.
