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

- [ ] Dark mode - Theme toggle
- [ ] Filter by type - Show only moves/oracles/assets in tree
- [ ] Expand/collapse all - Tree controls
- [ ] Roll history - Show recent oracle rolls in session
- [ ] Linked oracle rolls - When result suggests another oracle, make it clickable
- [ ] Delve renderers - Proper display for sites, themes, domains

### Nice to Have

- [ ] Hover previews - Preview linked items on hover
- [ ] Mobile layout - Responsive sidebar/detail toggle
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
3. **Missing Planet Hierarchy** - Flat structure instead of nested collections per planet type
4. **Missing Links** - Need `datasworn:` protocol links for cross-references

### Tasks

- [ ] Add "broken" impact to item assets (requested by kat)
- [ ] Identify and add missing Focus oracle (or verify it's `splinter_focus`)
- [ ] Add `_index` fields or restructure YAML to match book ordering
- [ ] Reorganize `planets_expanded` into hierarchical collections
  - ~150 oracles need grouping by planet type (desert_world, jungle_world, etc.)
  - Manual YAML work required due to anchors/aliases that don't survive round-tripping
  - Creates collections like `planets_expanded/desert_world/biome` for proper linking
- [ ] Add datasworn: links for all cross-references:
  - [x] Starforged oracle references (80 links added - Action, Theme, Focus, Descriptor, Planet, Creature, Settlement, Starship, Derelict, Precursor Vault)
  - [x] HTML entity decode: `&gt;` → `>` (515 refs now display cleanly)
  - [ ] Internal Ancient Wonders `>Oracle` syntax (~500 refs) - blocked by reorganization above
  - [ ] Starforged/Sundered Isles page references ("SI, pg 250" etc.)

---

## Dependencies (Resolved)

- [x] Evaluate `jtd` - Official RFC 8927 implementation, stable spec
- [x] Evaluate `json-schema` - Replaced with `@types/json-schema`
