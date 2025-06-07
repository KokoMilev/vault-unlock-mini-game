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
const OFFSET = {
  door:         { x: 80,  y: -10   },
  doorOpen:     { x: 80,  y: -10   },
  blink:        { x: 0,  y:  10   },
  doorShadow:   { x: 110, y: -10   },
  handle:       { x: 0,y: -10   },
  handleShadow: { x: 20,y: 40  },
};

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
  private blink!: Sprite;

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
      "assets/doorOpenShadow.png",
      "assets/doorOpen.png",
      "assets/handle.png",
      "assets/handleShadow.png",
      "assets/blink.png",
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
    // BACKGROUND
    this.bg = Sprite.from("assets/bg.png");
    this.bg.anchor.set(0.5);
    this.stage.addChild(this.bg);

    // CLOSED DOOR
    this.door = Sprite.from("assets/door.png");
    this.door.anchor.set(0.5);
    this.stage.addChild(this.door);

    
    // DOOR SHADOW
    this.doorOpenShadow = Sprite.from("assets/doorOpenShadow.png");
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.visible = false;
    this.stage.addChild(this.doorOpenShadow);
    
    // OPEN DOOR
    this.doorOpen = Sprite.from("assets/doorOpen.png");
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.visible = false;
    this.stage.addChild(this.doorOpen);
    
    // BLINK
    this.blink = Sprite.from("assets/blink.png");
    this.blink.anchor.set(0.5);
    this.blink.visible = false;
    this.stage.addChild(this.blink);
    
    // HANDLE SHADOW
    this.handleShadow = Sprite.from("assets/handleShadow.png");
    this.handleShadow.anchor.set(0.5);
    this.stage.addChild(this.handleShadow);

    // HANDLE
    this.handle = Sprite.from("assets/handle.png") as ButtonSprite;
    this.handle.anchor.set(0.5);
    this.handle.interactive = true;
    this.handle.buttonMode = true;
    this.handle.on("pointerdown", this.handleInput);
    this.stage.addChild(this.handle);
  }

  private resize() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // compute the same "cover & crop" scale as BG
    const { orig } = this.bg.texture;
    const coverScale = Math.max(w / orig.width, h / orig.height);
    const cx = w / 2;
    const cy = h / 2;

    // list all sprites you want to behave like the BG
    const all = [
      { s: this.bg,         off: { x: 0,  y: 0   } },
      { s: this.door,       off: OFFSET.door       },
      { s: this.doorOpen,   off: OFFSET.doorOpen   },
      { s: this.blink,   off: OFFSET.blink   },
      { s: this.doorOpenShadow, off: OFFSET.doorShadow },
      { s: this.handle,     off: OFFSET.handle     },
      { s: this.handleShadow, off: OFFSET.handleShadow },
      // if you want the timer to scale too, add here
    ];

    // apply same scale+center to each, then add your offsets
    all.forEach(({ s, off }) => {
      s.scale.set(coverScale);
      s.position.set(
        cx + off.x * coverScale,
        cy + off.y * coverScale
      );
    });
  }


    /* ─────────────────────────────────  GAME LOGIC  ───────────────────────────────── */

  private generateSecret() {
    this.secret = Array.from({ length: COMBINATION_LEN }, () => ({
      steps: 1 + Math.floor(Math.random() * 3),          // 1-3 clicks
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
    this.blink.visible = true;
    this.blink.alpha   = 0;

    
    await this.openVault();
    // pulse *both* doorOpen + shadow at once
    await this.delay(5);
    await Promise.all([
     new Promise(resolve => {
      gsap.fromTo(
        [ this.doorOpen, this.doorOpenShadow ],
        { alpha: 1 },
        { alpha: 1, yoyo: true, repeat: 0, duration: 0.25, onComplete: resolve }
      );
    }),
        // treasure blink
      (async () => {
        this.blink.visible = true;
        await new Promise<void>(r => gsap.fromTo(
          this.blink,
          { alpha: 0 },
          {
            alpha: 1,
            yoyo: true,
            repeat: 8,
            duration: 0.5,
            onComplete: () => {
              this.blink.visible = false;
              r();
            }
          }
        ));
      })()
    ]);
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

    const targetX = this.door.x + 300;
    const targetShadowX = targetX + 50;

    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .to(
          [this.doorOpenShadow, this.doorOpen],
          { x: (i) => i===0 ? targetShadowX : targetX, duration: 1, ease: "power2.out" }
        );
    });
  }

  private async reset(wasWin: boolean) {
    console.log(wasWin ? "Vault opened – resetting…" : "Wrong combo – resetting…");
    this.state = GameState.RESETTING;

    // graphics
    this.door.visible = true;
    this.doorOpen.visible =  false;
    this.doorOpenShadow.visible = false;
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
    this.timerTxt.anchor.set(0, 0);
    this.timerTxt.position.set(20, 20);
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