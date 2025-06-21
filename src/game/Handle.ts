import { Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { AssetManager } from "./AssetManager";
import { Direction } from "./types";
import { OFFSET, STEP_ANGLE } from "./constants";

type ButtonSprite = Sprite & { buttonMode: boolean };

export class Handle {
  public container: Container;

  private handle: ButtonSprite;
  private handleShadow: Sprite;

  public onRotation: ((dir: Direction) => void) | null = null;

  constructor(assetManager: AssetManager) {
    this.container = new Container();

    // HANDLE SHADOW
    this.handleShadow = Sprite.from(assetManager.getTexture("handleShadow"));
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.position.set(
      OFFSET.handleShadow.x,
      OFFSET.handleShadow.y,
    );
    this.container.addChild(this.handleShadow);

    // HANDLE
    this.handle = Sprite.from(
      assetManager.getTexture("handle"),
    ) as ButtonSprite;
    this.handle.anchor.set(0.5);
    this.handle.position.set(OFFSET.handle.x, OFFSET.handle.y);
    this.handle.interactive = true;
    this.handle.buttonMode = true;
    this.handle.on("pointerdown", this.handleInput.bind(this));
    this.container.addChild(this.handle);
  }

  private async handleInput(e: FederatedPointerEvent) {
    const globalX = e.global.x;
    const handleGlobalX = this.handle.getGlobalPosition().x;

    const dir = globalX >= handleGlobalX ? 1 : -1;

    await this.rotate(dir as Direction);

    if (this.onRotation) {
      this.onRotation(dir as Direction);
    }
  }

  rotate(dir: Direction): Promise<void> {
    return new Promise((resolve) => {
      gsap.to([this.handle, this.handleShadow], {
        rotation: `+=${dir * STEP_ANGLE}`,
        duration: 0.25,
        onComplete: resolve,
      });
    });
  }

  spinCrazy(): Promise<void> {
    return new Promise<void>((resolve) => {
      gsap.to([this.handle, this.handleShadow], {
        rotation: `+=${Math.PI * 6}`,
        duration: 1,
        ease: "power3.out",
        onComplete: resolve,
      });
    });
  }

  reset() {
    this.handle.visible = true;
    this.handleShadow.visible = true;
    this.handle.rotation = 0;
    this.handleShadow.rotation = 0;

    this.container.visible = true;
  }
} 