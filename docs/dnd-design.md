# Drag and Drop Design Requirements

## Overview

This document describes the detailed requirements for the drag and drop functionality in the Genshin Impact Tier List application. The application allows users to organize character cards into tiers (S, A, B, C, D) or leave them in a Pool, with precise positioning controls.

## Application Structure

### Tier System

- **Standard Tiers**: S, A, B, C, D (5 ranked tiers)
- **Pool Tier**: Special tier for unassigned/unranked characters
- **Tier Customization**: Each tier can be:
  - Renamed with custom display name
  - Hidden/shown independently
  - Characters in hidden tiers automatically move to Pool

### Character Organization

Characters are organized in a 2D grid system:

1. **Primary Dimension (Rows)**: Tiers - S, A, B, C, D, Pool
2. **Secondary Dimension (Columns)**: Elements - Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro

**Grid Layout**:

```text
           | Pyro | Hydro | Electro | Cryo | Anemo | Geo | Dendro |
-----------+------+-------+---------+------+-------+-----+--------+
S Tier     | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
A Tier     | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
B Tier     | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
C Tier     | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
D Tier     | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
Pool       | [🔥] | [💧]  | [⚡]    | [❄️] | [🌪️] | [🪨]| [🌿]   |
```

Each cell can contain **multiple characters**, displayed horizontally with flex wrap.

### Character Data Model

```typescript
type Character = {
  name: string;           // Unique identifier (English name)
  nameZh: string;         // Chinese name
  element: Element;       // Character's element (immutable)
  rarity: Rarity;         // 4 or 5 stars (for visual styling)
  weapon: Weapon;         // Weapon type (optional display)
  region: Region;         // Genshin Impact region
  releaseDate: string;    // YYYY-MM-DD format
  imageUrl: string;       // Remote image URL
  imagePath: string;      // Local cached image path
};
```

### Position Tracking

```typescript
interface TierAssignment {
  [characterName: string]: {
    tier: string;      // S, A, B, C, D (or Pool if unassigned)
    position: number;  // Order within the tier-element cell (0-based)
  };
}
```

Characters without an entry in `tierAssignments` are automatically placed in the Pool.

## Drag and Drop Requirements

### 1. Element Constraint Rule

**Critical Requirement**: Characters can **ONLY** be dropped in cells matching their element.

- A Pyro character can only be dropped in Pyro columns
- A Hydro character can only be dropped in Hydro columns
- Dropping in wrong element = no-op (drag operation fails silently)
- This enforces type safety and prevents invalid placements

**Implementation**: The drop position calculator returns `null` values if the dragged character's element doesn't match the drop target's element.

### 2. Drop Target Types

Characters can be dropped in five different ways:

#### A. Empty Cell Drop (position: 'only')

When dropping into an element-tier cell with **no existing characters**:

- Character becomes the first and only card in that cell
- Position is set to 0
- No direction needed

#### B. First Position Drop (position: 'first')

When cursor is **above all cards** in the cell:

- Character is inserted at position 0
- All existing characters shift positions +1
- Direction: 'left' (conventional)

#### C. Last Position Drop (position: 'last')

When cursor is **below all cards** in the cell:

- Character is appended to the end
- Position = highest current position + 1
- Direction: 'right' (conventional)

#### D. Relative Card Drop - Left Side

When cursor is over a card's **left half**:

- Character is inserted **before** the target card
- Target card and all following cards shift positions +1
- Direction: 'left'

#### E. Relative Card Drop - Right Side

When cursor is over a card's **right half**:

- Character is inserted **after** the target card
- All cards after target shift positions +1
- Direction: 'right'

Note: this position calculation heuristic is just attempting to make it feel normal. Other similar natural behaviors can also be accepted. The design is negotiable.

### 3. Drop Position Calculation Algorithm

The algorithm follows this priority order:

```text
1. Validate element match
   ├─ If element mismatch → return null (invalid drop)
   └─ If element matches → continue

2. Check if cell is empty
   ├─ If no cards → return position: 'only'
   └─ If has cards → continue

3. Check cursor Y position relative to all cards
   ├─ If Y < minTop of all cards → return position: 'first'
   ├─ If Y > maxBottom of all cards → return position: 'last'
   └─ If Y within card bounds → continue

4. Find card directly under cursor
   ├─ If cursor is within a card's bounding box
   │  ├─ If card is self → return null (can't drop on self)
   │  └─ If card is other → calculate left/right from midpoint
   └─ If not directly over any card → continue

5. Find nearest card within vertical threshold
   ├─ Search for nearest card within MAX_VERTICAL_DISTANCE (36px)
   ├─ If found nearest card (not self)
   │  └─ Calculate left/right from midpoint
   └─ If no valid card found → return null
```

### 4. Self-Drag Prevention

- Dragging a card over itself returns `null` position
- Prevents unnecessary state updates
- No visual feedback when hovering over self

### 5. Same-Tier Movement Optimization

When moving a character within the same tier and element:

1. Remove character from old position first
2. Decrement positions of all cards after old position
3. Calculate new position
4. Insert at new position
5. Increment positions of all cards at/after new position

This prevents position conflicts and maintains sequential ordering.

### 6. Visual Feedback Requirements

#### A. Hover Direction Indicator

When hovering over a valid drop target card:

- **Left hover**: Card translates +3px to the right
- **Right hover**: Card translates -3px to the left
- **No hover**: Card at original position (0px offset)

**Purpose**: Visual gap showing where the dragged card will be inserted.

**Implementation**:

```tsx
style={{
  transform: `translate(${offset}px, 0)`
}}
// offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0
```

#### B. Character Card Hover States

```css
.character-card {
  cursor: grab;
  transition: all 0.2s;
}

.character-card:hover {
  transform: scale(1.05);  /* 5% scale increase */
}

.character-card:active {
  cursor: grabbing;
}
```

#### C. Drag Preview Image

When drag starts, create a custom drag preview:

**Specifications**:

- Size: 64x64px (matches card size)
- Border radius: 0.375rem (6px)
- Background: Rarity color (4-star blue or 5-star gold)
- Opacity: 0.5 (semi-transparent)
- Scale: 1.05 (slightly enlarged)
- Box shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- Z-index: 9999
- Image: Character portrait with `object-fit: cover`
- Cursor offset: (32, 32) - centered on cursor

**Lifecycle**:

1. Create on drag start
2. Append to document.body
3. Set as drag image with `setDragImage(preview, 32, 32)`
4. Remove from DOM after drag starts (0ms timeout)

### 7. Drag Event Handlers

#### handleDragStart(e: DragEvent, character: Character)

**Purpose**: Initialize drag operation

**Actions**:

1. Store dragged character in ref (synchronous access)
2. Set `dataTransfer.effectAllowed = 'move'`
3. Set `dataTransfer.dropEffect = 'move'`
4. Store character.name in dataTransfer (for compatibility)
5. Create custom drag preview
6. Append preview to DOM
7. Call `setDragImage()`
8. Schedule preview cleanup

**State Changes**: `draggedCharacterRef.current = character`

#### handleDragOver(e: DragEvent)

**Purpose**: Calculate drop position and update visual feedback

**Actions**:

1. Prevent default (allows drop)
2. Set `dataTransfer.dropEffect = 'move'`
3. Get dragged character from ref
4. Calculate current drop position
5. Update hover states:
   - If `dropPos.cardName` and `dropPos.direction` exist:
     - `setHoveredCardName(dropPos.cardName)`
     - `setHoverDirection(dropPos.direction)`
   - Otherwise: Clear hover states

**Frequency**: Fires continuously during drag

#### handleDrop(e: DragEvent)

**Purpose**: Execute the character placement

**Actions**:

1. Prevent default
2. Get dragged character from ref
3. Calculate final drop position
4. Route to appropriate callback:
   - If `tier === 'Pool'`: Call `onRemoveFromTiers(characterName)`
   - If `position === 'first'/'last'/'only'`: Call `onTierAssignment(characterName, null, tier, direction)`
   - If `cardName && direction`: Call `onTierAssignment(characterName, cardName, tier, direction)`
5. Clear hover states
6. Clear `draggedCharacterRef`

#### handleDragEnd(e: DragEvent)

**Purpose**: Cleanup after drag completes or cancels

**Actions**:

1. Clear hover states
2. Clear `draggedCharacterRef`

**Trigger**: Fires when drag ends (successful drop or ESC key)

### 8. Position Assignment Logic

#### onTierAssignment(dragName, dropName, tier, direction)

Handles character placement in a tier.

- **Case 1: No drop target (dropName === null)**

```typescript
if (direction === 'left') {
  newPosition = 0;  // Insert at beginning
  // Shift all existing cards +1
} else {
  newPosition = max(existing positions) + 1;  // Append to end
}
```

- **Case 2: Drop target exists (dropName !== null)**

```typescript
const dropTargetPosition = findPosition(dropName);

if (direction === 'left') {
  newPosition = dropTargetPosition;
} else {
  newPosition = dropTargetPosition + 1;
}

// If moving within same tier:
//   1. Remove from old position first
//   2. Decrement affected positions
//   3. Then insert at new position
//   4. Increment affected positions

// If moving from different tier:
//   1. Directly insert at new position
//   2. Increment affected positions
```

**Position Re-indexing**:
After any insertion/removal, positions are kept sequential (0, 1, 2, 3...) within each element-tier cell.

#### onRemoveFromTiers(dragName)

Removes character from all tier assignments, returning it to Pool.

**Actions**:

1. Find character's current assignment
2. Delete assignment entry
3. Get all characters in same element-tier
4. Re-index positions sequentially (0, 1, 2, ...)
5. Character automatically appears in Pool (no assignment)

### 9. Double-Click Behavior

**Requirement**: Double-clicking any character card removes it from tiers and returns it to Pool.

**Implementation**:

- CharacterCard has `onDoubleClick` prop
- Calls `onRemoveFromTiers(character.name)`
- Same logic as dragging to Pool

### 10. Pool Tier Special Behavior

The Pool tier functions differently from standard tiers:

- **No tier assignment**: Characters in Pool have no entry in `tierAssignments`
- **Default location**: All unassigned characters appear here
- **Drop behavior**: Dragging to Pool calls `onRemoveFromTiers()` instead of `onTierAssignment()`
- **Hidden tier handling**: When a tier is hidden, its characters automatically appear in Pool

### 11. State Synchronization

**State Storage**: Zustand store with localStorage persistence

**Key States**:

```typescript
{
  tierAssignments: TierAssignment;      // Character positions
  tierCustomization: TierCustomization; // Tier names and visibility
  customTitle: string;                  // Custom tier list title
}
```

**Persistence Key**: `'tierlist-storage'`

**State Update Flow**:

```text
User action (drag/drop/double-click)
  ↓
Event handler in TierList.tsx
  ↓
Call store setter (setTierAssignments)
  ↓
Zustand updates state + localStorage
  ↓
React re-render
  ↓
TierGrid updates with new positions
```

### 12. Data Attributes for DOM Queries

**Critical**: The drop position calculator relies on these data attributes:

```tsx
// Tier row
<div data-tier="S">

// Element section within tier
<div data-element="Pyro">

// Character card
<div data-character-id="Bennett">
```

These attributes enable the position calculator to:

1. Find the target tier
2. Find the target element section
3. Find all cards in the section
4. Identify individual cards

### 13. Hover Offset Adjustment

The position calculator accounts for the visual offset when determining drop position:

```typescript
// If card is currently being hovered, adjust its bounds
if (cardName === hoveredCardName) {
  const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;
  adjustedRect = new DOMRect(
    rect.x - offset,  // Shift rect opposite to visual offset
    rect.y,
    rect.width,
    rect.height
  );
}
```

**Why**: The card's visual position shifts during hover, but we need to calculate based on its original position to maintain consistent drop zones.

### 14. Edge Cases and Constraints

#### A. Minimum Vertical Distance

When finding the nearest card (not directly over any card):

- `MAX_VERTICAL_DISTANCE = 36px`
- Cards beyond this vertical distance are ignored
- Prevents incorrect targeting of distant cards

#### B. Self-Targeting Prevention

- Dragging over own card returns null position
- Prevents unnecessary re-assignment
- Reduces state thrashing

#### C. Element Mismatch

- Most common invalid drop scenario
- Returns null silently (no error toast)
- User gets visual feedback from lack of hover indicator

#### D. Empty State

- Pool starts with all characters (no assignments)
- Tiers start empty
- Empty cells have `min-height: 5rem` to remain visible

#### E. Hidden Tier Handling

- Characters in hidden tiers are filtered at render time
- They appear in Pool instead
- Hiding a tier doesn't delete assignments (can be restored)

### 15. Browser Compatibility Considerations

#### DataTransfer API

```typescript
// Primary data
dataTransfer.setData('characterId', character.name);

// Fallback for older browsers
try {
  dataTransfer.setData('text/plain', character.name);
} catch (error) {
  // Older browsers may not support text/plain
}
```

#### Drag Image Support

```typescript
if (typeof dataTransfer.setDragImage === 'function') {
  // Create custom drag preview
} else {
  // Fallback: browser uses default drag image
}
```

## Performance Considerations

### 1. Ref Usage for Dragged Character

**Why ref instead of state?**

- `draggedCharacterRef.current` provides **synchronous** access
- State updates are **async** and may not be available in `calculateDropPosition`
- Drag events fire rapidly; ref prevents race conditions

### 2. Memoization

```typescript
const charactersPerTier = useMemo(
  () => createCharactersPerTierMap(),
  [tierAssignments, tierCustomization, allTiers, showTravelers]
);
```

Prevents unnecessary recalculations on every render.

### 3. Position Calculation Optimization

- Early returns when position is invalid
- Hierarchical checks (element → empty → edges → direct → nearest)
- Stops searching once valid position is found

### 4. Lazy Loading

```tsx
<img loading="lazy" />
```

Character images load on-demand to improve initial render performance.

## Summary of Critical Requirements

✅ **Element-based constraints**: Characters can only drop in matching element columns
✅ **Five drop positions**: only, first, last, left-of-card, right-of-card
✅ **Visual hover feedback**: 3px offset showing insertion point
✅ **Custom drag preview**: Styled 64x64px preview with rarity colors
✅ **Self-drag prevention**: Can't drop on own position
✅ **Same-tier optimization**: Remove then insert to prevent position conflicts
✅ **Position re-indexing**: Sequential positions (0, 1, 2...) maintained
✅ **Double-click removal**: Quick way to return character to Pool
✅ **Pool special handling**: Removal instead of assignment
✅ **Data attributes**: Required for DOM-based position calculation
✅ **Hover offset adjustment**: Calculate based on original position despite visual shift
✅ **Ref-based state**: Synchronous access to dragged character
✅ **Vertical distance limit**: 36px max for nearest-card detection
✅ **Hidden tier filtering**: Characters in hidden tiers appear in Pool

## Known Issues (Leading to dnd-kit Migration)

⚠️ **Tauri Compatibility**: The current native drag-and-drop implementation breaks in Tauri desktop environment
⚠️ **Cross-platform inconsistencies**: Browser vs. desktop app behavior differs
⚠️ **Complex position calculation**: Error-prone DOM-based positioning logic
⚠️ **Hover state management**: Manual tracking of hover states is fragile
⚠️ **Touch device support**: Native drag-and-drop has poor mobile/touch support

These issues motivate the migration to **dnd-kit**, which provides a more robust, cross-platform, and accessible drag-and-drop solution.
