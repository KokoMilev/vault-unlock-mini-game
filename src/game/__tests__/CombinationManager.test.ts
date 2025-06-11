import { describe, test, expect, beforeEach } from 'vitest';
import { CombinationManager } from '../CombinationManager';
import { COMBINATION_LEN } from '../constants';
import { CombinationStep, Direction } from '../types';

// Create a type for accessing private members
interface CombinationManagerPrivate {
  secret: CombinationStep[];
  playerSequence: CombinationStep[];
  currentStepCount: number;
  generateSecret: () => void;
  processStep: (dir: Direction) => 'continue' | 'success' | 'fail';
  reset: () => void;
}

describe('CombinationManager', () => {
  let manager: CombinationManager;
  let managerPrivate: CombinationManagerPrivate;

  beforeEach(() => {
    manager = new CombinationManager();
    // Cast to our interface for accessing private members
    managerPrivate = manager as unknown as CombinationManagerPrivate;
  });

  test('should generate a secret combination of correct length', () => {
    // Access the private property using our interface
    const secret = managerPrivate.secret;
    
    expect(secret).toBeDefined();
    expect(secret.length).toBe(COMBINATION_LEN);
    
    // Each step should have valid properties
    secret.forEach((step: CombinationStep) => {
      expect(step.steps).toBeGreaterThanOrEqual(1);
      expect(step.steps).toBeLessThanOrEqual(3);
      expect([1, -1]).toContain(step.dir);
    });
  });

  test('should process steps correctly and return appropriate results', () => {
    // Force a known secret for testing
    managerPrivate.secret = [
      { steps: 2, dir: 1 },  // 2 clockwise
      { steps: 1, dir: -1 }, // 1 counter-clockwise
      { steps: 3, dir: 1 }   // 3 clockwise
    ];
    
    // First step (correct direction)
    expect(manager.processStep(1)).toBe('continue');
    
    // Second step (completes first part)
    expect(manager.processStep(1)).toBe('continue');
    
    // Third step (correct direction)
    expect(manager.processStep(-1)).toBe('continue');
    
    // Fourth step (correct direction)
    expect(manager.processStep(1)).toBe('continue');
    
    // Fifth step (still need more steps)
    expect(manager.processStep(1)).toBe('continue');
    
    // Sixth step (completes combination)
    expect(manager.processStep(1)).toBe('success');
  });

  test('should fail when wrong direction is used', () => {
    // Force a known secret
    managerPrivate.secret = [
      { steps: 1, dir: 1 }
    ];
    
    // Wrong direction
    expect(manager.processStep(-1)).toBe('fail');
  });

  test('should reset properly', () => {
    // Setup initial state
    managerPrivate.playerSequence = [{ steps: 1, dir: 1 }];
    managerPrivate.currentStepCount = 2;
    
    // Reset
    manager.reset();
    
    // Verify reset state
    expect(managerPrivate.playerSequence).toEqual([]);
    expect(managerPrivate.currentStepCount).toBe(0);
    expect(managerPrivate.secret.length).toBe(COMBINATION_LEN);
  });
});

