## Why

The home page currently lists the full album catalog with no signal of what's actually happening in the app. Now that sticker collections persist for real (Prisma + SQLite, added alongside onboarding), we can show visitors genuine social proof — the albums and individual stickers people are actually collecting — instead of a flat, undifferentiated list. This gives new visitors a concrete reason to sign up and supports the same acquisition goal the onboarding flow serves.

## What Changes

- New backend aggregation over `CollectedSticker` to determine the most-collected albums and the most-collected individual stickers across all users.
- New API endpoint(s) exposing that aggregation (popular albums, popular stickers with their parent album).
- New "Popular albums" section on the home page, ranked by real collection counts.
- New "Popular stickers" section on the home page, showing individual stickers (name, rarity, parent album) ranked by real collection counts — independent of the album list, per the earlier decision that this is a standalone section rather than samples embedded in album cards.
- Defined fallback behavior for when collection data is too sparse to be meaningful (e.g. a freshly seeded app with few users) — see the `popular-picks` spec for the exact threshold/behavior.

## Capabilities

### New Capabilities
- `popular-picks`: aggregating real collection data (`CollectedSticker`) into ranked "popular albums" and "popular stickers" lists, exposed via the API and rendered on the home page.

### Modified Capabilities
<!-- none: no existing openspec specs exist yet for albums/collection browsing, so there is nothing to modify -->

## Impact

- **Backend** (`apis/albumcito-facilito-api`): a new read-only aggregation on top of the existing `collection` module's Prisma-backed `CollectedSticker` table (no schema changes expected — this is a query concern, not a new table). New DTOs for the ranked response shapes.
- **Frontend** (`apps/albumcito-facilito-app`): `app/page.tsx` gains two new sections; new presentational components and a new `app/lib` data-access function.
- No breaking changes to existing endpoints or pages.
