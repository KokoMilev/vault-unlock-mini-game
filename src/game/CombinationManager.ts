import { Direction, CombinationStep, CombinationResult } from "./types";
import { COMBINATION_LEN } from "./constants";

export class CombinationManager {
  private secret: CombinationStep[] = [];
  private playerSequence: CombinationStep[] = [];
  private currentStepCount = 0;
  
  constructor() {
    this.generateSecret();
  }
  
  generateSecret() {
    this.secret = Array.from({ length: COMBINATION_LEN }, () => ({
      steps: 1 + Math.floor(Math.random() * 3),  // 1-3 clicks
      dir: Math.random() > 0.5 ? 1 : -1,         // 1 = cw, -1 = ccw
    }));
    
    console.log(
      "Secret:",
      this.secret
        .map(s => `${s.steps} ${s.dir === 1 ? "clockwise" : "counterclockwise"}`)
        .join(", ")
    );
  }
  
  processStep(dir: Direction): CombinationResult {
    this.currentStepCount++;
    
    const expected = this.secret[this.playerSequence.length];
    
    // wrong direction
    if (dir !== expected.dir) {
      return 'fail';
    }
    
    // still counting clicks for this pair
    if (this.currentStepCount < expected.steps) {
      return 'continue';
    }
    
    // pair completed
    this.playerSequence.push({ steps: this.currentStepCount, dir });
    this.currentStepCount = 0;
    
    // combination finished
    if (this.playerSequence.length === COMBINATION_LEN) {
      return 'success';
    }
    
    return 'continue';
  }
  
  reset() {
    this.playerSequence = [];
    this.currentStepCount = 0;
    this.generateSecret();
  }
}