import { describe, test, expect, beforeEach, vi } from 'vitest';
import { VaultDoor } from '../VaultDoor';
import { AssetManager } from '../AssetManager';
import { gsap } from 'gsap';

// Mock AssetManager
vi.mock('../AssetManager', () => {
  return {
    AssetManager: vi.fn().mockImplementation(() => ({
      getTexture: vi.fn().mockReturnValue({ orig: { width: 100, height: 100 } }),
      getBackgroundTexture: vi.fn().mockReturnValue({ orig: { width: 100, height: 100 } }),
    })),
  };
});

describe('VaultDoor', () => {
  let door: VaultDoor;
  let assetManager: AssetManager;

  beforeEach(() => {
    vi.clearAllMocks();
    assetManager = new AssetManager();
    door = new VaultDoor(assetManager);
  });

  test('should initialize with correct properties', () => {
    expect(door.container).toBeDefined();
  });

  test('should open the door', async () => {
    const gsapToSpy = vi.spyOn(gsap, 'to');
    
    await door.open();
    
    expect(gsapToSpy).toHaveBeenCalled();
  });

  test('should show treasure', async () => {
    const gsapToSpy = vi.spyOn(gsap, 'to');
    
    await door.showTreasure();
    
    expect(gsapToSpy).toHaveBeenCalled();
  });

  test('should reset door state', () => {
    // @ts-expect-error - Accessing private properties for testing
    door.door = { visible: false };
    // @ts-expect-error - Accessing private properties for testing
    door.doorOpen = { visible: true, rotation: 0 };
    // @ts-expect-error - Accessing private properties for testing
    door.doorOpenShadow = { visible: true, rotation: 0 };
    // @ts-expect-error - Accessing private properties for testing
    door.blink = { visible: true };
    
    door.reset();
    
    // @ts-expect-error - Accessing private properties for testing
    expect(door.door.visible).toBe(true);
    // @ts-expect-error - Accessing private properties for testing
    expect(door.doorOpen.visible).toBe(false);
    // @ts-expect-error - Accessing private properties for testing
    expect(door.doorOpenShadow.visible).toBe(false);
    // @ts-expect-error - Accessing private properties for testing
    expect(door.blink.visible).toBe(false);
  });
});


