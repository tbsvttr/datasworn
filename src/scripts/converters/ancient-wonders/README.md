# Ancient Wonders FoundryVTT Converter

Scripts to convert the [Ancient Wonders](https://github.com/jendave/ancient-wonders/) FoundryVTT module into Datasworn format.

## Prerequisites

1. Clone the Ancient Wonders FoundryVTT module:
   ```bash
   git clone https://github.com/jendave/ancient-wonders.git
   ```

2. Install `classic-level` for LevelDB extraction:
   ```bash
   npm install classic-level
   ```

## Usage

Run from the directory containing the cloned FoundryVTT module:

### 1. Extract data from LevelDB packs
```bash
node extract.mjs
```
This creates `extracted/` folder with JSON files for assets, moves, and oracles.

### 2. Convert assets
```bash
node convert-assets.mjs
```
Outputs `converted-assets.yaml` with Datasworn-formatted assets.

### 3. Convert moves
```bash
node convert-moves.mjs
```
Outputs `converted-moves.yaml` with Datasworn-formatted moves (may need manual adjustments for trigger conditions).

### 4. Convert oracles
```bash
node convert-oracles.mjs
```
Outputs `converted-oracles.yaml` with Datasworn-formatted oracle tables.

## Notes

- The oracle converter fixes gaps and overlaps in roll ranges from the source data
- Some manual cleanup may be required for complex move triggers
- The converted files should be copied to `source_data/ancient_wonders/`
