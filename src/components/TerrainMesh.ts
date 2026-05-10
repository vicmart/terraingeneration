import * as THREE from 'three';
import MapGeneration from './mapgeneration';

export class TerrainMesh {
  readonly mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, input: number[][], amplitude: number, scale: number) {
    const [vertices, colors] = this.buildGeometry(input, amplitude, new THREE.Vector3(), scale);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,   3));
    geometry.computeVertexNormals();

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, color: 0x555555, shininess: 0 })
    );
    this.mesh.castShadow    = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }

  private buildGeometry(
    matrix: number[][], amplitude: number, offset: THREE.Vector3, scale: number
  ): [Float32Array, Float32Array] {
    const color    = new THREE.Color();
    const vertices = new Float32Array(matrix.length * matrix[0].length * 18);
    const colors   = new Float32Array(matrix.length * matrix[0].length * 18);

    for (let y = 0; y < matrix[0].length - 1; y++) {
      for (let x = 0; x < matrix.length - 1; x++) {
        const ap = (x * 18) + (y * matrix.length * 18);
        const w  = matrix.length;
        const h  = matrix[0].length;

        // Triangle 1: (x,y), (x,y+1), (x+1,y+1)
        vertices[ap + 0]  = (x       - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 1]  = Math.max(0, matrix[x][y])       * amplitude + offset.y;
        vertices[ap + 2]  = (y       - h/2.0 + offset.z)    * scale;
        vertices[ap + 3]  = (x       - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 4]  = Math.max(0, matrix[x][y+1])     * amplitude + offset.y;
        vertices[ap + 5]  = (y+1     - h/2.0 + offset.z)    * scale;
        vertices[ap + 6]  = (x+1     - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 7]  = Math.max(0, matrix[x+1][y+1])   * amplitude + offset.y;
        vertices[ap + 8]  = (y+1     - h/2.0 + offset.z)    * scale;
        // Triangle 2: (x,y), (x+1,y+1), (x+1,y)
        vertices[ap + 9]  = (x       - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 10] = Math.max(0, matrix[x][y])       * amplitude + offset.y;
        vertices[ap + 11] = (y       - h/2.0 + offset.z)    * scale;
        vertices[ap + 12] = (x+1     - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 13] = Math.max(0, matrix[x+1][y+1])   * amplitude + offset.y;
        vertices[ap + 14] = (y+1     - h/2.0 + offset.z)    * scale;
        vertices[ap + 15] = (x+1     - w/2.0 + 0.5 + offset.x) * scale;
        vertices[ap + 16] = Math.max(0, matrix[x+1][y])     * amplitude + offset.y;
        vertices[ap + 17] = (y       - h/2.0 + offset.z)    * scale;

        const setColor = (i: number, rgb: number[]) => {
          color.setRGB(rgb[0]/255, rgb[1]/255, rgb[2]/255);
          colors[ap+i] = color.r; colors[ap+i+1] = color.g; colors[ap+i+2] = color.b;
        };
        setColor(0,  MapGeneration.getColorFromHeight(matrix[x][y]));
        setColor(3,  MapGeneration.getColorFromHeight(matrix[x][y+1]));
        setColor(6,  MapGeneration.getColorFromHeight(matrix[x+1][y+1]));
        setColor(9,  MapGeneration.getColorFromHeight(matrix[x][y]));
        setColor(12, MapGeneration.getColorFromHeight(matrix[x+1][y+1]));
        setColor(15, MapGeneration.getColorFromHeight(matrix[x+1][y]));
      }
    }
    return [vertices, colors];
  }
}
