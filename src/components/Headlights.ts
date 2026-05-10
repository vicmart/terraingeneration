import * as THREE from 'three';

export class Headlights {
  private readonly spotLightLeft:  THREE.SpotLight;
  private readonly spotLightRight: THREE.SpotLight;
  readonly player: THREE.Mesh;

  constructor(camera: THREE.Camera) {
    this.spotLightRight = new THREE.SpotLight(0xffffff, 10);
    this.spotLightRight.distance = 600;
    this.spotLightRight.decay    = 3;
    this.spotLightRight.angle    = Math.PI / 11;
    this.spotLightRight.position.set(3, -0.5, 0);

    const targetRight = new THREE.Object3D();
    targetRight.position.set(3, -0.5, -50);
    camera.add(this.spotLightRight);
    camera.add(targetRight);
    this.spotLightRight.target = targetRight;

    this.spotLightLeft = new THREE.SpotLight(0xffffff, 10);
    this.spotLightLeft.distance = 600;
    this.spotLightLeft.decay    = 3;
    this.spotLightLeft.angle    = Math.PI / 11;
    this.spotLightLeft.position.set(-3, -0.5, 0);

    const targetLeft = new THREE.Object3D();
    targetLeft.position.set(-3, -0.5, -50);
    camera.add(this.spotLightLeft);
    camera.add(targetLeft);
    this.spotLightLeft.target = targetLeft;

    this.player = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    this.player.position.set(0, -1, -1.5);
    camera.add(this.player);
  }

  update(yPos: number): void {
    const on = yPos < -0.1 ? 0.5 : 0;
    this.spotLightLeft.intensity  = on;
    this.spotLightRight.intensity = on;
  }
}
