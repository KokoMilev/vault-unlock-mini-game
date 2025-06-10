import { Assets, Texture } from "pixi.js";

export class AssetManager {
  private assets: Map<string, Texture> = new Map();
  
  async loadAssets() {
    const assetPaths = [
      "assets/bg.png",
      "assets/door.png",
      "assets/doorOpenShadow.png",
      "assets/doorOpen.png",
      "assets/handle.png",
      "assets/handleShadow.png",
      "assets/blink.png",
    ];
    
    const textures = await Assets.load(assetPaths);
    
    // Store textures in map for easy access
    assetPaths.forEach(path => {
      const key = path.split('/').pop()!.split('.')[0];
      this.assets.set(key, textures[path]);
    });
  }
  
  getTexture(name: string): Texture {
    const texture = this.assets.get(name);
    if (!texture) {
      throw new Error(`Texture ${name} not found`);
    }
    return texture;
  }
  
  getBackgroundTexture(): Texture {
    return this.getTexture('bg');
  }
}