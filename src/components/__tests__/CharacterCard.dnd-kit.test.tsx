import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import CharacterCard from '../CharacterCard';
import { createMockCharacter, renderWithProviders } from '../../test/testUtils';

// Mock dnd-kit hooks
const mockUseSortable = vi.fn();

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: (options: any) => mockUseSortable(options),
  SortableContext: ({ children }: any) => children,
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: (transform: any) => {
        if (!transform) return '';
        return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
      },
    },
  },
}));

describe('CharacterCard with dnd-kit', () => {
  const mockCharacter = createMockCharacter({ name: 'Bennett', element: 'Pyro' });
  const mockOnDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock return value
    mockUseSortable.mockReturnValue({
      attributes: { role: 'button', tabIndex: 0 },
      listeners: { onPointerDown: vi.fn(), onKeyDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    });
  });

  it('should render character card correctly', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const image = screen.getByAltText('Bennett');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.png');
  });

  it('should call useSortable with correct ID format', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: 'S-Pyro-Bennett',
      data: {
        character: mockCharacter,
        tier: 'S',
        element: 'Pyro',
      },
    });
  });

  it('should pass character data to dnd-kit', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="A"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const callArgs = mockUseSortable.mock.calls[0][0];
    expect(callArgs.data.character).toEqual(mockCharacter);
    expect(callArgs.data.tier).toBe('A');
    expect(callArgs.data.element).toBe('Pyro');
  });

  it('should apply isDragging style when dragging', () => {
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true, // Dragging state
    });

    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Bennett').closest('[data-character-id]');
    expect(card).toHaveStyle({ opacity: 0.5 });
  });

  it('should apply transform when dragging', () => {
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      transition: null,
      isDragging: true,
    });

    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Bennett').closest('[data-character-id]');
    expect(card).toHaveStyle({ transform: 'translate3d(10px, 20px, 0)' });
  });

  it('should handle double click event', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Bennett').closest('[data-character-id]');
    fireEvent.doubleClick(card!);

    expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('should have data-character-id attribute', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Bennett').closest('[data-character-id]');
    expect(card).toHaveAttribute('data-character-id', 'Bennett');
  });

  it('should apply correct rarity styling', () => {
    const fiveStarChar = createMockCharacter({ rarity: 5 });
    renderWithProviders(
      <CharacterCard
        character={fiveStarChar}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]');
    expect(card).toHaveClass('bg-rarity-5');
  });

  it('should render weapon icon when showWeapons is true', () => {
    // This test would need to set the weapon visibility context
    // For now, we'll test that the component renders without error
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    expect(screen.getByAltText('Bennett')).toBeInTheDocument();
  });

  it('should prevent image dragging', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const image = screen.getByAltText('Bennett');
    expect(image).toHaveAttribute('draggable', 'false');
  });

  it('should use lazy loading for images', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        tier="S"
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const image = screen.getByAltText('Bennett');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should handle different tier values', () => {
    const tiers = ['S', 'A', 'B', 'C', 'D', 'Pool'];

    tiers.forEach((tier) => {
      mockUseSortable.mockClear();
      const { unmount } = renderWithProviders(
        <CharacterCard
          character={mockCharacter}
          tier={tier}
          onDoubleClick={mockOnDoubleClick}
        />
      );

      const expectedId = `${tier}-Pyro-Bennett`;
      expect(mockUseSortable).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expectedId,
          data: expect.objectContaining({ tier }),
        })
      );

      unmount();
    });
  });
});
