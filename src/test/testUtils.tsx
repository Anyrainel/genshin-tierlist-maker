import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Character } from '../data/types';
import { LanguageProvider } from '../contexts/LanguageContext';
import { WeaponVisibilityProvider } from '../contexts/WeaponVisibilityContext';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

/**
 * Render component with all necessary providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider>
      <WeaponVisibilityProvider>
        {children}
      </WeaponVisibilityProvider>
    </LanguageProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Mock drag start event for testing
 */
export const mockDragStartEvent = (
  id: string,
  character: Character,
  tier: string,
  element: string
): DragStartEvent => ({
  active: {
    id,
    rect: {
      current: {
        initial: null,
        translated: null,
      },
    },
    node: {
      current: document.createElement('div'),
    },
    data: {
      current: {
        character,
        tier,
        element,
      },
    },
  },
});

/**
 * Mock drag end event for testing
 */
export const mockDragEndEvent = (
  activeId: string,
  activeCharacter: Character,
  activeTier: string,
  activeElement: string,
  overId: string | null,
  overTier?: string,
  overElement?: string,
  overCharacter?: Character
): DragEndEvent => ({
  active: {
    id: activeId,
    rect: {
      current: {
        initial: null,
        translated: null,
      },
    },
    node: {
      current: document.createElement('div'),
    },
    data: {
      current: {
        character: activeCharacter,
        tier: activeTier,
        element: activeElement,
      },
    },
  },
  over: overId
    ? {
        id: overId,
        rect: {
          left: 0,
          top: 0,
          right: 100,
          bottom: 100,
          width: 100,
          height: 100,
        },
        disabled: false,
        node: {
          current: document.createElement('div'),
        },
        data: {
          current: overTier && overElement
            ? {
                tier: overTier,
                element: overElement,
                character: overCharacter,
              }
            : undefined,
        },
      }
    : null,
  delta: { x: 0, y: 0 },
  activatorEvent: null as any,
  collisions: null,
});

/**
 * Mock character data for testing
 */
export const createMockCharacter = (overrides?: Partial<Character>): Character => ({
  name: 'Test Character',
  nameZh: '测试角色',
  element: 'Pyro',
  weapon: 'Sword',
  rarity: 5,
  imagePath: '/test-image.png',
  imageUrl: 'https://test.com/image.png',
  region: 'Mondstadt',
  releaseDate: '2020-09-28',
  ...overrides,
});

/**
 * Create multiple mock characters
 */
export const createMockCharacters = (count: number, element: string): Character[] => {
  return Array.from({ length: count }, (_, i) => createMockCharacter({
    name: `Character ${i + 1}`,
    nameZh: `角色${i + 1}`,
    element: element as any,
  }));
};

/**
 * Mock getBoundingClientRect for elements
 */
export const mockBoundingClientRect = (
  element: Element | null,
  rect: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }
) => {
  if (!element) return;

  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    top = y,
    left = x,
    right = x + width,
    bottom = y + height,
  } = rect;

  const domRect: DOMRect = {
    x,
    y,
    width,
    height,
    top,
    left,
    right,
    bottom,
    toJSON: () => ({ x, y, width, height, top, left, right, bottom }),
  };

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(domRect);
};

/**
 * Wait for async state updates
 */
export const waitForStateUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock Tauri environment
 */
export const mockTauriEnvironment = () => {
  Object.defineProperty(window, '__TAURI__', {
    value: {
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
    },
    writable: true,
    configurable: true,
  });
};

/**
 * Clean up Tauri mock
 */
export const cleanupTauriEnvironment = () => {
  delete (window as any).__TAURI__;
};
