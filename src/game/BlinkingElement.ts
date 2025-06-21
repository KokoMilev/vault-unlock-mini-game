import { Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";

export class BlinkingElement {
  private sprite: Sprite;

  constructor(texture: Texture) {
    this.sprite = Sprite.from(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.visible = false;
  }

  getSprite(): Sprite {
    return this.sprite;
  }

  setPosition(x: number, y: number) {
    this.sprite.position.set(x, y);
  }

  playOnce(): Promise<void> {
    this.sprite.visible = true;
    this.sprite.alpha = 0;

    return new Promise<void>((resolve) => {
      gsap.to(this.sprite, {
        alpha: 1,
        yoyo: true,
        repeat: 8,
        duration: 0.6,
        onComplete: () => {
          this.sprite.visible = false;
          resolve();
        },
      });
    });
  }

  stopBlinking() {
    gsap.killTweensOf(this.sprite);
    this.sprite.visible = false;
  }
} 