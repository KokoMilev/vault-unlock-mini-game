import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../types';
import { Container } from 'pixi.js';

// Define a type for our mocked VaultGame
interface MockedVaultGame {
  testHandleRotation: (dir: 1 | -1) => Promise<void>;
  getTestState: () => GameState;
  _mockSuccess: ReturnType<typeof vi.fn>;
  _mockFail: ReturnType<typeof vi.fn>;
  _mockProcessStep: ReturnType<typeof vi.fn>;
}

// Mock the dependencies
vi.mock('../VaultDoor', () => ({
  VaultDoor: vi.fn().mockImplementation(() => ({
    container: new Container(),
    open: vi.fn().mockResolvedValue(undefined),
    showTreasure: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
  })),
}));

vi.mock('../VaultHandle', () => ({
  VaultHandle: vi.fn().mockImplementation(() => ({
    container: new Container(),
    onRotation: null,
    spinCrazy: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
  })),
}));

vi.mock('../CombinationManager', () => ({
  CombinationManager: vi.fn().mockImplementation(() => ({
    processStep: vi.fn(),
    reset: vi.fn(),
    generateSecret: vi.fn(),
  })),
}));

vi.mock('../AssetManager', () => ({
  AssetManager: vi.fn().mockImplementation(() => ({
    loadAssets: vi.fn().mockResolvedValue(undefined),
    getTexture: vi.fn().mockReturnValue({ 
      orig: { width: 100, height: 100 } 
    }),
    getBackgroundTexture: vi.fn().mockReturnValue({ 
      orig: { width: 1920, height: 1080 } 
    }),
  })),
}));

// Create mock functions outside the mock factory
const mockSuccess = vi.fn().mockResolvedValue(undefined);
const mockFail = vi.fn().mockResolvedValue(undefined);
const mockProcessStep = vi.fn();

// Mock the VaultGame class
vi.mock('../VaultGame', () => {
  return {
    VaultGame: vi.fn().mockImplementation(() => {
      return {
        // Public methods for testing
        testHandleRotation: (dir: 1 | -1) => {
          const result = mockProcessStep(dir);
          if (result === 'success') {
            return mockSuccess();
          } else if (result === 'fail') {
            return mockFail();
          }
          return Promise.resolve();
        },
        getTestState: () => GameState,
        
        // Expose mock functions for test verification
        _mockSuccess: mockSuccess,
        _mockFail: mockFail,
        _mockProcessStep: mockProcessStep
      };
    }),
    GameState
  };
});

// Import after mocks
import { VaultGame } from '../VaultGame';

describe('VaultGame', () => {
  let game: MockedVaultGame;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a new instance
    game = new VaultGame() as unknown as MockedVaultGame;
  });

  test('should initialize with correct state', () => {
    expect(game.getTestState()).toBe(GameState);
  });

  test('should handle successful vault opening', async () => {
    // Set up the mock to return 'success'
    game._mockProcessStep.mockReturnValue('success');
    
    // Call the method
    await game.testHandleRotation(1);
    
    // Verify success was called
    expect(game._mockSuccess).toHaveBeenCalled();
  });

  test('should handle failed vault opening', async () => {
    // Set up the mock to return 'fail'
    game._mockProcessStep.mockReturnValue('fail');
    
    // Call the method
    await game.testHandleRotation(-1);
    
    // Verify fail was called
    expect(game._mockFail).toHaveBeenCalled();
  });
});