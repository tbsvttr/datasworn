# Viewer Improvements

## High Value

- [x] **Search** - Find items by name or content across all rulesets
- [x] **Keyboard navigation** - `/` to focus search, `Escape` to clear
- [x] **Breadcrumb trail** - Show path to current item for context
- [ ] **Copy ID button** - Quick copy of `datasworn:` ID for referencing

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

- [ ] **Evaluate `jtd`** - Last updated 2021, consider alternatives or fork
- [ ] **Evaluate `json-schema`** - Last updated 2021, consider alternatives
