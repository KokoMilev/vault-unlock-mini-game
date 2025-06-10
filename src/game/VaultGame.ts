import { Application, Container, Text, Sprite } from "pixi.js";
import { GameState } from "./types";
import { AssetManager } from "./AssetManager";
import { VaultDoor } from "./VaultDoor";
import { VaultHandle } from "./VaultHandle";
import { CombinationManager } from "./CombinationManager";

export class VaultGame {
  // runtime and state
  private app!: Application;
  private stage!: Container;
  private state: GameState = GameState.LOCKED;

  // components
  private assetManager!: AssetManager;
  private door!: VaultDoor;
  private handle!: VaultHandle;
  private combinationManager!: CombinationManager;

  // timer
  private timerTxt!: Text;
  private timeStart = 0;

  constructor() {
    this.init();
  }

  private async init() {
    this.app = new Application();
    await this.app.init({
      resizeTo: window,
      background: "#0d1117",
      antialias: true,
    });

    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    this.stage = new Container();
    this.app.stage.addChild(this.stage);

    // Initialize components
    this.assetManager = new AssetManager();
    await this.assetManager.loadAssets();
    
    // Add background
    const background = Sprite.from(this.assetManager.getBackgroundTexture());
    background.anchor.set(0.5);
    this.stage.addChild(background);
    
    this.door = new VaultDoor(this.assetManager);
    this.stage.addChild(this.door.container);
    
    this.handle = new VaultHandle(this.assetManager);
    this.handle.onRotation = this.handleRotation.bind(this);
    this.stage.addChild(this.handle.container);
    
    this.combinationManager = new CombinationManager();
    
    this.addTimer();
    this.resize();
    
    // Add ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(document.getElementById("pixi-container")!);
    
    // Keep the window resize listener as a fallback
    window.addEventListener("resize", () => this.resize());

    this.combinationManager.generateSecret();
    this.state = GameState.INPUT;
  }

  private resize() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // compute the "cover & crop" scale
    const { orig } = this.assetManager.getBackgroundTexture();
    const coverScale = Math.max(w / orig.width, h / orig.height);
    
    // Apply scale to stage once
    this.stage.scale.set(coverScale);
    this.stage.position.set(w / 2, h / 2);
    
    // Position timer separately
    if (this.timerTxt) {
      this.timerTxt.position.set(20, 20);
    }
    
    // Force a render update
    this.app.render();
  }

  private handleRotation(dir: 1 | -1) {
    if (this.state !== GameState.INPUT) return;
    
    const result = this.combinationManager.processStep(dir);
    
    if (result === 'fail') {
      this.fail();
    } else if (result === 'success') {
      this.success();
    }
  }

  private async success() {
    this.state = GameState.OPENING;
    this.handle.container.visible = false;
    await this.door.open();
    await this.delay(5);
    await this.door.showTreasure();
    await this.reset(true);
  }

  private async fail() {
    this.state = GameState.RESETTING;
    await this.handle.spinCrazy();
    await this.reset(false);
  }

  private async reset(wasWin: boolean) {
    console.log(wasWin ? "Vault opened – resetting…" : "Wrong combo – resetting…");
    this.state = GameState.RESETTING;

    this.door.reset();
    this.handle.reset();
    this.combinationManager.reset();
    
    this.resetTimer();
    this.state = GameState.INPUT;
  }

  private addTimer() {
    this.timerTxt = new Text({
      text: "0.0 s",
      style: {
        fill: "white",
        fontFamily: "Arial",
        fontSize: 32,
      },
    });
    this.timerTxt.anchor.set(0, 0);
    this.timerTxt.position.set(20, 20);
    this.app.stage.addChild(this.timerTxt);
    this.resetTimer();

    this.app.ticker.add(() => {
      if (this.state !== GameState.INPUT) return;
      const elapsed = (performance.now() - this.timeStart) / 1000;
      this.timerTxt.text = `${elapsed.toFixed(1)} s`;
    });
  }

  private resetTimer() {
    this.timeStart = performance.now();
  }

  private delay(seconds: number) {
    return new Promise<void>(resolve => setTimeout(resolve, seconds * 1000));
  }
}



