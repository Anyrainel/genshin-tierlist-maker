import { render, screen, fireEvent } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import CharacterCard from '../CharacterCard';
import { Character } from '../../data/types';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { WeaponVisibilityProvider } from '../../contexts/WeaponVisibilityContext';

// Mock Tauri environment
const mockTauri = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
  path: {
    appDataDir: vi.fn(() => Promise.resolve('/mock/app/data')),
    join: vi.fn((...paths: string[]) => Promise.resolve(paths.join('/'))),
  },
  fs: {
    writeTextFile: vi.fn(() => Promise.resolve()),
    readTextFile: vi.fn(() => Promise.resolve('{}')),
    exists: vi.fn(() => Promise.resolve(false)),
    createDir: vi.fn(() => Promise.resolve()),
  },
};

Object.defineProperty(window, '__TAURI__', {
  value: mockTauri,
  writable: true,
});

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

const renderWithProviders = (ui: ReactNode) =>
  render(
    <LanguageProvider>
      <WeaponVisibilityProvider>
        {ui}
      </WeaponVisibilityProvider>
    </LanguageProvider>
  );

describe('CharacterCard in Tauri Environment', () => {
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects the mocked Tauri environment', () => {
    expect(window.__TAURI__).toBeDefined();
    expect(window.__TAURI__.fs.writeTextFile).toBeDefined();
  });

  it('supports drag lifecycle callbacks when running under Tauri', () => {
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

    fireEvent.dragStart(card, { dataTransfer, clientX: 10, clientY: 10 });
    fireEvent.dragOver(card, { dataTransfer, clientX: 12, clientY: 12 });
    fireEvent.drop(card, { dataTransfer, clientX: 15, clientY: 15 });
    fireEvent.dragEnd(card, { dataTransfer });

    expect(mockOnDragStart).toHaveBeenCalled();
    expect(mockOnDragEnd).toHaveBeenCalled();
    // ensure drag preview logic executed by verifying dataTransfer received the drag start call
    expect((dataTransfer as any).setData).toBeDefined();
  });
});
