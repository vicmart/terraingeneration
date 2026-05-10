import * as THREE from 'three';
import Stats from 'stats.js';
import { TerrainMesh } from './TerrainMesh';
import { SunLight }    from './SunLight';
import { Headlights }  from './Headlights';
import { Plane }       from './Plane';
import { Trees }       from './Trees';
import { SeaMesh }     from './SeaMesh';

export default class DrawThree {
  private readonly drawTwo:    any;
  private readonly scene:      THREE.Scene;
  private readonly camera:     THREE.PerspectiveCamera;
  private readonly renderer:   THREE.WebGLRenderer;
  private readonly startTime:  number;
  private readonly stats:      Stats;

  private readonly sunLight:   SunLight;
  private readonly headlights: Headlights;
  private readonly plane:      Plane;
  private trees:   Trees   | null = null;
  private seaMesh: SeaMesh | null = null;

  constructor(drawTwo: any) {
    this.drawTwo = drawTwo;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 200, 300);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
    this.camera.position.set(0, 30, 500);
    drawTwo.updatePlayer(0, 500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.startTime = Date.now() + 125000;

    this.sunLight   = new SunLight(this.scene, this.startTime);
    this.headlights = new Headlights(this.camera);
    this.plane      = new Plane(this.camera, (x, z, dx, dz) => drawTwo.updatePlayer(x, z, dx, dz));
    this.scene.add(this.camera);

    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }

  renderMap(heightMap: ArrayLike<number>, width: number, height: number, amplitude: number, scale: number): void {
    const input: number[][] = new Array(width);
    for (let i = 0; i < width; i++) {
      input[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        input[i][j] = (heightMap as any)[(j * width) + i];
      }
    }

    this.plane.setMapScale(scale);
    this.drawTwo.updatePlayer(
      Math.trunc(this.camera.position.x / scale),
      Math.trunc(this.camera.position.z / scale)
    );

    new TerrainMesh(this.scene, input, amplitude, scale);
    this.seaMesh = new SeaMesh(this.scene, input, amplitude, new THREE.Vector3(), scale, 0.22, 2.5, this.startTime);

    this.trees = new Trees(this.scene);
    this.trees.load(input, width, height, amplitude, scale, () => this.trees!.update(this.camera));

    window.requestAnimationFrame(() => this.animate());
  }

  private animate(): void {
    this.stats.begin();

    const yPos = this.sunLight.update(this.scene, this.camera);
    this.headlights.update(yPos);
    this.plane.autoMove();
    this.trees?.update(this.camera);
    this.seaMesh?.update(this.camera);

    this.renderer.render(this.scene, this.camera);
    this.stats.end();

    window.requestAnimationFrame(() => this.animate());
  }
}
