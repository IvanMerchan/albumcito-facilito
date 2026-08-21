## Purpose

Surfaces real collection activity — the albums and individual stickers that users are actually collecting across the whole app — on the home page, to give new visitors social proof and a concrete reason to sign up.

## ADDED Requirements

### Requirement: Popular albums ranking
The system SHALL rank albums by the total number of `CollectedSticker` records across all users whose sticker belongs to that album, and SHALL expose the top 5 albums by that count, descending.

#### Scenario: Albums ranked by total collected stickers
- **WHEN** the popular albums list is requested
- **THEN** albums are ordered from most collected stickers (summed across all users) to fewest, limited to the top 5

#### Scenario: Tied album counts
- **WHEN** two or more albums have the same total collected-sticker count
- **THEN** they are ordered by their existing catalog order (the order returned by the album catalog) as a stable tiebreaker

### Requirement: Popular stickers ranking
The system SHALL rank individual stickers by how many `CollectedSticker` records reference them across all users, and SHALL expose the top 5 stickers by that count, descending, each including its parent album's id and name.

#### Scenario: Stickers ranked by times collected
- **WHEN** the popular stickers list is requested
- **THEN** stickers are ordered from most-collected to least-collected across all users, limited to the top 5, each with its parent album identified

#### Scenario: Tied sticker counts
- **WHEN** two or more stickers have the same collected count
- **THEN** they are ordered by their existing catalog order (album order, then sticker number within the album) as a stable tiebreaker

### Requirement: Empty collection data
The system SHALL treat "no stickers collected by anyone yet" as a valid, non-error state.

#### Scenario: No collection data exists
- **WHEN** no user has collected any sticker
- **THEN** both the popular albums and popular stickers lists are empty
- **AND** the home page does not render either "Popular albums" or "Popular stickers" section

### Requirement: Public access
The system SHALL expose popular albums and popular stickers without requiring authentication, consistent with the rest of the album catalog being public.

#### Scenario: Anonymous visitor sees popular picks
- **WHEN** a visitor without a session requests the home page or the popular-picks data
- **THEN** the popular albums and popular stickers data is returned/rendered the same as for a signed-in user

### Requirement: Home page presentation
The system SHALL render a "Popular albums" section and a "Popular stickers" section on the home page as standalone sections, separate from the full album catalog listing, whenever their respective lists are non-empty.

#### Scenario: Both sections have data
- **WHEN** the home page loads and both popular lists are non-empty
- **THEN** the home page shows a "Popular albums" section and a separate "Popular stickers" section, in addition to the existing full album catalog

#### Scenario: Only one list has data
- **WHEN** one popular list is empty and the other is not
- **THEN** only the section with data is rendered; the empty one is omitted rather than shown with a placeholder
