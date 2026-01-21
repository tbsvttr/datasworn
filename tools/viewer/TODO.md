# Viewer Improvements

## High Value

- [x] **Search** - Find items by name or content across all rulesets
- [x] **Keyboard navigation** - `/` to focus search, `Escape` to clear
- [x] **Breadcrumb trail** - Show path to current item for context
- [x] **Copy ID button** - Quick copy of `datasworn:` ID for referencing

## Medium Value

- [ ] **Dark mode** - Theme toggle
- [ ] **Filter by type** - Show only moves/oracles/assets in tree
- [ ] **Expand/collapse all** - Tree controls
- [ ] **Roll history** - Show recent oracle rolls in session
- [ ] **Linked oracle rolls** - When result suggests another oracle, make it clickable
- [ ] **Delve renderers** - Proper display for sites, themes, domains

## Nice to Have

- [ ] **Hover previews** - Preview linked items on hover
- [ ] **Mobile layout** - Responsive sidebar/detail toggle
- [ ] **Cursed oracle support** - Use Sundered Isles `curse` tags to offer cursed alternatives
- [ ] **Export/print view** - Clean printable format
- [ ] **Favorites** - Bookmark frequently used items

---

## Tags Problem Analysis

### Current State

The `rules.tags` section in Datasworn has inconsistent implementation across rulesets:

| Ruleset | Tags Defined | Content |
|---------|--------------|---------|
| Ironsworn Classic | None | `tags: {}` (commented out) |
| Delve | None | No tags section |
| Starforged | 6 tags | `$schema` definitions only |
| Sundered Isles | 12 tags | `$schema` definitions only |

### The Problem

1. **Technical metadata shown to players**: The `$schema` descriptions are written for tool authors (e.g., "This oracle is the cursed version of one or more oracles. Ignore matches for its own ID...") rather than players
2. **Missing player-facing descriptions**: Tags like `supernatural`, `technological`, `recommended` are player-facing info (see Sundered Isles Asset Guide p.14) but have no player-friendly explanations in the data
3. **Inconsistent across rulesets**: Classic/Delve have no tags; SF/SI have technical-only definitions
4. **Cross-ruleset compatibility info missing**: Which SF content works in SI (and vice versa) is useful player info but not cleanly represented

### Options

#### Option A: Viewer-only fix (current approach)
- Hardcode player-friendly labels/descriptions in the viewer
- Already done for asset tags display
- **Pros**: Quick, no data changes needed
- **Cons**: Duplicates knowledge, doesn't fix the source data, other tools don't benefit

#### Option B: Add `description` field alongside `$schema`
```yaml
tags:
  supernatural:
    description: "Features supernatural or mythic powers"  # Player-facing
    $schema:
      description: "Technical schema info..."  # Tool-facing
      type: boolean
    node_types: [asset, row]
```
- **Pros**: Backwards compatible, clean separation of concerns
- **Cons**: Requires schema changes, all rulesets need updates

#### Option C: Replace `$schema.description` with player-facing text
- Rewrite the `$schema.description` fields to be player-friendly
- **Pros**: Simpler structure
- **Cons**: Loses technical documentation for tool authors

#### Option D: Separate `rules.tags` into two sections
```yaml
rules:
  tags:  # Player-facing tag definitions
    supernatural:
      label: "Supernatural"
      description: "Features supernatural or mythic powers"
  tag_schemas:  # Technical definitions for tools
    supernatural:
      type: boolean
      node_types: [asset, row]
```
- **Pros**: Clear separation
- **Cons**: Breaking change, significant restructure

### Recommended Approach

**Option B** is the cleanest path forward:
1. Add `description` (player-facing) field to tag definitions
2. Keep `$schema` for technical details
3. Backport tags to Classic/Delve where applicable
4. Update viewer to show `description` when browsing Rules > Tags

### Tasks

- [ ] **Data**: Add `description` field to tag definitions in source YAML
- [ ] **Data**: Backport relevant tags to Classic (e.g., `requires_allies`)
- [ ] **Data**: Backport relevant tags to Delve
- [ ] **Viewer**: Render `rules.tags` with player-friendly descriptions
- [ ] **Viewer**: Hide or de-emphasize `$schema` technical details

---

## Dependencies

- [x] **Evaluate `jtd`** - Official RFC 8927 implementation, stable spec, no security issues - keeping as-is
- [x] **Evaluate `json-schema`** - Replaced unofficial package with `@types/json-schema`

---

## ID Coverage Analysis

### Objects WITH IDs (referenceable)

All primary and embedded types have `_id` fields:

**Primary types:** `ruleset`, `oracle_rollable`, `oracle_collection`, `move`, `move_category`, `asset`, `asset_collection`, `npc`, `npc_collection`, `atlas_entry`, `truth`, `delve_site`, `delve_site_domain`, `delve_site_theme`, `rarity`

**Embedded types:** `row` (in oracles), `ability` (in assets), `option` (in truths), `variant` (in npcs), `feature`/`danger`/`denizen` (in delve)

### Objects WITHOUT IDs (not directly referenceable)

| Object                                                   | Count    | Parent  |
| -------------------------------------------------------- | -------- | ------- |
| `trigger.conditions[].roll_options[]`                    | ~602     | moves   |
| `trigger.conditions[]`                                   | ~68      | moves   |
| Planet sub-oracles (`observed_from_space`, `life`, etc.) | ~11 each | planets |

### Non-Breaking Solution

Adding `_id` to these objects would be **additive** (backwards compatible):

1. Add new type to `TypeId.EmbedOnly` in `src/pkg-core/IdElements/TypeId.ts`
2. Add embed relationship to `TypeId.EmbedTypeMap`
3. Create schema with `EmbeddedNode` pattern
4. Regenerate data

Example ID format:

```text
move.trigger.condition:starforged/adventure/face_danger.0
move.trigger.condition.roll_option:starforged/adventure/face_danger.0.0
```

### Priority

1. **Move trigger conditions** - enables linking to specific trigger mechanics
2. **Planet sub-oracles** - enables direct references in tools
3. **Roll options** - enables UI tools to reference specific choices
