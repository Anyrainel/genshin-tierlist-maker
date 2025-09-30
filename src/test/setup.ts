import '@testing-library/jest-dom';

// Mock Tauri APIs for testing
const mockTauri = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
  window: {
    appWindow: {
      close: vi.fn(),
      minimize: vi.fn(),
      maximize: vi.fn(),
      unmaximize: vi.fn(),
      isMaximized: vi.fn(),
      isMinimized: vi.fn(),
      isVisible: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      setFocus: vi.fn(),
      center: vi.fn(),
      print: vi.fn(),
      setDecorations: vi.fn(),
      setResizable: vi.fn(),
      setMaximizable: vi.fn(),
      setMinimizable: vi.fn(),
      setClosable: vi.fn(),
      setTitle: vi.fn(),
      getTitle: vi.fn(),
      setFullscreen: vi.fn(),
      isFullscreen: vi.fn(),
      setIcon: vi.fn(),
      setSkipTaskbar: vi.fn(),
      setCursorGrab: vi.fn(),
      setCursorVisible: vi.fn(),
      setCursorIcon: vi.fn(),
      setCursorPosition: vi.fn(),
      setIgnoreCursorEvents: vi.fn(),
      startDragging: vi.fn(),
    },
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

// Mock window.__TAURI__ for Tauri environment detection
Object.defineProperty(window, '__TAURI__', {
  value: mockTauri,
  writable: true,
});

// Mock DataTransfer for drag and drop testing
class MockDataTransfer {
  private data: Map<string, string> = new Map();
  effectAllowed: string = 'uninitialized';
  dropEffect: string = 'none';

  setData(format: string, data: string): void {
    this.data.set(format, data);
  }

  getData(format: string): string {
    return this.data.get(format) || '';
  }

  clearData(): void {
    this.data.clear();
  }

  setDragImage(): void {
    // Mock implementation
  }
}

// Mock DragEvent
class MockDragEvent extends Event {
  dataTransfer: MockDataTransfer;
  clientX: number;
  clientY: number;
  target: Element | null;

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);
    this.dataTransfer = new MockDataTransfer();
    this.clientX = eventInitDict?.clientX || 0;
    this.clientY = eventInitDict?.clientY || 0;
    this.target = eventInitDict?.target || null;
  }
}

// Add mock to global
Object.defineProperty(global, 'DragEvent', {
  value: MockDragEvent,
  writable: true,
});

// Mock getBoundingClientRect for testing
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 64,
  height: 64,
  top: 0,
  right: 64,
  bottom: 64,
  left: 0,
  toJSON: () => ({}),
}));

// Mock closest method
Element.prototype.closest = vi.fn(function(this: Element, selector: string) {
  // Simple mock implementation
  if (selector === '[data-tier]') {
    return this.closest('[data-tier]') || this;
  }
  if (selector === '[data-element]') {
    return this.closest('[data-element]') || this;
  }
  return null;
});

// Mock querySelectorAll
Element.prototype.querySelectorAll = vi.fn(function(this: Element, selector: string) {
  if (selector === '[data-character-id]') {
    return [] as any;
  }
  return [] as any;
});

// Mock getAttribute
Element.prototype.getAttribute = vi.fn(function(this: Element, name: string) {
  if (name === 'data-character-id') {
    return 'test-character';
  }
  if (name === 'data-tier') {
    return 'S';
  }
  if (name === 'data-element') {
    return 'Pyro';
  }
  return null;
});

// Mock hasAttribute
Element.prototype.hasAttribute = vi.fn(function(this: Element, name: string) {
  return name === 'data-character-id';
});
