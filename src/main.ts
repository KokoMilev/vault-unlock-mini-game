import { Application, Assets, Sprite, Container, Text, FederatedPointerEvent } from "pixi.js";
import { gsap } from "gsap";
type ButtonSprite = Sprite & { buttonMode: boolean };

enum GameState {
  LOCKED,
  INPUT,
  OPENING,
  OPEN,
  RESETTING,
}

const STEP_ANGLE = Math.PI / 3; // 60°
const COMBINATION_LEN = 3;      // 3 pairs ⇒ 6 clicks/steps


class VaultGame {
  // runtime and state
  private app!: Application;
  private stage!: Container;
  private state: GameState = GameState.LOCKED;

  // combination
  private secret: { steps: number; dir: 1 | -1 }[] = [];
  private playerSequence: { steps: number; dir: 1 | -1 }[] = [];
  private currentStepCount = 0;

  // timer
  private timerTxt!: Text;
  private timeStart = 0;

  // sprites
  private bg!: Sprite;
  private door!: Sprite;
  private doorOpen!: Sprite;
  private doorOpenShadow!: Sprite;
  private handle!: ButtonSprite;
  private handleShadow!: Sprite;

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

    await Assets.load([
      "assets/bg.png",
      "assets/door.png",
      "assets/doorOpen.png",
      "assets/doorOpenShadow.png",
      "assets/handle.png",
      "assets/handleShadow.png",
    ]);

    this.stage = new Container();
    this.app.stage.addChild(this.stage);

    this.setupScene();
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.generateSecret();
    this.addTimer();
    this.state = GameState.INPUT;
  }

  private setupScene() {
    // Background
    this.bg = Sprite.from("assets/bg.png");
    this.bg.anchor.set(0);
    this.stage.addChild(this.bg);

    // Closed door
    this.door = Sprite.from("assets/door.png");
    this.door.anchor.set(0.5);
    this.stage.addChild(this.door);

    // Open door
    this.doorOpen = Sprite.from("assets/doorOpen.png");
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.visible = false;
    this.stage.addChild(this.doorOpen);

    // Door shadow
    this.doorOpenShadow = Sprite.from("assets/doorOpenShadow.png");
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.visible = false;
    this.stage.addChild(this.doorOpenShadow);

    // Handle shadow
    this.handleShadow = Sprite.from("assets/handleShadow.png");
    this.handleShadow.anchor.set(0.5);
    this.stage.addChild(this.handleShadow);

    // Handle
    this.handle = Sprite.from("assets/handle.png") as ButtonSprite;
    this.handle.anchor.set(0.5);
    this.handle.interactive = true;
    this.handle.buttonMode = true;
    this.stage.addChild(this.handle);

    this.handle.on("pointerdown", this.handleInput);
    
    // // Click = rotate + open
    // this.handle.on("pointerdown", () => {
    //   gsap.to([this.handle, this.handleShadow], {
    //     rotation: this.handle.rotation + Math.PI / 3,
    //     duration: 0.25,
    //     onComplete: () => {
    //       this.openVault();
    //     },
    //   });
    // });
  }

  private resize() {
    const { width, height } = this.app.screen;

    // Background full screen
    this.bg.width = width;
    this.bg.height = height;

    // Vault position
    const vaultX = width * 0.5;
    const vaultY = height * 0.48;

    // Door positions
    this.door.position.set(vaultX, vaultY);
    this.doorOpen.position.set(vaultX, vaultY);
    this.doorOpenShadow.position.set(this.doorOpen.position.x + 30, vaultY);

    // Handle + shadow
    this.handle.position.set(vaultX - 80, vaultY);
    this.handleShadow.position.set(this.handle.position.x + 20, this.handle.position.y + 50);

    // timer
    if (this.timerTxt) this.timerTxt.position.set(width - 80, 60);
  }
    /* ─────────────────────────────────  GAME LOGIC  ───────────────────────────────── */

  private generateSecret() {
    this.secret = Array.from({ length: COMBINATION_LEN }, () => ({
      steps: 1 + Math.floor(Math.random() * 9),          // 1-9 clicks
      dir: Math.random() > 0.5 ? 1 : -1,                 // 1 = cw, -1 = ccw
    }));
    console.log(
      "Secret:",
      this.secret
        .map(s => `${s.steps} ${s.dir === 1 ? "clockwise" : "counterclockwise"}`)
        .join(", ")
    );
  }

  private handleInput = (e: FederatedPointerEvent) => {
    if (this.state !== GameState.INPUT) return;

    const local = e.getLocalPosition(this.handle);
    const dir = local.x >= 0 ? 1 : -1; // click right half = clockwise

    this.rotateByStep(dir as 1 | -1);
  };

  private rotateByStep(dir: 1 | -1) {
    gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${dir * STEP_ANGLE}`,
      duration: 0.25,
    });

    this.currentStepCount++;

    const expected = this.secret[this.playerSequence.length];

    // wrong direction
    if (dir !== expected.dir) {
      this.fail();
      return;
    }

    // still counting clicks for this pair
    if (this.currentStepCount < expected.steps) return;

    // pair completed
    this.playerSequence.push({ steps: this.currentStepCount, dir });
    this.currentStepCount = 0;

    // combination finished
    if (this.playerSequence.length === COMBINATION_LEN) this.success();
  }

  private async success() {
    this.state = GameState.OPENING;
    await this.openVault();
    await this.playGlitter();
    await this.delay(5);         // vault stays open 5 s
    await this.reset(true);
  }

  private async fail() {
    this.state = GameState.RESETTING;
    await gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${Math.PI * 6}`, // crazy spin
      duration: 1,
      ease: "power3.out",
    });
    await this.reset(false);
  }

  private openVault(): Promise<void> {
    this.door.visible = false;
    this.doorOpen.visible = this.doorOpenShadow.visible = true;
    this.handle.visible = this.handleShadow.visible = false;

    const targetX = this.door.x + 200;
    const targetShadowX = targetX + 50;

    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(this.doorOpen, { x: targetX, duration: 1, ease: "power2.out" })
        .to(this.doorOpenShadow, { x: targetShadowX, duration: 1 }, "<");
    });
  }

  private playGlitter(): Promise<void> {
    // placeholder: simple pulse. Replace with particles if desired
    return new Promise(resolve => {
      gsap.fromTo(
        this.doorOpen,
        { scale: 1 },
        { scale: 1.05, yoyo: true, repeat: 3, duration: 0.2, onComplete: resolve }
      );
    });
  }

  private async reset(wasWin: boolean) {
    console.log(wasWin ? "Vault opened – resetting…" : "Wrong combo – resetting…");
    this.state = GameState.RESETTING;

    // graphics
    this.door.visible = true;
    this.doorOpen.visible = this.doorOpenShadow.visible = false;
    this.handle.visible = this.handleShadow.visible = true;
    this.handle.rotation = this.handleShadow.rotation = 0;

    // sequences
    this.playerSequence = [];
    this.currentStepCount = 0;

    this.generateSecret();
    this.resetTimer();
    this.state = GameState.INPUT;
  }

  /* ─────────────────────────────────  TIMER  ───────────────────────────────── */

  private addTimer() {
    this.timerTxt = new Text({
      text: "0.0 s",
      style: {
        fill: "white",
        fontFamily: "Arial",
        fontSize: 32,
      },
    });
    this.timerTxt.anchor.set(0.5);
    this.stage.addChild(this.timerTxt);
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

  /* ─────────────────────────────────  UTILS  ───────────────────────────────── */

  private delay(seconds: number) {
    return new Promise<void>(resolve => gsap.delayedCall(seconds, resolve));
  }
}

new VaultGame();