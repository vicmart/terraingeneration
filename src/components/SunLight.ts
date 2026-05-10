import * as THREE from 'three';

export class SunLight {
  readonly sun: THREE.DirectionalLight;
  readonly hemisphereLight: THREE.HemisphereLight;
  private readonly startTime: number;

  constructor(scene: THREE.Scene, startTime: number) {
    this.startTime = startTime;

    this.sun = new THREE.DirectionalLight(0xffffe0, 1);
    this.sun.position.set(0, 100, 0);
    this.sun.castShadow = true;
    this.sun.shadow.camera.left   = -400;
    this.sun.shadow.camera.right  =  400;
    this.sun.shadow.camera.top    =  400;
    this.sun.shadow.camera.bottom = -400;
    this.sun.shadow.camera.near   = 0.5;
    this.sun.shadow.camera.far    = 3000;
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.shadow.mapSize.width  = 8192;
    this.sun.shadow.mapSize.height = 8192;
    this.sun.shadow.bias = -0.001;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4cba17, 0.6);
    scene.add(this.hemisphereLight);
  }

  update(scene: THREE.Scene, camera: THREE.Camera): number {
    const radians = -1 * (Date.now() - this.startTime) / 50000;
    const yPos = Math.sin(radians);

    this.sun.target.position.copy(camera.position);
    this.sun.target.updateMatrixWorld();
    this.sun.position.set(
      camera.position.x + Math.cos(radians) * 1000,
      camera.position.y + yPos * 1000,
      camera.position.z
    );
    this.sun.intensity = Math.max(0, yPos);
    this.sun.color.setHex(this.getSunColor(yPos));
    (scene.fog as THREE.Fog).color.setHex(this.getFogColor(yPos));
    (scene.background as THREE.Color).setHex(this.getBGColor(yPos));
    this.hemisphereLight.intensity = Math.max(0, yPos) * 0.6;
    this.hemisphereLight.color.setHex(this.getBGColor(yPos));

    return yPos;
  }

  private getSunColor(posY: number): number {
    return this.getWeightedColor(posY, '#ffffe0', '#ff9608');
  }

  private getFogColor(posY: number): number {
    if (posY > 0)    return this.getWeightedColor(posY, '#87ceeb', '#ff9608');
    if (posY > -0.4) return this.getWeightedColor(posY * 2.5, '#092936', '#ff9608');
    return this.getWeightedColor((posY + 0.4) * 1.5, '#000000', '#092936');
  }

  private getBGColor(posY: number): number {
    if (posY > 0)    return this.getWeightedColor(posY, '#87ceeb', '#bb6b00');
    if (posY > -0.4) return this.getWeightedColor(posY * 2.5, '#092936', '#bb6b00');
    return this.getWeightedColor((posY + 0.4) * 1.5, '#000000', '#092936');
  }

  private getWeightedColor(y: number, colorMax: string, colorMin: string): number {
    const max = this.hexToRgb(colorMax)!;
    const min = this.hexToRgb(colorMin)!;
    y = Math.min(1, Math.abs(y));
    return (Math.round(y * max.r + (1 - y) * min.r) << 16) |
           (Math.round(y * max.g + (1 - y) * min.g) << 8)  |
            Math.round(y * max.b + (1 - y) * min.b);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
}
