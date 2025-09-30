import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CharacterCard from '../CharacterCard';
import { Character } from '../../data/types';

// Mock Tauri environment
const mockTauri = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
  path: {
    appDataDir: vi.fn(() => Promise.resolve('/mock/app/data')),
    join: vi.fn((...paths) => Promise.resolve(paths.join('/'))),
  },
  fs: {
    writeTextFile: vi.fn(() => Promise.resolve()),
    readTextFile: vi.fn(() => Promise.resolve('{}')),
    exists: vi.fn(() => Promise.resolve(false)),
    createDir: vi.fn(() => Promise.resolve()),
  },
};

// Set up Tauri environment
Object.defineProperty(window, '__TAURI__', {
  value: mockTauri,
  writable: true,
});

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

describe('CharacterCard in Tauri Environment', () => {
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect Tauri environment correctly', () => {
    expect(window.__TAURI__).toBeDefined();
    expect(window.__TAURI__.path.appDataDir).toBeDefined();
    expect(window.__TAURI__.fs.writeTextFile).toBeDefined();
  });

  it('should handle drag start in Tauri environment', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    
    // Create a more realistic drag event for Tauri
    const dragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: card,
    });

    // Mock dataTransfer behavior that might be different in Tauri
    const mockDataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'uninitialized',
      dropEffect: 'none',
      setDragImage: vi.fn(),
    };

    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: true,
    });

    fireEvent(card, dragStartEvent);

    expect(mockOnDragStart).toHaveBeenCalledWith(dragStartEvent);
    
    // In Tauri, the dataTransfer might behave differently
    expect(mockDataTransfer.setData).toHaveBeenCalled();
  });

  it('should handle drag over in Tauri environment', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    
    const dragOverEvent = new DragEvent('dragover', {
      clientX: 150,
      clientY: 150,
      target: card,
    });

    const mockDataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'move',
      dropEffect: 'none',
      setDragImage: vi.fn(),
    };

    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: true,
    });

    fireEvent(card, dragOverEvent);

    // In Tauri, preventDefault might be called differently
    expect(dragOverEvent.defaultPrevented).toBe(false);
  });

  it('should handle drop in Tauri environment', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onDragStart={mockOnDragStart}
        onDragEnd={mockOnDragEnd}
        onDoubleClick={mockOnDoubleClick}
      />
    );

    const card = screen.getByRole('generic');
    
    const dropEvent = new DragEvent('drop', {
      clientX: 150,
      clientY: 150,
      target: card,
    });

    const mockDataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 'Test Character'),
      effectAllowed: 'move',
      dropEffect: 'move',
      setDragImage: vi.fn(),
    };

    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: true,
    });

    fireEvent(card, dropEvent);

    expect(mockOnDragEnd).toHaveBeenCalledWith(dropEvent);
  });

  it('should handle drag end in Tauri environment', () => {
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

  it('should handle image loading in Tauri environment', () => {
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

  it('should handle drag preview creation in Tauri', () => {
    // Mock document.createElement and related methods
    const mockDragPreview = document.createElement('div');
    const mockImage = document.createElement('img');
    
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'div') return mockDragPreview;
      if (tagName === 'img') return mockImage;
      return document.createElement(tagName);
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockDragPreview);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockDragPreview);

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

    const mockDataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'uninitialized',
      dropEffect: 'none',
      setDragImage: vi.fn(),
    };

    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: true,
    });

    fireEvent(card, dragStartEvent);

    // Check if drag preview was created
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.createElement).toHaveBeenCalledWith('img');
    expect(mockDataTransfer.setDragImage).toHaveBeenCalled();
  });
});
