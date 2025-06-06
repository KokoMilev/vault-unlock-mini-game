import { Application, Assets, Sprite, Container } from "pixi.js";
import { gsap } from "gsap";
type ButtonSprite = Sprite & { buttonMode: boolean };

class VaultGame {
  private app!: Application;
  private stage!: Container;

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

    // Click = rotate + open
    this.handle.on("pointerdown", () => {
      gsap.to([this.handle, this.handleShadow], {
        rotation: this.handle.rotation + Math.PI / 3,
        duration: 0.25,
        onComplete: () => {
          this.openVault();
        },
      });
    });
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
  }
  private openVault() {
    this.door.visible = false;
    this.doorOpen.visible = true;
    this.doorOpenShadow.visible = true;
    this.handle.visible = false;
    this.handleShadow.visible = false;
    const targetX = this.door.x * 1.5;
    const targetY = this.door.y + 5;

    // Main door movement
    gsap.to(this.doorOpen, {
      x: targetX,
      y: targetY,
      duration: 1,
      ease: "power2.out",
    });

    // Shadow follows slightly offset
    gsap.to(this.doorOpenShadow, {
      x: targetX + 50,
      y: targetY,
      duration: 1,
      ease: "power2.out",
    });
  }
}

new VaultGame();
