# Genshin Impact Character Data Generator

This directory contains a Python script to automatically generate character data and image files from the Genshin Impact Fandom wiki.

## Quick Start

### Execution
```bash
# Run the data generator from the project root directory
python scripts/generate_characters.py
```

## Output Files

The script generates three TypeScript files:

- **`src/data/characters.ts`**: Character data array sorted by rarity (5-star first) then by release date (newest first)
- **`src/data/elements.ts`**: Element image URLs scraped from the source table
- **`src/data/weapons.ts`**: Weapon image URLs scraped from the source table

## Data Source

The script scrapes data from `https://genshin-impact.fandom.com/wiki/Character/List`, specifically the "Playable Characters" table.

## Data Extraction Methods

The script extracts data from specific table columns:

- **Character Name**: `a` tag text in the Name column
- **Rarity**: `img` alt attribute in the Quality column (e.g., "5 Stars")
- **Element**: `a` tag text in the Element column
- **Weapon**: `a` tag text in the Weapon column
- **Region**: `a` tag text in the Region column (or direct text if no link)
- **Release Date**: `data-release` attribute in the Release Date column
- **Character Image URLs**: `img` `data-src` attribute in the Icon column (cleaned to remove scaling parameters)
- **Element Image URLs**: `img` `data-src` attribute in the Element column (first occurrence per element)
- **Weapon Image URLs**: `img` `data-src` attribute in the Weapon column (first occurrence per weapon)

## Error Handling

The script uses strict validation and will throw exceptions if:
- Character name cannot be found
- Element type cannot be determined
- Rarity cannot be extracted from alt text
- Image URL cannot be found
- Release date cannot be parsed
