import * as THREE from 'three';

export class SeaMesh {
  readonly mesh: THREE.Mesh;
  private readonly bufGeometry: THREE.BufferGeometry;

  private readonly seaLevel:     number;
  private readonly seaAmplitude: number;
  private readonly seaOffset:    THREE.Vector3;
  private readonly mapScale:     number;
  private readonly waveHeight:   number;
  private readonly landWidth:    number;
  private readonly landHeight:   number;
  private readonly seaWidth:     number;
  private readonly seaHeight:    number;
  private readonly startTime:    number;

  private coastDistMap:   Float32Array | null = null;
  private maxCoastDist    = 0;
  private seaSpaceWidth   = 0;
  private seaMeshNormals  = 0;

  private static readonly FACTOR = 4;

  constructor(
    scene:      THREE.Scene,
    matrix:     number[][],
    amplitude:  number,
    offset:     THREE.Vector3,
    scale:      number,
    seaLevel:   number,
    waveHeight: number,
    startTime:  number
  ) {
    this.seaLevel    = seaLevel;
    this.seaAmplitude = amplitude;
    this.seaOffset   = offset.clone();
    this.mapScale    = scale;
    this.waveHeight  = waveHeight;
    this.landWidth   = matrix.length;
    this.landHeight  = matrix[0].length;
    this.startTime   = startTime;

    const f = SeaMesh.FACTOR;
    this.seaWidth  = Math.floor(matrix.length    / f);
    this.seaHeight = Math.floor(matrix[0].length / f);
    const seaScale = scale * f;

    const [vertices, colors] = this.buildGeometry(matrix, amplitude, offset, seaScale, seaLevel);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,   3));
    geometry.computeVertexNormals();
    (geometry as any).dynamic = true;

    const material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, transparent: true, shininess: 100 });
    material.opacity = 0.6;

    this.bufGeometry = geometry;
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);

    this.coastDistMap = this.buildCoastDistMap(matrix);
  }

  private buildGeometry(
    matrix:    number[][],
    amplitude: number,
    offset:    THREE.Vector3,
    seaScale:  number,
    seaLevel:  number
  ): [Float32Array, Float32Array] {
    const f      = SeaMesh.FACTOR;
    const width  = this.seaWidth;
    const height = this.seaHeight;
    const vertices = new Float32Array(width * height * 18);
    const colors   = new Float32Array(width * height * 18);
    const baseR = 30 / 255, baseG = 144 / 255, baseB = 255 / 255;

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        if (
          matrix[x*f    ][y*f    ] >= seaLevel + 0.2 ||
          matrix[x*f + 1][y*f    ] >= seaLevel + 0.2 ||
          matrix[x*f    ][y*f + 1] >= seaLevel + 0.2 ||
          matrix[x*f + 1][y*f + 1] >= seaLevel + 0.2
        ) continue;

        const ap   = (x * 18) + (y * width * 18);
        const baseY = seaLevel * amplitude + offset.y;
        // Triangle 1
        vertices[ap + 0]  = (x     - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 1]  = baseY;
        vertices[ap + 2]  = (y     - height / 2 + offset.z) * seaScale;
        vertices[ap + 3]  = (x     - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 4]  = baseY;
        vertices[ap + 5]  = (y + 1 - height / 2 + offset.z) * seaScale;
        vertices[ap + 6]  = (x + 1 - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 7]  = baseY;
        vertices[ap + 8]  = (y + 1 - height / 2 + offset.z) * seaScale;
        // Triangle 2
        vertices[ap + 9]  = (x     - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 10] = baseY;
        vertices[ap + 11] = (y     - height / 2 + offset.z) * seaScale;
        vertices[ap + 12] = (x + 1 - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 13] = baseY;
        vertices[ap + 14] = (y + 1 - height / 2 + offset.z) * seaScale;
        vertices[ap + 15] = (x + 1 - width  / 2 + 0.5 + offset.x) * seaScale;
        vertices[ap + 16] = baseY;
        vertices[ap + 17] = (y     - height / 2 + offset.z) * seaScale;

        for (let i = 0; i < 6; i++) {
          colors[ap + i * 3]     = baseR;
          colors[ap + i * 3 + 1] = baseG;
          colors[ap + i * 3 + 2] = baseB;
        }
      }
    }
    return [vertices, colors];
  }

  private buildCoastDistMap(matrix: number[][]): Float32Array {
    const f  = SeaMesh.FACTOR;
    const sw = this.seaWidth;
    const sh = this.seaHeight;
    const distMap = new Float32Array(sw * sh).fill(-1);

    const isSea = (x: number, y: number): boolean => {
      if (x < 0 || x >= sw - 1 || y < 0 || y >= sh - 1) return false;
      return matrix[x*f][y*f]     < this.seaLevel + 0.2 &&
             matrix[x*f+1][y*f]   < this.seaLevel + 0.2 &&
             matrix[x*f][y*f+1]   < this.seaLevel + 0.2 &&
             matrix[x*f+1][y*f+1] < this.seaLevel + 0.2;
    };

    const isLand = (x: number, y: number): boolean => {
      if (x < 0 || x >= sw - 1 || y < 0 || y >= sh - 1) return false;
      return !isSea(x, y);
    };

    const queue: number[] = [];
    for (let y = 0; y < sh - 1; y++) {
      for (let x = 0; x < sw - 1; x++) {
        if (!isSea(x, y)) continue;
        if (isLand(x-1,y) || isLand(x+1,y) || isLand(x,y-1) || isLand(x,y+1)) {
          distMap[y * sw + x] = 0;
          queue.push(x, y);
        }
      }
    }

    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    let head = 0, maxDist = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const d = distMap[y * sw + x] + 1;
      for (let i = 0; i < 4; i++) {
        const nx = x + dirs[i][0];
        const ny = y + dirs[i][1];
        if (!isSea(nx, ny) || distMap[ny * sw + nx] >= 0) continue;
        distMap[ny * sw + nx] = d;
        if (d > maxDist) maxDist = d;
        queue.push(nx, ny);
      }
    }

    let src = distMap;
    let dst = new Float32Array(sw * sh);
    for (let pass = 0; pass < 7; pass++) {
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          if (src[y * sw + x] < 0) { dst[y * sw + x] = -1; continue; }
          let sum = 0, count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy, nx = x + dx;
              const v = (ny >= 0 && ny < sh && nx >= 0 && nx < sw) ? src[ny * sw + nx] : -1;
              if (v >= 0) { sum += v; count++; }
            }
          }
          dst[y * sw + x] = sum / count;
        }
      }
      const tmp = src; src = dst; dst = tmp;
    }

    this.maxCoastDist  = maxDist;
    this.seaSpaceWidth = sw;
    return src;
  }

  update(camera: THREE.Camera): void {
    const geom         = this.bufGeometry;
    const seaVertices  = geom.attributes.position.array as Float32Array;
    const seaColors    = geom.attributes.color.array as Float32Array;
    const timeOffset   = (Date.now() - this.startTime) / 1000;
    const waveLength   = 2;
    const f            = SeaMesh.FACTOR;

    const darkR = 0.03, darkG = 0.18, darkB = 0.45;
    const foamR = 0.92, foamG = 0.96, foamB = 1.00;
    const invWaveHeight = this.waveHeight > 0 ? 1 / this.waveHeight : 0;

    const playerX = Math.trunc((camera.position.x + this.landWidth  / 2 * this.mapScale) / this.mapScale);
    const playerY = Math.trunc((camera.position.z + this.landHeight / 2 * this.mapScale) / this.mapScale);
    const yMin = Math.trunc(Math.max(0,               playerY - 200) / f);
    const yMax = Math.trunc(Math.min(this.landHeight, playerY + 200) / f) - 1;
    const xMin = Math.trunc(Math.max(0,               playerX - 200) / f);
    const xMax = Math.trunc(Math.min(this.landWidth,  playerX + 200) / f) - 1;

    if (!this.coastDistMap) return;

    const precomputed    = this.seaLevel * this.seaAmplitude + this.seaOffset.y;
    const width          = this.seaWidth;
    const wl2            = waveLength * 1.5;
    const invMaxCoastDist = this.maxCoastDist > 0 ? 1 / this.maxCoastDist : 0;
    const waveHeight     = this.waveHeight;

    const cornerHeight = (d: number): number => {
      if (d < 0) return precomputed;
      const inv = 1 - Math.min(1, d * invMaxCoastDist);
      const s   = waveHeight * inv * inv * inv * inv * inv * inv * inv * inv * inv * inv;
      return precomputed + (Math.sin((timeOffset + d) / waveLength) * 0.7 +
                            Math.sin((timeOffset * 0.73 + d * 0.85) / wl2) * 0.3) * s;
    };

    for (let y = yMin; y < yMax; y++) {
      for (let x = xMin; x < xMax; x++) {
        const ap   = (x * 18) + (y * width * 18);
        const d_xy = this.coastDistMap[y * width + x];
        if (d_xy < 0) continue;

        const d_xy1  = this.coastDistMap[Math.min(y + 1, this.seaSpaceWidth - 1) * width + x];
        const d_x1y1 = this.coastDistMap[Math.min(y + 1, this.seaSpaceWidth - 1) * width + Math.min(x + 1, width - 1)];
        const d_x1y  = this.coastDistMap[y * width + Math.min(x + 1, width - 1)];

        const v_xy   = cornerHeight(d_xy);
        const v_xy1  = cornerHeight(d_xy1);
        const v_x1y1 = cornerHeight(d_x1y1);
        const v_x1y  = cornerHeight(d_x1y);

        const foam_xy   = Math.min(1, Math.max(0, (v_xy   - precomputed) * invWaveHeight) * 0.5);
        const foam_xy1  = Math.min(1, Math.max(0, (v_xy1  - precomputed) * invWaveHeight) * 0.5);
        const foam_x1y1 = Math.min(1, Math.max(0, (v_x1y1 - precomputed) * invWaveHeight) * 0.5);
        const foam_x1y  = Math.min(1, Math.max(0, (v_x1y  - precomputed) * invWaveHeight) * 0.5);

        if (seaVertices[ap + 1]) {
          seaVertices[ap + 1] = v_xy;
          seaColors[ap + 0]   = darkR + (foamR - darkR) * foam_xy;
          seaColors[ap + 1]   = darkG + (foamG - darkG) * foam_xy;
          seaColors[ap + 2]   = darkB + (foamB - darkB) * foam_xy;
        }
        if (seaVertices[ap + 4]) {
          seaVertices[ap + 4] = v_xy1;
          seaColors[ap + 3]   = darkR + (foamR - darkR) * foam_xy1;
          seaColors[ap + 4]   = darkG + (foamG - darkG) * foam_xy1;
          seaColors[ap + 5]   = darkB + (foamB - darkB) * foam_xy1;
        }
        if (seaVertices[ap + 7]) {
          seaVertices[ap + 7] = v_x1y1;
          seaColors[ap + 6]   = darkR + (foamR - darkR) * foam_x1y1;
          seaColors[ap + 7]   = darkG + (foamG - darkG) * foam_x1y1;
          seaColors[ap + 8]   = darkB + (foamB - darkB) * foam_x1y1;
        }
        if (seaVertices[ap + 10]) {
          seaVertices[ap + 10] = v_xy;
          seaColors[ap + 9]    = darkR + (foamR - darkR) * foam_xy;
          seaColors[ap + 10]   = darkG + (foamG - darkG) * foam_xy;
          seaColors[ap + 11]   = darkB + (foamB - darkB) * foam_xy;
        }
        if (seaVertices[ap + 13]) {
          seaVertices[ap + 13] = v_x1y1;
          seaColors[ap + 12]   = darkR + (foamR - darkR) * foam_x1y1;
          seaColors[ap + 13]   = darkG + (foamG - darkG) * foam_x1y1;
          seaColors[ap + 14]   = darkB + (foamB - darkB) * foam_x1y1;
        }
        if (seaVertices[ap + 16]) {
          seaVertices[ap + 16] = v_x1y;
          seaColors[ap + 15]   = darkR + (foamR - darkR) * foam_x1y;
          seaColors[ap + 16]   = darkG + (foamG - darkG) * foam_x1y;
          seaColors[ap + 17]   = darkB + (foamB - darkB) * foam_x1y;
        }
      }
    }

    this.seaMeshNormals = (this.seaMeshNormals + 1) % 15;
    if (this.seaMeshNormals === 0) geom.computeVertexNormals();
    (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (geom.attributes.color    as THREE.BufferAttribute).needsUpdate = true;
  }
}
