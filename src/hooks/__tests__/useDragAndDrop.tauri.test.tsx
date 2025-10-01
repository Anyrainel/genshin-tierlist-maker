import { renderHook, act } from '@testing-library/react';
import type { DragEvent as ReactDragEvent } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDragAndDrop } from '../useDragAndDrop';
import { Character } from '../../data/types';

const character: Character = {
  name: 'Amber',
  nameZh: '安柏',
  element: 'Pyro',
  weapon: 'Bow',
  rarity: 4,
  imagePath: '/amber.png',
  imageUrl: 'https://example.com/amber.png',
  region: 'Mondstadt',
  releaseDate: '2020-09-28',
};

describe('useDragAndDrop in Tauri-like environment', () => {
  const onTierAssignment = vi.fn();
  const onRemoveFromTiers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).__TAURI__ = {};
  });

  it('does not crash when dataTransfer.setDragImage is unavailable', () => {
    const { result } = renderHook(() => useDragAndDrop({ onTierAssignment, onRemoveFromTiers }));

    const event: any = {
      preventDefault: vi.fn(),
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'all',
        dropEffect: 'none',
      },
    };

      expect(() =>
        act(() => {
          result.current.handleDragStart(event as unknown as ReactDragEvent, character);
        })
      ).not.toThrow();
    expect(event.dataTransfer.setData).toHaveBeenCalledWith('characterId', character.name);
  });
});
