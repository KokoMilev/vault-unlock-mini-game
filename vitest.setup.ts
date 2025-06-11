import { vi } from 'vitest';

// Mock PIXI.js
vi.mock('pixi.js', () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    screen: { width: 800, height: 600 },
    stage: { addChild: vi.fn() },
    render: vi.fn(),
    canvas: document.createElement('canvas'),
    ticker: { add: vi.fn() },
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    position: { set: vi.fn() },
    scale: { set: vi.fn() },
  })),
  Sprite: {
    from: vi.fn().mockImplementation(() => ({
      anchor: { set: vi.fn() },
      position: { set: vi.fn() },
      pivot: { set: vi.fn() },
      rotation: 0,
      visible: true,
      alpha: 1,
      width: 100,
      height: 100,
    })),
  },
  Text: vi.fn().mockImplementation(() => ({
    anchor: { set: vi.fn() },
    position: { set: vi.fn() },
    text: '',
  })),
  Assets: {
    load: vi.fn().mockResolvedValue({
      'assets/bg.png': { orig: { width: 1920, height: 1080 } },
      'assets/door.png': { orig: { width: 500, height: 800 } },
      'assets/doorOpen.png': { orig: { width: 500, height: 800 } },
      'assets/doorOpenShadow.png': { orig: { width: 500, height: 800 } },
      'assets/handle.png': { orig: { width: 200, height: 200 } },
      'assets/handleShadow.png': { orig: { width: 200, height: 200 } },
      'assets/blink.png': { orig: { width: 300, height: 300 } },
    }),
  },
}));

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn().mockImplementation((_target, options) => {
      // Immediately call onComplete if provided
      if (options?.onComplete) {
        options.onComplete();
      }
      
      return {
        then: vi.fn(cb => {
          if (cb) cb();
          return Promise.resolve();
        }),
      };
    }),
    delayedCall: vi.fn().mockImplementation((_delay, callback) => {
      if (callback) callback();
      return { kill: vi.fn() };
    }),
    timeline: vi.fn().mockImplementation(() => ({
      to: vi.fn().mockReturnThis(),
      then: vi.fn(cb => {
        if (cb) cb();
        return Promise.resolve();
      }),
    })),
  },
}));

// Create mock for document.getElementById
document.getElementById = vi.fn().mockImplementation(() => {
  const element = document.createElement('div');
  element.id = 'pixi-container';
  return element;
});

// Mock ResizeObserver
// Use window instead of global for browser environment
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));





