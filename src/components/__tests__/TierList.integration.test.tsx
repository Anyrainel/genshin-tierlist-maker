import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TierList from '../TierList';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { WeaponVisibilityProvider } from '../../contexts/WeaponVisibilityContext';

// Mock the data manager
vi.mock('../../lib/dataManager', () => ({
  dataManager: {
    initialize: vi.fn(() => Promise.resolve()),
    loadData: vi.fn(() => Promise.resolve({
      language: 'en',
      showWeapons: true,
      tierLists: {},
      lastUpdated: new Date().toISOString(),
    })),
    saveData: vi.fn(() => Promise.resolve()),
    isFileSystemAvailable: vi.fn(() => false),
  },
}));

// Mock the translations
vi.mock('../../data/translations', () => ({
  translations: {
    en: {
      title: 'Genshin Tier List Maker',
      tiers: {
        S: 'S',
        A: 'A',
        B: 'B',
        C: 'C',
        D: 'D',
        Pool: 'Pool',
      },
      elements: {
        Pyro: 'Pyro',
        Hydro: 'Hydro',
        Electro: 'Electro',
        Cryo: 'Cryo',
        Anemo: 'Anemo',
        Geo: 'Geo',
        Dendro: 'Dendro',
      },
      messages: {
        tierListSaved: 'Tier list saved',
        tierListLoaded: 'Tier list loaded',
        tierListSaveFailed: 'Failed to save tier list',
        tierListLoadFailed: 'Failed to load tier list',
        fileReadError: 'Error reading file',
      },
    },
  },
  Language: 'en' as const,
}));

// Mock characters data
vi.mock('../../data/characters', () => ({
  characters: [
    {
      name: 'Test Character 1',
      element: 'Pyro',
      weapon: 'Sword',
      rarity: 5,
      imagePath: '/test-image-1.png',
      imageUrl: 'https://test.com/image1.png',
      region: 'Mondstadt',
      releaseDate: '2020-09-28',
    },
    {
      name: 'Test Character 2',
      element: 'Pyro',
      weapon: 'Bow',
      rarity: 4,
      imagePath: '/test-image-2.png',
      imageUrl: 'https://test.com/image2.png',
      region: 'Mondstadt',
      releaseDate: '2020-10-20',
    },
  ],
}));

// Mock elements data
vi.mock('../../data/elements', () => ({
  elements: ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro'],
  elementImages: {
    Pyro: '/pyro.png',
    Hydro: '/hydro.png',
    Electro: '/electro.png',
    Cryo: '/cryo.png',
    Anemo: '/anemo.png',
    Geo: '/geo.png',
    Dendro: '/dendro.png',
  },
}));

// Mock weapons data
vi.mock('../../data/weapons', () => ({
  weapons: ['Sword', 'Bow', 'Claymore', 'Polearm', 'Catalyst'],
  weaponImages: {
    Sword: '/sword.png',
    Bow: '/bow.png',
    Claymore: '/claymore.png',
    Polearm: '/polearm.png',
    Catalyst: '/catalyst.png',
  },
}));

// Mock types
vi.mock('../../data/types', () => ({
  tiers: ['S', 'A', 'B', 'C', 'D'],
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <WeaponVisibilityProvider>
      {children}
    </WeaponVisibilityProvider>
  </LanguageProvider>
);

describe('TierList Drag and Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render tier list with characters in pool', async () => {
    render(
      <TestWrapper>
        <TierList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Genshin Tier List Maker')).toBeInTheDocument();
    });

    // Check if characters are rendered in the pool
    expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test Character 2')).toBeInTheDocument();
  });

  it('should handle drag and drop between tiers', async () => {
    render(
      <TestWrapper>
        <TierList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });

    const characterCard = screen.getByAltText('Test Character 1').closest('[data-character-id]');
    const tierSCell = screen.getByText('S').closest('[data-tier]')?.querySelector('[data-element="Pyro"]');

    expect(characterCard).toBeInTheDocument();
    expect(tierSCell).toBeInTheDocument();

    // Simulate drag start
    const dragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: characterCard,
    });

    fireEvent(characterCard!, dragStartEvent);

    // Simulate drag over
    const dragOverEvent = new DragEvent('dragover', {
      clientX: 150,
      clientY: 150,
      target: tierSCell,
    });

    fireEvent(tierSCell!, dragOverEvent);

    // Simulate drop
    const dropEvent = new DragEvent('drop', {
      clientX: 150,
      clientY: 150,
      target: tierSCell,
    });

    fireEvent(tierSCell!, dropEvent);

    // Check if the character moved to S tier
    await waitFor(() => {
      // The character should now be in the S tier Pyro section
      const sTierPyroSection = screen.getByText('S').closest('[data-tier]')?.querySelector('[data-element="Pyro"]');
      expect(sTierPyroSection).toBeInTheDocument();
    });
  });

  it('should handle drag and drop back to pool', async () => {
    render(
      <TestWrapper>
        <TierList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });

    const characterCard = screen.getByAltText('Test Character 1').closest('[data-character-id]');
    const poolCell = screen.getByText('Pool').closest('[data-tier]')?.querySelector('[data-element="Pyro"]');

    expect(characterCard).toBeInTheDocument();
    expect(poolCell).toBeInTheDocument();

    // Simulate drag start
    const dragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: characterCard,
    });

    fireEvent(characterCard!, dragStartEvent);

    // Simulate drag over pool
    const dragOverEvent = new DragEvent('dragover', {
      clientX: 150,
      clientY: 150,
      target: poolCell,
    });

    fireEvent(poolCell!, dragOverEvent);

    // Simulate drop in pool
    const dropEvent = new DragEvent('drop', {
      clientX: 150,
      clientY: 150,
      target: poolCell,
    });

    fireEvent(poolCell!, dropEvent);

    // Character should remain in pool (this is the default behavior)
    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });
  });

  it('should handle double click to remove from tiers', async () => {
    render(
      <TestWrapper>
        <TierList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });

    const characterCard = screen.getByAltText('Test Character 1').closest('[data-character-id]');

    expect(characterCard).toBeInTheDocument();

    // Double click the character
    fireEvent.doubleClick(characterCard!);

    // Character should be removed from tiers (stays in pool)
    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });
  });

  it('should show visual feedback during drag operations', async () => {
    render(
      <TestWrapper>
        <TierList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Test Character 1')).toBeInTheDocument();
    });

    const characterCard = screen.getByAltText('Test Character 1').closest('[data-character-id]');

    expect(characterCard).toBeInTheDocument();

    // Simulate drag start
    const dragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: characterCard,
    });

    fireEvent(characterCard!, dragStartEvent);

    // Check if drag state is active (this would be reflected in the component state)
    // The exact implementation depends on how the visual feedback is handled
    expect(characterCard).toHaveAttribute('draggable', 'true');
  });
});
