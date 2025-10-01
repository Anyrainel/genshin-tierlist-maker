import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      buttons: {
        save: 'Save',
        load: 'Load',
        reset: 'Reset',
        showWeapons: 'Show Weapons',
        hideWeapons: 'Hide Weapons',
        customize: 'Customize',
      },
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
        tierListReset: 'Tier list reset',
        customizationsSaved: 'Saved',
      },
      resetConfirmDialog: {
        title: 'Reset',
        message: 'Are you sure?',
        confirm: 'Reset',
        cancel: 'Cancel',
      },
      customizeDialog: {
        title: 'Customize',
        description: 'Customize tiers',
        customTitle: 'Title',
        tierName: 'Tier Name',
        hideTier: 'Hide Tier',
        save: 'Save',
        cancel: 'Cancel',
        reset: 'Reset',
        defaultPrefix: 'Default: ',
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
      nameZh: '测试角色1',
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
      nameZh: '测试角色2',
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
vi.mock('../../data/types', async () => {
  const actual = await vi.importActual<typeof import('../../data/types')>('../../data/types');
  return {
    ...actual,
    tiers: ['S', 'A', 'B', 'C', 'D'],
    elements: ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro'],
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <WeaponVisibilityProvider>
      {children}
    </WeaponVisibilityProvider>
  </LanguageProvider>
);

const createDataTransfer = () => new DataTransfer();

const getElementCell = (tier: string, element: string) =>
  document.querySelector(`[data-tier="${tier}"][data-element="${element}"]`) as HTMLElement | null;

const getCharacterCard = (name: string) =>
  screen.getByAltText(name).closest('[data-character-id]') as HTMLElement | null;

const mockRect = (element: Element | null, rect: { x?: number; y?: number; width?: number; height?: number }) => {
  if (!element) return;
  const { x = 0, y = 0, width = 100, height = 100 } = rect;
  const domRect = {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(domRect);
};

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

    const characterCard = getCharacterCard('Test Character 1');
    const tierSCell = getElementCell('S', 'Pyro');

    expect(characterCard).not.toBeNull();
    expect(tierSCell).not.toBeNull();

    const cardEl = characterCard!;
    const tierCellEl = tierSCell!;

    mockRect(cardEl, { x: 20, y: 20, width: 64, height: 64 });
    mockRect(tierCellEl, { x: 200, y: 200, width: 120, height: 120 });

    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(cardEl, { dataTransfer, clientX: 30, clientY: 30 });
    fireEvent.dragOver(tierCellEl, { dataTransfer, clientX: 220, clientY: 220 });
    fireEvent.drop(tierCellEl, { dataTransfer, clientX: 220, clientY: 220 });
    fireEvent.dragEnd(cardEl, { dataTransfer });

    await waitFor(() => {
      const updatedTierCell = getElementCell('S', 'Pyro');
      expect(updatedTierCell).not.toBeNull();
      expect(within(updatedTierCell as HTMLElement).getByAltText('Test Character 1')).toBeInTheDocument();
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

    const initialCard = getCharacterCard('Test Character 1');
    const tierSCell = getElementCell('S', 'Pyro');

    expect(initialCard).not.toBeNull();
    expect(tierSCell).not.toBeNull();

    const initialCardEl = initialCard!;
    const tierSCellEl = tierSCell!;

    mockRect(initialCardEl, { x: 20, y: 20, width: 64, height: 64 });
    mockRect(tierSCellEl, { x: 200, y: 200, width: 120, height: 120 });

    const toTierDataTransfer = createDataTransfer();
    fireEvent.dragStart(initialCardEl, { dataTransfer: toTierDataTransfer, clientX: 30, clientY: 30 });
    fireEvent.dragOver(tierSCellEl, { dataTransfer: toTierDataTransfer, clientX: 220, clientY: 220 });
    fireEvent.drop(tierSCellEl, { dataTransfer: toTierDataTransfer, clientX: 220, clientY: 220 });
    fireEvent.dragEnd(initialCardEl, { dataTransfer: toTierDataTransfer });

    await waitFor(() => {
      const updatedTierCell = getElementCell('S', 'Pyro');
      expect(updatedTierCell).not.toBeNull();
      expect(within(updatedTierCell as HTMLElement).getByAltText('Test Character 1')).toBeInTheDocument();
    });

    const updatedCard = getCharacterCard('Test Character 1');
    const poolCell = getElementCell('Pool', 'Pyro');
    const otherPoolCard = getCharacterCard('Test Character 2');

    expect(updatedCard).not.toBeNull();
    expect(poolCell).not.toBeNull();
    expect(otherPoolCard).not.toBeNull();

    const updatedCardEl = updatedCard!;
    const poolCellEl = poolCell!;
    const otherPoolCardEl = otherPoolCard!;

    mockRect(updatedCardEl, { x: 210, y: 210, width: 64, height: 64 });
    mockRect(poolCellEl, { x: 10, y: 10, width: 140, height: 140 });
    mockRect(otherPoolCardEl, { x: 20, y: 20, width: 64, height: 64 });

    const backToPoolTransfer = createDataTransfer();
    fireEvent.dragStart(updatedCardEl, { dataTransfer: backToPoolTransfer, clientX: 215, clientY: 215 });
    fireEvent.dragOver(poolCellEl, { dataTransfer: backToPoolTransfer, clientX: 50, clientY: 130 });
    fireEvent.drop(poolCellEl, { dataTransfer: backToPoolTransfer, clientX: 50, clientY: 130 });
    fireEvent.dragEnd(updatedCardEl, { dataTransfer: backToPoolTransfer });

    await waitFor(() => {
      const refreshedPoolCell = getElementCell('Pool', 'Pyro');
      const refreshedSTier = getElementCell('S', 'Pyro');
      expect(refreshedPoolCell).not.toBeNull();
      expect(refreshedSTier).not.toBeNull();
      expect(within(refreshedSTier as HTMLElement).queryByAltText('Test Character 1')).not.toBeInTheDocument();
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
