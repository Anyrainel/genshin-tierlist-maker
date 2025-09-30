import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CharacterCard from '../CharacterCard';
import { Character } from '../../data/types';

// Mock character data
const mockCharacter: Character = {
  name: 'Test Character',
  element: 'Pyro',
  weapon: 'Sword',
  rarity: 5,
  imagePath: '/test-image.png',
  imageUrl: 'https://test.com/image.png',
  region: 'Mondstadt',
  releaseDate: '2020-09-28',
};

describe('CharacterCard Component', () => {
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render character card with correct attributes', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    expect(card).toHaveAttribute('data-character-id', 'Test Character');
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('should handle drag start event', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    const dragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: card,
    });

    fireEvent(card, dragStartEvent);

    expect(mockOnDragStart).toHaveBeenCalledWith(dragStartEvent);
  });

  it('should handle drag end event', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    const dragEndEvent = new DragEvent('dragend');

    fireEvent(card, dragEndEvent);

    expect(mockOnDragEnd).toHaveBeenCalledWith(dragEndEvent);
  });

  it('should handle double click event', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    
    fireEvent.doubleClick(card);

    expect(mockOnDoubleClick).toHaveBeenCalled();
  });

  it('should show dragging state when isDragging is true', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        isDragging={true}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    expect(card).toHaveClass('scale-105', 'opacity-50');
  });

  it('should show hover direction offset', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        hoverDirection="left"
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    expect(card).toHaveStyle('transform: translate(3px, 0)');
  });

  it('should disable dragging when draggable is false', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        draggable={false}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    expect(card).toHaveAttribute('draggable', 'false');
  });

  it('should render character image with correct attributes', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const image = screen.getByAltText('Test Character');
    expect(image).toHaveAttribute('src', '/test-image.png');
    expect(image).toHaveAttribute('draggable', 'false');
  });
});
