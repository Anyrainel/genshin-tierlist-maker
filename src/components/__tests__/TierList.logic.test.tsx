import { describe, it, expect, beforeEach } from 'vitest';
import { Character, TierAssignment } from '../../data/types';
import { createMockCharacter } from '../../test/testUtils';

/**
 * Unit tests for tier list business logic
 * These tests focus on the position assignment algorithms
 */

/**
 * Simulates the handleTierAssignment logic from TierList.tsx
 */
const assignToTier = (
  characters: Character[],
  prevAssignments: TierAssignment,
  dragName: string,
  dropName: string | null,
  tier: string,
  direction: 'left' | 'right'
): TierAssignment => {
  const newAssignments = { ...prevAssignments };
  const draggedChar = characters.find(c => c.name === dragName);
  if (!draggedChar) return prevAssignments;

  const oldAssignment = prevAssignments[dragName];
  const isSameTier = oldAssignment?.tier === tier;

  // Get all characters in the same element and tier, sorted by position
  const elementChars = Object.entries(prevAssignments)
    .filter(([id, assignment]) => {
      const char = characters.find(c => c.name === id);
      return char?.element === draggedChar.element && assignment.tier === tier;
    })
    .map(([name, assignment]) => ({
      name,
      position: assignment.position,
    }))
    .sort((a, b) => a.position - b.position);

  // If no drop target, append to the end
  if (!dropName) {
    const newPosition =
      direction === 'left'
        ? 0
        : elementChars.length > 0
        ? Math.max(...elementChars.map(c => c.position)) + 1
        : 0;

    newAssignments[dragName] = { tier, position: newPosition };

    // If inserting at the beginning, shift all other cards right
    if (direction === 'left') {
      elementChars.forEach(card => {
        newAssignments[card.name] = { tier, position: card.position + 1 };
      });
    }
    return newAssignments;
  }

  // Find the drop target's current position
  const dropTargetIndex = elementChars.findIndex(card => card.name === dropName);
  if (dropTargetIndex === -1) return prevAssignments;

  // Calculate the new position based on direction
  const newPosition =
    direction === 'left'
      ? elementChars[dropTargetIndex].position
      : elementChars[dropTargetIndex].position + 1;

  // If moving within the same tier, remove the dragged card first
  if (isSameTier) {
    const oldPosition = oldAssignment?.position ?? 0;
    elementChars.forEach(card => {
      if (card.position > oldPosition) {
        newAssignments[card.name] = { tier, position: card.position - 1 };
      }
    });
  }

  // Shift positions of affected cards
  elementChars.forEach(card => {
    if (card.position >= newPosition) {
      newAssignments[card.name] = { tier, position: card.position + 1 };
    }
  });

  // Set the dragged card's new position
  newAssignments[dragName] = { tier, position: newPosition };

  return newAssignments;
};

/**
 * Simulates the handleRemoveFromTiers logic from TierList.tsx
 */
const removeFromTier = (
  characters: Character[],
  prevAssignments: TierAssignment,
  dragName: string
): TierAssignment => {
  const newAssignments = { ...prevAssignments };
  const oldAssignment = prevAssignments[dragName];
  const character = characters.find(c => c.name === dragName);

  if (!character || !oldAssignment) return prevAssignments;

  // Get all characters in the same tier and element, sorted by position
  const elementChars = Object.entries(prevAssignments)
    .filter(([name, assignment]: [string, { tier: string; position: number }]) => {
      const char = characters.find(c => c.name === name);
      return (
        char?.element === character.element &&
        assignment.tier === oldAssignment.tier
      );
    })
    .map(([name, assignment]: [string, { tier: string; position: number }]) => ({
      name,
      position: assignment.position,
    }))
    .sort((a, b) => a.position - b.position);

  // Remove the dragged card
  delete newAssignments[character.name];

  // Reassign positions sequentially
  let newPosition = 0;
  elementChars.forEach((card) => {
    if (card.name !== character.name) {
      newAssignments[card.name] = {
        tier: oldAssignment.tier,
        position: newPosition,
      };
      newPosition++;
    }
  });

  return newAssignments;
};

describe('TierList Business Logic', () => {
  let characters: Character[];
  let tierAssignments: TierAssignment;

  beforeEach(() => {
    characters = [
      createMockCharacter({ name: 'Bennett', element: 'Pyro' }),
      createMockCharacter({ name: 'Diluc', element: 'Pyro' }),
      createMockCharacter({ name: 'Hu Tao', element: 'Pyro' }),
      createMockCharacter({ name: 'Ganyu', element: 'Cryo' }),
    ];

    tierAssignments = {};
  });

  describe('Position Assignment Logic', () => {

    it('should place character at first position when direction is left and no drop target', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
        'Hu Tao': { tier: 'S', position: 1 },
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', null, 'S', 'left');

      expect(result.Bennett).toEqual({ tier: 'S', position: 0 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 1 }); // Shifted right
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 2 }); // Shifted right
    });

    it('should place character at last position when direction is right and no drop target', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
        'Hu Tao': { tier: 'S', position: 1 },
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', null, 'S', 'right');

      expect(result.Bennett).toEqual({ tier: 'S', position: 2 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Unchanged
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 1 }); // Unchanged
    });

    it('should insert character to the left of target', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
        'Hu Tao': { tier: 'S', position: 1 },
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', 'Hu Tao', 'S', 'left');

      expect(result.Bennett).toEqual({ tier: 'S', position: 1 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Unchanged
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 2 }); // Shifted right
    });

    it('should insert character to the right of target', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
        'Hu Tao': { tier: 'S', position: 1 },
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', 'Diluc', 'S', 'right');

      expect(result.Bennett).toEqual({ tier: 'S', position: 1 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Unchanged
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 2 }); // Shifted right
    });

    it('should handle same-tier reordering correctly', () => {
      tierAssignments = {
        Bennett: { tier: 'S', position: 0 },
        Diluc: { tier: 'S', position: 1 },
        'Hu Tao': { tier: 'S', position: 2 },
      };

      // Move Bennett from position 0 to right of Diluc (position 2)
      const result = assignToTier(characters, tierAssignments, 'Bennett', 'Diluc', 'S', 'right');

      expect(result.Bennett).toEqual({ tier: 'S', position: 2 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Shifted left
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 3 }); // Shifted right
    });

    it('should handle moving to empty tier', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', null, 'A', 'right');

      expect(result.Bennett).toEqual({ tier: 'A', position: 0 });
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Unchanged
    });

    it('should only affect characters of the same element', () => {
      tierAssignments = {
        Diluc: { tier: 'S', position: 0 },
        Ganyu: { tier: 'S', position: 0 }, // Different element (Cryo)
      };

      const result = assignToTier(characters, tierAssignments, 'Bennett', null, 'S', 'right');

      expect(result.Bennett).toEqual({ tier: 'S', position: 1 }); // After Diluc
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Unchanged
      expect(result.Ganyu).toEqual({ tier: 'S', position: 0 }); // Unchanged (different element)
    });
  });

  describe('Character Removal Logic', () => {
    it('should remove character and re-index positions', () => {
      tierAssignments = {
        Bennett: { tier: 'S', position: 0 },
        Diluc: { tier: 'S', position: 1 },
        'Hu Tao': { tier: 'S', position: 2 },
      };

      const result = removeFromTier(characters, tierAssignments, 'Diluc');

      expect(result.Diluc).toBeUndefined();
      expect(result.Bennett).toEqual({ tier: 'S', position: 0 }); // Unchanged
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 1 }); // Shifted down
    });

    it('should handle removing last character', () => {
      tierAssignments = {
        Bennett: { tier: 'S', position: 0 },
      };

      const result = removeFromTier(characters, tierAssignments, 'Bennett');

      expect(result.Bennett).toBeUndefined();
      expect(Object.keys(result).length).toBe(0);
    });

    it('should only affect characters of the same element', () => {
      tierAssignments = {
        Bennett: { tier: 'S', position: 0 },
        Diluc: { tier: 'S', position: 1 },
        Ganyu: { tier: 'S', position: 0 }, // Different element
      };

      const result = removeFromTier(characters, tierAssignments, 'Bennett');

      expect(result.Bennett).toBeUndefined();
      expect(result.Diluc).toEqual({ tier: 'S', position: 0 }); // Shifted down
      expect(result.Ganyu).toEqual({ tier: 'S', position: 0 }); // Unchanged
    });

    it('should handle removing from middle position', () => {
      tierAssignments = {
        Bennett: { tier: 'S', position: 0 },
        Diluc: { tier: 'S', position: 1 },
        'Hu Tao': { tier: 'S', position: 2 },
      };

      const result = removeFromTier(characters, tierAssignments, 'Diluc');

      expect(result.Bennett).toEqual({ tier: 'S', position: 0 });
      expect(result.Diluc).toBeUndefined();
      expect(result['Hu Tao']).toEqual({ tier: 'S', position: 1 });
    });
  });

  describe('Element Constraint Validation', () => {
    it('should only allow drops in matching element', () => {
      const pyroChar = createMockCharacter({ name: 'Bennett', element: 'Pyro' });
      const cryoChar = createMockCharacter({ name: 'Ganyu', element: 'Cryo' });

      expect(pyroChar.element).toBe('Pyro');
      expect(cryoChar.element).toBe('Cryo');
      expect(pyroChar.element).not.toBe(cryoChar.element);
    });
  });

  describe('Position Sequential Integrity', () => {
    it('should maintain sequential positions after multiple operations', () => {
      tierAssignments = {};

      // Add first character
      tierAssignments = assignToTier(characters, tierAssignments, 'Bennett', null, 'S', 'right');
      expect(tierAssignments.Bennett.position).toBe(0);

      // Add second character
      tierAssignments = assignToTier(characters, tierAssignments, 'Diluc', null, 'S', 'right');
      expect(tierAssignments.Diluc.position).toBe(1);

      // Add third character
      tierAssignments = assignToTier(characters, tierAssignments, 'Hu Tao', null, 'S', 'right');
      expect(tierAssignments['Hu Tao'].position).toBe(2);

      // Remove middle character
      tierAssignments = removeFromTier(characters, tierAssignments, 'Diluc');
      expect(tierAssignments.Bennett.position).toBe(0);
      expect(tierAssignments['Hu Tao'].position).toBe(1); // Re-indexed

      // Verify no gaps
      const positions = Object.values(tierAssignments)
        .filter(a => a.tier === 'S')
        .map(a => a.position)
        .sort((a, b) => a - b);

      expect(positions).toEqual([0, 1]);
    });
  });
});
