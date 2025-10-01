import { render, screen, fireEvent } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import CharacterCard from '../CharacterCard';
import { Character } from '../../data/types';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { WeaponVisibilityProvider } from '../../contexts/WeaponVisibilityContext';

// Mock character data
const mockCharacter: Character = {
  name: 'Test Character',
  nameZh: '測試角色',
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

  const renderWithProviders = (ui: ReactNode) =>
    render(
      <LanguageProvider>
        <WeaponVisibilityProvider>
          {ui}
        </WeaponVisibilityProvider>
      </LanguageProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render character card with correct attributes', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;
    expect(card).toHaveAttribute('data-character-id', 'Test Character');
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('should handle drag start event', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;
    const dataTransfer = new DataTransfer();

    fireEvent.dragStart(card, { dataTransfer });

    expect(mockOnDragStart).toHaveBeenCalled();
  });

  it('should handle drag end event', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;

    fireEvent.dragEnd(card);

    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it('should handle double click event', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;
    
    fireEvent.doubleClick(card);

    expect(mockOnDoubleClick).toHaveBeenCalled();
  });

  it('should show hover direction offset', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        hoverDirection="left"
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;
    expect(card).toHaveStyle('transform: translate(3px, 0)');
  });

  it('should disable dragging when draggable is false', () => {
    renderWithProviders(
      <CharacterCard
        character={mockCharacter}
        draggable={false}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByAltText('Test Character').closest('[data-character-id]') as HTMLElement;
    expect(card).toHaveAttribute('draggable', 'false');
  });

  it('should render character image with correct attributes', () => {
    renderWithProviders(
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
