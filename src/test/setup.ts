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

// Lightweight DataTransfer mock for drag and drop testing
class MockDataTransfer {
  private data: Map<string, string> = new Map();
  dropEffect: string = 'none';
  effectAllowed: string = 'all';

  setData(format: string, data: string) {
    this.data.set(format, data);
  }

  getData(format: string) {
    return this.data.get(format) ?? '';
  }

  clearData() {
    this.data.clear();
  }

  setDragImage() {
    // No-op for tests
  }
}

class MockDragEvent extends MouseEvent {
  dataTransfer: MockDataTransfer;

  constructor(type: string, eventInitDict: DragEventInit = {}) {
    super(type, eventInitDict);
    this.dataTransfer = (eventInitDict.dataTransfer as MockDataTransfer) ?? new MockDataTransfer();
  }
}

Object.defineProperty(globalThis, 'DataTransfer', {
  value: MockDataTransfer,
  writable: true,
});

Object.defineProperty(globalThis, 'DragEvent', {
  value: MockDragEvent,
  writable: true,
});
