import { Container, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { AssetManager } from "./AssetManager";
import { OFFSET } from "./constants";

export class VaultDoor {
  public container: Container;
  
  private door: Sprite;
  private doorOpen: Sprite;
  private doorOpenShadow: Sprite;
  private blink: Sprite;
  
  constructor(assetManager: AssetManager) { 
    this.container = new Container();
    
    // CLOSED DOOR
    this.door = Sprite.from(assetManager.getTexture('door'));
    this.door.anchor.set(0.5);
    this.door.position.set(OFFSET.door.x, OFFSET.door.y);
    this.container.addChild(this.door);
    
    // DOOR SHADOW
    this.doorOpenShadow = Sprite.from(assetManager.getTexture('doorOpenShadow'));
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.position.set(OFFSET.doorShadow.x + 1500, OFFSET.doorShadow.y - 950);
    this.doorOpenShadow.visible = false;
    this.container.addChild(this.doorOpenShadow);
    
    // OPEN DOOR
    this.doorOpen = Sprite.from(assetManager.getTexture('doorOpen'));
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.position.set(OFFSET.doorOpen.x + 1450, OFFSET.doorOpen.y - 950);
    this.doorOpen.visible = false;
    this.container.addChild(this.doorOpen);
    
    // BLINK
    this.blink = Sprite.from(assetManager.getTexture('blink'));
    this.blink.anchor.set(0.5);
    this.blink.position.set(OFFSET.blink.x, OFFSET.blink.y);
    this.blink.visible = false;
    this.container.addChild(this.blink);
  }
  
  open(): Promise<void> {
    this.door.visible = false;
    this.doorOpen.visible = true;
    this.doorOpenShadow.visible = true;
    
    // Set the pivot point to the top edge of the door
    const doorHeight = this.doorOpen.height;
    const pivotX = 0;
    const pivotY = -doorHeight / 2;
    
    this.doorOpen.pivot.set(pivotX * 13, pivotY);
    this.doorOpenShadow.pivot.set(pivotX * 14, pivotY);
    
    this.doorOpen.rotation = 0;
    this.doorOpenShadow.rotation = 0;

    return new Promise<void>((resolve) => {
      gsap.to([this.doorOpenShadow, this.doorOpen],
        { 
          rotation: 0,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          onComplete: resolve
        });
      });
    }
  
  showTreasure(): Promise<void> {
    this.blink.visible = true;
    this.blink.alpha = 0;
    
    // Make sure we always return a Promise
    return new Promise<void>((resolve) => {
      gsap.to(this.blink, {
        alpha: 1,
        yoyo: true,
        repeat: 8,
        duration: 0.5,
        onComplete: () => {
        this.blink.visible = false;
        resolve();
        }
      });
    });
  }
  
  reset() {
    this.door.visible = true;
    this.doorOpen.visible = false;
    this.doorOpenShadow.visible = false;
    this.blink.visible = false;
    
    // Reset rotations
    this.doorOpen.rotation = 0;
    this.doorOpenShadow.rotation = 0;
  }
}




