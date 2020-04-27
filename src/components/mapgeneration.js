import perlin from 'perlin-noise';

export default class MapGeneration {  
  constructor(width, height) {
    this.width = width;
    this.height = height;

    return this.init();
  }

  init() {
    let heightMap = this.generatePerlinNoise();
    heightMap = this.normalizeEdges(heightMap);
    heightMap = this.blurMap(heightMap);

    return heightMap;
  }

  generatePerlinNoise() {
    return perlin.generatePerlinNoise(this.width, this.height, {octaveCount: 6, persistence: 0.6});
  }

  normalizeEdges(heightMap) {
    // Normalize for distance from center
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				let distanceFromCenter = 0.25 - Math.sqrt(Math.pow((this.width/2) - x, 2) + Math.pow((this.height/2) - y, 2)) / (Math.min(this.height/2, this.width/2));
				heightMap[(y * this.width) + x] = Math.max(0, Math.min(1, heightMap[(y * this.width) + x] + distanceFromCenter));
			}
    }
    
    return heightMap;
  }

  blurMap(heightMap) {
		let newHeightMap = Array(this.width * this.height).fill(0);

		// Blur
		let range = 15;
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				let totalHeight = 0;
				let count = 0;

				for (let xi = Math.max(0, x - range); xi < Math.min(this.width, 1 + x + range); xi++) {
					for (let yi = Math.max(0, y - range); yi < Math.min(this.height, 1 + y + range); yi++) {
						totalHeight += heightMap[(yi * this.width) + xi];
						count++;
					}
				}

				newHeightMap[(y * this.width) + x] = totalHeight / count;
			}
		}
		return newHeightMap;
  }
  
  static getColorFromHeight(height) {
    let gradient = [{pos: 0, color: [30,144,255]}, 
                    {pos: 0.25, color: [242,209,107]}, 
                    {pos: 0.35, color: [76,186,23]}, 
                    {pos: 0.7, color: [100,100,100]}, 
                    {pos: 0.9, color: [255,255,255]}, 
                    {pos: 1, color: [255,255,255]}];

		let gradientIndex = 1;

		while (height > gradient[gradientIndex].pos) {
			gradientIndex++;
		}

		let color1 = gradient[gradientIndex - 1].color;
		let pos1 = gradient[gradientIndex - 1].pos;
		let color2 = gradient[gradientIndex].color;
		let pos2 = gradient[gradientIndex].pos;

		let red = (color1[0] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[0] * (1 - (pos2 - height)/(pos2 - pos1)));
		let green = (color1[1] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[1] * (1 - (pos2 - height)/(pos2 - pos1)));
		let blue = (color1[2] * (1 - (height - pos1)/(pos2 - pos1))) + (color2[2] * (1 - (pos2 - height)/(pos2 - pos1)));

		return [red, green, blue];
	}
}