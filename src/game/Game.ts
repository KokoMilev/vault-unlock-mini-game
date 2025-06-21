import { Application, Container, Sprite } from "pixi.js";
import { GameState } from "./types";
import { AssetManager } from "./AssetManager";
import { Door } from "./Door";
import { CombinationManager } from "./CombinationManager";
import { Timer } from "./Timer";
import { delay } from "./Utils";
import { BlinkingElement } from "./BlinkingElement";
import { OFFSET } from "./constants";

export class Game {
  private app!: Application;
  private stage!: Container;
  private state: GameState = GameState.LOCKED;

  private assetManager!: AssetManager;
  private door!: Door;
  private combinationManager!: CombinationManager;
  private timer!: Timer;
  private blinkingElement!: BlinkingElement;

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

    this.assetManager = new AssetManager();
    await this.assetManager.loadAssets();

    const background = Sprite.from(this.assetManager.getBackgroundTexture());
    background.anchor.set(0.5);
    this.stage.addChild(background);

    this.door = new Door(this.assetManager);
    this.door.onRotation = this.handleRotation.bind(this);
    this.stage.addChild(this.door.container);

    this.blinkingElement = new BlinkingElement(
      this.assetManager.getTexture("blink"),
    );
    this.blinkingElement.setPosition(OFFSET.blink.x, OFFSET.blink.y);
    this.stage.addChild(this.blinkingElement.getSprite());

    this.combinationManager = new CombinationManager();

    this.timer = new Timer(this.app);
    this.app.stage.addChild(this.timer.container);

    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(document.getElementById("pixi-container")!);
    window.addEventListener("resize", () => this.resize());

    this.state = GameState.INPUT;
    this.timer.start();
  }

  private resize() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    const { orig } = this.assetManager.getBackgroundTexture();
    const coverScale = Math.max(w / orig.width, h / orig.height);

    this.stage.scale.set(coverScale);
    this.stage.position.set(w / 2, h / 2);

    if (this.timer) {
      this.timer.setPosition(20, 20);
    }

    this.app.render();
  }

  private handleRotation(dir: 1 | -1) {
    if (this.state !== GameState.INPUT) return;

    const result = this.combinationManager.processStep(dir);

    if (result === "fail") {
      this.fail();
    } else if (result === "success") {
      this.success();
    }
  }

  private async success() {
    this.state = GameState.OPENING;
    this.timer.stop();
    await this.door.open();
    await delay(0.3);
    await this.blinkingElement.playOnce();

    await this.reset(true);
  }

  private async fail() {
    this.state = GameState.RESETTING;
    this.timer.stop();
    await this.door.spinHandleCrazy();
    await this.reset(false);
  }

  private async reset(wasWin: boolean) {
    console.log(
      wasWin ? "Vault opened – resetting…" : "Wrong combo – resetting…",
    );
    this.state = GameState.RESETTING;

    this.door.reset();
    this.combinationManager.reset();

    this.timer.reset();
    this.timer.start();
    this.state = GameState.INPUT;
  }
} 