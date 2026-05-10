import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

export class Trees {
  private readonly scene: THREE.Scene;
  private treePositions:  THREE.Vector3[]      | null = null;
  private nearTreeMeshes: THREE.InstancedMesh[] | null = null;
  private readonly treeHiddenMatrix = new THREE.Matrix4();
  private _treeDummy:   THREE.Object3D | null = null;
  private _lastLODPos:  THREE.Vector3  | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.treeHiddenMatrix.makeScale(0, 0, 0);
  }

  load(
    matrix:    number[][],
    width:     number,
    height:    number,
    amplitude: number,
    scale:     number,
    onReady:   () => void
  ): void {
    loader.load('static/tree.glb', (gltf) => {
      const treeRoot = gltf.scene.children[0];

      this._treeDummy = new THREE.Object3D();
      this._treeDummy.quaternion.copy(treeRoot.quaternion);
      this._treeDummy.scale.copy(treeRoot.scale);

      const meshNodes: { geometry: THREE.BufferGeometry; material: THREE.MeshPhongMaterial }[] = [];
      gltf.scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const color = mat && mat.color ? mat.color.clone() : new THREE.Color(0x4a7c59);
        const hsl = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        color.setHSL(hsl.h, hsl.s, Math.min(1, hsl.l * 3));
        meshNodes.push({
          geometry: mesh.geometry as THREE.BufferGeometry,
          material: new THREE.MeshPhongMaterial({ color, shininess: 10, side: THREE.DoubleSide }),
        });
      });

      this.nearTreeMeshes = meshNodes.map(({ geometry, material }) => {
        const im = new THREE.InstancedMesh(geometry, material, 5000);
        im.castShadow    = true;
        im.receiveShadow = true;
        im.frustumCulled = false;
        this.scene.add(im);
        return im;
      });

      this.treePositions = [];
      let treeCount = 0;
      let ri = [0, 0];
      while (treeCount < 5000) {
        if (matrix[ri[0]][ri[1]] > 0.3 && matrix[ri[0]][ri[1]] < 0.6) {
          this.treePositions.push(new THREE.Vector3(
            (ri[0] - width  / 2 + 0.5) * scale,
            matrix[ri[0]][ri[1]] * amplitude + 1.5,
            (ri[1] - height / 2) * scale
          ));
          treeCount++;
        }
        ri = [Math.trunc(Math.random() * width), Math.trunc(Math.random() * height)];
      }

      onReady();
    }, undefined, undefined);
  }

  update(camera: THREE.Camera): void {
    if (!this.treePositions || !this.nearTreeMeshes || !this._treeDummy) return;

    const camPos = camera.position;
    if (this._lastLODPos) {
      const dx = camPos.x - this._lastLODPos.x;
      const dz = camPos.z - this._lastLODPos.z;
      if (dx * dx + dz * dz < 25) return;
    }
    this._lastLODPos = camPos.clone();

    const hidden = this.treeHiddenMatrix;
    const dummy  = this._treeDummy;

    for (let i = 0; i < this.treePositions.length; i++) {
      const pos = this.treePositions[i];
      if (camPos.distanceTo(pos) < 300) {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        this.nearTreeMeshes.forEach(m => m.setMatrixAt(i, dummy.matrix));
      } else {
        this.nearTreeMeshes.forEach(m => m.setMatrixAt(i, hidden));
      }
    }

    this.nearTreeMeshes.forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }
}
