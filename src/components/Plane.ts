import * as THREE from 'three';

type PlayerMoveCallback = (x: number, z: number, dx?: number, dz?: number) => void;

export class Plane {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly onPlayerMove: PlayerMoveCallback;
  private mapScale = 1;
  private keyDowns: number[] = [];

  private throttle    = 0.1;
  private turnSpeed   = 0;
  private noseSpeed   = 0;
  private rotateSpeed = 0;

  private readonly throttleStep    = 0.001;
  private readonly minThrottle     = 0.05;
  private readonly maxThrottle     = 0.3;
  private readonly turnSpeedStep   = 0.00002;
  private readonly maxTurnSpeed    = 0.001;
  private readonly noseSpeedStep   = 0.00003;
  private readonly maxNoseSpeed    = 0.002;
  private readonly rotateSpeedStep = 0.0001;
  private readonly maxRotateSpeed  = 0.003;

  constructor(camera: THREE.PerspectiveCamera, onPlayerMove: PlayerMoveCallback) {
    this.camera = camera;
    this.onPlayerMove = onPlayerMove;
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup',   (e) => this.onKeyUp(e));
  }

  setMapScale(scale: number): void {
    this.mapScale = scale;
  }

  autoMove(): void {
    const lookAt   = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const lookUp   = new THREE.Vector3(0, -1, 0).applyQuaternion(this.camera.quaternion);
    const lookSide = new THREE.Vector3().crossVectors(lookAt, lookUp);

    this.camera.position.addScaledVector(lookAt,   this.throttle);
    this.camera.rotateOnWorldAxis(lookUp,   this.turnSpeed);
    this.camera.rotateOnWorldAxis(lookSide, this.noseSpeed);
    this.camera.rotateOnWorldAxis(lookAt,   this.rotateSpeed);

    this.turnSpeed   -= this.turnSpeed   / 200;
    this.noseSpeed   -= this.noseSpeed   / 200;
    this.rotateSpeed -= this.rotateSpeed / 200;

    this.onPlayerMove(
      Math.trunc(this.camera.position.x / this.mapScale),
      Math.trunc(this.camera.position.z / this.mapScale),
      lookAt.x,
      lookAt.z
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.keyDowns.includes(event.keyCode)) {
      this.keyDowns.push(event.keyCode);
      if (this.keyDowns.length === 1) {
        window.requestAnimationFrame(() => this.processKeys());
      }
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    const idx = this.keyDowns.indexOf(event.keyCode);
    if (idx !== -1) this.keyDowns.splice(idx, 1);
  }

  private processKeys(): void {
    const lookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const lookUp = new THREE.Vector3(0, -1, 0).applyQuaternion(this.camera.quaternion);
    const speed  = 0.1;

    for (const keyCode of this.keyDowns) {
      if      (keyCode === 65) this.rotateSpeed = Math.max(-this.maxRotateSpeed, this.rotateSpeed - this.rotateSpeedStep);
      else if (keyCode === 68) this.rotateSpeed = Math.min( this.maxRotateSpeed, this.rotateSpeed + this.rotateSpeedStep);
      else if (keyCode === 87) this.throttle    = Math.min( this.maxThrottle,    this.throttle    + this.throttleStep);
      else if (keyCode === 83) this.throttle    = Math.max( this.minThrottle,    this.throttle    - this.throttleStep);
      else if (keyCode === 81) this.camera.position.addScaledVector(lookUp,  speed);
      else if (keyCode === 69) this.camera.position.addScaledVector(lookUp, -speed);
      else if (keyCode === 38) this.noseSpeed  = Math.min( this.maxNoseSpeed,  this.noseSpeed  + this.noseSpeedStep);
      else if (keyCode === 40) this.noseSpeed  = Math.max(-this.maxNoseSpeed,  this.noseSpeed  - this.noseSpeedStep);
      else if (keyCode === 37) this.turnSpeed  = Math.max(-this.maxTurnSpeed,  this.turnSpeed  - this.turnSpeedStep);
      else if (keyCode === 39) this.turnSpeed  = Math.min( this.maxTurnSpeed,  this.turnSpeed  + this.turnSpeedStep);
    }

    this.onPlayerMove(
      Math.trunc(this.camera.position.x / this.mapScale),
      Math.trunc(this.camera.position.z / this.mapScale),
      lookAt.x,
      lookAt.z
    );

    if (this.keyDowns.length > 0) {
      window.requestAnimationFrame(() => this.processKeys());
    }
  }
}
