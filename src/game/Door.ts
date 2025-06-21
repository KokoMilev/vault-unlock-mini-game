import { Container, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { AssetManager } from "./AssetManager";
import { OFFSET } from "./constants";
import { Handle } from "./Handle";
import { Direction } from "./types";

export class Door {
  public container: Container;
  public onRotation: ((dir: Direction) => void) | null = null;

  private door: Sprite;
  private doorOpen: Sprite;
  private doorOpenShadow: Sprite;
  private handle: Handle;

  constructor(assetManager: AssetManager) {
    this.container = new Container();

    // CLOSED DOOR
    this.door = Sprite.from(assetManager.getTexture("door"));
    this.door.anchor.set(0.5);
    this.door.position.set(OFFSET.door.x, OFFSET.door.y);
    this.container.addChild(this.door);

    // DOOR SHADOW
    this.doorOpenShadow = Sprite.from(
      assetManager.getTexture("doorOpenShadow"),
    );
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.position.set(
      OFFSET.doorShadow.x + 1500,
      OFFSET.doorShadow.y - 950,
    );
    this.doorOpenShadow.visible = false;
    this.container.addChild(this.doorOpenShadow);

    // OPEN DOOR
    this.doorOpen = Sprite.from(assetManager.getTexture("doorOpen"));
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.position.set(
      OFFSET.doorOpen.x + 1450,
      OFFSET.doorOpen.y - 950,
    );
    this.doorOpen.visible = false;
    this.container.addChild(this.doorOpen);

    // HANDLE
    this.handle = new Handle(assetManager);
    this.handle.onRotation = (dir) => this.onRotation?.(dir);
    this.container.addChild(this.handle.container);
  }

  open(): Promise<void> {
    this.handle.container.visible = false;
    this.door.visible = false;
    this.doorOpen.visible = true;
    this.doorOpenShadow.visible = true;

    const doorHeight = this.doorOpen.height;
    const pivotX = 0;
    const pivotY = -doorHeight / 2;

    this.doorOpen.pivot.set(pivotX * 13, pivotY);
    this.doorOpenShadow.pivot.set(pivotX * 14, pivotY);

    this.doorOpen.rotation = 0;
    this.doorOpenShadow.rotation = 0;

    return new Promise<void>((resolve) => {
      gsap.to([this.doorOpenShadow, this.doorOpen], {
        rotation: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        onComplete: resolve,
      });
    });
  }

  spinHandleCrazy(): Promise<void> {
    return this.handle.spinCrazy();
  }

  reset() {
    this.door.visible = true;
    this.doorOpen.visible = false;
    this.doorOpenShadow.visible = false;

    this.doorOpen.rotation = 0;
    this.doorOpenShadow.rotation = 0;
    this.handle.reset();
  }
} 