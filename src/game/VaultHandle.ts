import { Container, FederatedPointerEvent, Sprite, Text } from "pixi.js";
import { gsap } from "gsap";
import { AssetManager } from "./AssetManager";
import { Direction } from "./types";
import { OFFSET, STEP_ANGLE } from "./constants";

type ButtonSprite = Sprite & { buttonMode: boolean };

export class VaultHandle {
  public container: Container;
  
  private handle: ButtonSprite;
  private handleShadow: Sprite;
  private leftArrow: Text;
  private rightArrow: Text;
  
  public onRotation: ((dir: Direction) => void) | null = null;
  
  constructor(assetManager: AssetManager) {
    this.container = new Container();
    
    // HANDLE SHADOW
    this.handleShadow = Sprite.from(assetManager.getTexture('handleShadow'));
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.position.set(OFFSET.handleShadow.x, OFFSET.handleShadow.y);
    this.container.addChild(this.handleShadow);

    // HANDLE
    this.handle = Sprite.from(assetManager.getTexture('handle')) as ButtonSprite;
    this.handle.anchor.set(0.5);
    this.handle.position.set(OFFSET.handle.x, OFFSET.handle.y);
    this.handle.interactive = true;
    this.handle.buttonMode = true;
    this.handle.on("pointerdown", this.handleInput);
    this.handle.on("pointerover", this.showDirectionHint);
    this.handle.on("pointerout", this.hideDirectionHint);
    this.container.addChild(this.handle);
    
    // Add markers to the handle
    this.addHandleMarkers();
    
    // Create direction arrows
    const arrowStyle = {
      fill: "white",
      fontFamily: "Arial",
      fontSize: 32,
      fontWeight: "bold" as const,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowDistance: 2
    };
    
    // Left arrow (counter-clockwise)
    this.leftArrow = new Text({
      text: "↺",
      style: arrowStyle
    });
    this.leftArrow.anchor.set(0.5);
    this.leftArrow.visible = false;
    this.container.addChild(this.leftArrow);
    
    // Right arrow (clockwise)
    this.rightArrow = new Text({
      text: "↻",
      style: arrowStyle
    });
    this.rightArrow.anchor.set(0.5);
    this.rightArrow.visible = false;
    this.container.addChild(this.rightArrow);
  }
  
  private addHandleMarkers() {
    const markerStyle = {
      fill: "#FFFFFF",
      fontFamily: "Arial",
      fontSize: 64,
      fontWeight: "bold" as const,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 2,
      dropShadowDistance: 1
    };
    
    const handleRadius = 300;
    
    // Create left marker (CCW)
    const leftMarker = new Text({
      text: "CCW",
      style: markerStyle
    });
    leftMarker.anchor.set(1, 0.5);
    leftMarker.position.set(-handleRadius, 0);
    this.handle.addChild(leftMarker);
    
    // Create right marker (CW)
    const rightMarker = new Text({
      text: "CW",
      style: markerStyle
    });
    rightMarker.anchor.set(0, 0.5);
    rightMarker.position.set(handleRadius, 0);
    this.handle.addChild(rightMarker);
    
    // Add top marker
    const topMarker = new Text({
      text: "CCW ← | → CW",
      style: {
        ...markerStyle,
        fontSize: 64
      }
    });
    topMarker.anchor.set(0.5, 1);
    topMarker.position.set(0, -handleRadius);
    this.handle.addChild(topMarker);
    
    // Add bottom marker
    const bottomMarker = new Text({
      text: "CCW ← | → CW",
      style: {
        ...markerStyle,
        fontSize: 64
      }
    });
    bottomMarker.anchor.set(0.5, 0);
    bottomMarker.position.set(0, handleRadius);
    this.handle.addChild(bottomMarker);
  }
  
  private handleInput = (e: FederatedPointerEvent) => {
    const local = e.getLocalPosition(this.handle);
    const dir = local.x >= 0 ? 1 : -1; // click right half = clockwise
    
    this.rotate(dir as Direction);
    
    if (this.onRotation) {
      this.onRotation(dir as Direction);
    }
  };
  
  rotate(dir: Direction) {
    gsap.to([this.handle, this.handleShadow], {
      rotation: `+=${dir * STEP_ANGLE}`,
      duration: 0.25,
    });
  }
  
  spinCrazy(): Promise<void> {
    // Create a new Promise that resolves when the animation completes
    return new Promise<void>((resolve) => {
      gsap.to([this.handle, this.handleShadow], {
        rotation: `+=${Math.PI * 6}`,
        duration: 1,
        ease: "power3.out",
        onComplete: resolve
      });
    });
  }
  
  reset() {
    this.handle.visible = true;
    this.handleShadow.visible = true;
    this.handle.rotation = 0;
    this.handleShadow.rotation = 0;
  }
  
  private showDirectionHint = (e: FederatedPointerEvent) => {
    const local = e.getLocalPosition(this.handle);
    const dir = local.x >= 0 ? 1 : -1;
    
    this.handle.cursor = dir === 1 ? 'e-resize' : 'w-resize';
    
    this.leftArrow.visible = dir === -1;
    this.rightArrow.visible = dir === 1;
    
    const offset = 60;
    this.leftArrow.position.set(this.handle.x - offset, this.handle.y);
    this.rightArrow.position.set(this.handle.x + offset, this.handle.y);
  };

  private hideDirectionHint = () => {
    this.handle.cursor = 'pointer';
    this.leftArrow.visible = false;
    this.rightArrow.visible = false;
  };
}


