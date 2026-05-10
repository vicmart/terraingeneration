import perlin from 'perlin-noise';

interface GradientStop {
  pos:   number;
  color: [number, number, number];
}

export default class MapGeneration {
  static generate(width: number, height: number): number[] {
    let h = MapGeneration.generatePerlinNoise(width, height);
    h = MapGeneration.normalizeEdges(h, width, height);
    h = MapGeneration.blurMap(h, width, height);
    h = MapGeneration.amplifyMap(h, width, height);
    return h;
  }

  private static generatePerlinNoise(width: number, height: number): number[] {
    return (perlin as any).generatePerlinNoise(width, height, { octaveCount: 6, persistence: 0.6 });
  }

  private static normalizeEdges(heightMap: number[], width: number, height: number): number[] {
    const rw = width  / 2;
    const rh = height / 2;
    const denom = Math.sqrt(rh * rh + rw * rw);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dist = 0.5 - Math.sqrt((rw - x) ** 2 + (rh - y) ** 2) / denom;
        const i = y * width + x;
        heightMap[i] = Math.max(0, Math.min(1, heightMap[i] + dist));
      }
    }
    return heightMap;
  }

  private static blurMap(heightMap: number[], width: number, height: number): number[] {
    const out   = new Array<number>(width * height).fill(0);
    const range = 6;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let total = 0, count = 0;
        for (let xi = Math.max(0, x - range); xi < Math.min(width,  x + range + 1); xi++) {
          for (let yi = Math.max(0, y - range); yi < Math.min(height, y + range + 1); yi++) {
            total += heightMap[yi * width + xi];
            count++;
          }
        }
        out[y * width + x] = total / count;
      }
    }
    return out;
  }

  private static amplifyMap(heightMap: number[], width: number, height: number): number[] {
    for (let i = 0; i < width * height; i++) {
      heightMap[i] = heightMap[i] ** 3;
    }
    return heightMap;
  }

  static getColorFromHeight(height: number): [number, number, number] {
    const gradient: GradientStop[] = [
      { pos: 0.0, color: [242, 209, 107] },
      { pos: 0.2, color: [242, 209, 107] },
      { pos: 0.3, color: [ 76, 186,  23] },
      { pos: 0.6, color: [ 76, 186,  23] },
      { pos: 0.7, color: [100, 100, 100] },
      { pos: 0.9, color: [255, 255, 255] },
      { pos: 1.0, color: [255, 255, 255] },
    ];

    let gi = 1;
    while (height > gradient[gi].pos) gi++;

    const [r1, g1, b1] = gradient[gi - 1].color;
    const p1 = gradient[gi - 1].pos;
    const [r2, g2, b2] = gradient[gi].color;
    const p2 = gradient[gi].pos;
    const t  = (height - p1) / (p2 - p1);

    return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
  }
}
