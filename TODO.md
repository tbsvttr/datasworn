# Datasworn TODO

## ID Coverage

### Completed

- [x] **Move trigger conditions** - Added in v0.0.6
  - Format: `move.condition:starforged/adventure/face_danger.0`
  - Embedded: `asset.ability.move.condition:starforged/path/archer.0.craft_projectiles.0`
- [x] **Move outcomes** - Added in v0.0.7
  - Format: `move.outcome:starforged/adventure/face_danger.strong_hit`
  - Embedded: `asset.ability.move.outcome:starforged/path/archer.0.craft_projectiles.weak_hit`

### Remaining

- [ ] **Roll options** - `trigger.conditions[].roll_options[]` (~602 objects)
  - Would enable UI tools to reference specific stat choices
  - Format: `move.condition.roll_option:starforged/adventure/face_danger.0.0`
- [ ] **Planet sub-oracles** - `observed_from_space`, `life`, etc. (~11 each per planet type)
  - Would enable direct references in tools

---

## Viewer Improvements

### High Value (Completed)

- [x] Search - Find items by name or content across all rulesets
- [x] Keyboard navigation - `/` to focus search, `Escape` to clear
- [x] Breadcrumb trail - Show path to current item for context
- [x] Copy ID button - Quick copy of `datasworn:` ID for referencing

### Medium Value

- [x] Dark mode - Theme toggle with localStorage persistence
- [x] Filter by type - Show only moves/oracles/assets in tree
- [x] Expand/collapse all - Tree controls
- [x] Linked oracle rolls - Markdown links like `[Action](datasworn:...)` are clickable
- [x] Delve renderers - Proper display for sites, themes, domains
- [x] Roll history - Show recent oracle rolls in session

### Nice to Have

- [x] Hover previews - Preview linked items on hover
- [x] Mobile layout - Responsive sidebar/detail toggle
- [ ] Cursed oracle support - Use Sundered Isles `curse` tags for alternatives
- [ ] Export/print view - Clean printable format
- [ ] Favorites - Bookmark frequently used items

---

## Tags System

### Problem

The `rules.tags` section has inconsistent implementation:

| Ruleset | Tags Defined | Issue |
|---------|--------------|-------|
| Ironsworn Classic | None | `tags: {}` (commented out) |
| Delve | None | No tags section |
| Starforged | 6 tags | `$schema` definitions only |
| Sundered Isles | 12 tags | `$schema` definitions only |

Technical `$schema` descriptions are written for tool authors, not players. Player-facing descriptions (e.g., "Features supernatural or mythic powers") are missing.

### Recommended Fix (Option B)

Add `description` field alongside `$schema`:

```yaml
tags:
  supernatural:
    description: "Features supernatural or mythic powers"  # Player-facing
    $schema:
      description: "Technical schema info..."  # Tool-facing
      type: boolean
    node_types: [asset, row]
```

### Tasks

- [ ] Add `description` field to tag definitions in source YAML
- [ ] Backport relevant tags to Classic (e.g., `requires_allies`)
- [ ] Backport relevant tags to Delve
- [ ] Update viewer to render `rules.tags` with player-friendly descriptions

---

## Ancient Wonders Data Quality

Feedback from southpole regarding converter-generated data.

### Issues

1. **Missing Focus Table** - May need core "Focus" oracle or verify `splinter_focus`
2. **Table Ordering** - Tables not in book order (alphabetical vs physical book structure)
3. ~~**Missing Planet Hierarchy**~~ - ✅ Fixed: 20 planet type collections created
4. ~~**Missing Links**~~ - ✅ Fixed: 326 planet world links added
5. **Missing Failure Track** - Ancient Wonders uses the failure track mechanic (like Delve p. 58ff)

### Tasks

- [x] Add "broken" impact to item assets (PR #7 by kat)
- [x] **Add failure track** - Ancient Wonders uses failure track mechanic, needs special track added (see Delve p. 58ff for reference)
- [x] **Clean up oracle text formatting** - 68 entries had `>Name; pg N` format, now cleaned
- [x] Identify and add missing Focus oracle - Verified: `oracle_rollable:ancient_wonders/other/focus` exists (100 entries)
- [ ] Add `_source.page` numbers to match book ordering (blocked: needs PDF for page numbers)
- [x] Reorganize `planets_expanded` into hierarchical collections
  - ~262 oracles grouped into 20 planet type collections
  - Creates IDs like `oracle_collection:ancient_wonders/planets_expanded/desert_world`
  - Script: `scripts/reorganize-planets.ts`
- [x] Add datasworn: links for planet world references
  - [x] Starforged oracle references (80 links - Action, Theme, Focus, Descriptor, Planet, etc.)
  - [x] HTML entity decode: `&gt;` → `>` (515 refs)
  - [x] Planet world links: `>Desert World; pg 50` → `[Desert World](datasworn:...)` (326 refs)
  - [x] Biome references: `>Badlands (Desert World); pg 50` → linked format
  - [ ] Starforged/Sundered Isles page references ("SI, pg 250" etc.) - lower priority

---

## Starsmith / Ironsmith Expansions

### Starsmith (for Starforged) - by Eric Bright

Currently includes **Expanded Oracles** (~9,800 oracle entries) and **Assets** (32).

Recent improvements (PR #8 by southpole):

- [x] Synced ID naming conventions with Starforged (e.g., `derelicts` → `derelict`, `vaults` → `precursor_vault`)
- [x] Added page numbers to oracle collections
- [ ] **Page numbers for individual oracles** - Collections done, individual oracles still need page numbers

Missing content:

- [x] **New Assets** - 32 assets across all categories (Module: 7, Path: 15, Companion: 5, Deed: 4, Support Vehicle: 1)
- [x] **Additional Oracles** - 7 oracles added (Random NPC Conversation, Quick Flora, Starship Quirks, Registry Number)
- [ ] **Mecha Mercs** - Modular giant robot system with 4 chassis types (adds new mechanics - harder to convert)

Source: [playeveryrole.com/starsmith-products](https://playeveryrole.com/starsmith-products/)

FoundryVTT module available: [jendave/starsmith-compendiums](https://github.com/jendave/starsmith-compendiums)

### Ironsmith (for Classic Ironsworn) - by Eric Bright

Currently includes **87 assets** and **76 oracles**.

- [x] **Core Assets** - 27 assets (Companion 4, Path 15, Ritual 7, Combat Talent 1)
- [x] **Mythology flavor packs** - 60 assets (Japanese 14, Indian 12, African 11, Norse 11, South American 12)
- [x] **Oracles** - 76 oracles across 10 categories (Corruption, Quests, Mystery Vow, Monster Hunting, etc.)
- [ ] Site/Delve Themes, Domains, Foes

FoundryVTT module available: [jendave/ironsmith-compendiums](https://github.com/jendave/ironsmith-compendiums)

License: CC-BY-4.0

### Starforging Ironsworn - by iceyman

Homebrew bringing Starforged mechanics to Classic Ironsworn. Updated to use "Follow a Path" from Ironsworn Lodestar.

- [ ] Assess PDF structure for conversion feasibility
- [ ] Potentially contains: moves, assets, oracles

Source: Discord (IS15E-ish Ironsworn Upgraded.zip)

Note: kat mentioned there may be a second "starforged ironsworn" project - need to identify it.

---

## Schema Enhancements

### Dual-Card Assets (Ancient Wonders)

Ancient Wonders has "Special Companions" with two physical cards (recto/verso). Currently modeled as separate assets (e.g., `ace_pilot_1`, `ace_pilot_2`).

Proposed backwards-compatible enhancement:

- [ ] Add optional `card_group` field to link paired assets
- [ ] Add optional `card_index` field (0=recto, 1=verso)
- [ ] Apps can render as flip-card or keep as separate assets

---

## Inline Code TODOs

Items extracted from `TODO`/`FIXME`/`HACK` comments in source files.

### Schema

- [ ] **OracleCollection color description**: Add "An optional thematic color for this column" (see Starforged p. 337)
  — `src/schema/oracles/OracleCollection.ts`
- [ ] **DelveSiteDomain defaults**: Disabled because defaults make TypeCompiler upset — investigate
  — `src/schema/delve/DelveSiteDomain.ts`
- [ ] **TagRule type safety**: Update TagRule type to match expected shape (2 locations)
  — `src/schema/utils/generateRulesetSchemas.ts`
- [ ] **Generate dummy schemas**: Generate placeholder schemas so overrides can be inserted later
  — `src/schema/utils/generateRulesetSchemas.ts`
- [ ] **Computed properties**: Support function-based computed properties
  — `src/schema/utils/Computed.ts`
- [x] **canonicalTags enums**: Convert `curse_behavior` and `region` from `Type.String()` to enums
  — `src/schema/tags/canonicalTags.ts`
- [ ] **Dice rolls**: Support arbitrary dice expressions (e.g. 1d6); consider `recommended_rolls`
  — `src/schema/common/Rolls.ts`
- [ ] **Fields enhance_player**: Complete the `enhance_player` field implementation
  — `src/schema/common/Fields.ts`
- [ ] **TagRule automation**: Generate node types by iterating objects with 'tags' properties
  — `src/schema/rules/TagRule.ts`
- [ ] **TagSchema JTD**: Add JSON schema type stub library as dependency
  — `src/schema/rules/TagSchema.ts`
- [ ] **Package construction config**: Configure more of package construction from build config
  — `src/schema/tools/build/index.ts`

### Scripts

- [ ] **Validation stubs**: Implement actual validation in `jsl.ts` format validators
  — `src/scripts/validation/jsl.ts`
- [x] **ID error reporting**: Report specific files where bad IDs exist
  — `src/scripts/datasworn/writeDatasworn.ts`
- [x] **ID ref optimization**: Grab all ID refs when deserializing to avoid redundant crawls
  — `src/scripts/datasworn/writeDatasworn.ts`
- [ ] **JTD patternProperties**: Verify handling is safe beyond Dictionary-style usage
  — `src/scripts/json-typedef/utils.ts`
- [ ] **JTD metadata omission**: Track down why some metadata gets omitted
  — `src/scripts/json-typedef/utils.ts`
- [ ] **i18n extraction**: Complete implementation — requires `loadDataswornNamespace` or refactoring
  — `src/scripts/i18n/extractLocaleStrings.ts`, `src/scripts/i18n/index.ts`
- [ ] **i18n tags**: Use tags to distinguish sense/part of speech
  — `src/scripts/i18n/extractLocaleStrings.ts`

### Known Limitations

- JSON Schema draft migration to `2020-12/meta/core` blocked by VSCode support
  — `src/scripts/const.ts`

---

## Dependencies (Resolved)

- [x] Evaluate `jtd` - Official RFC 8927 implementation, stable spec
- [x] Evaluate `json-schema` - Replaced with `@types/json-schema`
