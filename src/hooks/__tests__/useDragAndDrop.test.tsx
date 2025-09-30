import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Character } from '../data/types';

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

describe('useDragAndDrop Hook', () => {
  const mockOnTierAssignment = vi.fn();
  const mockOnRemoveFromTiers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    expect(result.current.hoveredCardName).toBeNull();
    expect(result.current.hoverDirection).toBeNull();
    expect(typeof result.current.handleDragStart).toBe('function');
    expect(typeof result.current.handleDragOver).toBe('function');
    expect(typeof result.current.handleDrop).toBe('function');
    expect(typeof result.current.handleDragEnd).toBe('function');
  });

  it('should handle drag start correctly', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    const mockDragEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    });

    act(() => {
      result.current.handleDragStart(mockDragEvent as any, mockCharacter);
    });

    expect(mockDragEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'Test Character');
    expect(mockDragEvent.dataTransfer.effectAllowed).toBe('move');
  });

  it('should handle drag over with valid drop position', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    // First start dragging
    const mockDragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    });

    act(() => {
      result.current.handleDragStart(mockDragStartEvent as any, mockCharacter);
    });

    // Then drag over
    const mockDragOverEvent = new DragEvent('dragover', {
      clientX: 150,
      clientY: 150,
      target: document.createElement('div'),
    });

    // Mock the target element to have the required attributes
    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-tier', 'S');
    mockTarget.setAttribute('data-element', 'Pyro');
    mockTarget.setAttribute('data-character-id', 'target-character');
    mockDragOverEvent.target = mockTarget;

    act(() => {
      result.current.handleDragOver(mockDragOverEvent as any);
    });

    expect(mockDragOverEvent.dataTransfer.dropEffect).toBe('move');
  });

  it('should handle drop correctly', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    // First start dragging
    const mockDragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    });

    act(() => {
      result.current.handleDragStart(mockDragStartEvent as any, mockCharacter);
    });

    // Then drop
    const mockDropEvent = new DragEvent('drop', {
      clientX: 150,
      clientY: 150,
      target: document.createElement('div'),
    });

    // Mock the target element
    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-tier', 'S');
    mockTarget.setAttribute('data-element', 'Pyro');
    mockTarget.setAttribute('data-character-id', 'target-character');
    mockDropEvent.target = mockTarget;

    act(() => {
      result.current.handleDrop(mockDropEvent as any);
    });

    expect(result.current.hoveredCardName).toBeNull();
    expect(result.current.hoverDirection).toBeNull();
  });

  it('should handle drag end correctly', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    // First start dragging
    const mockDragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    });

    act(() => {
      result.current.handleDragStart(mockDragStartEvent as any, mockCharacter);
    });

    // Then end drag
    const mockDragEndEvent = new DragEvent('dragend');

    act(() => {
      result.current.handleDragEnd(mockDragEndEvent as any);
    });

    expect(result.current.hoveredCardName).toBeNull();
    expect(result.current.hoverDirection).toBeNull();
  });

  it('should call onRemoveFromTiers when dropping in Pool', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        onTierAssignment: mockOnTierAssignment,
        onRemoveFromTiers: mockOnRemoveFromTiers,
      })
    );

    // Start dragging
    const mockDragStartEvent = new DragEvent('dragstart', {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    });

    act(() => {
      result.current.handleDragStart(mockDragStartEvent as any, mockCharacter);
    });

    // Drop in Pool
    const mockDropEvent = new DragEvent('drop', {
      clientX: 150,
      clientY: 150,
      target: document.createElement('div'),
    });

    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-tier', 'Pool');
    mockTarget.setAttribute('data-element', 'Pyro');
    mockDropEvent.target = mockTarget;

    act(() => {
      result.current.handleDrop(mockDropEvent as any);
    });

    expect(mockOnRemoveFromTiers).toHaveBeenCalledWith('Test Character');
  });
});
